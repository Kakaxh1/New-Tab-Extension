# CyberTab - Personal Aesthetic Dashboard & New Tab Experience

A handcrafted personal new tab dashboard created for daily aesthetic pleasure, focus, and curiosity. Built with dark glassmorphism, responsive drag-and-drop widgets, keyboard-driven navigation, and playful cybersecurity touches.

Created by [kakaxh1](https://github.com/Kakaxh1/New-Tab-Extension) • [Portfolio](https://bhavymorvadiya.netlify.app/).

---

## Why This Exists (The Personal Experience)

This project was built first and foremost as a **personal experience**, not a corporate tool, commercial utility, or enterprise software. 

Every time you open a new tab, you are greeted with a clean, ambient, distraction-free environment tailored for someone who appreciates:
* **Cyberpunk & Dark Glass Aesthetics**: Deep translucent surfaces, frosted blur, ambient lighting, and crisp monospace typography that make every tab feel like a personal sci-fi terminal.
* **Atmospheric Ambiance**: Ultra-high-resolution wallpapers, Ken Burns smooth motion, subtle 3D mouse parallax, and customizable dark overlays that keep the screen easy on the eyes during late-night sessions.
* **Frictionless Daily Flow**: Instant search with engine switching (`E`), command palette (`K`), quick-access bookmarks, focus sprint timers, and persistent task checklists.
* **Curiosity & Exploration**: Built-in gadgets for exploring the web, learning how pages are constructed, inspecting response headers, practicing Google dorking queries, and jotting down notes across personal devices on a local LAN.

---

## Getting Started

1. Clone or download this repository to your computer:
   ```bash
   git clone https://github.com/Kakaxh1/New-Tab-Extension.git
   ```
2. Open **Google Chrome** (or any Chromium browser like Brave, Edge, or Vivaldi) and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the upper-right corner.
4. Click **Load unpacked** in the upper-left corner.
5. Select the folder containing this repository.
6. Open a new tab (`Ctrl + T` or `Cmd + T`) to launch your personalized space.

---

## The Visual Experience

* **Layered Glassmorphism**: Translucent frosted panels with real-time blur, high-contrast borders, and adaptive accent colors (Cyan, Emerald, Amber, Violet, Crimson, Sky).
* **Three Curated Themes**:
  * **Charcoal Glass (Default)**: Deep charcoal-slate glass with cool cyan telemetry accents.
  * **OLED Midnight**: Pitch-black pure void surfaces designed for battery savings and zero glare.
  * **Frosted Light**: Clean translucent light glass with crisp dark slate text.
  *(Cycle themes instantly with `D` or through Settings).*
* **Wallpaper Engine & Mood Customization**:
  * **Dynamic Keyword Search**: Type any theme or mood (`matrix`, `cyberpunk`, `space`, `tokyo`, `nature`, `dark`) to load high-resolution wallpapers on the fly.
  * **Curated Offline Collections**: Hand-picked collections across Technology, Cyber Security, Hacker, Architecture, Nature, Space, Minimalist, and Abstract Neon with 1-click shuffle (`B`).
  * **Direct Links & Local Files**: Drop any image URL or upload a local wallpaper stored entirely inside the browser.
  * **Post-Processing Controls**: Real-time sliders for Darkness Dimming (0-95%), Frosted Glass Blur (0-25px), Vignette Shadowing, and 3D Parallax mouse depth.

---

## Highlights of the Space

### 1. Header Telemetry HUD
Glanceable stats across the top navigation bar designed for zero-click awareness:
* **Network & Public IP Indicator (`I`)**: Shows public IP, location, and organization status at a glance.
* **Sprint & Target Countdown Pill**: A discreet timer showing active focus sessions or countdowns to personal milestones, exams, or CTF events, with an interactive popover progress bar.
* **Quick Navigation**: Instant shortcuts for adding widgets (`W`), arranging the grid (`M`), toggling wallpaper settings (`P`), opening tasks (`T`), viewing hotkeys (`?`), or customizing preferences (`O`).

### 2. Center Omni-Search HUD
Press **`S`** or **`/`** from anywhere to focus the search bar:
* **Interactive Engine Switcher (`E`)**: Seamlessly cycle between search providers (Google, DuckDuckGo, Brave, Startpage, DeepSeek AI, and Tor search gateways like Torch and Ahmia).
* **Jump Bangs**: Quick prefix jumps to security references, documentation, and cheat sheets (`!cve`, `!shodan`, `!gtfo`, `!payloads`, `!ht`, `!dork`).

### 3. Google Dorking & OSINT Learning Workbench
A fun, exploratory workstation for discovering how search engines index public data:
* **Interactive Query Builder**: Visual chips for operators like `site:`, `inurl:`, `intitle:`, `filetype:`, and exact quotes.
* **Curated Query Library**: Examples exploring exposed documents, configuration files, and technology footprints for educational understanding.
* **Personal Notes & Evidence Log**: Save interesting queries and findings locally with JSON export and import.

### 4. Toolbar Popup: In-Browser Web Explorer & LAN Notes
Clicking the extension icon in Chrome opens a personal companion popup for inspecting the currently active website:
* **Page & Protocol Overview**: Real-time domain, protocol status, and 1-click clipping of the current URL into personal notes.
* **Security Headers Check**: A quick glance at standard HTTP response headers (`CSP`, `HSTS`, `X-Frame-Options`, `CORS`) to see how websites protect themselves.
* **Clickjacking Framing Demo**: A sandboxed test to visualize how frame-ancestor policies behave in real-time.
* **Hidden Field & Form Inspector**: View hidden form inputs on pages and toggle "Reveal & Unlock" to see how forms structure client-side parameters.
* **Script & Endpoint Scraper**: Scan script tags on the active page to spot internal API paths and endpoints for learning purposes.
* **User-Agent Switcher**: Test how sites adapt layout across mobile, Googlebot, and custom desktop personas.
* **Mini LAN Shared Notes (Multi-Tab v2)**: A synchronized scratchpad connected to your local home network workspace with multi-tab support (`shared_notes.txt` / KHP Workspace). Features instant tab switching, tab creation, and 1-click text formatting tools:
  * **Quote Normalizer (` ` -> `'`)**: Converts backticks to single quotes within highlighted selections or entire notes.
  * **Dash Normalizer (`—` -> `-`)**: Replaces Word and macOS em/en dashes with standard clean hyphens.

### 5. Modular Dashboard Widgets & Freeform Grid
Every card on the dashboard can be dragged, repositioned, resized, or removed:
* **Arrange Mode (`M` or `R`)**: Reorder the workspace freely to create your own personal layout.
* **Widget Collection**:
  * **Countdown & Sprint Timer**: Focus intervals (25m Pomodoro, 45m Deep Work) or target deadlines.
  * **Payload Reference & Encoders**: Quick reference copy-paste for standard strings, Base64, Hex, and SHA-256 hashes.
  * **Networking Reference**: Common ports, protocols, and CIDR subnet calculator.
  * **Digital Clock & Calendar**: Monospace high-precision clock and date display.
  * **Thought of the Moment**: Curated security and philosophical quotes (`Q` to cycle, `C` to copy).
  * **LAN Shared Notes (Multi-Tab v2)**: Full Markdown viewer and editor synchronized with your local network workspace. Features multi-tab management (create, rename, close tabs with color tags), real-time WebSocket sync, interactive task checkboxes, split preview, and 1-click format converters.
  * **To-Do Checklist**: Fast, interactive task list synced with the slide-out task drawer.

### 6. Bottom Dock & Curated Reference Flyouts
Hover or click across the bottom dock to access quick links to developer tools, documentation, cheat sheets, and online decoders (CyberChef, GTFOBins, HackTricks, PortSwigger Academy).

---

## Keyboard Navigation

Built for hands-on-keyboard enthusiasts:

| Hotkey | Action | What it Does |
| :--- | :--- | :--- |
| `S` or `/` | **Focus Search** | Snaps focus straight to the main search bar |
| `E` | **Cycle Engine** | Switches between Google, DuckDuckGo, Brave, DeepSeek, etc. |
| `Ctrl + K` or `K` | **Command Palette** | Quick launcher for theme changes, widgets, and tools |
| `T` | **Tasks Drawer** | Slides open your personal to-do list |
| `W` or `A` | **Add Widget** | Opens the modular widget catalog |
| `M` or `R` | **Arrange Mode** | Toggles freeform drag-and-drop widget layout |
| `O` or `,` | **Settings** | Opens operator preferences and profile |
| `B` | **Shuffle Background** | Cycles to a fresh atmospheric wallpaper |
| `P` | **Wallpaper Panel** | Opens background customization drawer |
| `I` | **IP Telemetry** | Displays network telemetry details |
| `D` | **Cycle Theme** | Cycles between Charcoal, Midnight, and Light |
| `Q` | **Next Quote** | Cycles to the next quote |
| `C` | **Copy Quote** | Copies active quote text to clipboard |
| `Esc` | **Dismiss** | Closes any open modal, drawer, or search focus |

---

## Privacy & Local Ownership

* **100% Local & Offline-First**: Runs entirely inside your browser. No third-party analytics, tracking scripts, or telemetry collected.
* **No External CDNs Required**: All fonts, icons (custom SVGs), and scripts are bundled locally inside the extension.
* **Your Data Stays Yours**: Your notes, widget positions, and preferences live strictly within your local browser storage (`chrome.storage.local`).

---

## About the Author

* **Author**: [kakaxh1](https://github.com/Kakaxh1/New-Tab-Extension)
* **Portfolio**: [bhavymorvadiya.netlify.app](https://bhavymorvadiya.netlify.app/)
* **Repository**: [github.com/Kakaxh1/New-Tab-Extension](https://github.com/Kakaxh1/New-Tab-Extension)

---

## License

MIT License - Copyright (c) 2026 [kakaxh1](https://github.com/Kakaxh1/New-Tab-Extension).
