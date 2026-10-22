/**
 * Google Dorking & OSINT Reconnaissance Module
 * Provides interactive query building, categorized VAPT dork templates,
 * operator insertion, scope domain replacement, and GHDB navigation.
 */
const DorkService = (() => {
  // 1. Curated VAPT Google Dork Templates
  const DEFAULT_TEMPLATES = [
    // A. Domain Reconnaissance
    {
      id: 'recon-indexed',
      category: 'recon',
      categoryLabel: 'Domain Recon',
      title: 'Indexed Pages',
      desc: 'Map all indexed pages and public web surface for the target',
      query: 'site:{DOMAIN}'
    },
    {
      id: 'recon-subdomains',
      category: 'recon',
      categoryLabel: 'Domain Recon',
      title: 'Subdomain Discovery',
      desc: 'Discover non-www subdomains, services, and staging hosts',
      query: 'site:*.{DOMAIN} -www'
    },
    {
      id: 'recon-docs',
      category: 'recon',
      categoryLabel: 'Domain Recon',
      title: 'Public PDF Documents',
      desc: 'Locate indexed PDF documents, whitepapers, and guides',
      query: 'site:{DOMAIN} filetype:pdf'
    },
    {
      id: 'recon-tech',
      category: 'recon',
      categoryLabel: 'Domain Recon',
      title: 'Technology & API References',
      desc: 'Identify references to APIs, endpoints, and Swagger specs',
      query: 'site:{DOMAIN} (intext:API OR intext:Swagger)'
    },
    {
      id: 'recon-external',
      category: 'recon',
      categoryLabel: 'Domain Recon',
      title: 'External Scope References',
      desc: 'Search for references to target domain outside its own host',
      query: '"{DOMAIN}" -site:{DOMAIN}'
    },

    // B. Public Documentation and Exposure Review
    {
      id: 'docs-pdf',
      category: 'docs',
      categoryLabel: 'Docs & Exposure',
      title: 'Public PDF Documents',
      desc: 'Find all indexed PDF files for policy or manual disclosure',
      query: 'site:{DOMAIN} filetype:pdf'
    },
    {
      id: 'docs-spreadsheets',
      category: 'docs',
      categoryLabel: 'Docs & Exposure',
      title: 'Spreadsheet Discovery',
      desc: 'Detect Excel or CSV documents containing lists or records',
      query: 'site:{DOMAIN} (filetype:xls OR filetype:xlsx OR filetype:csv)'
    },
    {
      id: 'docs-config',
      category: 'docs',
      categoryLabel: 'Docs & Exposure',
      title: 'Configuration References',
      desc: 'Search for public settings, setup guides, and config references',
      query: 'site:{DOMAIN} (intext:configuration OR intext:settings)'
    },
    {
      id: 'docs-api',
      category: 'docs',
      categoryLabel: 'Docs & Exposure',
      title: 'Public API Documentation',
      desc: 'Find OpenAPI, Swagger, and developer API references',
      query: 'site:{DOMAIN} (inurl:swagger OR inurl:api-docs OR inurl:openapi)'
    },
    {
      id: 'docs-logs',
      category: 'docs',
      categoryLabel: 'Docs & Exposure',
      title: 'Log & Text Files',
      desc: 'Locate raw server logs and text dumps indexed by search crawlers',
      query: 'site:{DOMAIN} (filetype:log OR filetype:txt)'
    },

    // C. Authentication and Application Mapping
    {
      id: 'auth-login',
      category: 'auth',
      categoryLabel: 'Auth & Mapping',
      title: 'Login & Sign-In Portals',
      desc: 'Discover administrative and user authentication entry points',
      query: 'site:{DOMAIN} (inurl:login OR inurl:signin)'
    },
    {
      id: 'auth-admin',
      category: 'auth',
      categoryLabel: 'Auth & Mapping',
      title: 'Administrative Interfaces',
      desc: 'Locate administrative dashboards, consoles, and portals',
      query: 'site:{DOMAIN} (inurl:admin OR inurl:dashboard)'
    },
    {
      id: 'auth-sso',
      category: 'auth',
      categoryLabel: 'Auth & Mapping',
      title: 'SSO & OAuth References',
      desc: 'Identify SAML, OAuth, and Single Sign-On callback handlers',
      query: 'site:{DOMAIN} (intext:SSO OR intext:OAuth OR intext:SAML)'
    },
    {
      id: 'auth-errors',
      category: 'auth',
      categoryLabel: 'Auth & Mapping',
      title: 'Error & Stack Traces',
      desc: 'Discover internal server errors, unhandled exceptions, and stack traces',
      query: 'site:{DOMAIN} (intext:"stack trace" OR intext:"internal server error")'
    },
    {
      id: 'auth-reset',
      category: 'auth',
      categoryLabel: 'Auth & Mapping',
      title: 'Password Reset Flows',
      desc: 'Find account recovery, token verification, and password reset pages',
      query: 'site:{DOMAIN} (inurl:reset-password OR inurl:forgot-password)'
    },

    // D. Security Assessment and Misconfiguration Review
    {
      id: 'sec-backups',
      category: 'security',
      categoryLabel: 'Misconfiguration',
      title: 'Publicly Indexed Backups',
      desc: 'Unprotected backup and archive files left by deployment pipelines',
      query: 'site:{DOMAIN} (filetype:bak OR filetype:old OR filetype:backup)'
    },
    {
      id: 'sec-indexof',
      category: 'security',
      categoryLabel: 'Misconfiguration',
      title: 'Directory Listing Indicators',
      desc: 'Web server directories with index of / directory browsing enabled',
      query: 'site:{DOMAIN} intitle:"index of"'
    },
    {
      id: 'sec-env',
      category: 'security',
      categoryLabel: 'Misconfiguration',
      title: 'Environment & Config Files',
      desc: 'Exposed .env, config.php, or configuration file disclosures',
      query: 'site:{DOMAIN} (intext:".env" OR intext:"config.php")'
    },
    {
      id: 'sec-vcs',
      category: 'security',
      categoryLabel: 'Misconfiguration',
      title: 'Exposed Version Control',
      desc: 'Publicly reachable .git or .svn version control directories',
      query: 'site:{DOMAIN} (inurl:".git" OR inurl:".svn")'
    },
    {
      id: 'sec-confidential',
      category: 'security',
      categoryLabel: 'Misconfiguration',
      title: 'Confidential & Internal Notices',
      desc: 'Documents and pages explicitly designated internal use only',
      query: 'site:{DOMAIN} (intext:"confidential" OR intext:"internal use only")'
    },

    // E. Vulnerability Research
    {
      id: 'vuln-nvd',
      category: 'vulns',
      categoryLabel: 'Vulnerability Research',
      title: 'NVD CVE References',
      desc: 'Official National Vulnerability Database CVE listings',
      query: 'site:nvd.nist.gov "CVE-"'
    },
    {
      id: 'vuln-advisories',
      category: 'vulns',
      categoryLabel: 'Vulnerability Research',
      title: 'Vendor Security Advisories',
      desc: 'Security advisories and security bulletins published by target',
      query: 'site:{DOMAIN} (inurl:security OR inurl:advisory)'
    },
    {
      id: 'vuln-poc',
      category: 'vulns',
      categoryLabel: 'Vulnerability Research',
      title: 'GitHub CVE PoC Research',
      desc: 'Public proof-of-concept exploits and vulnerability code on GitHub',
      query: 'site:github.com "CVE-2026-"'
    },
    {
      id: 'vuln-ghdb',
      category: 'vulns',
      categoryLabel: 'Vulnerability Research',
      title: 'Exploit-DB GHDB Research',
      desc: 'Exploit Database Google Hacking Database dork queries',
      query: 'site:exploit-db.com/google-hacking-database {DOMAIN}'
    },

    // F. PERSON OSINT & Digital Footprint Investigation
    {
      id: 'person-social',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Public Social Profiles',
      desc: 'Discover profiles across X/Twitter, Instagram, Facebook, and LinkedIn',
      query: '(site:twitter.com OR site:x.com OR site:instagram.com OR site:facebook.com OR site:linkedin.com) "{PERSON}"'
    },
    {
      id: 'person-linkedin',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Professional Identity Research',
      desc: 'Isolate LinkedIn professional dossiers, job titles, and employers',
      query: 'site:linkedin.com/in/ "{PERSON}"'
    },
    {
      id: 'person-alias',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Username & Alias Pivoting',
      desc: 'Footprint user handle across Reddit, Telegram, Medium, YouTube, and TikTok',
      query: '(site:reddit.com/user/ OR site:medium.com/@ OR site:t.me/ OR site:youtube.com/@ OR site:tiktok.com/@) "{HANDLE}"'
    },
    {
      id: 'person-github',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Code Repositories & Commits',
      desc: 'Find code repositories, commits, and developer activity on GitHub & GitLab',
      query: '(site:github.com OR site:gitlab.com) ("{PERSON}" OR "{HANDLE}")'
    },
    {
      id: 'person-docs',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Public Resumes & CVs',
      desc: 'Locate indexed PDF or Word documents containing CVs, resumes, or bios',
      query: '"{PERSON}" (filetype:pdf OR filetype:doc OR filetype:docx) (intext:resume OR intext:cv OR intext:"curriculum vitae")'
    },
    {
      id: 'person-org',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Domain & Organization Association',
      desc: 'Identify references linking the individual directly to the target domain or company',
      query: '"{PERSON}" "{DOMAIN}"'
    },
    {
      id: 'person-contacts',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Email & Contact Disclosures',
      desc: 'Search for public mentions of personal or corporate email addresses',
      query: '"{PERSON}" ("@gmail.com" OR "@yahoo.com" OR "@{DOMAIN}" OR "email" OR "contact")'
    },
    {
      id: 'person-pastes',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Digital-Footprint & Pastes',
      desc: 'Investigate mentions across Pastebin, JustPaste.it, and text dumps',
      query: '(site:pastebin.com OR site:justpaste.it OR site:rentry.co) ("{PERSON}" OR "{HANDLE}")'
    },
    {
      id: 'person-mentions',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Articles, Press & Speaking Bios',
      desc: 'Discover conference talks, press releases, interviews, and author bios',
      query: '"{PERSON}" (intext:"about the author" OR intext:"speaker" OR intext:"biography")'
    },
    {
      id: 'person-presentations',
      category: 'person',
      categoryLabel: 'Person OSINT',
      title: 'Slides & Conference Papers',
      desc: 'Find technical slide decks, presentations, and whitepapers by the target',
      query: '"{PERSON}" (filetype:pdf OR filetype:ppt OR filetype:pptx) (intext:conference OR intext:presentation)'
    }
  ];

  // 2. Google Search Operators List
  const OPERATORS = [
    { op: 'site:', label: 'site:', title: 'Restrict results to a specific domain or host' },
    { op: 'filetype:', label: 'filetype:', title: 'Search for specific file extension (pdf, xlsx, env, log)' },
    { op: 'intitle:', label: 'intitle:', title: 'Keyword must appear in webpage title' },
    { op: 'inurl:', label: 'inurl:', title: 'Keyword must appear in URL path' },
    { op: 'intext:', label: 'intext:', title: 'Keyword must appear in webpage body text' },
    { op: 'allintitle:', label: 'allintitle:', title: 'All following words must appear in title' },
    { op: 'allinurl:', label: 'allinurl:', title: 'All following words must appear in URL' },
    { op: 'allintext:', label: 'allintext:', title: 'All following words must appear in text' },
    { op: 'before:', label: 'before:', title: 'Results before date (YYYY-MM-DD)' },
    { op: 'after:', label: 'after:', title: 'Results after date (YYYY-MM-DD)' },
    { op: 'OR', label: 'OR', title: 'Boolean OR operator between conditions' },
    { op: '-', label: '-', title: 'Exclusion prefix (e.g. -www)' },
    { op: '""', label: '""', title: 'Quoted exact phrase matching' }
  ];

  let currentScopeDomain = 'example.com';
  let currentPersonTarget = 'Target Person';
  let currentHandleTarget = 'targetuser';
  let investigationNotes = [];
  let customTemplates = [];
  let favoriteIds = [];
  let isInitialized = false;

  const OSINT_TOOLS = [
    { id: 'tool-whatsmyname', name: 'WhatsMyName', category: 'Username Recon', getUrl: (h) => `https://whatsmyname.app/?q=${encodeURIComponent(h)}`, desc: 'Username enumeration across 500+ services' },
    { id: 'tool-namechk', name: 'Namechk', category: 'Username & Domain', getUrl: (h) => `https://namechk.com/`, desc: 'Social handle availability & footprint' },
    { id: 'tool-gh-users', name: 'GitHub Users', category: 'Code Repos', getUrl: (h) => `https://github.com/search?type=users&q=${encodeURIComponent(h)}`, desc: 'Developer accounts, commits & forks' },
    { id: 'tool-linkedin', name: 'LinkedIn People', category: 'Professional ID', getUrl: (p) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p)}`, desc: 'Corporate identity & employment history' },
    { id: 'tool-intelx', name: 'IntelX', category: 'Pastes & Breaches', getUrl: (q) => `https://intelx.io/?s=${encodeURIComponent(q)}`, desc: 'Historical pastes, archives & text dumps' },
    { id: 'tool-wayback', name: 'Wayback Machine', category: 'Web Archives', getUrl: (d) => `https://web.archive.org/web/*/${encodeURIComponent(d)}`, desc: 'Historical snapshots of target profile or site' }
  ];

  async function init() {
    if (isInitialized) return;
    currentScopeDomain = await StorageService.get('dorkScopeDomain', 'example.com');
    currentPersonTarget = await StorageService.get('dorkPersonTarget', 'Target Person');
    currentHandleTarget = await StorageService.get('dorkHandleTarget', 'targetuser');
    investigationNotes = await StorageService.get('osintNotes', []);
    customTemplates = await StorageService.get('customDorks', []);
    favoriteIds = await StorageService.get('dorkFavorites', []);
    isInitialized = true;
  }

  function getScopeDomain() {
    return currentScopeDomain || 'example.com';
  }

  async function setScopeDomain(domain) {
    const clean = (domain || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    currentScopeDomain = clean || 'example.com';
    await StorageService.set('dorkScopeDomain', currentScopeDomain);
    return currentScopeDomain;
  }

  function getPersonTarget() {
    return currentPersonTarget || 'Target Person';
  }

  async function setPersonTarget(name) {
    currentPersonTarget = (name || '').trim() || 'Target Person';
    await StorageService.set('dorkPersonTarget', currentPersonTarget);
    return currentPersonTarget;
  }

  function getHandleTarget() {
    return currentHandleTarget || 'targetuser';
  }

  async function setHandleTarget(handle) {
    const clean = (handle || '').trim().replace(/^@/, '');
    currentHandleTarget = clean || 'targetuser';
    await StorageService.set('dorkHandleTarget', currentHandleTarget);
    return currentHandleTarget;
  }

  function getAllTemplates() {
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }

  function compileQuery(rawQuery, domain, person, handle) {
    const targetDomain = domain || getScopeDomain();
    const targetPerson = person !== undefined ? person : getPersonTarget();
    const targetHandle = handle !== undefined ? handle : getHandleTarget();
    if (!rawQuery) return '';
    return rawQuery
      .replace(/\{DOMAIN\}/gi, targetDomain)
      .replace(/\{PERSON\}/gi, targetPerson)
      .replace(/\{HANDLE\}/gi, targetHandle)
      .replace(/\{USERNAME\}/gi, targetHandle);
  }

  function openGoogleDork(query, domain, person, handle) {
    const compiled = compileQuery(query, domain, person, handle);
    if (!compiled) return;

    if (isSensitiveQuery(compiled)) {
      if (typeof window.showToast === 'function') {
        window.showToast('Notice: Authorized assessment scope only', 3000);
      }
    }

    const url = `https://www.google.com/search?q=${encodeURIComponent(compiled)}`;
    window.open(url, '_blank', 'noreferrer');
  }

  function openGhdb(searchQuery = '') {
    const term = searchQuery ? encodeURIComponent(searchQuery) : '';
    const url = term
      ? `https://www.exploit-db.com/google-hacking-database?search=${term}`
      : 'https://www.exploit-db.com/google-hacking-database';
    window.open(url, '_blank', 'noreferrer');
  }

  function isSensitiveQuery(query) {
    const lower = (query || '').toLowerCase();
    const sensitiveIndicators = [
      '.env', 'config.php', 'stack trace', 'internal server error',
      'password', 'credentials', 'filetype:bak', 'filetype:old', 'intitle:"index of"'
    ];
    return sensitiveIndicators.some(ind => lower.includes(ind));
  }

  function getInvestigationNotes() {
    return [...investigationNotes];
  }

  async function addInvestigationNote(noteObj) {
    const note = {
      id: 'note-' + Date.now(),
      target: (noteObj.target || currentPersonTarget || currentScopeDomain).trim(),
      type: noteObj.type || 'person',
      note: (noteObj.note || '').trim(),
      evidenceUrl: (noteObj.evidenceUrl || '').trim(),
      status: noteObj.status || 'unverified', // 'unverified', 'verified', 'disproved'
      createdAt: new Date().toISOString()
    };
    investigationNotes.unshift(note);
    await StorageService.set('osintNotes', investigationNotes);
    return note;
  }

  async function deleteInvestigationNote(id) {
    investigationNotes = investigationNotes.filter(n => n.id !== id);
    await StorageService.set('osintNotes', investigationNotes);
  }

  async function updateInvestigationNote(id, updates) {
    const idx = investigationNotes.findIndex(n => n.id === id);
    if (idx !== -1) {
      investigationNotes[idx] = { ...investigationNotes[idx], ...updates, updatedAt: new Date().toISOString() };
      await StorageService.set('osintNotes', investigationNotes);
      return investigationNotes[idx];
    }
    return null;
  }

  async function saveCustomTemplate(name, query, category = 'custom', desc = '') {
    if (!name || !query) return false;
    const id = 'custom-' + Date.now();
    const item = {
      id,
      category: category || 'custom',
      categoryLabel: category === 'person' ? 'Person OSINT' : 'Custom Dork',
      title: name.trim(),
      desc: (desc || 'User custom template').trim(),
      query: query.trim()
    };
    customTemplates.push(item);
    await StorageService.set('customDorks', customTemplates);
    return item;
  }

  async function deleteCustomTemplate(id) {
    customTemplates = customTemplates.filter(t => t.id !== id);
    favoriteIds = favoriteIds.filter(fId => fId !== id);
    await StorageService.set('customDorks', customTemplates);
    await StorageService.set('dorkFavorites', favoriteIds);
  }

  async function toggleFavorite(id) {
    if (favoriteIds.includes(id)) {
      favoriteIds = favoriteIds.filter(fId => fId !== id);
    } else {
      favoriteIds.push(id);
    }
    await StorageService.set('dorkFavorites', favoriteIds);
    return favoriteIds.includes(id);
  }

  function exportTemplatesJson() {
    const data = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      scopeDomain: currentScopeDomain,
      personTarget: currentPersonTarget,
      handleTarget: currentHandleTarget,
      investigationNotes,
      customDorks: customTemplates
    };
    return JSON.stringify(data, null, 2);
  }

  async function importTemplatesJson(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data) throw new Error('Invalid JSON format');

      let importedDorksCount = 0;
      if (Array.isArray(data.customDorks)) {
        const validItems = [];
        data.customDorks.forEach(item => {
          if (item && typeof item.title === 'string' && typeof item.query === 'string') {
            validItems.push({
              id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
              category: typeof item.category === 'string' ? item.category : 'custom',
              categoryLabel: item.category === 'person' ? 'Person OSINT' : 'Imported Dork',
              title: String(item.title).slice(0, 80),
              desc: typeof item.desc === 'string' ? String(item.desc).slice(0, 160) : '',
              query: String(item.query).slice(0, 400)
            });
          }
        });
        if (validItems.length > 0) {
          customTemplates = [...customTemplates, ...validItems];
          await StorageService.set('customDorks', customTemplates);
          importedDorksCount = validItems.length;
        }
      }

      if (Array.isArray(data.investigationNotes)) {
        const validNotes = data.investigationNotes.filter(n => n && n.note);
        if (validNotes.length > 0) {
          investigationNotes = [...validNotes, ...investigationNotes];
          await StorageService.set('osintNotes', investigationNotes);
        }
      }

      return importedDorksCount;
    } catch (err) {
      throw new Error(err.message || 'Could not parse JSON');
    }
  }

  return {
    init,
    DEFAULT_TEMPLATES,
    OPERATORS,
    OSINT_TOOLS,
    getScopeDomain,
    setScopeDomain,
    getPersonTarget,
    setPersonTarget,
    getHandleTarget,
    setHandleTarget,
    getInvestigationNotes,
    addInvestigationNote,
    deleteInvestigationNote,
    updateInvestigationNote,
    getAllTemplates,
    compileQuery,
    openGoogleDork,
    openGhdb,
    isSensitiveQuery,
    saveCustomTemplate,
    deleteCustomTemplate,
    toggleFavorite,
    isFavorite: (id) => favoriteIds.includes(id),
    exportTemplatesJson,
    importTemplatesJson
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DorkService;
}
