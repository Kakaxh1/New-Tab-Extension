/**
 * Content script to synchronize client-side navigator properties with active session User-Agent
 * Strictly zero emojis
 */
(function() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

  function applyClientUaSpoof(uaString, platform) {
    if (!uaString) return;

    try {
      if (navigator.userAgentData) {
        delete Navigator.prototype.userAgentData;
      }
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
        get: () => uaString,
        configurable: true
      });
    } catch (e) {}

    try {
      Object.defineProperty(Navigator.prototype, 'appVersion', {
        get: () => uaString,
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

  chrome.storage.local.get(['activeSessionUserAgent'], (res) => {
    const active = res && res.activeSessionUserAgent;
    if (active && active.value) {
      applyClientUaSpoof(active.value, active.platform);
    }
  });
})();
