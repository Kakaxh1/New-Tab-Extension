# VAPT Minimal New Tab Extension (Manifest V3)

A minimalist, responsive cybersecurity and VAPT-themed New Tab dashboard for Google Chrome, engineered with dark glassmorphism, responsive grid widgets, command-driven search, and authentic penetration testing principles.

---

## Installation Guide

1. Open **Google Chrome**.
2. Navigate to `chrome://extensions` in the address bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select this project directory:
   ```
   d:\Docs\Bhavya\Extention\New Tabs
   ```
6. Open a new tab (`Ctrl + T` or `Cmd + T`). Your custom VAPT dashboard will appear immediately.

---

## How to Reload After Changes

When you make changes to HTML, CSS, or JavaScript:
1. Go to `chrome://extensions`.
2. Locate **VAPT Minimal New Tab**.
3. Click the circular **Reload** icon on the extension card.
4. Refresh any open New Tab (`F5` or `Ctrl + R`).

---

## Extension Architecture

```
/
├── manifest.json        # Chrome MV3 manifest (url override for newtab)
├── newtab.html          # Semantic HTML layout, modals, search, and dock
├── css/
│   ├── main.css         # Design tokens, theme variables, glassmorphism, search, modals
│   ├── widgets.css      # Responsive grid, widget card styling, animations, typography
│   └── dorks.css        # Google Dorking & Person OSINT workbench and evidence styling
├── js/
│   ├── storage.js       # Unified chrome.storage.local wrapper with localStorage fallback
│   ├── clock.js         # Real-time digital clock (12h/24h, zero layout shift)
│   ├── date.js          # Stacked calendar date indicator (MON / 5 / OCT)
│   ├── quotes.js        # VAPT principle quotes engine with smooth fade transitions
│   ├── search.js        # Search controller with '/' shortcut, commands & bangs
│   ├── dorks.js         # Google Dorking & Person OSINT engine, templates & notes manager
│   ├── widgets.js       # Widget registry, dynamic add/remove/reorder/resize system
│   ├── todo.js          # Slide-out To-Do list panel controller & task manager
│   └── app.js           # Main application coordinator, settings panel & themes
└── assets/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Features & Usage

### 1. Right-Side To-Do Panel (Tasks & Scope Tracker)
- **Instant Drawer**: Click the checklist checkmark icon in the top-right header to slide out the side panel.
- **Task Management**:
  - Add tasks with `Enter` or the `+` button.
  - Check / uncheck items with custom minimal checkbox buttons.
  - Hover over any item to reveal the delete action.
  - Real-time counter tracks progress (e.g., `1/4`).
- **Filters**: Quickly filter by **All**, **Active**, and **Completed**.
- **Batch Action**: Click **Clear Completed** to purge finished tasks.
- **Keyboard Dismissal**: Press `Escape` or click the frosted backdrop overlay to close.
- **Persistence**: All tasks are automatically saved to `chrome.storage.local` with `localStorage` fallback.

### 2. Welcome Greeting ("WELCOME, KKAXH1")
- Prominently positioned greeting banner directly matching the visual screenshot reference composition.
- Default callsign/username: **KKAXH1**.
- Fully configurable in Settings with support for static "WELCOME" or dynamic time-of-day greetings ("GOOD MORNING", "GOOD AFTERNOON", "GOOD EVENING").
- Live telemetry indicator with active operational status.

### 3. Center Search Bar
- **Instant Focus**: Press `S` or `/` anywhere on the page (or click the `S` badge on the search bar) to jump focus to the search bar.
- **Configurable Default Engine**: Choose between **Google**, **DuckDuckGo**, **Torch (Dark Web)**, **Ahmia (Clearnet Tor)**, **Brave**, **Startpage**, or **DeepSeek AI** in Settings.
- **Interactive Engine Pill**: Click the pill on the search bar to cycle between search engines instantly.
- **Slash Commands & Bangs**:
  - `/duckduckgo <query>` or `!ddg` — Search DuckDuckGo (privacy search)
  - `/torch <query>` or `!torch` — Search Torch dark web index (`.onion`)
  - `/ahmia <query>` or `!ahmia` / `!onion` — Search Ahmia Tor clearnet gateway
  - `/ddgonion <query>` or `!ddgo` — Search DuckDuckGo Tor hidden service mirror
  - `/brave <query>` or `!brave` — Search Brave Private Search
  - `/startpage <query>` or `!startpage` — Search Startpage (untracked Google results)
  - `/google <query>` or `!g` — Search Google
  - `/github <query>` or `!gh` — Search GitHub repositories or code
  - `/youtube <query>` or `!yt` — Search YouTube
  - `/chatgpt <query>` or `!ai` — Prompt ChatGPT
  - `/deepseek <query>` or `!ds` — Prompt DeepSeek AI reasoning assistant
  - `/dork <query>` or `!dork` — Launch Google search using specified dork query
  - `/dorkui` or `!dorkui` — Open interactive Google Dork Builder modal
  - `/ghdb <query>` or `!ghdb` — Search the Google Hacking Database (Exploit-DB)
  - `/site <domain>` or `!site` — Quick site-scoped Google query (`site:<domain>`)
  - `/filetype <ext> <domain>` or `!filetype` / `!ft` — Quick filetype query (`site:<domain> filetype:<ext>`)
  - `/osint <query>` or `!osint` — OSINT reconnaissance search on Google
  - `/person <name>` or `!person` — Person OSINT profile discovery across social platforms
  - `/alias <handle>` or `!alias` / `!handle` — Username & alias cross-platform reconnaissance
- **Security Bangs**:
  - `!cve <id>` — Lookup vulnerability on CVE Details / MITRE
  - `!shodan <query>` — Reconnaissance query on Shodan
  - `!edb <query>` — Exploit Database lookup
  - `!ps <query>` — Search PortSwigger Web Security Academy
  - `!payloads <query>` — PayloadsAllTheThings repository search
  - `!gtfo <query>` — GTFOBins Unix binaries lookup
  - `!ht <query>` — HackTricks pentesting book search
- **Command Hints & Predictive Autocomplete**: Live suggestions for privacy and dark web queries, cyber security terms, and history with `Tab` auto-fill.

### 4. Console Hotkeys & Shortcuts
Press `?` or `H` anywhere on the new tab page to summon the interactive **Console Hotkeys HUD**:

| Key | Action | Description |
| :--- | :--- | :--- |
| `S` or `/` | **Focus Search** | Jump focus directly into the main search input |
| `E` | **Cycle Search Target** | Cycle between Google, DuckDuckGo, Torch, Ahmia, Brave, Startpage, and DeepSeek AI |
| `Ctrl + K` or `K` | **Command Palette** | Quick launcher for encoders (Base64, Hex, Hash, URL), actions, and shortcuts |
| `T` | **Tasks Drawer** | Slide open / close the target To-Do List panel |
| `O` or `,` | **Settings** | Open Dashboard Settings slide-over |
| `B` | **Shuffle Wallpaper** | Fetch and apply a fresh high-resolution cyber wallpaper from Unsplash |
| `P` | **Wallpaper Panel** | Open the wallpaper and background customizer panel |
| `I` | **IP Telemetry** | Inspect public IP address, ISP, location, and VPN/leak telemetry |
| `W` or `A` | **Add Widget** | Open the 17-tool modular Widget Library catalog |
| `M` or `R` | **Arrange Widgets** | Toggle freeform drag-and-drop / resize arrange mode |
| `D` | **Cycle Theme** | Instant cycle between Charcoal Glass, OLED Midnight, and Frosted Light themes |
| `Q` | **Next Principle** | Cycle to the next VAPT / security principle quote |
| `C` | **Copy Principle** | Copy the active security principle directly to the clipboard |
| `1` – `6` | **Dock Flyouts** | Instantly trigger Bottom Dock popovers (Search, GitHub, Cheats, Lookups, AppSec, Decoders) |
| `?` or `H` | **Shortcuts HUD** | Toggle the visual Keyboard Shortcuts modal cheatsheet |
| `Esc` | **Dismiss / Clear** | Close any active modal, panel, drawer, or clear search focus |

### 5. Live Widgets
- **VAPT Identity**: Subtle pulsating blue circular orb indicator with click-to-toggle `RED TEAM` / `VAPT` modes and operational status dot.
- **Digital Clock**: High-precision `HH:MM` time display with `AM/PM` or 24-hour mode.
- **Date Stack**: Minimalist calendar block displaying Day of Week, Day of Month, and Month.
- **VAPT Principles Quote**: Click anywhere on the quote to smoothly transition to the next principle. Click copy to copy the principle to your clipboard.

### 5. Widget Management ("+ Add widget")
- Located in the **top-left corner of the navigation bar** for 1-click access to the Widget Library modal.
- Toggle any of the 17 modular widgets:
  1. *Status* (Operational readiness indicator and mode switch)
  2. *Clock* (Digital clock with 12/24-hour display)
  3. *Date* (Current day, date, and month indicator)
  4. *Quotes* (Security and development principles with 1-click copy)
  5. *To-Do List* (Embedded target checklists with 2-way sync to slide-out drawer)
  6. *Payloads* (Quick-copy pentest payloads for XSS, SQLi, RevShells)
  7. *Encoder* (Base64, URL, Hex, and SHA-256 encoder/decoder)
  8. *Ports* (Common ports and service cheatsheet)
  9. *Subnets* (CIDR to mask and subnet calculator)
  10. *CVSS Calculator* (CVSS v3.1 severity calculator with vector string export)
  11. *Quick Links* (Direct bookmarks to pentest tools and resources)
  12. *Notes* (Scratchpad for target notes and credentials)
  13. *Countdown* (Countdown timer for deadlines and targets)
  14. *Weather* (Current weather and temperature monitor)
  15. *World Clock* (UTC, EST, GMT, and JST operational timezones)
  16. *GitHub* (Popular security tools and repositories)
  17. *System Status* (Network connectivity and latency monitor)
  18. *User-Agent & Headers* (Browser session default User-Agent override across all websites via declarativeNetRequest with Client Hints suppression and navigator.userAgent DOM synchronization)
  19. *Google Dorks & OSINT Recon* (Interactive query builder with scope domain substitution, mini operator chips, categorized reconnaissance templates, and Google search launcher)
- **Multi-Dimensional Grid Resizing & Custom Spans (1x1 to 4x5, Full Bar)**:
  - **Visual Grid Matrix Picker**: Interactive 4×5 tile matrix in the resize menu. Hover over any cell (e.g. 2×3) to preview the bounding box and click to apply immediately.
  - **Dimension Steppers**: Incremental Width (1 to 4 cols, Full) and Height (1 to 6 rows) controls for exact numeric span tuning.
  - **Quick Dimension Presets**: Instant 1-click buttons for `1×1`, `2×1`, `1×2`, `2×2`, `1×3`, `2×3`, `4×2`, `4×5`, and `Full Width`.
  - **Corner Drag Handle**: Drag the bottom-right corner grip on any card to fluidly adjust columns and rows in real-time, or click to cycle popular dimensions.
  - **Adaptive Content**: All cards fluidly adjust layout, multi-column subgrids, textareas, and scrollbars based on their assigned columns and rows.
  - Hover over any card for **Reordering** (`<-` / `->`) and **Dismissal** (`x`).

### 6. Customization & Settings (Gear Icon)
- **Operator Name**: Customize your display handle (default: `kkaxh1`).
- **Welcome Subtext / Status**: Customize the subtitle text beneath your callsign (default: `OPERATIONAL ENVIRONMENT READY`, e.g. `TARGET: 10.10.10.145`, `SCOPE: *.INTERNAL.CORP`, or any custom mission status).
- **Greeting Style**: Choose between `Welcome [Name]` or dynamic time-of-day greetings (`Good Morning` / `Good Afternoon` / `Good Evening`).
- **Default Search Engine**: Configure default search engine (Google, DuckDuckGo, Torch Dark Web, Ahmia Tor Index, Brave, Startpage, DeepSeek AI).
- **Appearance Themes**: Charcoal Glass (default), OLED Midnight, Frosted Minimal Light.
- **Time Format**: 12-hour (with AM/PM) or 24-hour format.
- **Accent Highlight**: Custom color picker to tune the accent glow (Google Blue `#4285F4`, Cyber Cyan, Emerald, etc.).
- **Surface Opacity**: Adjust card translucency from 20% to 95%.
  - **Background Architecture**:
    - **Sources**:
      - **Unsplash**: Direct dynamic Unsplash search and high-resolution curation with live API and offline fallback pool.
      - **Custom URL**: Direct URL input for any external wallpaper or CDN image.
      - **Local Image**: Drag-and-drop or file picker uploading local pictures stored securely offline in `chrome.storage.local`.
      - **Solid / Gradient**: Minimalist solid colors and 6 cybersecurity dark gradients (Cyber Void, Deep Matrix, Midnight Neon, Abyssal Navy, Carbon Fiber, Crimson Eclipse) plus custom color picker.
    - **Unsplash Options**:
      - **Search**: Custom keyword query input (e.g. `cyber security`, `hacker`, `matrix`, `space`).
      - **Category**: Dropdown with curated presets (`Technology`, `Cyberpunk`, `Dark Minimal`, `Architecture`, `Space`, `Nature`, `Abstract`, `Tokyo Night`).
      - **Mode**:
        - `Random`: Statically holds chosen image until manually shuffled.
        - `Daily`: Automatically rotates image once every 24 hours based on calendar date.
        - `On New Tab`: Automatically shuffles and selects a fresh wallpaper every time a new tab is opened.
      - **[ Shuffle Background ]**: 1-click instant randomize button with rotating loading feedback.
    - **Overlay Controls**:
      - **Darkness**: Range slider (0% to 95%, default 65%) with real-time numeric readout for optimal widget contrast.
      - **Blur**: Range slider (0px to 25px, default 8px) with real-time numeric readout for frosted backdrop depth.
    - **Effects**:
      - **Glass readability**: Enhanced card backdrop filter saturation (180%) and deep glassmorphic contrast.
      - **Vignette**: Subtle radial edge-shadow gradient drawing focus inward to widgets.
      - **Parallax**: Dynamic cursor tracking translating wallpaper layer on mouse movement for 3D depth.
      - **Motion**: Subtle Ken Burns slow breathing zoom animation (`@keyframes kenBurnsMotion`).
    - **Photo Info & Attribution**:
      - **Show photographer**: Bottom-left glassmorphic pill with photographer name and direct profile link.
      - **Show "Unsplash" attribution**: Includes official Unsplash attribution link honoring platform terms.
- **Quote Category**: Filter quotes by *All*, *Authentication & Access*, *Business Logic*, *Reconnaissance*, or *Exploitation*.
- **Reset Layout**: Instantly restore default widget arrangement.

### 7. Bottom Dock Flyout Lists (Security Consultant Toolkit)
Hovering or clicking any dock item reveals a curated glassmorphic flyout card tailored for penetration testing & consulting workflows:
- **Search**: Google Search, Google Dork Builder (interactive OSINT modal), Google Hacking Database (GHDB dorks), GitHub Code Search, DuckDuckGo (clearnet & .onion), Torch Search Engine (.onion), Ahmia Tor Search, and Brave Search.
- **GitHub**: PayloadsAllTheThings, SecLists, PEASS-ng (LinPEAS/WinPEAS), Nuclei Templates, HackTricks Source, and GitHub Home.
- **Cheatsheets**: HackTricks Cloud & Pentest, GTFOBins (Linux privesc & SUID), LOLBAS (Windows Living Off The Land), WADComs (Active Directory commands), and RevShells Generator.
- **Lookups**: Exploit-DB (verified exploits & shellcode), Sploitus (0-days & GitHub PoCs), crt.sh (certificate transparency subdomains), Default Credentials Lookup, and BGP/ASN Hurricane Electric IP scoping.
- **AppSec**: PortSwigger Web Academy, OWASP Web Security Testing Guide (WSTG Checklist), OWASP Top 10, and Hack The Box.
- **Decoders**: CyberChef App, CrackStation Hash Lookup (MD5/SHA1/SHA256), JWT.io Token Debugger, and Hash Identifier.

### 8. Google Dorking & OSINT Reconnaissance Module
An offline-first reconnaissance workbench embedded into the VAPT New Tab Dashboard:
- **Interactive Dork Builder (`/dorkui`)**:
  - Clickable operator chips for `site:`, `filetype:`, `intitle:`, `inurl:`, `intext:`, `allintitle:`, `allinurl:`, `allintext:`, `before:`, `after:`, `OR`, `-`, and exact quoted phrases `""`.
  - Dynamic Target Scope Domain management with `{DOMAIN}` replacement in templates.
  - Live compiled preview and one-click **Copy Query** and **Open in Google**.
  - In-scope warning notice when formulating queries targeting sensitive exposures, credentials, or logs.
- **Categorized VAPT Dork Library**:
  - **Domain Recon**: Indexed pages, Subdomain discovery (`-www`), public PDF documents, technology and API references.
  - **Public Docs & Exposure**: Spreadsheets (`.xls`, `.xlsx`, `.csv`), configuration guides, OpenAPI/Swagger references, and server log files.
  - **Authentication & Mapping**: Login & sign-in portals, admin dashboards, SSO/OAuth/SAML references, stack traces & error messages.
  - **Security & Misconfiguration**: Public backups (`.bak`, `.old`), directory listings (`intitle:"index of"`), environment files (`.env`, `config.php`), sensitive data keywords.
  - **Vulnerability Research**: CVE references (NVD, MITRE), vendor security advisories, GitHub proof-of-concept repositories.
- **Saved Queries & Scope Backup**:
  - Save custom dorks locally with custom names and descriptions.
  - Mark favorite templates for rapid access.
  - Import and export user-created templates as sanitized JSON (`google-dorks-backup.json`).
- **Slash Commands & Bangs**:
  - `/dork <query>` or `!dork` — Launch Google search with dork
  - `/dorkui` or `!dorkui` — Open Dork Builder Modal
  - `/ghdb <query>` or `!ghdb` — Search Google Hacking Database
  - `/site <domain>` or `!site` — Scoped domain query
  - `/filetype <ext> <domain>` or `!filetype` — Scoped filetype search
  - `/osint <query>` or `!osint` — OSINT search on Google

### 9. Dedicated Person OSINT & Digital Footprint Module
A dedicated offensive intelligence suite engineered directly into the Google Dorking workbench, Search flyout, and Widget Library:
- **Unified Target Scope Controls**:
  - Dynamically configure **DOMAIN** (`{DOMAIN}`), **PERSON** (`{PERSON}`), and **HANDLE / ALIAS** (`{HANDLE}`) in the builder header.
  - Changes instantly propagate across all pre-compiled templates, live query preview, and widgets.
- **Categorized Person OSINT Templates**:
  - **Public Social-Profile Discovery**: High-confidence discovery across X (Twitter), Instagram, Facebook, and LinkedIn.
  - **Professional Identity Research**: Target dossiers, roles, employment history, and recommendations via `site:linkedin.com/in/`.
  - **Username & Alias Pivoting**: Cross-platform footprint reconnaissance across Reddit, Telegram, Medium, YouTube, TikTok, and GitHub.
  - **Public Code Repositories**: Source code commits, repositories, and gist disclosures on GitHub and GitLab.
  - **Publicly Indexed Documents**: Resumes, CVs, and biography briefs (`filetype:pdf`, `filetype:doc`, `filetype:docx`).
  - **Domain & Organization Association**: Mentions binding the person to their target organization or employer domain.
  - **Contact & Email Discovery**: Public emails, corporate formats (`@{DOMAIN}`), and direct contact details.
  - **Pastebin & Credential Dumps**: Plaintext dumps, leaks, and disclosures across Pastebin, JustPaste, and paste mirrors.
  - **Mentions, Interviews & Talks**: Conference appearances, podcast interviews, and news mentions.
  - **Slide Decks & Presentations**: Uploaded decks on SlideShare, SpeakerDeck, and Prezi.
- **Verified External OSINT Launchers (1-Click Pivot)**:
  - **WhatsMyName**: Interactive web app checking username presence across 500+ social and web platforms.
  - **Namechk**: Real-time username and brand identity availability checker.
  - **GitHub Users**: Developer profile, public repositories, and commit history discovery.
  - **LinkedIn People Directory**: Direct professional identity and executive directory search.
  - **Intelligence X (IntelX)**: Deep search across public pastes, leaks, historical data, and archives.
  - **Wayback Machine**: Historical web archives and deleted profile snapshots via Internet Archive.
- **Investigation Evidence & Notes Log**:
  - Embedded logger for recording validated findings with Target, Evidence Source URL, Verification Status, and investigative notes.
  - **Validation Status Badges**: `CONFIRMED / VERIFIED` (Green), `UNVERIFIED` (Yellow), and `FALSE POSITIVE` (Red).
  - One-click deletion and automatic persistence in `chrome.storage.local`.
  - Included in unified JSON export/import backups.

---

## How to Customize Quotes

Open [`js/quotes.js`](file:///d:/Docs/Bhavya/Extention/New%20Tabs/js/quotes.js) and add your custom quotes to the `QUOTES` array:

```javascript
{
  text: "Your customized security quote here.",
  author: "VAPT PRINCIPLE",
  category: "recon" // 'auth', 'logic', 'recon', 'exploit', or 'architecture'
}
```

---

## How to Add a New Widget

1. Open [`js/widgets.js`](file:///d:/Docs/Bhavya/Extention/New%20Tabs/js/widgets.js).
2. Register your widget in `WIDGET_CATALOG`:
   ```javascript
   mywidget: {
     id: 'mywidget',
     title: 'Custom Tool',
     category: 'tools',
     description: 'Description of your tool.',
     defaultSize: 'normal',
     render: renderMyWidget
   }
   ```
3. Implement `renderMyWidget(container)`:
   ```javascript
   function renderMyWidget(container) {
     container.innerHTML = `<div class="my-custom-content">Hello Security World</div>`;
   }
   ```
4. Add styles in [`css/widgets.css`](file:///d:/Docs/Bhavya/Extention/New%20Tabs/css/widgets.css) under `.widget-mywidget`.
