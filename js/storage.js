/**
 * Unified storage service supporting chrome.storage.local with transparent localStorage fallback
 */
const StorageService = (() => {
  const isChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  /**
   * Default application state configuration
   */
  const DEFAULTS = {
    theme: 'dark', // 'dark', 'midnight', 'light'
    clockFormat: '12', // '12' or '24'
    accentColor: '#4285F4', // default Google Blue
    bgOpacity: 0.65,
    quoteCategory: 'all',
    activeWidgets: ['identity', 'clock', 'date', 'quotes'],
    widgetSizes: {
      identity: 'compact',
      clock: 'normal',
      date: 'compact',
      quotes: 'normal',
      quicklinks: 'normal',
      notes: 'normal',
      countdown: 'wide',
      weather: 'compact',
      worldclock: 'normal',
      github: 'compact',
      systemstatus: 'compact',
      todolist: 'wide',
      payloads: 'wide',
      encoder: 'wide',
      commonports: 'wide',
      subnets: 'normal',
      cvss: 'wide',
      useragents: 'wide',
      googledorks: 'wide'
    },
    countdownTitle: 'CTF / Engagement Deadline',
    countdownMode: 'date',
    countdownTargetDate: '',
    countdownStartDate: '',
    countdownSprintMins: 45,
    countdownSprintRemaining: 2700,
    countdownSprintRunning: false,
    dorkScopeDomain: 'example.com',
    dorkPersonTarget: 'John Doe',
    dorkHandleTarget: 'johndoe',
    osintNotes: [],
    customDorks: [],
    dorkFavorites: [],
    userName: 'kkaxh1',
    greetingType: 'dynamic', // 'dynamic' (Good Morning/Afternoon/Evening) or 'welcome' (Welcome)
    welcomeSubtext: 'OPERATIONAL ENVIRONMENT READY',
    notesContent: 'Target Scope:\n- api.internal.local (10.0.4.0/24)\n- auth.staging.example.com\n\nActive findings / payloads ready.',
    searchEngine: 'google',
    ipDetectorEnabled: true,
    dockLinks: {
      search: [
        { title: 'Google Search', desc: 'Primary web search engine', url: 'https://www.google.com' },
        { title: 'Google Dork Builder', desc: 'Interactive OSINT reconnaissance & query builder', url: '#dorkui' },
        { title: 'Person OSINT Workbench', desc: 'Social profiles, aliases & professional identity research', url: '#person-osint' },
        { title: 'DuckDuckGo', desc: 'Untracked privacy search index', url: 'https://duckduckgo.com' },
        { title: 'Torch Search Engine (.onion)', desc: 'Oldest Tor dark web hidden service search', url: 'http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion' },
        { title: 'Ahmia Tor Search', desc: 'Clearnet-accessible index for .onion sites', url: 'https://ahmia.fi' },
        { title: 'DuckDuckGo (.onion)', desc: 'Tor hidden service version of DuckDuckGo', url: 'https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion' },
        { title: 'Brave Search', desc: 'Independent privacy-first index', url: 'https://search.brave.com' },
        { title: 'DeepSeek AI', desc: 'Advanced reasoning & code generation assistant', url: 'https://chat.deepseek.com' },
        { title: 'Google Hacking DB (GHDB)', desc: 'Curated Google dorks & juicy file queries', url: 'https://www.exploit-db.com/google-hacking-database' },
        { title: 'GitHub Code Search', desc: 'Find leaked keys, tokens, and endpoints', url: 'https://github.com/search?type=code' }
      ],
      github: [
        { title: 'PayloadsAllTheThings', desc: 'Web app security payloads, bypasses & cheats', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' },
        { title: 'SecLists', desc: 'Security tester companion wordlists & discovery', url: 'https://github.com/danielmiessler/SecLists' },
        { title: 'PEASS-ng (LinPEAS/WinPEAS)', desc: 'Privilege escalation tools for Linux & Windows', url: 'https://github.com/carlospolop/PEASS-ng' },
        { title: 'Nuclei Templates', desc: 'Community curated vulnerability scanner templates', url: 'https://github.com/projectdiscovery/nuclei-templates' },
        { title: 'HackTricks Source', desc: 'HackTricks wiki open repository', url: 'https://github.com/carlospolop/hacktricks' },
        { title: 'GitHub Home', desc: 'Primary dashboard & trending repositories', url: 'https://github.com' }
      ],
      cheatsheets: [
        { title: 'HackTricks Cloud & Pentest', desc: 'Modern cybersecurity wiki & testing handbook', url: 'https://book.hacktricks.xyz' },
        { title: 'GTFOBins', desc: 'Bypass local security restrictions in Linux binaries', url: 'https://gtfobins.github.io' },
        { title: 'LOLBAS Project', desc: 'Living Off The Land Binaries for Windows', url: 'https://lolbas-project.github.io' },
        { title: 'WADComs', desc: 'Interactive cheatsheet for Active Directory commands', url: 'https://wadcoms.github.io' },
        { title: 'RevShells Generator', desc: 'One-liner reverse shells and listener commands', url: 'https://www.revshells.com' }
      ],
      lookups: [
        { title: 'Exploit-DB', desc: 'Verified exploits, PoCs, and shellcode archives', url: 'https://www.exploit-db.com' },
        { title: 'Sploitus', desc: 'Fast exploit & 0-day vulnerability search engine', url: 'https://sploitus.com' },
        { title: 'crt.sh Certificate Search', desc: 'Certificate transparency subdomain mapping', url: 'https://crt.sh' },
        { title: 'Default Credentials Lookup', desc: 'Default logins for routers, cameras & appliances', url: 'https://default-password.info' },
        { title: 'BGP / ASN Scope Lookup', desc: 'Hurricane Electric CIDR & ASN scoping tool', url: 'https://bgp.he.net' }
      ],
      appsec: [
        { title: 'PortSwigger Web Academy', desc: 'Interactive web vulnerability labs & materials', url: 'https://portswigger.net/web-security' },
        { title: 'OWASP WSTG Checklist', desc: 'Definitive web security testing guide', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
        { title: 'OWASP Top 10', desc: 'Industry standard application security risks', url: 'https://owasp.org/www-project-top-ten/' },
        { title: 'Hack The Box', desc: 'Offensive pentest labs & machine training', url: 'https://www.hackthebox.com' }
      ],
      decoders: [
        { title: 'CyberChef App', desc: 'Swiss Army knife for encodings & transforms', url: 'https://gchq.github.io/CyberChef/' },
        { title: 'CrackStation Hash Lookup', desc: 'Fast lookup for MD5, SHA1, SHA256 hashes', url: 'https://crackstation.net' },
        { title: 'JWT.io Debugger', desc: 'Decode, verify, and tamper JSON Web Tokens', url: 'https://jwt.io' },
        { title: 'Hash Identifier', desc: 'Identify unknown hash algorithms & formats', url: 'https://hashes.com/en/tools/hash_identifier' }
      ]
    },
    todoList: [
      { id: '1', text: 'Subdomain enumeration & DNS recon', completed: true },
      { id: '2', text: 'Review authenticated API endpoints', completed: false },
      { id: '3', text: 'Test IDORs on user profile parameters', completed: false },
      { id: '4', text: 'Inspect WebSocket handshake & token refresh', completed: false }
    ],
    // Background Configuration
    bgSource: 'unsplash',
    unsplashSearch: 'cyber security',
    unsplashCategory: 'technology',
    unsplashMode: 'random',
    unsplashDailyDate: '',
    unsplashDailyPhoto: null,
    wallpaperUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=75&auto=format&fit=crop',
    wallpaperTitle: 'Dark Matrix',
    wallpaperAuthor: 'Markus Spiske',
    cachedWallpaperDataUrl: '',
    nextUnsplashWallpaper: null,
    customWallpaperUrl: '',
    localImageData: '',
    localImageName: '',
    solidGradientValue: 'linear-gradient(135deg, #0b0f19 0%, #151b28 50%, #0d1117 100%)',
    overlayDarkness: 0.65,
    overlayBlur: 8,
    effectGlassReadability: true,
    effectVignette: true,
    effectParallax: false,
    effectMotion: false,
    infoShowPhotographer: true,
    infoShowAttribution: true
  };

  /**
   * High-performance in-memory cache to eliminate async IPC bottlenecks
   */
  let _cache = null;
  let _initPromise = null;

  function loadFromLocalStorage() {
    const loaded = { ...DEFAULTS };
    try {
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            try {
              loaded[k] = JSON.parse(localStorage.getItem(k));
            } catch {
              loaded[k] = localStorage.getItem(k);
            }
          }
        }
      }
    } catch {}
    return loaded;
  }

  // Pre-seed cache from localStorage for instant frame-0 availability
  _cache = loadFromLocalStorage();

  /**
   * Asynchronously synchronize with chrome.storage.local
   */
  function initCache() {
    if (_initPromise) return _initPromise;

    _initPromise = new Promise((resolve) => {
      if (isChromeStorage) {
        try {
          chrome.storage.local.get(null, (items) => {
            if (!chrome.runtime.lastError && items && typeof items === 'object') {
              _cache = { ...DEFAULTS, ..._cache, ...items };
            }
            resolve(_cache);
          });
        } catch {
          resolve(_cache);
        }
      } else {
        resolve(_cache);
      }
    });

    return _initPromise;
  }

  // Kick off Chrome storage hydration immediately on script evaluation
  initCache();

  /**
   * Retrieve a value by key (instant from memory cache)
   */
  async function get(key, fallbackValue = null) {
    const defaultVal = fallbackValue !== null ? fallbackValue : DEFAULTS[key];
    if (!_cache) {
      await initCache();
    }
    return (_cache && _cache[key] !== undefined) ? _cache[key] : defaultVal;
  }

  /**
   * Synchronous zero-latency getter from memory cache
   */
  function getSync(key, fallbackValue = null) {
    const defaultVal = fallbackValue !== null ? fallbackValue : DEFAULTS[key];
    return (_cache && _cache[key] !== undefined) ? _cache[key] : defaultVal;
  }

  /**
   * Retrieve all settings in a single bulk operation
   */
  async function getAll() {
    if (!_cache) {
      await initCache();
    }
    return { ...DEFAULTS, ..._cache };
  }

  /**
   * Persist a value by key (updates memory cache immediately, writes to storage in background)
   */
  async function set(key, value) {
    if (!_cache) {
      _cache = { ...DEFAULTS };
    }
    _cache[key] = value;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {}

    if (isChromeStorage) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.set({ [key]: value }, () => {
            resolve(true);
          });
        } catch {
          resolve(true);
        }
      });
    }
    return true;
  }

  /**
   * Persist multiple values in a single batch
   */
  async function setMultiple(entries) {
    if (!entries || typeof entries !== 'object') return false;
    if (!_cache) {
      _cache = { ...DEFAULTS };
    }
    Object.assign(_cache, entries);

    try {
      if (typeof localStorage !== 'undefined') {
        for (const [k, v] of Object.entries(entries)) {
          try {
            localStorage.setItem(k, JSON.stringify(v));
          } catch {}
        }
      }
    } catch {}

    if (isChromeStorage) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.set(entries, () => {
            resolve(true);
          });
        } catch {
          resolve(true);
        }
      });
    }
    return true;
  }

  /**
   * Remove a value
   */
  async function remove(key) {
    if (_cache) {
      delete _cache[key];
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {}

    if (isChromeStorage) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.remove([key], () => resolve(true));
        } catch {
          resolve(true);
        }
      });
    }
    return true;
  }

  /**
   * Reset all settings to defaults
   */
  async function resetAll() {
    _cache = { ...DEFAULTS };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        for (const [k, v] of Object.entries(DEFAULTS)) {
          localStorage.setItem(k, JSON.stringify(v));
        }
      }
    } catch {}

    if (isChromeStorage) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.clear(() => {
            chrome.storage.local.set(DEFAULTS, () => resolve(DEFAULTS));
          });
        } catch {
          resolve(DEFAULTS);
        }
      });
    }
    return DEFAULTS;
  }

  return {
    DEFAULTS,
    get,
    getSync,
    getAll,
    set,
    setMultiple,
    remove,
    resetAll,
    initCache
  };
})();

// Export for ES modules or script tags
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
