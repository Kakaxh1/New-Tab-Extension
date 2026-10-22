/**
 * Enhanced Search Service with Auto-Fill, Ghost Predictive Text,
 * Recent Searches, Command Bangs, Keyboard Navigation, and Dynamic Engine Pill.
 */
const SearchService = (() => {
  const COMMANDS = [
    {
      prefix: '/duckduckgo',
      label: 'DuckDuckGo Privacy Search',
      alias: '!ddg',
      aliases: ['!d', '/ddg', '@ddg'],
      pill: 'DuckDuckGo',
      url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://duckduckgo.com'
    },
    {
      prefix: '/torch',
      label: 'Torch Dark Web Search (.onion)',
      alias: '!torch',
      aliases: ['/torch', '!tor', '/tor', '@torch', '@tor'],
      pill: 'Torch',
      url: (q) => `http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion/search?query=${encodeURIComponent(q)}`,
      defaultUrl: 'http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion'
    },
    {
      prefix: '/ahmia',
      label: 'Ahmia Dark Web Search (Clearnet)',
      alias: '!ahmia',
      aliases: ['/ahmia', '@ahmia', '!onion'],
      pill: 'Ahmia',
      url: (q) => `https://ahmia.fi/search/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://ahmia.fi'
    },
    {
      prefix: '/ddgonion',
      label: 'DuckDuckGo Onion (Tor)',
      alias: '!ddgo',
      aliases: ['/ddgo', '@ddgo'],
      pill: 'DDG Onion',
      url: (q) => `https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion'
    },
    {
      prefix: '/brave',
      label: 'Brave Private Search',
      alias: '!brave',
      aliases: ['/brave', '!b', '@brave'],
      pill: 'Brave',
      url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://search.brave.com'
    },
    {
      prefix: '/startpage',
      label: 'Startpage Private Search',
      alias: '!startpage',
      aliases: ['/startpage', '!spg', '@startpage'],
      pill: 'Startpage',
      url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.startpage.com'
    },
    {
      prefix: '/google',
      label: 'Google Search',
      alias: '!g',
      aliases: ['/google', '@google'],
      pill: 'Google',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/github',
      label: 'GitHub Code & Repos',
      alias: '!gh',
      aliases: ['/github', '@github'],
      pill: 'GitHub',
      url: (q) => `https://github.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://github.com'
    },
    {
      prefix: '/youtube',
      label: 'YouTube Videos',
      alias: '!yt',
      aliases: ['/youtube', '@youtube'],
      pill: 'YouTube',
      url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.youtube.com'
    },
    {
      prefix: '/chatgpt',
      label: 'ChatGPT AI',
      alias: '!ai',
      aliases: ['/chatgpt', '@chatgpt'],
      pill: 'ChatGPT',
      url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://chatgpt.com'
    },
    {
      prefix: '/deepseek',
      label: 'DeepSeek AI',
      alias: '!ds',
      aliases: ['/deepseek', '@deepseek', '!deepseek', '/ds', '@ds'],
      pill: 'DeepSeek',
      url: (q) => `https://chat.deepseek.com/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://chat.deepseek.com'
    },
    {
      prefix: '/cve',
      label: 'CVE Details & MITRE',
      alias: '!cve',
      aliases: ['/cve', '@cve'],
      pill: 'CVE',
      url: (q) => `https://www.cvedetails.com/google-search-results.php?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://cve.mitre.org'
    },
    {
      prefix: '/shodan',
      label: 'Shodan Recon',
      alias: '!shodan',
      aliases: ['/shodan', '@shodan'],
      pill: 'Shodan',
      url: (q) => `https://www.shodan.io/search?query=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.shodan.io'
    },
    {
      prefix: '/payloads',
      label: 'PayloadsAllTheThings',
      alias: '!payloads',
      aliases: ['/payloads', '@payloads'],
      pill: 'Payloads',
      url: (q) => `https://github.com/swisskyrepo/PayloadsAllTheThings/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://github.com/swisskyrepo/PayloadsAllTheThings'
    },
    {
      prefix: '/gtfo',
      label: 'GTFOBins PrivEsc',
      alias: '!gtfo',
      aliases: ['/gtfo', '@gtfo'],
      pill: 'GTFOBins',
      url: (q) => `https://gtfobins.github.io/#${encodeURIComponent(q)}`,
      defaultUrl: 'https://gtfobins.github.io'
    },
    {
      prefix: '/hacktricks',
      label: 'HackTricks Pentest Book',
      alias: '!ht',
      aliases: ['/hacktricks', '@hacktricks'],
      pill: 'HackTricks',
      url: (q) => `https://book.hacktricks.xyz/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://book.hacktricks.xyz'
    },
    {
      prefix: '/crt',
      label: 'crt.sh Subdomains',
      alias: '!crt',
      aliases: ['/crt', '@crt'],
      pill: 'crt.sh',
      url: (q) => `https://crt.sh/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://crt.sh'
    },
    {
      prefix: '/sploitus',
      label: 'Sploitus Exploit Search',
      alias: '!sp',
      aliases: ['/sploitus', '@sploitus'],
      pill: 'Sploitus',
      url: (q) => `https://sploitus.com/?query=${encodeURIComponent(q)}`,
      defaultUrl: 'https://sploitus.com'
    },
    {
      prefix: '/exploitdb',
      label: 'Exploit Database',
      alias: '!edb',
      aliases: ['/exploitdb', '@exploitdb'],
      pill: 'Exploit-DB',
      url: (q) => `https://www.exploit-db.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.exploit-db.com'
    },
    {
      prefix: '/portswigger',
      label: 'PortSwigger Web Academy',
      alias: '!ps',
      aliases: ['/portswigger', '@portswigger'],
      pill: 'PortSwigger',
      url: (q) => `https://portswigger.net/web-security/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://portswigger.net/web-security'
    },
    {
      prefix: '/dork',
      label: 'Google Dork Search',
      alias: '!dork',
      aliases: ['/dork', '@dork'],
      pill: 'Dork',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/dorkui',
      label: 'Google Dork Builder HUD',
      alias: '!dorkui',
      aliases: ['/dorkui', '@dorkui'],
      pill: 'Dork UI',
      handler: (q) => {
        if (typeof window.openDorkBuilderModal === 'function') {
          window.openDorkBuilderModal(q);
        } else {
          const modal = document.getElementById('dork-builder-modal');
          if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('active'));
          }
        }
      },
      url: () => '#dorkui',
      defaultUrl: '#dorkui'
    },
    {
      prefix: '/ghdb',
      label: 'Google Hacking Database',
      alias: '!ghdb',
      aliases: ['/ghdb', '@ghdb'],
      pill: 'GHDB',
      url: (q) => `https://www.exploit-db.com/google-hacking-database?search=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.exploit-db.com/google-hacking-database'
    },
    {
      prefix: '/site',
      label: 'Google Site Query',
      alias: '!site',
      aliases: ['/site', '@site'],
      pill: 'Site:',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent('site:' + q.trim())}`,
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/filetype',
      label: 'Google Filetype Query',
      alias: '!filetype',
      aliases: ['/filetype', '@filetype', '!ft'],
      pill: 'Filetype:',
      url: (q) => {
        const parts = q.trim().split(/\s+/);
        if (parts.length >= 2) {
          const ext = parts[0];
          const dom = parts[1];
          return `https://www.google.com/search?q=${encodeURIComponent('site:' + dom + ' filetype:' + ext)}`;
        }
        return `https://www.google.com/search?q=${encodeURIComponent('filetype:' + q.trim())}`;
      },
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/osint',
      label: 'Google OSINT Search',
      alias: '!osint',
      aliases: ['/osint', '@osint'],
      pill: 'OSINT',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/person',
      label: 'Person OSINT Profile Search',
      alias: '!person',
      aliases: ['/person', '@person', '!whoisperson'],
      pill: 'Person OSINT',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent('(site:linkedin.com/in/ OR site:twitter.com OR site:instagram.com) "' + q.trim() + '"')}`,
      defaultUrl: 'https://www.google.com'
    },
    {
      prefix: '/alias',
      label: 'Username & Alias OSINT Search',
      alias: '!alias',
      aliases: ['/alias', '@alias', '!handle', '/handle'],
      pill: 'Handle OSINT',
      url: (q) => {
        const clean = q.trim().replace(/^@/, '');
        return `https://www.google.com/search?q=${encodeURIComponent('(site:github.com OR site:twitter.com OR site:reddit.com/user/) "' + clean + '"')}`;
      },
      defaultUrl: 'https://www.google.com'
    }
  ];

  // Default Search Engine Registry
  const DEFAULT_ENGINES = {
    google: {
      id: 'google',
      name: 'Google',
      pill: 'Google',
      placeholder: 'Search Google, @bang, or /command',
      url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.google.com'
    },
    duckduckgo: {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      pill: 'DuckDuckGo',
      placeholder: 'Search DuckDuckGo (Privacy), @bang, or /command',
      url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://duckduckgo.com'
    },
    torch: {
      id: 'torch',
      name: 'Torch',
      pill: 'Torch',
      placeholder: 'Search Torch (Dark Web .onion), @bang, or /command',
      url: (q) => `http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion/search?query=${encodeURIComponent(q)}`,
      defaultUrl: 'http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion'
    },
    ahmia: {
      id: 'ahmia',
      name: 'Ahmia',
      pill: 'Ahmia',
      placeholder: 'Search Ahmia (Tor Clearnet Index), @bang, or /command',
      url: (q) => `https://ahmia.fi/search/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://ahmia.fi'
    },
    brave: {
      id: 'brave',
      name: 'Brave',
      pill: 'Brave',
      placeholder: 'Search Brave Private Search, @bang, or /command',
      url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://search.brave.com'
    },
    startpage: {
      id: 'startpage',
      name: 'Startpage',
      pill: 'Startpage',
      placeholder: 'Search Startpage (Private Google), @bang, or /command',
      url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
      defaultUrl: 'https://www.startpage.com'
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      pill: 'DeepSeek',
      placeholder: 'Search DeepSeek AI, @bang, or /command',
      url: (q) => `https://chat.deepseek.com/?q=${encodeURIComponent(q)}`,
      defaultUrl: 'https://chat.deepseek.com'
    }
  };

  // Curated cybersecurity & technical predictive terms
  const PREDICTIVE_TERMS = [
    'duckduckgo privacy search bangs',
    'duckduckgo onion hidden service',
    'torch dark web search onion',
    'torch v3 onion hidden wiki',
    'ahmia tor dark web search',
    'brave search private index',
    'startpage private google search',
    'deepseek ai reasoning',
    'deepseek r1 prompt',
    'deepseek coder v3',
    'site:example.com filetype:pdf',
    'site:example.com inurl:login',
    'site:example.com intitle:"index of"',
    'site:example.com (filetype:bak OR filetype:old)',
    'google hacking database ghdb',
    'payloadsallthethings',
    'payloadsallthethings xss',
    'payloadsallthethings sqli',
    'payloadsallthethings ssti',
    'payloadsallthethings lfi',
    'seclists wordlists',
    'seclists passwords',
    'seclists discovery web content',
    'peass-ng linpeas',
    'peass-ng winpeas',
    'nuclei templates',
    'gtfobins suid',
    'gtfobins sudo privileges',
    'lolbas windows living off the land',
    'hacktricks cloud pentesting',
    'hacktricks active directory',
    'exploit-db public exploits',
    'sploitus zero day search',
    'portswigger web security academy',
    'sql injection bypass authentication',
    'xss filter evasion cheat sheet',
    'ssrf aws metadata 169.254.169.254',
    'idor authorization testing',
    'lfi path traversal bypass php filter',
    'subdomain enumeration amass subfinder',
    'ffuf directory discovery fuzzing',
    'hydra ssh brute force',
    'nmap scan flags cheat sheet',
    'bloodhound active directory attack graph',
    'mimikatz sekurlsa logonpasswords',
    'crackstation hash lookup decrypt',
    'cyberchef swiss army knife',
    'reverse shell cheat sheet revshells',
    'cve-2024 poc exploit github',
    'cve-2025 security advisory',
    'jwt debugger json web tokens',
    'default credentials router switch admin'
  ];

  let inputEl = null;
  let ghostEl = null;
  let hintsEl = null;
  let clearBtn = null;
  let enginePill = null;

  let activeEngineId = 'google';
  let activeEngine = DEFAULT_ENGINES.google;

  let recentSearches = [];
  let currentItems = [];
  let selectedIndex = -1;
  let debounceTimer = null;
  let originalInput = '';

  async function init(inputId = 'main-search-input', hintsId = 'search-hints') {
    inputEl = document.getElementById(inputId);
    hintsEl = document.getElementById(hintsId);
    ghostEl = document.getElementById('main-search-ghost');
    clearBtn = document.getElementById('search-clear-btn');
    enginePill = document.getElementById('search-engine-pill');

    if (!inputEl) return;

    // Load active search engine from storage
    activeEngineId = await StorageService.get('searchEngine', 'google');
    setDefaultEngine(activeEngineId);

    // Setup interactive engine pill
    if (enginePill) {
      enginePill.style.cursor = 'pointer';
      enginePill.setAttribute('role', 'button');
      enginePill.setAttribute('tabindex', '0');
      enginePill.title = `Search Engine: ${activeEngine.name} (Click to switch)`;
      enginePill.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleEngine();
      });
      enginePill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycleEngine();
        }
      });
    }

    // Load recent searches
    recentSearches = await StorageService.get('recentSearches', [
      'payloadsallthethings',
      'gtfobins suid',
      'cve details',
      'hacktricks pentest'
    ]);

    // Handle Input Typing
    inputEl.addEventListener('input', handleInputChange);

    // Focus & Blur
    inputEl.addEventListener('focus', () => {
      if (!inputEl.value.trim()) {
        renderRecentOnly();
      } else {
        handleInputChange();
      }
    });

    // Close hints on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        hideHints();
      }
    });

    // Clear Button
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        inputEl.value = '';
        if (ghostEl) ghostEl.value = '';
        clearBtn.style.display = 'none';
        updateEnginePill('');
        inputEl.focus();
        renderRecentOnly();
      });
    }

    // Keyboard controls
    inputEl.addEventListener('keydown', handleKeyDown);

    // Click on kbd hint badge to focus search
    const kbdHint = document.querySelector('.search-kbd-hint');
    if (kbdHint) {
      kbdHint.style.cursor = 'pointer';
      kbdHint.addEventListener('click', () => {
        inputEl.focus();
        inputEl.select();
      });
    }

    // Global shortcut: Pressing 's'/'S' or '/' focuses search input if not typing in an input/textarea
    window.addEventListener('keydown', (e) => {
      // Do not trigger if modifier keys are pressed (e.g., Ctrl+S, Alt+S, Cmd+S)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const targetTag = (e.target && e.target.tagName) ? e.target.tagName : '';
      const isEditable = e.target && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag));
      if (isEditable) return;

      // Don't intercept if an overlay modal is currently open
      const settingsModal = document.getElementById('settings-modal');
      const addModal = document.getElementById('add-widget-modal');
      const cmdPalette = document.getElementById('command-palette-modal');
      const shortcutsModal = document.getElementById('shortcuts-modal');
      const isModalOpen = (settingsModal && settingsModal.classList.contains('active')) ||
                          (addModal && addModal.classList.contains('active')) ||
                          (shortcutsModal && shortcutsModal.classList.contains('active')) ||
                          (cmdPalette && cmdPalette.style.display === 'flex');
      if (isModalOpen) return;

      if ((e.key === '/' || e.key.toLowerCase() === 's') && document.activeElement !== inputEl) {
        e.preventDefault();
        inputEl.focus();
        inputEl.select();
      }
    });
  }

  function setDefaultEngine(engineId) {
    if (DEFAULT_ENGINES[engineId]) {
      activeEngineId = engineId;
      activeEngine = DEFAULT_ENGINES[engineId];
    } else {
      activeEngineId = 'google';
      activeEngine = DEFAULT_ENGINES.google;
    }

    if (inputEl) {
      inputEl.placeholder = activeEngine.placeholder;
      inputEl.setAttribute('aria-label', activeEngine.placeholder);
    }
    updateEnginePill(inputEl ? inputEl.value : '');
  }

  async function cycleEngine() {
    const keys = Object.keys(DEFAULT_ENGINES);
    const currIdx = keys.indexOf(activeEngineId);
    const nextIdx = (currIdx + 1) % keys.length;
    const nextKey = keys[nextIdx];
    setDefaultEngine(nextKey);
    await StorageService.set('searchEngine', nextKey);

    const settingSelect = document.getElementById('setting-search-engine');
    if (settingSelect) settingSelect.value = nextKey;

    if (typeof window.showToast === 'function') {
      window.showToast(`Search Engine: ${activeEngine.name}`);
    }
  }

  function handleInputChange() {
    const raw = inputEl.value;
    const val = raw.trim();

    if (clearBtn) {
      clearBtn.style.display = raw.length > 0 ? 'flex' : 'none';
    }

    updateEnginePill(raw);
    originalInput = raw;
    selectedIndex = -1;

    if (!val) {
      if (ghostEl) ghostEl.value = '';
      renderRecentOnly();
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      computeSuggestions(val);
    }, 40);
  }

  function handleKeyDown(e) {
    const raw = inputEl.value;

    // 1. TAB or ARROW RIGHT -> Auto-complete / Fill Ghost Text
    if ((e.key === 'Tab' || (e.key === 'ArrowRight' && inputEl.selectionStart === raw.length)) && ghostEl && ghostEl.value) {
      if (ghostEl.value.toLowerCase().startsWith(raw.toLowerCase()) && ghostEl.value.length > raw.length) {
        e.preventDefault();
        inputEl.value = ghostEl.value;
        ghostEl.value = '';
        updateEnginePill(inputEl.value);
        computeSuggestions(inputEl.value.trim());
        return;
      }
    }

    // 2. ARROW DOWN -> Navigate down suggestions
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length === 0) return;
      selectedIndex = (selectedIndex + 1) % currentItems.length;
      highlightSelectedItem();
      return;
    }

    // 3. ARROW UP -> Navigate up suggestions
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length === 0) return;
      if (selectedIndex <= 0) {
        selectedIndex = -1;
        inputEl.value = originalInput;
        if (ghostEl) ghostEl.value = '';
        unhighlightItems();
      } else {
        selectedIndex--;
        highlightSelectedItem();
      }
      return;
    }

    // 4. ENTER -> Execute search
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && currentItems[selectedIndex]) {
        executeItem(currentItems[selectedIndex]);
      } else {
        executeSearch(inputEl.value.trim());
      }
      return;
    }

    // 5. ESCAPE -> Dismiss suggestions or clear
    if (e.key === 'Escape') {
      e.preventDefault();
      if (hintsEl && hintsEl.style.display !== 'none') {
        hideHints();
        if (ghostEl) ghostEl.value = '';
      } else {
        inputEl.value = '';
        if (ghostEl) ghostEl.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        updateEnginePill('');
        inputEl.blur();
      }
    }
  }

  function updateEnginePill(query) {
    if (!enginePill) return;
    const lower = query.trim().toLowerCase();
    if (!lower) {
      enginePill.textContent = activeEngine.pill;
      enginePill.style.color = '';
      enginePill.style.background = '';
      enginePill.title = `Search Engine: ${activeEngine.name} (Click to switch)`;
      return;
    }

    // Sort by alias/prefix length descending
    const sorted = [...COMMANDS].sort((a, b) => {
      const maxA = Math.max(a.prefix.length, a.alias ? a.alias.length : 0);
      const maxB = Math.max(b.prefix.length, b.alias ? b.alias.length : 0);
      return maxB - maxA;
    });

    for (const cmd of sorted) {
      const p = cmd.prefix.toLowerCase();
      const a = (cmd.alias || '').toLowerCase();
      const at = '@' + p.slice(1);
      const aliases = (cmd.aliases || []).map(x => x.toLowerCase());

      const matchPatterns = [p, a, at, ...aliases].filter(Boolean);

      for (const pat of matchPatterns) {
        if (lower === pat || lower.startsWith(pat + ' ')) {
          enginePill.textContent = cmd.pill;
          enginePill.style.color = 'var(--accent)';
          enginePill.style.background = 'var(--accent-soft)';
          enginePill.title = `Active search target: ${cmd.label}`;
          return;
        }
      }
    }

    enginePill.textContent = activeEngine.pill;
    enginePill.style.color = '';
    enginePill.style.background = '';
    enginePill.title = `Search Engine: ${activeEngine.name} (Click to switch)`;
  }

  async function computeSuggestions(query) {
    const lower = query.toLowerCase();
    const items = [];

    // A. Match Commands / Bangs
    COMMANDS.forEach(cmd => {
      const matchPrefix = cmd.prefix.toLowerCase().startsWith(lower);
      const matchAlias = cmd.alias && cmd.alias.toLowerCase().startsWith(lower);
      const matchLabel = cmd.label.toLowerCase().includes(lower);
      const matchAt = ('@' + cmd.prefix.slice(1)).startsWith(lower);
      const matchAliases = (cmd.aliases || []).some(al => al.toLowerCase().startsWith(lower));

      if (matchPrefix || matchAlias || matchLabel || matchAt || matchAliases) {
        items.push({
          type: 'command',
          label: `${cmd.prefix} • ${cmd.label}`,
          fillValue: `${cmd.prefix} `,
          badge: cmd.alias || cmd.pill,
          cmd: cmd
        });
      }
    });

    // B. Match Recent Searches
    recentSearches.forEach(rec => {
      if (rec.toLowerCase().includes(lower) && !items.some(i => i.fillValue.trim() === rec.toLowerCase())) {
        items.push({
          type: 'recent',
          label: rec,
          fillValue: rec,
          badge: 'RECENT'
        });
      }
    });

    // C. Match Built-in Predictive Cybersecurity & General Queries
    PREDICTIVE_TERMS.forEach(term => {
      if (term.toLowerCase().includes(lower) && !items.some(i => i.fillValue.toLowerCase() === term.toLowerCase())) {
        items.push({
          type: 'predictive',
          label: term,
          fillValue: term,
          badge: 'AUTO'
        });
      }
    });

    // D. Fetch Online Live Suggestions (Graceful fallback)
    try {
      const onlineItems = await fetchLiveSuggestions(query);
      onlineItems.forEach(term => {
        if (!items.some(i => i.fillValue.toLowerCase() === term.toLowerCase())) {
          items.push({
            type: 'online',
            label: term,
            fillValue: term,
            badge: 'WEB'
          });
        }
      });
    } catch {
      // Continue with local suggestions
    }

    // Limit to top 8 items
    currentItems = items.slice(0, 8);

    // Update Ghost Text
    updateGhostText(query, currentItems);

    // Render Dropdown
    if (currentItems.length > 0) {
      renderDropdown(currentItems, query);
    } else {
      hideHints();
    }
  }

  async function fetchLiveSuggestions(query) {
    if (!query || query.startsWith('/') || query.startsWith('!') || query.startsWith('@')) return [];
    
    // If duckduckgo is active, prioritize DuckDuckGo autocomplete
    if (activeEngine.id === 'duckduckgo') {
      try {
        const ddgUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
        const res = await fetch(ddgUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[1])) {
            return data[1].slice(0, 4);
          }
        }
      } catch {
        // Fallback to Google below
      }
    }

    try {
      const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 4);
      }
    } catch {
      // Return empty if blocked by environment
    }
    return [];
  }

  function updateGhostText(userQuery, items) {
    if (!ghostEl) return;
    const lowerUser = userQuery.toLowerCase();

    // Find first item that starts with userQuery
    const match = items.find(i => i.fillValue.toLowerCase().startsWith(lowerUser));
    if (match && match.fillValue.length > userQuery.length) {
      ghostEl.value = userQuery + match.fillValue.slice(userQuery.length);
    } else {
      ghostEl.value = '';
    }
  }

  function renderRecentOnly() {
    if (recentSearches.length === 0) {
      hideHints();
      return;
    }

    currentItems = recentSearches.slice(0, 6).map(r => ({
      type: 'recent',
      label: r,
      fillValue: r,
      badge: 'RECENT'
    }));

    selectedIndex = -1;
    if (ghostEl) ghostEl.value = '';

    renderDropdown(currentItems, '', true);
  }

  function renderDropdown(items, query, isRecentMode = false) {
    if (!hintsEl) return;
    hintsEl.innerHTML = '';

    // Section Header
    const secHeader = document.createElement('div');
    secHeader.className = 'hints-section-header';
    secHeader.innerHTML = `
      <span>${isRecentMode ? 'RECENT SEARCHES' : 'SUGGESTIONS & COMMANDS'}</span>
      ${isRecentMode ? '<button class="hints-clear-recent" id="clear-all-recents">Clear History</button>' : ''}
    `;
    hintsEl.appendChild(secHeader);

    if (isRecentMode) {
      const clearAllBtn = secHeader.querySelector('#clear-all-recents');
      if (clearAllBtn) {
        clearAllBtn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          clearRecentSearches();
          hideHints();
        });
      }
    }

    const listContainer = document.createElement('div');
    listContainer.className = 'hints-list';

    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `search-hint-item ${idx === selectedIndex ? 'is-selected' : ''}`;
      row.dataset.index = idx;

      // Icon SVGs
      let iconSvg = '';
      if (item.type === 'command') {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>';
      } else if (item.type === 'recent') {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      } else {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
      }

      // Highlight matched query letters
      let formattedLabel = escapeHtml(item.label);
      if (query && item.label.toLowerCase().includes(query.toLowerCase())) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        formattedLabel = escapeHtml(item.label).replace(regex, '<mark>$1</mark>');
      }

      row.innerHTML = `
        <div class="hint-main">
          <span class="hint-icon">${iconSvg}</span>
          <span class="hint-text">${formattedLabel}</span>
        </div>
        <div class="hint-badge-group">
          <span class="hint-tag ${item.type === 'command' ? 'tag-cmd' : 'tag-recent'}">${item.badge}</span>
          ${item.type === 'recent' 
            ? `<button class="hint-delete-btn" title="Remove from history">&times;</button>`
            : `<button class="hint-autofill-btn" title="Auto-fill into input">&#8599;</button>`
          }
        </div>
      `;

      // Click row to execute
      row.addEventListener('mousedown', (e) => {
        // If clicked on delete button
        if (e.target.closest('.hint-delete-btn')) {
          e.preventDefault();
          e.stopPropagation();
          removeRecentSearch(item.fillValue);
          renderRecentOnly();
          return;
        }

        // If clicked on autofill button
        if (e.target.closest('.hint-autofill-btn')) {
          e.preventDefault();
          e.stopPropagation();
          inputEl.value = item.fillValue;
          if (ghostEl) ghostEl.value = '';
          updateEnginePill(inputEl.value);
          inputEl.focus();
          computeSuggestions(inputEl.value.trim());
          return;
        }

        e.preventDefault();
        executeItem(item);
      });

      // Hover row
      row.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        highlightSelectedItem(false);
      });

      listContainer.appendChild(row);
    });

    hintsEl.appendChild(listContainer);

    // Footer with keyboard help
    const footer = document.createElement('div');
    footer.className = 'hints-footer';
    footer.innerHTML = `
      <div class="hints-footer-keys">
        <span><span class="kbd-chip">Tab</span> Auto-fill</span>
        <span><span class="kbd-chip">&#8593;&#8595;</span> Navigate</span>
        <span><span class="kbd-chip">&#9166;</span> Search</span>
      </div>
      <span><span class="kbd-chip">Esc</span> Dismiss</span>
    `;
    hintsEl.appendChild(footer);

    hintsEl.style.display = 'flex';
  }

  function highlightSelectedItem(updateInput = true) {
    if (!hintsEl) return;
    const items = hintsEl.querySelectorAll('.search-hint-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('is-selected');
        item.scrollIntoView({ block: 'nearest' });
        if (updateInput && currentItems[idx]) {
          inputEl.value = currentItems[idx].fillValue;
          if (ghostEl) ghostEl.value = '';
          updateEnginePill(inputEl.value);
        }
      } else {
        item.classList.remove('is-selected');
      }
    });
  }

  function unhighlightItems() {
    if (!hintsEl) return;
    hintsEl.querySelectorAll('.search-hint-item').forEach(i => i.classList.remove('is-selected'));
  }

  function hideHints() {
    if (hintsEl) {
      hintsEl.style.display = 'none';
      hintsEl.innerHTML = '';
    }
    if (ghostEl) ghostEl.value = '';
    selectedIndex = -1;
    currentItems = [];
  }

  function executeItem(item) {
    if (item.type === 'command' && item.cmd) {
      if (typeof item.cmd.handler === 'function') {
        item.cmd.handler('');
        hideHints();
        return;
      }
      const target = item.cmd.defaultUrl;
      saveRecentSearch(item.cmd.prefix);
      window.location.href = target;
      return;
    }
    executeSearch(item.fillValue);
  }

  function executeSearch(query) {
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    // Check matching command
    for (const cmd of COMMANDS) {
      const p = cmd.prefix.toLowerCase();
      const a = (cmd.alias || '').toLowerCase();
      const at = '@' + p.replace('/', '');
      const aliases = (cmd.aliases || []).map(x => x.toLowerCase());

      const patterns = [p, a, at, ...aliases].filter(Boolean);

      for (const pat of patterns) {
        if (lowerQuery === pat) {
          if (typeof cmd.handler === 'function') {
            cmd.handler('');
            hideHints();
            return;
          }
          saveRecentSearch(cmd.prefix);
          window.location.href = cmd.defaultUrl;
          return;
        }
        if (lowerQuery.startsWith(pat + ' ')) {
          const term = query.slice(pat.length).trim();
          if (typeof cmd.handler === 'function') {
            cmd.handler(term);
            hideHints();
            return;
          }
          saveRecentSearch(query);
          window.location.href = term ? cmd.url(term) : cmd.defaultUrl;
          return;
        }
      }
    }

    // Default to active default engine (Google, DuckDuckGo, Torch, etc.)
    saveRecentSearch(query);
    window.location.href = activeEngine.url(query);
  }

  async function saveRecentSearch(query) {
    if (!query) return;
    const clean = query.trim();
    recentSearches = recentSearches.filter(q => q.toLowerCase() !== clean.toLowerCase());
    recentSearches.unshift(clean);
    if (recentSearches.length > 10) recentSearches = recentSearches.slice(0, 10);
    await StorageService.set('recentSearches', recentSearches);
  }

  async function removeRecentSearch(query) {
    recentSearches = recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
    await StorageService.set('recentSearches', recentSearches);
  }

  async function clearRecentSearches() {
    recentSearches = [];
    await StorageService.set('recentSearches', recentSearches);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return {
    init,
    executeSearch,
    setDefaultEngine,
    cycleEngine,
    getActiveEngine: () => activeEngine,
    DEFAULT_ENGINES,
    COMMANDS,
    getRecentSearches: () => [...recentSearches]
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchService;
}
