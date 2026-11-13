/**
 * Background Service Worker for VAPT Minimal New Tab
 * Manages DeclarativeNetRequest rules and Main-World JavaScript Spoofing
 * Strictly zero emojis
 */

const UA_RULE_ID = 1001;
const CH_RULE_ID = 1002;

let cachedActiveUa = null;

// Initialize on startup & install
chrome.runtime.onInstalled.addListener(() => {
  syncActiveUserAgent();
});

chrome.runtime.onStartup.addListener(() => {
  syncActiveUserAgent();
});

async function syncActiveUserAgent() {
  try {
    const res = await chrome.storage.local.get(['activeSessionUserAgent']);
    cachedActiveUa = res ? res.activeSessionUserAgent : null;
    if (cachedActiveUa && cachedActiveUa.value) {
      await applyDnrRules(cachedActiveUa.value);
    } else {
      await clearDnrRules();
    }
  } catch (err) {
    console.error('Error syncing user agent in background:', err);
  }
}

async function applyDnrRules(uaString) {
  if (!chrome.declarativeNetRequest) return;

  const uaRule = {
    id: UA_RULE_ID,
    priority: 999,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        { header: 'user-agent', operation: 'set', value: uaString }
      ]
    },
    condition: {
      urlFilter: '*',
      resourceTypes: [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'image',
        'font',
        'object',
        'xmlhttprequest',
        'ping',
        'csp_report',
        'media',
        'websocket',
        'other'
      ]
    }
  };

  const chRule = {
    id: CH_RULE_ID,
    priority: 999,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        { header: 'sec-ch-ua', operation: 'remove' },
        { header: 'sec-ch-ua-mobile', operation: 'remove' },
        { header: 'sec-ch-ua-platform', operation: 'remove' }
      ]
    },
    condition: {
      urlFilter: '*',
      resourceTypes: [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'image',
        'font',
        'object',
        'xmlhttprequest',
        'ping',
        'csp_report',
        'media',
        'websocket',
        'other'
      ]
    }
  };

  try {
    if (chrome.declarativeNetRequest.updateDynamicRules) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [UA_RULE_ID, CH_RULE_ID],
        addRules: [uaRule, chRule]
      });
      console.log('Successfully updated dynamic DNR rules for UA:', uaString);
    }
  } catch (e) {
    console.error('Error updating dynamic DNR rules:', e);
  }

  try {
    if (chrome.declarativeNetRequest.updateSessionRules) {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [UA_RULE_ID, CH_RULE_ID],
        addRules: [uaRule, chRule]
      });
      console.log('Successfully updated session DNR rules for UA:', uaString);
    }
  } catch (e) {
    console.error('Error updating session DNR rules:', e);
  }
}

async function clearDnrRules() {
  if (!chrome.declarativeNetRequest) return;
  try {
    if (chrome.declarativeNetRequest.updateDynamicRules) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [UA_RULE_ID, CH_RULE_ID]
      });
    }
  } catch (e) {}

  try {
    if (chrome.declarativeNetRequest.updateSessionRules) {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [UA_RULE_ID, CH_RULE_ID]
      });
    }
  } catch (e) {}
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.activeSessionUserAgent) {
    cachedActiveUa = changes.activeSessionUserAgent.newValue;
    if (cachedActiveUa && cachedActiveUa.value) {
      applyDnrRules(cachedActiveUa.value);
    } else {
      clearDnrRules();
    }
  }
});

// Listen for explicit message from options / newtab
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'applyUserAgent') {
    cachedActiveUa = msg.data;
    if (cachedActiveUa && cachedActiveUa.value) {
      applyDnrRules(cachedActiveUa.value).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }
  } else if (msg && msg.action === 'resetUserAgent') {
    cachedActiveUa = null;
    clearDnrRules().then(() => {
      sendResponse({ success: true });
    });
    return true;
  } else if (msg && msg.action === 'getTabHeaders') {
    const cached = tabHeadersCache.get(msg.tabId);
    sendResponse({ success: !!cached, data: cached || null });
    return false;
  }
});

// ==========================================================================
// HTTP RESPONSE HEADERS CAPTURE & CACHE (MAIN FRAME)
// ==========================================================================
const tabHeadersCache = new Map();

function setupHeadersCapture() {
  if (!chrome.webRequest || !chrome.webRequest.onHeadersReceived) return;

  const filter = {
    urls: ['<all_urls>'],
    types: ['main_frame']
  };

  const onHeadersReceived = (details) => {
    if (!details || details.tabId < 0) return;

    const headersMap = {};
    const rawHeaders = [];

    if (details.responseHeaders && Array.isArray(details.responseHeaders)) {
      for (const h of details.responseHeaders) {
        if (!h || !h.name) continue;
        const lower = h.name.toLowerCase();
        const val = h.value || '';
        if (headersMap[lower]) {
          headersMap[lower] += ', ' + val;
        } else {
          headersMap[lower] = val;
        }
        rawHeaders.push({ name: h.name, value: val });
      }
    }

    tabHeadersCache.set(details.tabId, {
      tabId: details.tabId,
      url: details.url,
      statusCode: details.statusCode,
      statusLine: details.statusLine || `HTTP ${details.statusCode}`,
      headers: headersMap,
      rawHeaders: rawHeaders,
      timestamp: Date.now()
    });
  };

  try {
    chrome.webRequest.onHeadersReceived.addListener(
      onHeadersReceived,
      filter,
      ['responseHeaders', 'extraHeaders']
    );
  } catch (e1) {
    try {
      chrome.webRequest.onHeadersReceived.addListener(
        onHeadersReceived,
        filter,
        ['responseHeaders']
      );
    } catch (e2) {
      console.error('Failed to register onHeadersReceived listener:', e2);
    }
  }
}

setupHeadersCapture();

if (chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    tabHeadersCache.delete(tabId);
  });
}

// Main world injection function executed on page navigation
function injectMainWorldSpoof(spoofedUa, platform) {
  try {
    delete Navigator.prototype.userAgentData;
  } catch (e) {}

  try {
    Object.defineProperty(Navigator.prototype, 'userAgentData', {
      get: () => undefined,
      configurable: true
    });
  } catch (e) {}

  try {
    Object.defineProperty(navigator, 'userAgentData', {
      get: () => undefined,
      configurable: true
    });
  } catch (e) {}

  try {
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      get: () => spoofedUa,
      configurable: true
    });
  } catch (e) {}

  try {
    Object.defineProperty(Navigator.prototype, 'appVersion', {
      get: () => spoofedUa,
      configurable: true
    });
  } catch (e) {}

  if (platform !== undefined) {
    try {
      Object.defineProperty(Navigator.prototype, 'platform', {
        get: () => platform,
        configurable: true
      });
    } catch (e) {}
  }
}

// Inject only into remote web pages (http/https) when navigation is committed
if (chrome.webNavigation && chrome.webNavigation.onCommitted) {
  chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (!cachedActiveUa || !cachedActiveUa.value) return;

    // Strictly limit injection to standard web protocols (http:// and https://)
    // NEVER inject into chrome://, chrome-extension://, about:, file:, etc.
    if (!details.url || (!details.url.startsWith('http://') && !details.url.startsWith('https://'))) {
      return;
    }

    try {
      // Verify parent tab is also an external web page, never an extension or system tab
      const tab = await chrome.tabs.get(details.tabId);
      if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
        return;
      }

      // Explicitly protect extension origins
      const extPrefix = typeof chrome.runtime.getURL === 'function' ? chrome.runtime.getURL('') : 'chrome-extension://';
      if (tab.url.startsWith(extPrefix) || details.url.startsWith(extPrefix)) {
        return;
      }

      if (chrome.scripting && chrome.scripting.executeScript) {
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId, frameIds: [details.frameId] },
          world: 'MAIN',
          injectImmediately: true,
          func: injectMainWorldSpoof,
          args: [cachedActiveUa.value, cachedActiveUa.platform || '']
        });
      }
    } catch (err) {
      // Ignore injection errors on restricted or disconnected tabs
    }
  });
}
