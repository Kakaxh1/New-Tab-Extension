# VAPT Minimal New Tab — Cybersecurity & Recon Dashboard

A sleek, minimalist, cybersecurity-themed New Tab extension for Google Chrome. Engineered with dark glassmorphism, responsive widget grid architecture, command-driven search, and specialized penetration testing & OSINT reconnaissance modules.

---

## Quick Start / Installation

1. Open **Google Chrome** and navigate to `chrome://extensions/`.
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select this folder:
   ```text
   d:\Docs\Bhavya\Extention\New Tabs
   ```
5. Open a new tab (`Ctrl + T` or `Cmd + T`) to launch your VAPT dashboard immediately.

---

## Visual Design & Aesthetics

* **Cyberpunk Glassmorphism**: Tailored HSL color palette, translucent frosted glass cards with multi-layer background blur, high-contrast typography (Inter & monospace digits), and smooth micro-interactions.
* **Three Curated Themes**:
  * **Charcoal Glass (Default)**: Deep blue-gray glass with vibrant Google Blue/Cyan telemetry accents.
  * **OLED Midnight**: Pitch-black surfaces designed for maximum battery savings and ultra-high contrast.
  * **Frosted Light**: Clean slate-white glass aesthetic with soft drop shadows and crisp dark typography.
  *(Toggle instantly with `D` or via Settings).*
* **Dynamic Wallpaper & Ambient Engine**:
  * **Unsplash Curated Stream**: Dynamic high-resolution wallpapers across Cyberpunk, Tech, Minimal, Tokyo Night, and Space categories with 1-click shuffle (`B`).
  * **Custom Image / URL**: Load any external wallpaper URL or upload local images stored offline.
  * **Cyber Gradients**: Solid colors and built-in hacker gradients (Cyber Void, Deep Matrix, Carbon Fiber, Crimson Eclipse).
  * **Visual Post-Processing**: Real-time adjustable sliders for Background Darkness (0–95%), Frosted Blur (0–25px), Vignette Shadows, and subtle 3D Parallax mouse depth.

---

## Key UI & UX Features

### 1. Header Telemetry HUD

Located across the top navigation bar for zero-click operational awareness:

* **Active Public IP & VPN Leak Checker (`I`)**:
  * Real-time network indicator with status dot:
    * 🟢 **Secure / Public Network**
    * 🔵 **Protected VPN / Proxy / Datacenter**
    * 🔴 **Network Leak / Offline**
  * Click to reveal the **Network Telemetry Popover**: inspects your public IPv4/IPv6, ISP/Organization, Country, City, and provides a 1-click **Copy IP** button.
* **Compact Header Countdown & Sprint Timer**:
  * Positioned right beside the IP network pill with a clean SVG stopwatch icon.
  * Displays remaining engagement time or sprint countdown in compact tabular monospace digits (e.g. `CTF: 06d 23h 45m` or `24:59`).
  * Real-time status badges: `LIVE`, `URGENT` (< 1 hour remaining), `EXPIRED`, or `SPRINT`.
  * Click the pill to open the **Interactive Popover Card**:
    * Full precision countdown (`00d 00h 00m 00s`).
    * Animated gradient progress bar showing percentage of time elapsed.
    * 1-click **Start / Pause** button for focus sprints.
    * 1-click **Configure Target** button to jump directly to the Countdown widget.
* **Quick Navigation Controls**:
  * **`+ Add widget` (`W` or `A`)**: Opens the modular Widget Library modal.
  * **`Arrange` (`M` or `R`)**: Toggles freeform drag-and-drop grid repositioning.
  * **`Wallpaper` (`P`)**: Opens the background and overlay settings drawer.
  * **`Tasks` (`T`)**: Slides open the right-side To-Do drawer.
  * **`Shortcuts` (`?` or `H`)**: Opens the keyboard cheatsheet HUD.
  * **`Settings` (`O` or `,`)**: Opens the operator preferences slide-over.

---

### 2. Center Omni-Search HUD

Press **`S`** or **`/`** from anywhere on the page to instantly snap focus to the search bar.

* **Interactive Engine Switcher Pill (`E`)**:
  Click the pill on the search bar or press `E` to cycle between search backends:
  * 🌐 **Google** (Primary clearnet web index)
  * 🦆 **DuckDuckGo** (Untracked privacy search)
  * 🧅 **Torch (.onion)** (Oldest Tor dark web search engine)
  * 🛡️ **Ahmia Tor Search** (Clearnet gateway for hidden services)
  * 🧅 **DuckDuckGo Onion** (Tor hidden service mirror)
  * 🦁 **Brave Search** (Independent privacy index)
  * ⚡ **Startpage** (Private Google results without profiling)
  * 🤖 **DeepSeek AI** (Advanced reasoning & code assistant)
* **Built-in Security Bangs & Jump Shortcuts**:
  * `!cve <id>` — Lookup vulnerabilities on CVE Details & NVD
  * `!shodan <query>` — Search Shodan internet intelligence
  * `!edb <query>` — Search Exploit-DB for verified exploits
  * `!ghdb <query>` — Search the Google Hacking Database
  * `!payloads <query>` — Search PayloadsAllTheThings
  * `!gtfo <binary>` — GTFOBins Unix privilege escalation commands
  * `!ht <query>` — Search HackTricks pentesting encyclopedia
  * `!ps <query>` — PortSwigger Web Security Academy lookups
  * `!dork <query>` — Formulate and execute a raw Google Dork
  * `!dorkui` — Open the interactive Dork Builder modal
  * `!site <domain>` — Scoped domain query (`site:<domain>`)
  * `!filetype <ext> <domain>` — Filetype exposure query (`site:<domain> filetype:<ext>`)
* **Autocomplete & Predictive Cyber History**:
  * Type `/` to browse built-in commands with live arrow-key navigation and `Tab` completion.

---

### 3. Google Dorking & Person OSINT Workbench

An integrated offensive intelligence workstation accessible via the bottom dock, search commands (`/dorkui`), or the dashboard widget:

* **Interactive Dork Builder**:
  * One-click operator chips for `site:`, `inurl:`, `intitle:`, `filetype:`, `intext:`, `allintitle:`, `before:`, `after:`, `OR`, `-`, and exact quoted phrases `""`.
  * Dynamic target substitution: define your target domain once (`{DOMAIN}`) and watch all queries auto-populate.
  * Live compiled query preview with 1-click **Copy Query** and **Open in Google**.
* **Pre-compiled VAPT Dork Library**:
  * **Domain Recon**: Subdomains (`-www`), public PDFs, API schemas, technology footprints.
  * **Public Docs & Exposures**: Leaked spreadsheets (`.xlsx`, `.csv`), configuration guides, OpenAPI docs.
  * **Auth & Gateways**: Sign-in portals, admin panels, SSO/OAuth endpoints, server stack traces.
  * **Security Misconfigurations**: Public backups (`.bak`, `.old`), directory listings (`intitle:"index of"`), environment files (`.env`).
  * **Vulnerability Research**: CVE references, vendor advisories, GitHub PoCs.
* **Dedicated Person OSINT Module**:
  * Configure **Target Name** (`{PERSON}`) and **Handle/Username** (`{HANDLE}`).
  * **Social Profile Discovery**: Cross-platform reconnaissance across X, LinkedIn, Instagram, Facebook.
  * **Professional Dossiers**: Career history, recommendations, and roles via LinkedIn.
  * **Username & Alias Pivoting**: Search Reddit, Telegram, Medium, GitHub, YouTube, TikTok.
  * **Code & Commits**: Git commits, public gists, and repository author searches.
  * **Document Exposures**: Resumes, CVs, biography briefs (`filetype:pdf`, `filetype:docx`).
  * **Paste & Credential Dumps**: Search Pastebin, JustPaste, and paste mirrors for leaked data.
* **1-Click External OSINT Pivots**:
  * Direct launchers to **WhatsMyName** (500+ site username scanner), **IntelX**, **Wayback Machine**, **Namechk**, and **LinkedIn Directory**.
* **Investigation Evidence & Notes Log**:
  * Record findings with Target, Evidence Source URL, Verification Status (`CONFIRMED`, `UNVERIFIED`, `FALSE POSITIVE`), and notes.
  * Complete export and import of saved queries and evidence as JSON (`google-dorks-backup.json`).

---

### 4. Modular Dashboard Widgets & Freeform Grid

Every widget can be freely positioned, resized, or customized on the grid:

* **Arrange Mode (`M` or `R`)**:
  * Drag widget headers to position cards anywhere on the grid.
  * Click the resize icon or drag the bottom-right corner grip to cycle between **Compact (1×1)**, **Wide (2×1)**, **Tall (1×2)**, **Large (2×2)**, or **Full Width (4×2)**.
* **Available Widget Suite**:
  1. **Countdown & Sprint Timer**:
     * **Deadline Mode**: Set custom target date/time (CTFs, certifications, exam deadlines). Displays 4 digital time cards (`DAYS`, `HOURS`, `MINS`, `SECS`), elapsed progress track, and urgency glow.
     * **Focus Sprint Mode**: Built-in timers (25m Pomodoro, 45m Recon, 60m Deep Work, 90m Marathon) with start, pause, and reset controls.
     * Inline gear button flips to quick-config drawer with `+1h`, `+24h`, `+7d` presets.
  2. **Security Payloads**: Instant 1-click copy for essential XSS, SQLi, SSRF, LFI, and Reverse Shell strings.
  3. **Encoder / Decoder**: Live bi-directional conversions for Base64, URL Encode, Hex, and SHA-256 hashes.
  4. **Common Ports & Protocols**: Quick-reference table of common networking ports, standard services, and default credentials.
  5. **Subnets & CIDR Calculator**: Input any IP/CIDR (e.g. `192.168.1.0/24`) to get network address, broadcast, usable range, and host count.
  6. **CVSS v3.1 Calculator**: Interactive base metric scoring with instant CVSS score calculation and vector string generator.
  7. **User-Agent & Header Switcher**: Spoof browser User-Agents (Googlebot, Burp Suite, Mobile, Custom) with declarativeNetRequest header rules.
  8. **Notes Scratchpad**: Lightweight local notepad for engagement scopes, payloads, and credentials.
  9. **Interactive To-Do List**: Target checklist synchronized with the slide-out tasks drawer.
  10. **Digital Clock**: High-precision clock with 12h/24h toggle and zero layout jitter.
  11. **Date Stack**: Minimalist calendar block with Day, Date, and Month.
  12. **VAPT Principles Quote**: Curated security quotes with smooth fade transitions and 1-click clipboard copy.
  13. **Operational Identity**: Red Team / VAPT mode badge with pulsating core orb.
  14. **System Status**: Real-time network latency ping and browser online status.
  15. **World Clock**: Multiple operational timezones (UTC, EST, GMT, JST).

---

### 5. Slide-Out Tasks & Engagement Drawer (`T`)

Press **`T`** or click the checklist icon in the top-right header to toggle the side drawer:
* Add tasks with `Enter` or the `+` button.
* Filter by **All**, **Active**, and **Completed**.
* Real-time task completion progress counter (e.g. `3/5 Done`).
* Purge finished tasks with the **Clear Completed** batch button.
* Fully persistent in local storage.

---

### 6. Bottom Dock Flyouts (Security Toolkit)

Hover or click items on the floating bottom dock for instant access to curated security resources:
* **Search Flyout**: Quick links to Dork Builder, GHDB, Ahmia, Torch, and GitHub Code Search.
* **GitHub Flyout**: PayloadsAllTheThings, SecLists, PEASS-ng, Nuclei Templates, HackTricks.
* **Cheatsheets Flyout**: GTFOBins, LOLBAS, WADComs, RevShells, HackTricks Cloud.
* **Lookups Flyout**: Exploit-DB, Sploitus, crt.sh, BGP Hurricane Electric, Default Creds.
* **AppSec Flyout**: PortSwigger Web Academy, OWASP WSTG, OWASP Top 10, Hack The Box.
* **Decoders Flyout**: CyberChef, CrackStation, JWT.io, Hash Identifier.

---

### 7. Keyboard Navigation & Shortcuts Cheatsheet

Press **`?`** or **`H`** to summon the hotkey cheatsheet HUD:

| Hotkey | Action | Description |
| :--- | :--- | :--- |
| `S` or `/` | **Focus Search** | Focus main search bar |
| `E` | **Cycle Engine** | Switch between Google, DuckDuckGo, Torch, Ahmia, Brave, DeepSeek |
| `Ctrl + K` or `K` | **Command Palette** | Quick action launcher for tools, themes, and encoders |
| `T` | **Tasks Drawer** | Toggle slide-out target checklist drawer |
| `W` or `A` | **Add Widget** | Open the Widget Library catalog |
| `M` or `R` | **Arrange Mode** | Toggle freeform drag-and-drop widget layout |
| `O` or `,` | **Settings** | Open dashboard settings & operator profile |
| `B` | **Shuffle Background** | Fetch a fresh cyber wallpaper from Unsplash |
| `P` | **Wallpaper Panel** | Configure wallpapers, blur, and contrast overlays |
| `I` | **IP Telemetry** | Inspect public IP, VPN leak status, and network info |
| `D` | **Cycle Theme** | Instant swap between Charcoal Glass, OLED Midnight, and Light |
| `Q` | **Next Principle** | Cycle to next security quote |
| `C` | **Copy Principle** | Copy active quote to clipboard |
| `1` – `6` | **Dock Flyouts** | Trigger bottom dock menus (Search, GitHub, Cheats, Lookups, AppSec, Decoders) |
| `Esc` | **Dismiss / Close** | Close any open modal, popover, drawer, or search focus |

---

## Privacy & Security

* **100% Offline-First Architecture**: Operates directly inside your browser. No external telemetry, tracking scripts, or analytics.
* **Zero Third-Party CDNs**: All fonts, SVGs, styles, and scripts are bundled locally within the extension to ensure strict adherence to Content Security Policy (CSP).
* **Safe Storage**: Notes, settings, and saved dorks stay in your local browser profile (`chrome.storage.local`).
