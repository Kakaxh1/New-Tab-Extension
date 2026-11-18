/**
 * VAPT Target Auditor - Popup Controller
 * Full-featured active target recon, headers security audit, clickjacking framing tester,
 * on-page hidden form inputs inspector & unlocker, endpoints/JS scraper,
 * 1-click User-Agent spoofer, and mini LAN shared notes synchronizer.
 * Strictly ZERO emojis
 */

(function () {
  'use strict';

  // State
  let activeTab = null;
  let activeUrl = null;
  let activeHostname = null;
  let activeProtocol = 'https:';
  let discoveredEndpoints = [];
  let discoveredHiddenInputs = [];
  let lanServerUrl = 'http://192.168.1.143:9900';
  let lanDebounceTimer = null;

  // UA Presets Map
  const UA_PRESETS = {
    'native': {
      name: 'Native Browser',
      value: null
    },
    'googlebot-desktop': {
      name: 'Googlebot 2.1 (Desktop)',
      value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    },
    'googlebot-mobile': {
      name: 'Googlebot Mobile',
      value: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    },
    'iphone-safari': {
      name: 'Apple iPhone (iOS 17)',
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    },
    'android-chrome': {
      name: 'Android Mobile (Pixel)',
      value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    },
    'burpsuite': {
      name: 'Pentest Audit / Burp',
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Pentest-Audit)'
    },
    'tor-linux': {
      name: 'Tor Browser (Linux)',
      value: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
    }
  };

  // DOM Elements
  const el = {
    hostname: document.getElementById('target-hostname'),
    fullUrl: document.getElementById('target-full-url'),
    protocolBadge: document.getElementById('target-protocol-badge'),
    statusPill: document.getElementById('target-status-pill'),
    openNewtabBtn: document.getElementById('open-newtab-btn'),
    setScopeBtn: document.getElementById('set-scope-btn'),
    clipToNotesBtn: document.getElementById('clip-to-notes-btn'),
    copyTargetUrlBtn: document.getElementById('copy-target-url-btn'),
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    protocolText: document.getElementById('protocol-text'),
    targetPortPill: document.getElementById('target-port-pill'),
    dorkHintHost: document.getElementById('dork-hint-host'),
    countPass: document.getElementById('count-pass'),
    countWarn: document.getElementById('count-warn'),
    countFail: document.getElementById('count-fail'),
    // Headers
    headersAuditList: document.getElementById('headers-audit-list'),
    headersScoreBadge: document.getElementById('headers-score-badge'),
    refreshHeadersBtn: document.getElementById('refresh-headers-btn'),
    serverTechLeak: document.getElementById('server-tech-leak'),
    serverTechChips: document.getElementById('server-tech-chips'),
    rawHeadersWrap: document.getElementById('raw-headers-wrap'),
    httpStatusPill: document.getElementById('http-status-pill'),
    toggleRawHeadersBtn: document.getElementById('toggle-raw-headers-btn'),
    copyRawHeadersBtn: document.getElementById('copy-raw-headers-btn'),
    rawHeadersPre: document.getElementById('raw-headers-pre'),
    // Dorks & OSINT
    dorkChips: document.querySelectorAll('.dork-chip'),
    osintShodan: document.getElementById('osint-shodan'),
    osintCrtsh: document.getElementById('osint-crtsh'),
    osintVt: document.getElementById('osint-vt'),
    osintWayback: document.getElementById('osint-wayback'),
    osintUrlscan: document.getElementById('osint-urlscan'),
    // Clickjacking
    runClickjackBtn: document.getElementById('run-clickjack-btn'),
    cjBadge: document.getElementById('cj-badge'),
    cjStatusText: document.getElementById('cj-status-text'),
    cjFrameContainer: document.getElementById('clickjack-frame-container'),
    cjIframe: document.getElementById('clickjack-iframe'),
    closeCjPreviewBtn: document.getElementById('close-cj-preview-btn'),
    // Forms & Hidden
    scanFormsBtn: document.getElementById('scan-forms-btn'),
    statFormsCount: document.getElementById('stat-forms-count'),
    statInputsCount: document.getElementById('stat-inputs-count'),
    statHiddenCount: document.getElementById('stat-hidden-count'),
    statPasswordsCount: document.getElementById('stat-passwords-count'),
    revealHiddenFieldsBtn: document.getElementById('reveal-hidden-fields-btn'),
    hiddenInputsList: document.getElementById('hidden-inputs-list'),
    // Endpoints
    endpointsCountBadge: document.getElementById('endpoints-count-badge'),
    endpointsFilterInput: document.getElementById('endpoints-filter-input'),
    copyAllEndpointsBtn: document.getElementById('copy-all-endpoints-btn'),
    scrapeEndpointsBtn: document.getElementById('scrape-endpoints-btn'),
    endpointsListBox: document.getElementById('endpoints-list-box'),
    // User-Agent
    activeUaPill: document.getElementById('active-ua-pill'),
    uaPresetBtns: document.querySelectorAll('.ua-preset-btn'),
    customUaInput: document.getElementById('custom-ua-input'),
    applyCustomUaBtn: document.getElementById('apply-custom-ua-btn'),
    autoReloadToggle: document.getElementById('auto-reload-toggle'),
    resetUaBtn: document.getElementById('reset-ua-btn'),
    bypassChips: document.querySelectorAll('.bypass-header-chip'),
    // LAN Notes
    lanPopupDot: document.getElementById('lan-popup-dot'),
    lanPopupStatus: document.getElementById('lan-popup-status'),
    lanPopupClipBtn: document.getElementById('lan-popup-clip-btn'),
    lanPopupReplaceBtn: document.getElementById('lan-popup-replace-btn'),
    lanPopupDashBtn: document.getElementById('lan-popup-dash-btn'),
    lanPopupSyncBtn: document.getElementById('lan-popup-sync-btn'),
    lanPopupCopyBtn: document.getElementById('lan-popup-copy-btn'),
    lanPopupSrvUrl: document.getElementById('lan-popup-srv-url'),
    lanPopupTabsBar: document.getElementById('lan-popup-tabs-bar'),
    lanPopupTextarea: document.getElementById('lan-popup-textarea'),
    lanPopupStats: document.getElementById('lan-popup-stats'),
    lanPopupTime: document.getElementById('lan-popup-time'),
    // Toast
    toast: document.getElementById('popup-toast'),
    toastMsg: document.getElementById('popup-toast-msg')
  };

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (!el.toast || !el.toastMsg) return;
    el.toastMsg.textContent = msg;
    el.toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.style.display = 'none';
    }, 1800);
  }

  function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').slice(0, 19);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    setupTabNavigation();
    setupTargetContext();
    setupUaSpoofer();
    setupLanNotes();
  });

  // Tab Switching
  function setupTabNavigation() {
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        el.navTabs.forEach(t => t.classList.remove('active'));
        el.tabPanes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    el.openNewtabBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'newtab.html' });
    });
  }

  // Target Discovery & Setup
  async function setupTargetContext() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        setSpecialPageTarget('No active tab detected');
        return;
      }

      activeTab = tabs[0];
      const rawUrl = activeTab.url || '';

      if (!rawUrl || rawUrl.startsWith('chrome://') || rawUrl.startsWith('chrome-extension://') || rawUrl.startsWith('edge://') || rawUrl.startsWith('about:')) {
        setSpecialPageTarget(rawUrl || 'Internal Browser Page');
        return;
      }

      try {
        const parsed = new URL(rawUrl);
        activeUrl = rawUrl;
        activeHostname = parsed.hostname;
        activeProtocol = parsed.protocol;

        el.hostname.textContent = activeHostname;
        el.fullUrl.textContent = activeUrl;

        if (activeProtocol === 'https:') {
          if (el.protocolText) el.protocolText.textContent = 'HTTPS';
          el.protocolBadge.className = 'meta-pill pill-https';
          if (el.targetPortPill) el.targetPortPill.textContent = 'PORT 443';
        } else if (activeProtocol === 'http:') {
          if (el.protocolText) el.protocolText.textContent = 'HTTP';
          el.protocolBadge.className = 'meta-pill pill-http';
          if (el.targetPortPill) el.targetPortPill.textContent = 'PORT 80';
        } else {
          if (el.protocolText) el.protocolText.textContent = activeProtocol.replace(':', '').toUpperCase();
          el.protocolBadge.className = 'meta-pill pill-port';
          if (el.targetPortPill) el.targetPortPill.textContent = 'PORT --';
        }

        if (el.dorkHintHost) el.dorkHintHost.textContent = activeHostname;

        el.statusPill.textContent = 'ACTIVE TAB';
        el.statusPill.className = 'meta-pill pill-status-live';

        // Setup Scope button
        el.setScopeBtn.addEventListener('click', async () => {
          if (activeHostname && typeof StorageService !== 'undefined') {
            await StorageService.set('dorkScopeDomain', activeHostname);
            showToast(`Target scope set to ${activeHostname}`);
          } else {
            await chrome.storage.local.set({ dorkScopeDomain: activeHostname });
            showToast(`Target scope set to ${activeHostname}`);
          }
        });

        // Setup Copy URL button
        el.copyTargetUrlBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(activeUrl);
            if (window.IconAnimator) IconAnimator.morphSuccess(el.copyTargetUrlBtn);
            showToast('URL copied to clipboard');
          } catch {}
        });

        // Setup Clip to notes
        el.clipToNotesBtn.addEventListener('click', () => {
          if (window.IconAnimator) IconAnimator.pop(el.clipToNotesBtn);
          clipTargetToNotes();
        });

        // Setup Dorks & OSINT
        setupScopedDorks(activeHostname);
        setupOsintLinks(activeHostname);

        // Run Initial Audits
        auditSecurityHeaders(activeUrl);
        scanPageForms();
        scrapePageEndpoints();
        setupClickjackTest(activeUrl);

      } catch (err) {
        setSpecialPageTarget(rawUrl);
      }
    } catch (err) {
      console.error('Error fetching active tab:', err);
    }
  }

  function setSpecialPageTarget(msg) {
    el.hostname.textContent = 'Internal Browser Resource';
    el.fullUrl.textContent = msg;
    el.protocolBadge.textContent = 'RESTRICTED';
    el.protocolBadge.className = 'protocol-badge protocol-special';
    el.statusPill.textContent = 'SCRIPTING DISABLED';
    el.statusPill.className = 'status-pill';
    el.headersAuditList.innerHTML = '<div class="empty-state">Security headers audit not applicable to internal browser schemas.</div>';
    el.headersScoreBadge.textContent = 'N/A';
    el.endpointsListBox.innerHTML = '<div class="empty-state">Cannot inject DOM inspection on internal browser pages.</div>';
    el.hiddenInputsList.innerHTML = '<div class="empty-state">Page inspection restricted.</div>';
  }

  // ==========================================================================
  // TAB 1: SECURITY HEADERS AUDIT & RECON (VIA WEBREQUEST ONHEADERSRECEIVED)
  // ==========================================================================
  async function auditSecurityHeaders(url, forceReload = false) {
    if (!activeTab || !activeTab.id || !url || url.startsWith('chrome://')) return;

    el.headersAuditList.innerHTML = `
      <div class="loading-state">
        <span class="spinner-dot"></span>
        <span>${forceReload ? 'Reloading page to intercept response headers...' : 'Reading intercepted HTTP response headers...'}</span>
      </div>
    `;
    el.headersScoreBadge.textContent = 'Analyzing...';
    el.headersScoreBadge.className = 'score-badge score-calculating';
    el.serverTechLeak.style.display = 'none';
    if (el.rawHeadersWrap) el.rawHeadersWrap.style.display = 'none';

    // 1. Query background service worker's webRequest onHeadersReceived cache
    chrome.runtime.sendMessage({ action: 'getTabHeaders', tabId: activeTab.id }, async (response) => {
      if (response && response.success && response.data && response.data.headers) {
        evaluateHeaders(response.data.headers, response.data.statusLine, response.data.rawHeaders);
        return;
      }

      // If user requested reload or forceReload is true, reload active tab and poll cache
      if (forceReload) {
        chrome.tabs.reload(activeTab.id);
        let attempts = 0;
        const pollInterval = setInterval(() => {
          attempts++;
          chrome.runtime.sendMessage({ action: 'getTabHeaders', tabId: activeTab.id }, (reloadedRes) => {
            if (reloadedRes && reloadedRes.success && reloadedRes.data && reloadedRes.data.headers) {
              clearInterval(pollInterval);
              evaluateHeaders(reloadedRes.data.headers, reloadedRes.data.statusLine, reloadedRes.data.rawHeaders);
            } else if (attempts >= 10) {
              clearInterval(pollInterval);
              renderHeadersMissingFallback();
            }
          });
        }, 350);
        return;
      }

      // 2. Fallback attempt: direct fetch (effective on localhost/APIs with CORS)
      try {
        const fetchHeaders = {};
        const rawList = [];
        let statusLine = 'HTTP 200 OK';

        try {
          const headRes = await fetch(url, { method: 'HEAD', cache: 'no-store' });
          statusLine = `HTTP ${headRes.status} ${headRes.statusText || 'OK'}`;
          headRes.headers.forEach((val, key) => {
            fetchHeaders[key.toLowerCase()] = val;
            rawList.push({ name: key, value: val });
          });
        } catch (e) {
          const getRes = await fetch(url, { method: 'GET', cache: 'no-store' });
          statusLine = `HTTP ${getRes.status} ${getRes.statusText || 'OK'}`;
          getRes.headers.forEach((val, key) => {
            fetchHeaders[key.toLowerCase()] = val;
            rawList.push({ name: key, value: val });
          });
        }

        if (Object.keys(fetchHeaders).length > 2 && (fetchHeaders['content-security-policy'] || fetchHeaders['strict-transport-security'] || fetchHeaders['x-frame-options'] || fetchHeaders['server'])) {
          evaluateHeaders(fetchHeaders, statusLine, rawList);
          return;
        }
      } catch (err) {
        // Direct fetch blocked by CORS or origin isolation
      }

      // 3. If headers were not yet captured in this session, render clean 1-click reload capture button
      renderHeadersMissingFallback();
    });
  }

  function renderHeadersMissingFallback() {
    el.headersAuditList.innerHTML = `
      <div class="empty-state" style="padding: 12px 10px; text-align: center;">
        <p style="margin-bottom: 8px; color: var(--text-muted); font-size: 0.69rem;">
          Headers not yet intercepted for this tab session.
        </p>
        <button id="reload-tab-headers-btn" class="btn-xs btn-primary-accent" type="button" style="margin: 0 auto; display: inline-flex;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          Reload Page to Capture Headers
        </button>
      </div>
    `;
    el.headersScoreBadge.textContent = 'NEEDS RELOAD';
    el.headersScoreBadge.className = 'score-badge score-calculating';

    const reloadBtn = document.getElementById('reload-tab-headers-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        auditSecurityHeaders(activeUrl, true);
      });
    }
  }

  function evaluateHeaders(h, statusLine = 'HTTP 200 OK', rawList = []) {
    const tests = [
      {
        name: 'Content-Security-Policy (CSP)',
        key: 'content-security-policy',
        hint: 'Script execution & injection restrictions',
        evaluate: (val) => {
          if (!val) return { pass: false, status: 'fail', tag: 'Missing' };
          if (val.includes("'unsafe-inline'") || val.includes("'unsafe-eval'")) {
            return { pass: true, status: 'warn', tag: 'Weak (unsafe)' };
          }
          return { pass: true, status: 'pass', tag: 'Active' };
        }
      },
      {
        name: 'Strict-Transport-Security (HSTS)',
        key: 'strict-transport-security',
        hint: 'Forces TLS encrypted connections & prevents downgrade',
        evaluate: (val) => {
          if (activeProtocol !== 'https:') return { pass: false, status: 'warn', tag: 'N/A (HTTP)' };
          if (!val) return { pass: false, status: 'fail', tag: 'Missing' };
          return { pass: true, status: 'pass', tag: 'Active' };
        }
      },
      {
        name: 'X-Frame-Options (Clickjacking)',
        key: 'x-frame-options',
        hint: 'Clickjacking & unauthorized framing prevention',
        evaluate: (val) => {
          if (!val) {
            // Check if CSP has frame-ancestors
            const csp = h['content-security-policy'] || '';
            if (csp.includes('frame-ancestors')) {
              return { pass: true, status: 'pass', tag: 'CSP Ancestors' };
            }
            return { pass: false, status: 'fail', tag: 'Missing (Framing Allowed)' };
          }
          const upper = val.toUpperCase();
          if (upper.includes('DENY') || upper.includes('SAMEORIGIN')) {
            return { pass: true, status: 'pass', tag: upper };
          }
          return { pass: false, status: 'warn', tag: val };
        }
      },
      {
        name: 'X-Content-Type-Options',
        key: 'x-content-type-options',
        hint: 'MIME-type sniffing & drive-by download protection',
        evaluate: (val) => {
          if (val && val.toLowerCase().includes('nosniff')) {
            return { pass: true, status: 'pass', tag: 'nosniff' };
          }
          return { pass: false, status: 'fail', tag: 'Missing' };
        }
      },
      {
        name: 'Referrer-Policy',
        key: 'referrer-policy',
        hint: 'Controls cross-origin referrer URL data leakage',
        evaluate: (val) => {
          if (!val) return { pass: false, status: 'warn', tag: 'Not set' };
          return { pass: true, status: 'pass', tag: val };
        }
      },
      {
        name: 'Permissions-Policy',
        key: 'permissions-policy',
        hint: 'Restricts camera, microphone & device sensor access',
        evaluate: (val) => {
          if (!val) return { pass: false, status: 'warn', tag: 'Not set' };
          return { pass: true, status: 'pass', tag: 'Active' };
        }
      },
      {
        name: 'CORS Access-Control-Allow-Origin',
        key: 'access-control-allow-origin',
        hint: 'Cross-origin resource sharing access scope',
        evaluate: (val) => {
          if (val === '*') return { pass: false, status: 'warn', tag: 'Wildcard (*)' };
          if (val) return { pass: true, status: 'pass', tag: val };
          return { pass: true, status: 'pass', tag: 'Same-Origin' };
        }
      }
    ];

    let passedCount = 0;
    let warnCount = 0;
    let failCount = 0;
    let listHtml = '';

    tests.forEach(t => {
      const val = h[t.key];
      const res = t.evaluate(val);
      if (res.status === 'pass') {
        passedCount++;
      } else if (res.status === 'warn') {
        warnCount++;
      } else {
        failCount++;
      }

      listHtml += `
        <div class="header-audit-item">
          <div class="header-item-left">
            <span class="header-status-indicator ${res.status}"></span>
            <div class="header-info-col">
              <span class="header-name">${t.name}</span>
              <span class="header-role-hint">${t.hint || ''}</span>
            </div>
          </div>
          <span class="header-value-tag tag-${res.status}">${res.tag}</span>
        </div>
      `;
    });

    el.headersAuditList.innerHTML = listHtml;

    // Update Posture Breakdown stats
    if (el.countPass) el.countPass.textContent = passedCount;
    if (el.countWarn) el.countWarn.textContent = warnCount;
    if (el.countFail) el.countFail.textContent = failCount;

    // Score badge
    const total = tests.length;
    el.headersScoreBadge.textContent = `${passedCount}/${total} Passed`;
    if (passedCount >= 5) {
      el.headersScoreBadge.className = 'score-badge score-good';
    } else if (passedCount >= 3) {
      el.headersScoreBadge.className = 'score-badge score-moderate';
    } else {
      el.headersScoreBadge.className = 'score-badge score-poor';
    }

    // Technology banners (Server / X-Powered-By / Via)
    const leaks = [];
    if (h['server']) leaks.push(`Server: ${h['server']}`);
    if (h['x-powered-by']) leaks.push(`X-Powered-By: ${h['x-powered-by']}`);
    if (h['x-aspnet-version']) leaks.push(`ASP.NET: ${h['x-aspnet-version']}`);
    if (h['via']) leaks.push(`Via: ${h['via']}`);

    if (leaks.length > 0) {
      el.serverTechLeak.style.display = 'flex';
      if (el.serverTechChips) {
        el.serverTechChips.innerHTML = leaks.map(l => `<span class="tech-chip">${escapeHtml(l)}</span>`).join('');
      }
    } else {
      el.serverTechLeak.style.display = 'none';
    }

    // Render Raw Headers Block
    if (el.rawHeadersWrap) {
      el.rawHeadersWrap.style.display = 'flex';

      if (el.httpStatusPill) {
        const line = statusLine || 'HTTP 200 OK';
        el.httpStatusPill.textContent = line;
        if (line.includes('4') || line.includes('5')) {
          el.httpStatusPill.className = 'http-status-pill status-error';
        } else if (line.includes('3')) {
          el.httpStatusPill.className = 'http-status-pill status-warn';
        } else {
          el.httpStatusPill.className = 'http-status-pill';
        }
      }

      // Format raw headers string
      let rawString = (statusLine || 'HTTP 200 OK') + '\n';
      if (rawList && rawList.length > 0) {
        rawString += rawList.map(r => `${r.name}: ${r.value}`).join('\n');
      } else {
        rawString += Object.entries(h).map(([k, v]) => `${k}: ${v}`).join('\n');
      }

      if (el.rawHeadersPre) {
        el.rawHeadersPre.textContent = rawString;
      }
    }
  }

  // Raw Headers Toggle and Copy
  if (el.toggleRawHeadersBtn && el.rawHeadersPre) {
    el.toggleRawHeadersBtn.addEventListener('click', () => {
      const isVisible = el.rawHeadersPre.style.display === 'block';
      el.rawHeadersPre.style.display = isVisible ? 'none' : 'block';
      if (el.copyRawHeadersBtn) el.copyRawHeadersBtn.style.display = isVisible ? 'none' : 'inline-block';
      el.toggleRawHeadersBtn.textContent = isVisible ? 'Show Raw Headers' : 'Hide Raw Headers';
    });
  }

  if (el.copyRawHeadersBtn && el.rawHeadersPre) {
    el.copyRawHeadersBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(el.rawHeadersPre.textContent);
      if (window.IconAnimator) IconAnimator.pop(el.copyRawHeadersBtn);
      showToast('Raw HTTP response headers copied to clipboard');
    });
  }

  if (el.refreshHeadersBtn) {
    el.refreshHeadersBtn.addEventListener('click', () => {
      if (window.IconAnimator) IconAnimator.spin(el.refreshHeadersBtn);
      if (activeUrl) auditSecurityHeaders(activeUrl, true);
    });
  }

  // Scoped Dorks
  function setupScopedDorks(host) {
    el.dorkChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const dorkPattern = chip.dataset.dork;
        const query = `site:${host} ${dorkPattern}`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        chrome.tabs.create({ url: searchUrl });
      });
    });
  }

  // OSINT External Links
  function setupOsintLinks(host) {
    if (el.osintShodan) el.osintShodan.href = `https://www.shodan.io/search?query=hostname:${host}`;
    if (el.osintCrtsh) el.osintCrtsh.href = `https://crt.sh/?q=%25.${host}`;
    if (el.osintVt) el.osintVt.href = `https://www.virustotal.com/gui/domain/${host}`;
    if (el.osintWayback) el.osintWayback.href = `https://web.archive.org/web/*/${host}`;
    if (el.osintUrlscan) el.osintUrlscan.href = `https://urlscan.io/domain/${host}`;
  }

  // ==========================================================================
  // TAB 2: PAGE AUDIT (CLICKJACKING, FORMS, ENDPOINTS)
  // ==========================================================================

  // Clickjacking Live Test
  function setupClickjackTest(url) {
    el.runClickjackBtn.addEventListener('click', () => {
      runClickjackingTest(url);
    });

    el.closeCjPreviewBtn.addEventListener('click', () => {
      el.cjFrameContainer.style.display = 'none';
    });
  }

  function runClickjackingTest(url) {
    el.cjBadge.textContent = 'TESTING...';
    el.cjBadge.className = 'cj-status-badge';
    el.cjStatusText.textContent = 'Attempting cross-origin iframe framing...';
    el.cjFrameContainer.style.display = 'flex';

    let hasLoaded = false;
    let timeoutId = null;

    el.cjIframe.src = url;

    const onFrameLoad = () => {
      hasLoaded = true;
      clearTimeout(timeoutId);
      el.cjBadge.textContent = 'VULNERABLE';
      el.cjBadge.className = 'cj-status-badge cj-vulnerable';
      el.cjStatusText.textContent = 'Target page rendered inside cross-origin frame without blocking. Vulnerable to Clickjacking/UI Redressing.';
    };

    el.cjIframe.onload = onFrameLoad;

    timeoutId = setTimeout(() => {
      if (!hasLoaded) {
        el.cjBadge.textContent = 'PROTECTED';
        el.cjBadge.className = 'cj-status-badge cj-protected';
        el.cjStatusText.textContent = 'Framing refused or blocked by X-Frame-Options / CSP frame-ancestors policy.';
      }
    }, 2800);
  }

  // Forms & Hidden Inputs Inspector
  async function scanPageForms() {
    if (!activeTab || !activeTab.id || !activeUrl || activeUrl.startsWith('chrome://')) return;

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          const forms = Array.from(document.forms);
          const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
          const hiddenInputs = Array.from(document.querySelectorAll('input[type="hidden"]')).map(inp => ({
            name: inp.name || inp.id || '(anonymous)',
            id: inp.id || '',
            value: inp.value || '',
            formAction: inp.form ? inp.form.action : ''
          }));
          const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));

          return {
            formsCount: forms.length,
            inputsCount: allInputs.length,
            hiddenCount: hiddenInputs.length,
            passwordsCount: passwordInputs.length,
            hiddenItems: hiddenInputs
          };
        }
      });

      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        el.statFormsCount.textContent = data.formsCount;
        el.statInputsCount.textContent = data.inputsCount;
        el.statHiddenCount.textContent = data.hiddenCount;
        el.statPasswordsCount.textContent = data.passwordsCount;

        discoveredHiddenInputs = data.hiddenItems;
        renderHiddenInputsList(discoveredHiddenInputs);
      }
    } catch (err) {
      console.warn('Form inspection unavailable on this frame:', err);
    }
  }

  function renderHiddenInputsList(items) {
    if (!items || items.length === 0) {
      el.hiddenInputsList.innerHTML = '<div class="empty-state">No hidden input fields discovered on active page.</div>';
      return;
    }

    let html = '';
    items.forEach((item, idx) => {
      html += `
        <div class="hidden-input-item">
          <div class="hidden-item-meta">
            <span class="hidden-input-name">${escapeHtml(item.name)}:</span>
            <span class="hidden-input-val" title="${escapeHtml(item.value)}">${escapeHtml(item.value || '(empty)')}</span>
          </div>
          <button class="endpoint-copy-btn copy-hidden-btn" data-idx="${idx}" type="button">Copy</button>
        </div>
      `;
    });

    el.hiddenInputsList.innerHTML = html;

    el.hiddenInputsList.querySelectorAll('.copy-hidden-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const item = items[idx];
        if (item) {
          await navigator.clipboard.writeText(item.value);
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        }
      });
    });
  }

  // Reveal & Unlock Hidden Fields on Target Page Live
  if (el.revealHiddenFieldsBtn) {
    el.revealHiddenFieldsBtn.addEventListener('click', async () => {
      if (window.IconAnimator) IconAnimator.pop(el.revealHiddenFieldsBtn);
      if (!activeTab || !activeTab.id) return;
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => {
            let revealedCount = 0;
            const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(inp => {
              inp.type = 'text';
              inp.style.border = '2px dashed #f59e0b';
              inp.style.background = 'rgba(245, 158, 11, 0.2)';
              inp.style.color = '#111';
              inp.style.padding = '4px 8px';
              inp.style.margin = '4px';
              inp.style.display = 'inline-block';
              inp.style.visibility = 'visible';
              inp.style.zIndex = '999999';

              const label = document.createElement('span');
              label.style.fontFamily = 'monospace';
              label.style.fontSize = '10px';
              label.style.background = '#f59e0b';
              label.style.color = '#000';
              label.style.padding = '2px 4px';
              label.style.fontWeight = 'bold';
              label.style.borderRadius = '3px';
              label.textContent = `[HIDDEN: ${inp.name || inp.id || 'field'}]`;
              inp.parentNode.insertBefore(label, inp);

              revealedCount++;
            });

            // Unlock disabled and readonly inputs
            const lockedInputs = document.querySelectorAll('input:disabled, textarea:disabled, button:disabled, [readonly]');
            lockedInputs.forEach(el => {
              el.removeAttribute('disabled');
              el.removeAttribute('readonly');
              el.style.outline = '2px solid #10b981';
            });

            return { revealedCount, unlockedCount: lockedInputs.length };
          }
        });

        if (results && results[0] && results[0].result) {
          const res = results[0].result;
          showToast(`Revealed ${res.revealedCount} hidden & unlocked ${res.unlockedCount} disabled elements on page!`);
        }
      } catch (err) {
        showToast('Could not execute script on target tab');
      }
    });
  }

  if (el.scanFormsBtn) {
    el.scanFormsBtn.addEventListener('click', () => {
      if (window.IconAnimator) IconAnimator.spin(el.scanFormsBtn);
      scanPageForms();
    });
  }

  // Page Endpoints & JS Scraper
  async function scrapePageEndpoints() {
    if (!activeTab || !activeTab.id || !activeUrl || activeUrl.startsWith('chrome://')) return;

    el.endpointsListBox.innerHTML = '<div class="loading-state"><span class="spinner-dot"></span><span>Scraping script bundles and endpoints...</span></div>';

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          const set = new Set();

          // 1. Script sources
          document.querySelectorAll('script[src]').forEach(s => {
            const src = s.getAttribute('src');
            if (src) set.add(src);
          });

          // 2. Links & actions
          document.querySelectorAll('a[href], form[action]').forEach(el => {
            const val = el.getAttribute('href') || el.getAttribute('action');
            if (val && !val.startsWith('#') && !val.startsWith('javascript:')) {
              set.add(val);
            }
          });

          // 3. Inline scripts regex extraction
          const scripts = Array.from(document.scripts);
          const endpointRegex = /(?:"|')(\/(?:api|v[0-9]|graphql|auth|admin|user|rest|oauth|static|assets)[a-zA-Z0-9_\-\/\.\?\=\&\#\%]*)(?:"|')/gi;
          const fileRegex = /(?:"|')([a-zA-Z0-9_\-\.\/]+\.(?:json|js|php|asp|aspx|action|do|xml|txt|env|yml|yaml|bak|sql))(?:"|')/gi;

          scripts.forEach(s => {
            if (!s.src && s.textContent) {
              let m;
              while ((m = endpointRegex.exec(s.textContent)) !== null) {
                if (m[1] && m[1].length < 160) set.add(m[1]);
              }
              while ((m = fileRegex.exec(s.textContent)) !== null) {
                if (m[1] && m[1].length < 160) set.add(m[1]);
              }
            }
          });

          return Array.from(set);
        }
      });

      if (results && results[0] && Array.isArray(results[0].result)) {
        discoveredEndpoints = results[0].result;
        el.endpointsCountBadge.textContent = `${discoveredEndpoints.length} items`;
        renderEndpointsList(discoveredEndpoints);
      } else {
        el.endpointsListBox.innerHTML = '<div class="empty-state">No endpoints or script bundles detected.</div>';
      }
    } catch (err) {
      el.endpointsListBox.innerHTML = '<div class="empty-state">DOM endpoint scraper not available for this page schema.</div>';
    }
  }

  function renderEndpointsList(items) {
    if (!items || items.length === 0) {
      el.endpointsListBox.innerHTML = '<div class="empty-state">No endpoints matching current filter.</div>';
      return;
    }

    let html = '';
    items.forEach((item, idx) => {
      html += `
        <div class="endpoint-row">
          <span class="endpoint-text" title="${escapeHtml(item)}">${escapeHtml(item)}</span>
          <button class="endpoint-copy-btn copy-ep-btn" data-idx="${idx}" type="button">Copy</button>
        </div>
      `;
    });

    el.endpointsListBox.innerHTML = html;

    el.endpointsListBox.querySelectorAll('.copy-ep-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const text = items[idx];
        if (text) {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
        }
      });
    });
  }

  if (el.endpointsFilterInput) {
    el.endpointsFilterInput.addEventListener('input', () => {
      const q = el.endpointsFilterInput.value.trim().toLowerCase();
      if (!q) {
        renderEndpointsList(discoveredEndpoints);
      } else {
        const filtered = discoveredEndpoints.filter(ep => ep.toLowerCase().includes(q));
        renderEndpointsList(filtered);
      }
    });
  }

  if (el.copyAllEndpointsBtn) {
    el.copyAllEndpointsBtn.addEventListener('click', async () => {
      if (discoveredEndpoints.length === 0) return;
      await navigator.clipboard.writeText(discoveredEndpoints.join('\n'));
      if (window.IconAnimator) IconAnimator.pop(el.copyAllEndpointsBtn);
      showToast(`Copied ${discoveredEndpoints.length} endpoints to clipboard`);
    });
  }

  if (el.scrapeEndpointsBtn) {
    el.scrapeEndpointsBtn.addEventListener('click', () => {
      if (window.IconAnimator) IconAnimator.spin(el.scrapeEndpointsBtn);
      scrapePageEndpoints();
    });
  }

  // ==========================================================================
  // TAB 3: USER-AGENT SPOOFER
  // ==========================================================================
  async function setupUaSpoofer() {
    // Read current storage
    const stored = await chrome.storage.local.get(['activeSessionUserAgent', 'autoReloadOnUaSwitch']);
    const activeUa = stored.activeSessionUserAgent;
    const autoReload = stored.autoReloadOnUaSwitch !== false;

    if (el.autoReloadToggle) {
      el.autoReloadToggle.checked = autoReload;
      el.autoReloadToggle.addEventListener('change', () => {
        chrome.storage.local.set({ autoReloadOnUaSwitch: el.autoReloadToggle.checked });
      });
    }

    updateUaStatusUi(activeUa);

    // Preset buttons
    el.uaPresetBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.ua;
        const preset = UA_PRESETS[key];
        if (preset) {
          await applyUserAgent(preset);
        }
      });
    });

    // Custom UA button
    if (el.applyCustomUaBtn && el.customUaInput) {
      el.applyCustomUaBtn.addEventListener('click', async () => {
        const customVal = el.customUaInput.value.trim();
        if (customVal) {
          await applyUserAgent({
            name: 'Custom Profile',
            value: customVal
          });
        }
      });
    }

    // Reset button
    if (el.resetUaBtn) {
      el.resetUaBtn.addEventListener('click', async () => {
        await applyUserAgent(UA_PRESETS['native']);
      });
    }

    // Bypass headers chips copy
    el.bypassChips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const val = chip.dataset.copy;
        if (val) {
          await navigator.clipboard.writeText(val);
          showToast(`Copied: ${val}`);
        }
      });
    });
  }

  async function applyUserAgent(preset) {
    if (!preset || !preset.value) {
      // Reset to native
      await chrome.storage.local.remove(['activeSessionUserAgent']);
      try {
        await chrome.runtime.sendMessage({ action: 'resetUserAgent' });
      } catch {}
      updateUaStatusUi(null);
      showToast('Restored Native Browser User-Agent');
    } else {
      const data = {
        name: preset.name,
        value: preset.value,
        timestamp: Date.now()
      };
      await chrome.storage.local.set({ activeSessionUserAgent: data });
      try {
        await chrome.runtime.sendMessage({ action: 'applyUserAgent', data });
      } catch {}
      updateUaStatusUi(data);
      showToast(`User-Agent switched to: ${preset.name}`);
    }

    // Auto-reload active tab if enabled
    if (el.autoReloadToggle && el.autoReloadToggle.checked && activeTab && activeTab.id) {
      chrome.tabs.reload(activeTab.id);
    }
  }

  function updateUaStatusUi(activeUa) {
    if (!activeUa || !activeUa.value) {
      el.activeUaPill.textContent = 'Native Browser';
      el.activeUaPill.className = 'ua-status-pill status-native';
      el.uaPresetBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ua === 'native');
      });
      if (el.customUaInput) el.customUaInput.value = '';
    } else {
      el.activeUaPill.textContent = activeUa.name || 'Spoofed UA';
      el.activeUaPill.className = 'ua-status-pill status-spoofed';
      el.uaPresetBtns.forEach(btn => {
        const key = btn.dataset.ua;
        const preset = UA_PRESETS[key];
        btn.classList.toggle('active', preset && preset.value === activeUa.value);
      });
      if (el.customUaInput) el.customUaInput.value = activeUa.value;
    }
  }

  // ==========================================================================
  // TAB 4: MINI LAN SHARED NOTES (MULTI-TAB FORMAT v2 SUPPORT)
  // ==========================================================================
  const LAN_NOTE_COLORS = {
    violet: '#a855f7',
    onyx: '#64748b',
    emerald: '#10b981',
    amber: '#f59e0b',
    cyan: '#06b6d4',
    rose: '#f43f5e',
    blue: '#3b82f6'
  };
  const LAN_COLOR_KEYS = Object.keys(LAN_NOTE_COLORS);

  function parseLanNotesPayload(raw) {
    if (typeof raw !== 'string') raw = '';
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.notes) && parsed.notes.length > 0) {
        const activeId = (parsed.activeId && parsed.notes.some(n => n.id === parsed.activeId))
          ? parsed.activeId
          : parsed.notes[0].id;
        return {
          version: parsed.version || 2,
          activeId,
          notes: parsed.notes.map(n => ({
            id: String(n.id || ('note-' + Math.random().toString(36).substr(2, 9))),
            title: String(n.title || 'Untitled'),
            author: String(n.author || ''),
            color: String(n.color || 'cyan'),
            content: typeof n.content === 'string' ? n.content : '',
            updatedAt: String(n.updatedAt || 'Just now')
          }))
        };
      }
    } catch (e) {}

    return {
      version: 2,
      activeId: 'note-default',
      notes: [
        {
          id: 'note-default',
          title: 'General',
          author: 'Kkaxh1',
          color: 'cyan',
          content: raw,
          updatedAt: 'Just now'
        }
      ]
    };
  }

  function serializeLanNotesPayload(lanData) {
    return JSON.stringify({
      version: 2,
      activeId: lanData.activeId,
      notes: lanData.notes
    }, null, 2);
  }

  async function setupLanNotes() {
    const res = await chrome.storage.local.get(['lanNotesServerUrl', 'lanNotesCachedText']);
    lanServerUrl = res.lanNotesServerUrl || 'http://192.168.1.143:9900';
    const cachedText = res.lanNotesCachedText || '';

    let lanData = parseLanNotesPayload(cachedText);

    function getActiveNote() {
      let n = lanData.notes.find(item => item.id === lanData.activeId);
      if (!n) {
        n = lanData.notes[0];
        if (n) lanData.activeId = n.id;
      }
      if (!n) {
        n = {
          id: 'note-' + Date.now(),
          title: 'General',
          author: 'Kkaxh1',
          color: 'cyan',
          content: '',
          updatedAt: 'Just now'
        };
        lanData.notes.push(n);
        lanData.activeId = n.id;
      }
      return n;
    }

    el.lanPopupSrvUrl.textContent = lanServerUrl;

    function renderPopupTabs() {
      if (!el.lanPopupTabsBar) return;
      el.lanPopupTabsBar.innerHTML = '';
      getActiveNote();

      lanData.notes.forEach(note => {
        const tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.className = 'lan-popup-tab' + (note.id === lanData.activeId ? ' active' : '');
        tabBtn.dataset.id = note.id;

        const colorHex = LAN_NOTE_COLORS[note.color] || '#06b6d4';
        const tooltip = note.author ? `${note.title} (${note.author})` : note.title;
        tabBtn.title = tooltip;

        tabBtn.innerHTML = `
          <span class="lan-popup-tab-dot" style="background:${colorHex}"></span>
          <span class="lan-popup-tab-title">${escapeHtml(note.title)}</span>
        `;

        tabBtn.addEventListener('click', () => {
          if (note.id === lanData.activeId) return;
          // Commit current textarea edits
          const cur = getActiveNote();
          cur.content = el.lanPopupTextarea.value;
          cur.updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          lanData.activeId = note.id;
          el.lanPopupTextarea.value = note.content;
          renderPopupTabs();
          updateLanStats();
          saveLanNotes();
        });

        el.lanPopupTabsBar.appendChild(tabBtn);
      });

      // Add Tab button
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'lan-popup-add-tab';
      addBtn.title = 'Add new tab';
      addBtn.innerHTML = `+ Tab`;
      addBtn.addEventListener('click', () => {
        const cur = getActiveNote();
        cur.content = el.lanPopupTextarea.value;

        const defaultTitle = `Note ${lanData.notes.length + 1}`;
        const title = prompt('Enter new tab title:', defaultTitle);
        if (title === null) return;
        const tabTitle = title.trim() || defaultTitle;
        const newColor = LAN_COLOR_KEYS[lanData.notes.length % LAN_COLOR_KEYS.length] || 'cyan';
        const newNote = {
          id: 'note-' + Date.now(),
          title: tabTitle,
          author: 'Kkaxh1',
          color: newColor,
          content: '',
          updatedAt: 'Just now'
        };
        lanData.notes.push(newNote);
        lanData.activeId = newNote.id;
        el.lanPopupTextarea.value = '';
        renderPopupTabs();
        updateLanStats();
        el.lanPopupTextarea.focus();
        saveLanNotes();
      });
      el.lanPopupTabsBar.appendChild(addBtn);
    }

    renderPopupTabs();
    el.lanPopupTextarea.value = getActiveNote().content;
    updateLanStats();

    // Fetch initial from server
    fetchLanNotes();

    // Textarea auto-save debounced
    el.lanPopupTextarea.addEventListener('input', () => {
      getActiveNote().content = el.lanPopupTextarea.value;
      getActiveNote().updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateLanStats();
      setLanStatus('saving', 'Saving...');
      clearTimeout(lanDebounceTimer);
      lanDebounceTimer = setTimeout(() => {
        saveLanNotes();
      }, 700);
    });

    // Manual Sync
    el.lanPopupSyncBtn.addEventListener('click', () => {
      if (window.IconAnimator) IconAnimator.spin(el.lanPopupSyncBtn);
      fetchLanNotes();
    });

    // 1-Click Replace ` to ' (Selection or Full Note)
    if (el.lanPopupReplaceBtn) {
      el.lanPopupReplaceBtn.addEventListener('click', () => {
        const textarea = el.lanPopupTextarea;
        const fullText = textarea.value;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const hasSelection = (typeof start === 'number' && typeof end === 'number' && start !== end);

        if (hasSelection) {
          const selectedText = fullText.slice(start, end);
          const count = (selectedText.match(/`/g) || []).length;
          if (count === 0) {
            showToast("No backticks (`) in selected text");
            return;
          }
          const replaced = selectedText.replace(/`/g, "'");
          textarea.value = fullText.slice(0, start) + replaced + fullText.slice(end);
          textarea.setSelectionRange(start, start + replaced.length);
          getActiveNote().content = textarea.value;
          updateLanStats();
          saveLanNotes();
          showToast(`Replaced ${count} backtick${count === 1 ? '' : 's'} with ' in selection`);
        } else {
          const count = (fullText.match(/`/g) || []).length;
          if (count === 0) {
            showToast("No backticks (`) found in notes");
            return;
          }
          const replaced = fullText.replace(/`/g, "'");
          textarea.value = replaced;
          getActiveNote().content = replaced;
          updateLanStats();
          saveLanNotes();
          showToast(`Replaced ${count} backtick${count === 1 ? '' : 's'} with ' in notes`);
        }
      });
    }

    // 1-Click Replace em dash (—) to hyphen (-) (Selection or Full Note)
    if (el.lanPopupDashBtn) {
      el.lanPopupDashBtn.addEventListener('click', () => {
        const textarea = el.lanPopupTextarea;
        const fullText = textarea.value;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const hasSelection = (typeof start === 'number' && typeof end === 'number' && start !== end);
        const dashRegex = /[—–―‒]/g;

        if (hasSelection) {
          const selectedText = fullText.slice(start, end);
          const count = (selectedText.match(dashRegex) || []).length;
          if (count === 0) {
            showToast("No em dashes in selected text");
            return;
          }
          const replaced = selectedText.replace(dashRegex, '-');
          textarea.value = fullText.slice(0, start) + replaced + fullText.slice(end);
          textarea.setSelectionRange(start, start + replaced.length);
          getActiveNote().content = textarea.value;
          updateLanStats();
          saveLanNotes();
          showToast(`Replaced ${count} em dash${count === 1 ? '' : 'es'} with - in selection`);
        } else {
          const count = (fullText.match(dashRegex) || []).length;
          if (count === 0) {
            showToast("No em dashes found in notes");
            return;
          }
          const replaced = fullText.replace(dashRegex, '-');
          textarea.value = replaced;
          getActiveNote().content = replaced;
          updateLanStats();
          saveLanNotes();
          showToast(`Replaced ${count} em dash${count === 1 ? '' : 'es'} with - in notes`);
        }
      });
    }

    // Copy Notes
    el.lanPopupCopyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(el.lanPopupTextarea.value);
      if (window.IconAnimator) IconAnimator.pop(el.lanPopupCopyBtn);
      showToast('Active note copied to clipboard');
    });

    // Clip target
    el.lanPopupClipBtn.addEventListener('click', () => {
      if (window.IconAnimator) IconAnimator.pop(el.lanPopupClipBtn);
      clipTargetToNotes();
    });

    function clipTargetToNotes() {
      if (!activeUrl) {
        showToast('No active URL to clip');
        return;
      }
      const title = activeTab && activeTab.title ? activeTab.title : activeHostname;
      const clipLine = `\n- [${getTimestamp()}] Target: ${activeUrl} ("${title}")\n`;
      
      const active = getActiveNote();
      const updated = (el.lanPopupTextarea.value.trimEnd() + clipLine).trimStart();
      el.lanPopupTextarea.value = updated;
      active.content = updated;
      active.updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateLanStats();
      saveLanNotes();
      showToast(`Target clipped to note "${active.title}"!`);
    }

    async function fetchLanNotes() {
      setLanStatus('saving', 'Syncing...');
      try {
        const cleanUrl = lanServerUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/notes`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const incomingRaw = typeof data.text === 'string' ? data.text : '';
        const currentSerialized = serializeLanNotesPayload(lanData);
        if (incomingRaw !== currentSerialized) {
          lanData = parseLanNotesPayload(incomingRaw);
          await chrome.storage.local.set({ lanNotesCachedText: incomingRaw });
          renderPopupTabs();
          el.lanPopupTextarea.value = getActiveNote().content;
          updateLanStats();
          setLanStatus('synced', 'Synced');
        } else {
          setLanStatus('synced', 'Synced');
        }
        el.lanPopupTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (err) {
        setLanStatus('offline', 'Server Offline');
      }
    }

    async function saveLanNotes() {
      const active = getActiveNote();
      active.content = el.lanPopupTextarea.value;
      active.updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const serialized = serializeLanNotesPayload(lanData);
      try {
        const cleanUrl = lanServerUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: serialized, force: true })
        });
        if (res.ok) {
          await chrome.storage.local.set({ lanNotesCachedText: serialized });
          setLanStatus('synced', 'Saved');
          el.lanPopupTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          setLanStatus('offline', 'Save error');
        }
      } catch (err) {
        setLanStatus('offline', 'Server Offline');
      }
    }

    function setLanStatus(state, label) {
      el.lanPopupDot.className = `lan-status-dot ${state}`;
      el.lanPopupStatus.textContent = label;
    }

    function updateLanStats() {
      const val = el.lanPopupTextarea.value || '';
      el.lanPopupStats.textContent = `${val.length} chars`;
    }
  }

  // Utility Escaper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
