/**
 * App Controller
 * Orchestrates themes, accent colors, settings modal, welcome greeting, and module initialization.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Load all saved preferences in a single bulk operation from in-memory cache
  const settings = await StorageService.getAll();

  const currentTheme = settings.theme || 'dark';
  const clockFormat = settings.clockFormat || '12';
  const accentColor = settings.accentColor || '#4285F4';
  const bgOpacity = settings.bgOpacity !== undefined ? settings.bgOpacity : 0.65;
  const quoteCategory = settings.quoteCategory || 'all';
  const userName = settings.userName || 'kkaxh1';
  const greetingStyle = settings.greetingType || 'welcome';
  const welcomeSubtext = settings.welcomeSubtext || 'OPERATIONAL ENVIRONMENT READY';

  // Background Configuration
  const bgSource = settings.bgSource || 'unsplash';
  const unsplashSearch = settings.unsplashSearch || 'cyber security';
  const unsplashCategory = settings.unsplashCategory || 'technology';
  const unsplashMode = settings.unsplashMode || 'random';
  const overlayDarkness = settings.overlayDarkness !== undefined ? settings.overlayDarkness : 0.65;
  const overlayBlur = settings.overlayBlur !== undefined ? settings.overlayBlur : 8;
  const effectGlassReadability = settings.effectGlassReadability !== undefined ? settings.effectGlassReadability : true;
  const effectVignette = settings.effectVignette !== undefined ? settings.effectVignette : true;
  const effectParallax = settings.effectParallax !== undefined ? settings.effectParallax : false;
  const effectMotion = settings.effectMotion !== undefined ? settings.effectMotion : false;
  const infoShowPhotographer = settings.infoShowPhotographer !== undefined ? settings.infoShowPhotographer : true;
  const infoShowAttribution = settings.infoShowAttribution !== undefined ? settings.infoShowAttribution : true;
  const cachedWallpaperDataUrl = settings.cachedWallpaperDataUrl || '';
  const wallpaperUrl = optimizeUnsplashUrl(settings.wallpaperUrl || StorageService.DEFAULTS.wallpaperUrl);
  const wallpaperTitle = settings.wallpaperTitle || 'Dark Matrix';
  const wallpaperAuthor = settings.wallpaperAuthor || 'Markus Spiske';
  const customWallpaperUrl = settings.customWallpaperUrl || '';
  const localImageData = settings.localImageData || '';
  const localImageName = settings.localImageName || '';
  const solidGradientValue = settings.solidGradientValue || StorageService.DEFAULTS.solidGradientValue;
  const searchEngine = settings.searchEngine || 'google';

  const bgState = {
    source: bgSource,
    cachedDataUrl: cachedWallpaperDataUrl,
    unsplashSearch,
    unsplashCategory,
    unsplashMode,
    url: wallpaperUrl,
    title: wallpaperTitle,
    author: wallpaperAuthor,
    customUrl: customWallpaperUrl,
    localData: localImageData,
    localName: localImageName,
    gradient: solidGradientValue,
    darkness: overlayDarkness,
    blur: overlayBlur,
    effects: {
      glass: effectGlassReadability,
      vignette: effectVignette,
      parallax: effectParallax,
      motion: effectMotion
    },
    attribution: {
      showPhotographer: infoShowPhotographer,
      showAttribution: infoShowAttribution,
      photographer: wallpaperAuthor,
      title: wallpaperTitle
    }
  };

  // Apply initial theme tokens & custom background immediately
  applyTheme(currentTheme);
  applyAccentColor(accentColor);
  applyBgOpacity(bgOpacity);
  applyBackground(bgState);

  // Initialize Welcome Greeting
  renderWelcomeGreeting(userName, greetingStyle, welcomeSubtext);

  // Initialize Search
  SearchService.init('main-search-input', 'search-hints');

  // Initialize Widgets
  await WidgetsManager.init('main-widget-grid', 'add-widget-modal', {
    clockFormat,
    quoteCategory
  });

  // Initialize Settings Panel
  initSettingsPanel({
    theme: currentTheme,
    clockFormat,
    accentColor,
    bgOpacity,
    quoteCategory,
    userName,
    greetingStyle,
    welcomeSubtext,
    searchEngine,
    bgState
  });

  // Defer Unsplash photo shuffling to idle time so tab opens at maximum speed
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => handleBackgroundModeOnLoad(bgState), { timeout: 1000 });
  } else {
    setTimeout(() => handleBackgroundModeOnLoad(bgState), 400);
  }

  // Initialize To-Do Panel
  if (typeof TodoManager !== 'undefined') {
    await TodoManager.init();
  }

  // Initialize Dock Popover Flyouts
  initDockPopovers();

  // Initialize Active IP & VPN Leak Indicator
  initIpIndicator();

  // Initialize Header Countdown beside IP Status
  initHeaderCountdown();

  // Initialize Command Palette (Ctrl+K / Cmd+K)
  initCommandPalette();

  // Initialize Google Dork Builder Modal
  initDorkBuilderModal();

  // Setup Global Keyboard Shortcuts
  setupKeyboardShortcuts();
});

/**
 * Render Welcome / Greeting banner matching reference screenshot
 */
let typingAnimationTimer = null;

function renderWelcomeGreeting(name, style, subtext) {
  const headingEl = document.getElementById('welcome-heading');
  const subtextEl = document.getElementById('welcome-subtext');

  if (typingAnimationTimer) {
    clearTimeout(typingAnimationTimer);
    typingAnimationTimer = null;
  }

  const effectiveName = (name || 'kkaxh1').trim();
  const isKkaxh1 = effectiveName.toLowerCase() === 'kkaxh1';

  let salutation = 'WELCOME';
  if (style === 'dynamic') {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      salutation = 'GOOD AFTERNOON';
    } else if (hour >= 17) {
      salutation = 'GOOD EVENING';
    } else {
      salutation = 'GOOD MORNING';
    }
  }

  if (subtextEl) {
    subtextEl.textContent = (subtext !== undefined && subtext !== null && subtext !== '')
      ? subtext
      : 'OPERATIONAL ENVIRONMENT READY';
  }

  if (!headingEl) return;

  // Terminal Typing Effect strictly for kkaxh1 (clean text without cursor)
  if (isKkaxh1) {
    const fullText = `${salutation}, ${effectiveName.toUpperCase()}`;
    headingEl.innerHTML = `<span id="welcome-typing-target"></span>`;
    const targetEl = document.getElementById('welcome-typing-target');
    let idx = 0;

    function typeChar() {
      if (!targetEl) return;
      if (idx <= fullText.length) {
        const slice = fullText.slice(0, idx);
        if (slice.includes(',')) {
          const parts = slice.split(',');
          targetEl.innerHTML = `<span id="welcome-salutation">${escapeHtml(parts[0])}</span>, <span id="welcome-username" class="highlight-name">${escapeHtml(parts.slice(1).join(',').trim())}</span>`;
        } else {
          targetEl.innerHTML = `<span id="welcome-salutation">${escapeHtml(slice)}</span>`;
        }
        idx++;
        typingAnimationTimer = setTimeout(typeChar, 42);
      }
    }
    typeChar();
  } else {
    headingEl.innerHTML = `<span id="welcome-salutation">${escapeHtml(salutation)}</span>, <span id="welcome-username" class="highlight-name">${escapeHtml(effectiveName.toUpperCase())}</span>`;
  }
}

/**
 * Apply theme classes and CSS variables
 */
function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
}

/**
 * Apply accent color dynamically
 */
function applyAccentColor(hex) {
  document.documentElement.style.setProperty('--accent', hex);
  document.documentElement.style.setProperty('--accent-glow', `${hex}33`);
  document.documentElement.style.setProperty('--accent-soft', `${hex}1a`);
}

/**
 * Apply surface background opacity
 */
function applyBgOpacity(opacity) {
  document.documentElement.style.setProperty('--surface-opacity', opacity);
}

/**
 * Global background state tracker for dynamic effects (parallax, motion, attribution)
 */
let currentBackgroundState = null;

/**
 * Optimize Unsplash URLs to lightweight WebP/AVIF at 1920px and q=75 (reduces download from 10MB to ~180KB)
 */
function optimizeUnsplashUrl(url, targetWidth = 1920, quality = 75) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('images.unsplash.com')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(targetWidth));
    parsed.searchParams.set('q', String(quality));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    return parsed.toString();
  } catch {
    let clean = url.replace(/[?&](w|q|auto|fit)=[^&]*/g, '');
    const delim = clean.includes('?') ? '&' : '?';
    return `${clean}${delim}w=${targetWidth}&q=${quality}&auto=format&fit=crop`;
  }
}

/**
 * Extract optimal high-speed resolution from Unsplash API photo results
 */
function extractBestUnsplashUrl(urls, targetWidth = 1920, quality = 75) {
  if (!urls) return '';
  if (urls.regular) {
    return optimizeUnsplashUrl(urls.regular, targetWidth, quality);
  }
  if (urls.raw) {
    return `${urls.raw}&w=${targetWidth}&q=${quality}&auto=format&fit=crop`;
  }
  if (urls.full) {
    return optimizeUnsplashUrl(urls.full, targetWidth, quality);
  }
  return urls.small || '';
}

/**
 * Cache current wallpaper image data locally so subsequent new tabs render with 0ms delay
 */
async function cacheWallpaperLocally(url) {
  if (!url || !url.startsWith('http')) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (dataUrl && dataUrl.length < 2500000) {
        StorageService.set('cachedWallpaperDataUrl', dataUrl);
      }
    };
    reader.readAsDataURL(blob);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Apply complete Background System (Source, Overlay, Effects, Photo Info)
 */
function applyBackground(state) {
  currentBackgroundState = state;
  const img = document.getElementById('wallpaper-image');
  const overlay = document.getElementById('wallpaper-overlay');
  const attrEl = document.getElementById('wallpaper-attribution');
  const attrPhotographer = document.getElementById('attribution-photographer');
  const attrSource = document.getElementById('attribution-source');
  const attrLink = document.getElementById('attribution-link');

  if (!img) return;

  // Effects toggling
  document.body.classList.toggle('has-vignette', !!state.effects?.vignette);
  document.body.classList.toggle('has-glass-readability', !!state.effects?.glass);
  document.body.classList.toggle('has-motion', !!state.effects?.motion);

  // Reset transform if parallax disabled
  if (!state.effects?.parallax) {
    img.style.transform = '';
  }

  // Overlay Darkness & Blur
  const darkness = state.darkness !== undefined ? state.darkness : 0.65;
  const blur = state.blur !== undefined ? state.blur : 8;
  if (overlay) {
    overlay.style.setProperty('--wallpaper-dim', darkness);
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;
  }
  img.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';

  let hasImage = false;

  if (state.source === 'unsplash') {
    const cachedData = state.cachedDataUrl || StorageService.getSync('cachedWallpaperDataUrl', '');
    const optUrl = optimizeUnsplashUrl(state.url || '');

    if (cachedData) {
      img.style.backgroundColor = 'transparent';
      img.style.backgroundImage = `url("${cachedData}")`;
      hasImage = true;
    } else if (optUrl) {
      hasImage = true;
      if (img.dataset.loadedUrl === optUrl) {
        img.style.backgroundColor = 'transparent';
        img.style.backgroundImage = `url("${optUrl}")`;
      } else {
        const preloader = new Image();
        preloader.src = optUrl;
        preloader.onload = () => {
          img.style.backgroundColor = 'transparent';
          img.style.backgroundImage = `url("${optUrl}")`;
          img.dataset.loadedUrl = optUrl;
          cacheWallpaperLocally(optUrl);
        };
        if (preloader.complete) {
          img.style.backgroundColor = 'transparent';
          img.style.backgroundImage = `url("${optUrl}")`;
          img.dataset.loadedUrl = optUrl;
          cacheWallpaperLocally(optUrl);
        }
      }
    }
  } else if (state.source === 'custom-url') {
    const url = state.customUrl || '';
    if (url) {
      img.style.backgroundColor = 'transparent';
      img.style.backgroundImage = `url("${url}")`;
      hasImage = true;
    }
  } else if (state.source === 'local-image') {
    const data = state.localData || '';
    if (data) {
      img.style.backgroundColor = 'transparent';
      img.style.backgroundImage = `url("${data}")`;
      hasImage = true;
    }
  } else if (state.source === 'solid-gradient') {
    const grad = state.gradient || 'linear-gradient(135deg, #0b0f19 0%, #151b28 50%, #0d1117 100%)';
    img.style.backgroundColor = 'transparent';
    img.style.backgroundImage = grad;
    hasImage = true;
  }

  if (hasImage) {
    document.body.classList.add('has-custom-wallpaper');
  } else {
    document.body.classList.remove('has-custom-wallpaper');
    img.style.backgroundImage = 'none';
    img.style.backgroundColor = 'transparent';
  }

  // Photo Info Attribution
  if (attrEl) {
    const isUnsplash = state.source === 'unsplash' && hasImage;
    const showPhoto = state.attribution?.showPhotographer;
    const showAttr = state.attribution?.showAttribution;
    const shouldShow = isUnsplash && (showPhoto || showAttr);

    document.body.classList.toggle('show-attribution', shouldShow);

    if (shouldShow) {
      attrEl.style.display = 'block';
      if (attrPhotographer) {
        attrPhotographer.textContent = showPhoto ? `Photo by ${state.attribution?.photographer || 'Unsplash Creator'}` : '';
        attrPhotographer.style.display = showPhoto ? 'inline' : 'none';
      }
      if (attrSource) {
        attrSource.textContent = showAttr ? (showPhoto ? ' on Unsplash' : 'Unsplash') : '';
        attrSource.style.display = showAttr ? 'inline' : 'none';
      }
      if (attrLink && state.url) {
        attrLink.href = state.url.includes('unsplash') ? state.url : 'https://unsplash.com';
      }
    } else {
      attrEl.style.display = 'none';
    }
  }
}

// Parallax mouse movement handler
window.addEventListener('mousemove', (e) => {
  if (!currentBackgroundState?.effects?.parallax) return;
  const img = document.getElementById('wallpaper-image');
  if (!img) return;
  const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  img.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
});

/**
 * Handle Unsplash Modes (On New Tab & Daily)
 */
async function handleBackgroundModeOnLoad(bgState) {
  if (bgState.source !== 'unsplash') return;

  if (bgState.unsplashMode === 'on-new-tab') {
    // Check if we have an instant pre-fetched wallpaper ready in local storage
    const nextPhoto = await StorageService.get('nextUnsplashWallpaper', null);
    if (nextPhoto && nextPhoto.url) {
      await StorageService.set('nextUnsplashWallpaper', null);
      await updateActiveUnsplashWallpaper(nextPhoto.url, nextPhoto.title, nextPhoto.author, false);
    }
    // Pre-fetch the next wallpaper in the background for the next tab
    setTimeout(() => {
      prefetchNextUnsplashWallpaper(bgState.unsplashSearch, bgState.unsplashCategory);
    }, 1200);
  } else if (bgState.unsplashMode === 'daily') {
    const todayStr = new Date().toISOString().slice(0, 10);
    const savedDate = await StorageService.get('unsplashDailyDate', '');
    if (savedDate !== todayStr) {
      setTimeout(async () => {
        await triggerUnsplashShuffle(bgState.unsplashSearch, bgState.unsplashCategory, false);
        await StorageService.set('unsplashDailyDate', todayStr);
      }, 800);
    }
  }
}

/**
 * Pre-fetch next Unsplash photo in the background to ensure next tab opens with 0ms wait
 */
async function prefetchNextUnsplashWallpaper(query, category) {
  const searchTerm = (query || category || 'cyber security').trim();
  try {
    const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=12`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const item = data.results[Math.floor(Math.random() * data.results.length)];
        const fullUrl = extractBestUnsplashUrl(item.urls, 1920, 75);
        const title = (item.description || item.alt_description || searchTerm).slice(0, 24);
        const author = item.user ? item.user.name : 'Unsplash';
        if (fullUrl) {
          const img = new Image();
          img.src = fullUrl;
          await StorageService.set('nextUnsplashWallpaper', { url: fullUrl, title, author });
        }
      }
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Trigger Unsplash Shuffle
 */
async function triggerUnsplashShuffle(query, category, notify = true) {
  const searchTerm = (query || category || 'cyber security').trim();
  const pool = [
    { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=75&auto=format&fit=crop", title: "Dark Matrix", author: "Markus Spiske" },
    { url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=75&auto=format&fit=crop", title: "Tokyo Cyber", author: "Aleksandar Pasaric" },
    { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=75&auto=format&fit=crop", title: "Server Terminal", author: "Florian Olivo" },
    { url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=75&auto=format&fit=crop", title: "Deep Cosmos", author: "NASA" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=75&auto=format&fit=crop", title: "Abstract Fluid Wave", author: "Milad Fakurian" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=75&auto=format&fit=crop", title: "Dark Architecture", author: "Sean Pollock" },
    { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=75&auto=format&fit=crop", title: "Hardware Microchip", author: "Alexandre Debiève" },
    { url: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=1920&q=75&auto=format&fit=crop", title: "Neon Rain Street", author: "Max Langelott" },
    { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920&q=75&auto=format&fit=crop", title: "Server Racks", author: "Lars Kienle" },
    { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=75&auto=format&fit=crop", title: "Milky Way Mountains", author: "Benjamin Voros" },
    { url: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=1920&q=75&auto=format&fit=crop", title: "Dark Topography", author: "Lucas Benjamin" },
    { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1920&q=75&auto=format&fit=crop", title: "Circuit Glow", author: "Arseny Togulev" }
  ];

  try {
    const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=24`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const item = data.results[Math.floor(Math.random() * data.results.length)];
        const fullUrl = extractBestUnsplashUrl(item.urls, 1920, 75);
        const title = (item.description || item.alt_description || searchTerm).slice(0, 24);
        const author = item.user ? item.user.name : 'Unsplash';
        if (fullUrl) {
          await updateActiveUnsplashWallpaper(fullUrl, title, author, notify);
          return;
        }
      }
    }
  } catch (e) {
    console.warn('Shuffle fallback to pool:', e.message);
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  await updateActiveUnsplashWallpaper(chosen.url, chosen.title, chosen.author, notify);
}

async function updateActiveUnsplashWallpaper(url, title, author, notify = true) {
  if (!currentBackgroundState) return;
  const optimized = optimizeUnsplashUrl(url);

  currentBackgroundState.url = optimized;
  currentBackgroundState.cachedDataUrl = ''; // Clear prior cached base64 so newly chosen photo is displayed
  currentBackgroundState.title = title;
  currentBackgroundState.author = author;
  if (!currentBackgroundState.attribution) currentBackgroundState.attribution = {};
  currentBackgroundState.attribution.photographer = author;
  currentBackgroundState.attribution.title = title;

  // Preload new image in memory before swapping
  const preloader = new Image();
  preloader.src = optimized;
  preloader.onload = () => {
    applyBackground(currentBackgroundState);
    cacheWallpaperLocally(optimized);
  };
  preloader.onerror = () => {
    applyBackground(currentBackgroundState);
  };

  if (preloader.complete) {
    applyBackground(currentBackgroundState);
    cacheWallpaperLocally(optimized);
  }

  await StorageService.set('wallpaperUrl', optimized);
  await StorageService.set('wallpaperTitle', title);
  await StorageService.set('wallpaperAuthor', author);

  // Update gallery highlight
  const gallery = document.getElementById('wallpaper-gallery-grid');
  if (gallery) {
    gallery.querySelectorAll('.wallpaper-thumb-card').forEach(card => {
      const m = card.dataset.url === optimized || (card.dataset.url && card.dataset.url.includes('photo-') && optimized.includes(card.dataset.url.split('?')[0]));
      card.classList.toggle('active', !!m);
    });
  }

  if (notify) {
    showToast(`Background updated: ${title}`);
  }
}

/**
 * Toast notification system
 */
function showToast(message, duration = 2500) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}

/**
 * Settings Panel management
 */
function initSettingsPanel(initialState) {
  const settingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const resetLayoutBtn = document.getElementById('reset-layout-btn');

  // Controls
  const userNameInput = document.getElementById('setting-user-name');
  const welcomeSubtextInput = document.getElementById('setting-welcome-subtext');
  const greetingSelect = document.getElementById('setting-greeting-style');
  const themeSelect = document.getElementById('setting-theme');
  const clockToggle = document.getElementById('setting-clock-format');
  const accentPicker = document.getElementById('setting-accent-color');
  const opacitySlider = document.getElementById('setting-opacity-slider');
  const opacityVal = document.getElementById('opacity-value-label');
  const quoteCatSelect = document.getElementById('setting-quote-category');

  // Set initial form states
  if (userNameInput) userNameInput.value = initialState.userName || 'kkaxh1';
  if (welcomeSubtextInput) welcomeSubtextInput.value = initialState.welcomeSubtext || 'OPERATIONAL ENVIRONMENT READY';
  if (greetingSelect) greetingSelect.value = initialState.greetingStyle || 'welcome';
  if (themeSelect) themeSelect.value = initialState.theme;
  if (clockToggle) clockToggle.checked = initialState.clockFormat === '24';
  if (accentPicker) accentPicker.value = initialState.accentColor;
  if (opacitySlider) {
    opacitySlider.value = initialState.bgOpacity;
    if (opacityVal) opacityVal.textContent = `${Math.round(initialState.bgOpacity * 100)}%`;
  }
  if (quoteCatSelect) quoteCatSelect.value = initialState.quoteCategory;

  // Open / Close Settings Slide-Over Panel (Matching Tasks panel behavior)
  const settingsOverlay = document.getElementById('settings-panel-overlay');

  const openSettings = () => {
    if (settingsModal) {
      settingsModal.classList.add('active');
      settingsModal.setAttribute('aria-hidden', 'false');
    }
    if (settingsOverlay) {
      settingsOverlay.classList.add('active');
      settingsOverlay.setAttribute('aria-hidden', 'false');
    }
  };

  const closeSettings = () => {
    if (settingsModal) {
      settingsModal.classList.remove('active');
      settingsModal.setAttribute('aria-hidden', 'true');
    }
    if (settingsOverlay) {
      settingsOverlay.classList.remove('active');
      settingsOverlay.setAttribute('aria-hidden', 'true');
    }
  };

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings);
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettings);
  }

  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', closeSettings);
  }

  // Escape key closes settings slide-over panel
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('active')) {
      closeSettings();
    }
  });

  // Operator Name Change
  if (userNameInput) {
    userNameInput.addEventListener('input', async (e) => {
      const val = e.target.value.trim() || 'kkaxh1';
      await StorageService.set('userName', val);
      const currentGreeting = greetingSelect ? greetingSelect.value : 'welcome';
      const currentSubtext = welcomeSubtextInput ? welcomeSubtextInput.value : 'OPERATIONAL ENVIRONMENT READY';
      renderWelcomeGreeting(val, currentGreeting, currentSubtext);
    });
  }

  // Welcome Subtext Change
  if (welcomeSubtextInput) {
    welcomeSubtextInput.addEventListener('input', async (e) => {
      const val = e.target.value;
      await StorageService.set('welcomeSubtext', val);
      const currentName = userNameInput ? userNameInput.value : 'kkaxh1';
      const currentGreeting = greetingSelect ? greetingSelect.value : 'welcome';
      renderWelcomeGreeting(currentName, currentGreeting, val);
    });
  }

  // Greeting Style Change
  if (greetingSelect) {
    greetingSelect.addEventListener('change', async (e) => {
      const style = e.target.value;
      await StorageService.set('greetingType', style);
      const currentName = userNameInput ? userNameInput.value : 'kkaxh1';
      const currentSubtext = welcomeSubtextInput ? welcomeSubtextInput.value : 'OPERATIONAL ENVIRONMENT READY';
      renderWelcomeGreeting(currentName, style, currentSubtext);
      showToast('Greeting style updated');
    });
  }

  // Default Search Engine
  const searchEngineSelect = document.getElementById('setting-search-engine');
  if (searchEngineSelect) {
    searchEngineSelect.value = initialState.searchEngine || 'google';
    searchEngineSelect.addEventListener('change', async (e) => {
      const eng = e.target.value;
      await StorageService.set('searchEngine', eng);
      if (typeof SearchService !== 'undefined' && SearchService.setDefaultEngine) {
        SearchService.setDefaultEngine(eng);
      }
      const label = searchEngineSelect.options[searchEngineSelect.selectedIndex].text;
      showToast(`Default search: ${label}`);
    });
  }

  // Theme change
  if (themeSelect) {
    themeSelect.addEventListener('change', async (e) => {
      const theme = e.target.value;
      applyTheme(theme);
      await StorageService.set('theme', theme);
      showToast(`Theme updated: ${theme}`);
    });
  }

  // 12h / 24h clock toggle
  if (clockToggle) {
    clockToggle.addEventListener('change', async (e) => {
      const format = e.target.checked ? '24' : '12';
      await StorageService.set('clockFormat', format);
      WidgetsManager.updateSettings({ clockFormat: format });
      showToast(`Clock format: ${format}-hour`);
    });
  }

  // Accent color change
  if (accentPicker) {
    accentPicker.addEventListener('input', async (e) => {
      const col = e.target.value;
      applyAccentColor(col);
      await StorageService.set('accentColor', col);
    });
  }

  // Opacity change
  if (opacitySlider) {
    opacitySlider.addEventListener('input', async (e) => {
      const op = parseFloat(e.target.value);
      applyBgOpacity(op);
      if (opacityVal) opacityVal.textContent = `${Math.round(op * 100)}%`;
      await StorageService.set('bgOpacity', op);
    });
  }

  // Quote category change
  if (quoteCatSelect) {
    quoteCatSelect.addEventListener('change', async (e) => {
      const cat = e.target.value;
      await StorageService.set('quoteCategory', cat);
      WidgetsManager.updateSettings({ quoteCategory: cat });
      showToast(`Quotes filter: ${cat.toUpperCase()}`);
    });
  }

  // Header Quick Wallpaper button
  const toggleWallpaperBtn = document.getElementById('toggle-wallpaper-btn');
  if (toggleWallpaperBtn && settingsModal) {
    toggleWallpaperBtn.addEventListener('click', () => {
      settingsModal.classList.add('active');
      setTimeout(() => {
        const input = document.getElementById('unsplash-search-input');
        if (input) {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          input.focus();
        }
      }, 100);
    });
  }

  // ==========================================
  // BACKGROUND SETTINGS CONTROLLER
  // ==========================================
  const bgState = initialState.bgState;

  // Source selection radios
  const sourceRadios = document.querySelectorAll('input[name="bg-source"]');
  const panels = {
    'unsplash': document.getElementById('bg-panel-unsplash'),
    'custom-url': document.getElementById('bg-panel-custom-url'),
    'local-image': document.getElementById('bg-panel-local-image'),
    'solid-gradient': document.getElementById('bg-panel-solid-gradient')
  };

  function switchBgPanel(source) {
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.toggle('active', key === source);
      }
    });
  }

  sourceRadios.forEach(radio => {
    if (radio.value === bgState.source) {
      radio.checked = true;
      switchBgPanel(bgState.source);
    }
    radio.addEventListener('change', async (e) => {
      const src = e.target.value;
      bgState.source = src;
      switchBgPanel(src);
      applyBackground(bgState);
      await StorageService.set('bgSource', src);
      showToast(`Background source: ${e.target.closest('label').querySelector('.radio-text').textContent}`);
    });
  });

  // 1. Unsplash Controls
  const unsplashSearchInput = document.getElementById('unsplash-search-input');
  const btnUnsplashSearch = document.getElementById('btn-unsplash-search');
  const unsplashCategorySelect = document.getElementById('unsplash-category-select');
  const unsplashModeRadios = document.querySelectorAll('input[name="unsplash-mode"]');
  const btnShuffleUnsplash = document.getElementById('btn-shuffle-unsplash');
  const galleryGrid = document.getElementById('wallpaper-gallery-grid');
  const galleryStatus = document.getElementById('wallpaper-gallery-status');
  const galleryCount = document.getElementById('wallpaper-gallery-count');

  if (unsplashSearchInput) unsplashSearchInput.value = bgState.unsplashSearch || 'cyber security';
  if (unsplashCategorySelect) unsplashCategorySelect.value = bgState.unsplashCategory || 'technology';

  unsplashModeRadios.forEach(radio => {
    if (radio.value === bgState.unsplashMode) radio.checked = true;
    radio.addEventListener('change', async (e) => {
      bgState.unsplashMode = e.target.value;
      await StorageService.set('unsplashMode', e.target.value);
      showToast(`Unsplash mode: ${e.target.value}`);
    });
  });

  if (unsplashCategorySelect) {
    unsplashCategorySelect.addEventListener('change', async (e) => {
      bgState.unsplashCategory = e.target.value;
      await StorageService.set('unsplashCategory', e.target.value);
      if (unsplashSearchInput) {
        unsplashSearchInput.value = e.target.value;
      }
      await searchUnsplashInPanel(e.target.value, true);
    });
  }

  async function searchUnsplashInPanel(query, autoApply = true) {
    const q = (query || '').trim();
    if (!q) return;

    if (galleryStatus) {
      galleryStatus.innerHTML = `<span class="wallpaper-loading-spinner"></span><span>Searching "${q}"...</span>`;
    }

    try {
      const response = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=18`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        if (galleryGrid) galleryGrid.innerHTML = '';
        if (galleryStatus) galleryStatus.innerHTML = `<span>Unsplash: "${q}"</span>`;
        if (galleryCount) galleryCount.textContent = `${data.results.length} Photos`;

        data.results.forEach((r, idx) => {
          const author = r.user ? r.user.name : 'Unsplash';
          const title = (r.description || r.alt_description || q).slice(0, 24);
          const fullUrl = extractBestUnsplashUrl(r.urls, 1920, 75);
          const thumbUrl = (r.urls && (r.urls.small || r.urls.thumb)) || fullUrl;

          const card = document.createElement('button');
          card.className = 'wallpaper-thumb-card';
          card.type = 'button';
          card.dataset.url = fullUrl;
          card.dataset.title = title;
          card.dataset.author = author;
          card.title = `${title} — by ${author}`;

          if (idx === 0 && autoApply) card.classList.add('active');

          card.innerHTML = `
            <img src="${thumbUrl}" alt="${title}" class="wallpaper-thumb-img" loading="lazy">
            <div class="wallpaper-thumb-overlay">
              <span class="wallpaper-thumb-name">${title}</span>
              <span class="wallpaper-thumb-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          `;
          galleryGrid.appendChild(card);
        });

        if (autoApply && data.results[0]) {
          const top = data.results[0];
          const fullUrl = extractBestUnsplashUrl(top.urls, 1920, 75);
          const title = (top.description || top.alt_description || q).slice(0, 24);
          const author = top.user ? top.user.name : 'Unsplash';
          await updateActiveUnsplashWallpaper(fullUrl, title, author, true);
        }
      } else {
        if (galleryStatus) galleryStatus.innerHTML = `<span>No results for "${q}"</span>`;
        showToast(`No results for "${q}"`);
      }
    } catch (err) {
      console.warn('Search fallback:', err.message);
      showToast(`Search error, using curated pool`);
    }
  }

  if (btnUnsplashSearch && unsplashSearchInput) {
    btnUnsplashSearch.addEventListener('click', async () => {
      const q = unsplashSearchInput.value.trim();
      bgState.unsplashSearch = q;
      await StorageService.set('unsplashSearch', q);
      await searchUnsplashInPanel(q, true);
    });
    unsplashSearchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = unsplashSearchInput.value.trim();
        bgState.unsplashSearch = q;
        await StorageService.set('unsplashSearch', q);
        await searchUnsplashInPanel(q, true);
      }
    });
  }

  if (btnShuffleUnsplash) {
    btnShuffleUnsplash.addEventListener('click', async () => {
      const q = unsplashSearchInput ? unsplashSearchInput.value.trim() : 'cyber security';
      const cat = unsplashCategorySelect ? unsplashCategorySelect.value : 'technology';
      await triggerUnsplashShuffle(q, cat, true);
    });
  }

  // Gallery card click
  if (galleryGrid) {
    galleryGrid.addEventListener('click', async (e) => {
      const card = e.target.closest('.wallpaper-thumb-card');
      if (!card) return;
      const url = card.dataset.url;
      const title = card.dataset.title || 'Unsplash Photo';
      const author = card.dataset.author || 'Unsplash Creator';
      if (url) {
        await updateActiveUnsplashWallpaper(url, title, author, true);
      }
    });
  }

  // 2. Custom URL Controls
  const customUrlInput = document.getElementById('custom-url-input');
  const btnApplyCustomUrl = document.getElementById('btn-apply-custom-url');

  if (customUrlInput) customUrlInput.value = bgState.customUrl || '';
  if (btnApplyCustomUrl && customUrlInput) {
    btnApplyCustomUrl.addEventListener('click', async () => {
      const url = customUrlInput.value.trim();
      if (!url) {
        showToast('Please enter an image URL');
        return;
      }
      bgState.source = 'custom-url';
      bgState.customUrl = url;
      document.getElementById('source-custom-url').checked = true;
      switchBgPanel('custom-url');
      applyBackground(bgState);
      await StorageService.set('bgSource', 'custom-url');
      await StorageService.set('customWallpaperUrl', url);
      showToast('Custom URL background applied');
    });
  }

  // 3. Local Image Upload
  const localImageFileInput = document.getElementById('local-image-file-input');
  const localDropzone = document.getElementById('local-upload-dropzone');
  const localPreviewBar = document.getElementById('local-image-preview-bar');
  const localThumbImg = document.getElementById('local-image-thumb');
  const localThumbName = document.getElementById('local-thumb-name');
  const btnRemoveLocalImage = document.getElementById('btn-remove-local-image');

  function updateLocalPreviewUI(dataUrl, name) {
    if (dataUrl && localPreviewBar && localThumbImg && localThumbName) {
      localThumbImg.src = dataUrl;
      localThumbName.textContent = name || 'Uploaded image';
      localPreviewBar.style.display = 'flex';
    } else if (localPreviewBar) {
      localPreviewBar.style.display = 'none';
    }
  }

  if (bgState.localData) {
    updateLocalPreviewUI(bgState.localData, bgState.localName);
  }

  function handleLocalFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      bgState.source = 'local-image';
      bgState.localData = dataUrl;
      bgState.localName = file.name;
      document.getElementById('source-local-image').checked = true;
      switchBgPanel('local-image');
      updateLocalPreviewUI(dataUrl, file.name);
      applyBackground(bgState);
      await StorageService.set('bgSource', 'local-image');
      await StorageService.set('localImageData', dataUrl);
      await StorageService.set('localImageName', file.name);
      showToast(`Local image applied: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  if (localImageFileInput) {
    localImageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleLocalFile(e.target.files[0]);
      }
    });
  }

  if (localDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      localDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        localDropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      localDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        localDropzone.classList.remove('dragover');
      });
    });
    localDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLocalFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnRemoveLocalImage) {
    btnRemoveLocalImage.addEventListener('click', async () => {
      bgState.localData = '';
      bgState.localName = '';
      updateLocalPreviewUI('', '');
      await StorageService.set('localImageData', '');
      await StorageService.set('localImageName', '');
      applyBackground(bgState);
      showToast('Local image removed');
    });
  }

  // 4. Solid / Gradient Controls
  const gradientChips = document.querySelectorAll('.gradient-chip');
  const customSolidColor = document.getElementById('custom-solid-color');

  gradientChips.forEach(chip => {
    chip.style.background = chip.dataset.gradient;
    chip.addEventListener('click', async () => {
      gradientChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const grad = chip.dataset.gradient;
      bgState.source = 'solid-gradient';
      bgState.gradient = grad;
      document.getElementById('source-solid-gradient').checked = true;
      switchBgPanel('solid-gradient');
      applyBackground(bgState);
      await StorageService.set('bgSource', 'solid-gradient');
      await StorageService.set('solidGradientValue', grad);
      showToast(`Applied ${chip.title || 'Gradient'}`);
    });
  });

  if (customSolidColor) {
    customSolidColor.addEventListener('input', async (e) => {
      const col = e.target.value;
      bgState.source = 'solid-gradient';
      bgState.gradient = col;
      document.getElementById('source-solid-gradient').checked = true;
      switchBgPanel('solid-gradient');
      applyBackground(bgState);
      await StorageService.set('bgSource', 'solid-gradient');
      await StorageService.set('solidGradientValue', col);
    });
  }

  // 5. Overlay Controls (Darkness & Blur)
  const overlayDarknessSlider = document.getElementById('setting-overlay-darkness');
  const overlayDarknessVal = document.getElementById('overlay-darkness-val');
  const overlayBlurSlider = document.getElementById('setting-overlay-blur');
  const overlayBlurVal = document.getElementById('overlay-blur-val');

  if (overlayDarknessSlider) {
    overlayDarknessSlider.value = bgState.darkness;
    if (overlayDarknessVal) overlayDarknessVal.textContent = `${Math.round(bgState.darkness * 100)}%`;
    overlayDarknessSlider.addEventListener('input', async (e) => {
      const val = parseFloat(e.target.value);
      bgState.darkness = val;
      if (overlayDarknessVal) overlayDarknessVal.textContent = `${Math.round(val * 100)}%`;
      applyBackground(bgState);
      await StorageService.set('overlayDarkness', val);
    });
  }

  if (overlayBlurSlider) {
    overlayBlurSlider.value = bgState.blur;
    if (overlayBlurVal) overlayBlurVal.textContent = `${bgState.blur}px`;
    overlayBlurSlider.addEventListener('input', async (e) => {
      const val = parseInt(e.target.value, 10);
      bgState.blur = val;
      if (overlayBlurVal) overlayBlurVal.textContent = `${val}px`;
      applyBackground(bgState);
      await StorageService.set('overlayBlur', val);
    });
  }

  // 6. Effects Checkboxes
  const chkGlass = document.getElementById('effect-glass-readability');
  const chkVignette = document.getElementById('effect-vignette');
  const chkParallax = document.getElementById('effect-parallax');
  const chkMotion = document.getElementById('effect-motion');

  if (chkGlass) {
    chkGlass.checked = !!bgState.effects.glass;
    chkGlass.addEventListener('change', async (e) => {
      bgState.effects.glass = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('effectGlassReadability', e.target.checked);
    });
  }

  if (chkVignette) {
    chkVignette.checked = !!bgState.effects.vignette;
    chkVignette.addEventListener('change', async (e) => {
      bgState.effects.vignette = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('effectVignette', e.target.checked);
    });
  }

  if (chkParallax) {
    chkParallax.checked = !!bgState.effects.parallax;
    chkParallax.addEventListener('change', async (e) => {
      bgState.effects.parallax = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('effectParallax', e.target.checked);
    });
  }

  if (chkMotion) {
    chkMotion.checked = !!bgState.effects.motion;
    chkMotion.addEventListener('change', async (e) => {
      bgState.effects.motion = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('effectMotion', e.target.checked);
    });
  }

  // 7. Photo Info Checkboxes
  const chkPhotographer = document.getElementById('info-show-photographer');
  const chkAttribution = document.getElementById('info-show-attribution');

  if (chkPhotographer) {
    chkPhotographer.checked = !!bgState.attribution.showPhotographer;
    chkPhotographer.addEventListener('change', async (e) => {
      bgState.attribution.showPhotographer = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('infoShowPhotographer', e.target.checked);
    });
  }

  if (chkAttribution) {
    chkAttribution.checked = !!bgState.attribution.showAttribution;
    chkAttribution.addEventListener('change', async (e) => {
      bgState.attribution.showAttribution = e.target.checked;
      applyBackground(bgState);
      await StorageService.set('infoShowAttribution', e.target.checked);
    });
  }

  // Reset Layout
  if (resetLayoutBtn) {
    resetLayoutBtn.addEventListener('click', async () => {
      await WidgetsManager.resetLayout();
      showToast('Dashboard layout reset to defaults');
    });
  }

  // Initialize Dock Links Manager
  initDockLinksManager();
}

/**
 * Render All Dock Popovers from dynamic storage
 */
async function renderAllDockPopovers() {
  let dockLinks = await StorageService.get('dockLinks');
  if (!dockLinks || Object.keys(dockLinks).length === 0) {
    dockLinks = StorageService.DEFAULTS ? StorageService.DEFAULTS.dockLinks : {};
  }
  const wrappers = document.querySelectorAll('.dock-item-wrapper');

  wrappers.forEach(wrapper => {
    const key = wrapper.dataset.dock;
    if (!key) return;
    const listEl = wrapper.querySelector('.popover-list');
    if (!listEl) return;
    const links = (dockLinks && dockLinks[key]) || (StorageService.DEFAULTS && StorageService.DEFAULTS.dockLinks && StorageService.DEFAULTS.dockLinks[key]) || [];

    listEl.innerHTML = '';
    links.forEach(item => {
      const a = document.createElement('a');
      a.className = 'popover-item';
      a.href = item.url;
      if (item.url && item.url.startsWith('#')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          if (item.url === '#dorkui' && typeof window.openDorkBuilderModal === 'function') {
            window.openDorkBuilderModal();
          }
          if (typeof closeAllDockPopovers === 'function') {
            closeAllDockPopovers();
          }
        });
      } else {
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
      }
      a.innerHTML = `
        <div class="popover-item-text">
          <span class="popover-item-title">${escapeHtml(item.title)}</span>
          <span class="popover-item-desc">${escapeHtml(item.desc || '')}</span>
        </div>
        <svg class="popover-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      `;
      listEl.appendChild(a);
    });
  });
}

/**
 * Dock Popovers Interactive Management
 */
function initDockPopovers() {
  renderAllDockPopovers();

  const wrappers = document.querySelectorAll('.dock-item-wrapper');

  wrappers.forEach(wrapper => {
    const btn = wrapper.querySelector('.dock-item');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAlreadyActive = wrapper.classList.contains('active');

      // Close all other open popovers
      wrappers.forEach(w => {
        w.classList.remove('active');
        const b = w.querySelector('.dock-item');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!isAlreadyActive) {
        wrapper.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close popovers on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dock-item-wrapper')) {
      closeAllDockPopovers();
    }
  });
}

function closeAllDockPopovers() {
  const wrappers = document.querySelectorAll('.dock-item-wrapper');
  wrappers.forEach(w => {
    w.classList.remove('active');
    const b = w.querySelector('.dock-item');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Dock Links Manager (Inside Settings Modal)
 */
async function initDockLinksManager() {
  const categorySelect = document.getElementById('dock-category-select');
  const listEl = document.getElementById('dock-manager-list');
  const titleInput = document.getElementById('dock-new-title');
  const descInput = document.getElementById('dock-new-desc');
  const urlInput = document.getElementById('dock-new-url');
  const addBtn = document.getElementById('dock-add-btn');
  const resetBtn = document.getElementById('dock-reset-category-btn');

  if (!categorySelect || !listEl) return;

  let dockLinks = await StorageService.get('dockLinks');
  if (!dockLinks || Object.keys(dockLinks).length === 0) {
    dockLinks = StorageService.DEFAULTS ? JSON.parse(JSON.stringify(StorageService.DEFAULTS.dockLinks)) : {};
    await StorageService.set('dockLinks', dockLinks);
  }

  function renderCategoryList() {
    const cat = categorySelect.value;
    let links = (dockLinks && dockLinks[cat]) ? dockLinks[cat] : null;
    if (!links && StorageService.DEFAULTS && StorageService.DEFAULTS.dockLinks) {
      links = StorageService.DEFAULTS.dockLinks[cat] || [];
      dockLinks[cat] = links;
    }
    listEl.innerHTML = '';

    if (!links || links.length === 0) {
      listEl.innerHTML = '<div class="palette-empty">No links configured in this category</div>';
      return;
    }

    links.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'dock-manager-item';

      const info = document.createElement('div');
      info.className = 'dock-manager-item-info';
      info.innerHTML = `
        <span class="dock-manager-item-title">${escapeHtml(item.title)}</span>
        <span class="dock-manager-item-url">${escapeHtml(item.url)}</span>
      `;

      const delBtn = document.createElement('button');
      delBtn.className = 'dock-manager-del-btn';
      delBtn.type = 'button';
      delBtn.title = 'Delete link';
      delBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      delBtn.addEventListener('click', async () => {
        links.splice(index, 1);
        dockLinks[cat] = links;
        await StorageService.set('dockLinks', dockLinks);
        renderCategoryList();
        renderAllDockPopovers();
        showToast('Link removed');
      });

      row.appendChild(info);
      row.appendChild(delBtn);
      listEl.appendChild(row);
    });
  }

  categorySelect.addEventListener('change', renderCategoryList);

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      let url = urlInput.value.trim();

      if (!title || !url) {
        showToast('Please provide a title and URL');
        return;
      }

      if (!/^https?:\/\//i.test(url) && !url.startsWith('http://') && !url.endsWith('.onion')) {
        url = 'https://' + url;
      }

      const cat = categorySelect.value;
      if (!dockLinks[cat]) dockLinks[cat] = [];
      dockLinks[cat].push({ title, desc, url });

      await StorageService.set('dockLinks', dockLinks);
      titleInput.value = '';
      descInput.value = '';
      urlInput.value = '';
      renderCategoryList();
      renderAllDockPopovers();
      showToast(`Added: ${title}`);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const cat = categorySelect.value;
      const defaultLinks = {
        search: [
          { title: 'Google Search', desc: 'Primary web search engine', url: 'https://www.google.com' },
          { title: 'Google Dork Builder', desc: 'Interactive OSINT reconnaissance & query builder', url: '#dorkui' },
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
      };

      if (defaultLinks[cat]) {
        dockLinks[cat] = JSON.parse(JSON.stringify(defaultLinks[cat]));
        await StorageService.set('dockLinks', dockLinks);
        renderCategoryList();
        renderAllDockPopovers();
        showToast(`Reset ${cat} links to default`);
      }
    });
  }

  renderCategoryList();
}

/**
 * Active IP & VPN / Proxy Leak Indicator
 */
async function initIpIndicator() {
  const indicatorEl = document.getElementById('ip-leak-indicator');
  const dotEl = document.getElementById('ip-status-dot');
  const displayVal = document.getElementById('ip-display-val');
  const countryBadge = document.getElementById('ip-country-badge');
  const popoverCard = document.getElementById('ip-popover-card');
  const refreshBtn = document.getElementById('ip-refresh-btn');
  const copyBtn = document.getElementById('ip-copy-btn');
  const fullIpEl = document.getElementById('ip-full-ip');
  const fullOrgEl = document.getElementById('ip-full-org');
  const fullLocEl = document.getElementById('ip-full-loc');
  const fullVpnEl = document.getElementById('ip-full-vpn');

  if (!indicatorEl || !displayVal) return;

  let currentIpData = null;

  function renderIpData(data) {
    if (!data || !data.ip || data.ip === 'Unknown') {
      displayVal.textContent = 'Offline';
      if (dotEl) dotEl.className = 'ip-status-dot dot-leak';
      if (countryBadge) countryBadge.style.display = 'none';
      if (fullIpEl) fullIpEl.textContent = 'Unavailable';
      if (fullOrgEl) fullOrgEl.textContent = '-';
      if (fullLocEl) fullLocEl.textContent = '-';
      if (fullVpnEl) {
        fullVpnEl.textContent = '-';
        fullVpnEl.style.color = 'var(--text-muted)';
      }
      return;
    }

    currentIpData = data;
    displayVal.textContent = data.ip;
    if (countryBadge) {
      countryBadge.textContent = data.country || 'NET';
      countryBadge.style.display = 'inline-block';
    }

    const orgLower = ((data.org || '') + ' ' + (data.city || '')).toLowerCase();
    const isVpn = orgLower.includes('vpn') ||
      orgLower.includes('cloud') ||
      orgLower.includes('hosting') ||
      orgLower.includes('datacenter') ||
      orgLower.includes('server') ||
      orgLower.includes('amazon') ||
      orgLower.includes('google') ||
      orgLower.includes('microsoft') ||
      orgLower.includes('mullvad') ||
      orgLower.includes('digitalocean') ||
      orgLower.includes('linode') ||
      orgLower.includes('ovh') ||
      orgLower.includes('hetzner') ||
      orgLower.includes('vultr') ||
      orgLower.includes('nord') ||
      orgLower.includes('express') ||
      orgLower.includes('proton') ||
      orgLower.includes('tor');

    if (dotEl) {
      if (isVpn) {
        dotEl.className = 'ip-status-dot dot-vpn';
        indicatorEl.title = `Protected VPN / Proxy: ${data.ip}`;
      } else {
        dotEl.className = 'ip-status-dot dot-secure';
        indicatorEl.title = `Active Public IP: ${data.ip}`;
      }
    }

    if (fullIpEl) fullIpEl.textContent = data.ip;
    if (fullOrgEl) fullOrgEl.textContent = data.org || 'ISP Network';
    if (fullLocEl) fullLocEl.textContent = (data.city && data.city !== 'Unknown') ? `${data.city}, ${data.country || 'NET'}` : (data.country || 'Public Network');
    if (fullVpnEl) {
      fullVpnEl.textContent = isVpn ? 'Protected (VPN / Datacenter)' : 'Exposed (Residential / ISP)';
      fullVpnEl.style.color = isVpn ? '#06b6d4' : '#f59e0b';
    }
  }

  async function fetchWithTimeout(url, timeoutMs = 4500) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  async function checkIp() {
    if (dotEl && !currentIpData) {
      dotEl.className = 'ip-status-dot dot-checking';
      displayVal.textContent = 'Checking...';
    }

    if (refreshBtn) {
      refreshBtn.classList.add('is-refreshing');
    }

    let resolvedData = null;

    // Provider 1: ipwho.is (rich details: IP, country, city, ISP)
    try {
      const res = await fetchWithTimeout('https://ipwho.is/');
      if (res.ok) {
        const json = await res.json();
        if (json && json.ip && json.success !== false) {
          resolvedData = {
            ip: json.ip,
            org: (json.connection && (json.connection.isp || json.connection.org)) || 'ISP Network',
            country: json.country_code || json.country || 'NET',
            city: json.city || 'Unknown'
          };
        }
      }
    } catch (e) {
      // Continue to next provider
    }

    // Provider 2: api64.ipify.org
    if (!resolvedData) {
      try {
        const res = await fetchWithTimeout('https://api64.ipify.org?format=json');
        if (res.ok) {
          const json = await res.json();
          if (json && json.ip) {
            resolvedData = {
              ip: json.ip,
              org: 'Public Network',
              country: 'NET',
              city: 'Unknown'
            };
          }
        }
      } catch (e) {
        // Continue to next provider
      }
    }

    // Provider 3: api.ipify.org
    if (!resolvedData) {
      try {
        const res = await fetchWithTimeout('https://api.ipify.org?format=json');
        if (res.ok) {
          const json = await res.json();
          if (json && json.ip) {
            resolvedData = {
              ip: json.ip,
              org: 'Public Network',
              country: 'NET',
              city: 'Unknown'
            };
          }
        }
      } catch (e) {
        // Continue to next provider
      }
    }

    // Provider 4: httpbin.org/ip
    if (!resolvedData) {
      try {
        const res = await fetchWithTimeout('https://httpbin.org/ip');
        if (res.ok) {
          const json = await res.json();
          if (json && json.origin) {
            const rawIp = json.origin.split(',')[0].trim();
            resolvedData = {
              ip: rawIp,
              org: 'Public Network',
              country: 'NET',
              city: 'Unknown'
            };
          }
        }
      } catch (e) {
        // Fallback exhausted
      }
    }

    if (refreshBtn) {
      refreshBtn.classList.remove('is-refreshing');
    }

    if (resolvedData) {
      renderIpData(resolvedData);
      StorageService.set('cachedIpData', resolvedData);
    } else if (!currentIpData) {
      renderIpData(null);
    }
  }

  // Hydrate immediately from cache if available
  const cached = await StorageService.get('cachedIpData', null);
  if (cached && cached.ip) {
    renderIpData(cached);
  }

  // Toggle Popover Card
  indicatorEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('#ip-refresh-btn') || e.target.closest('#ip-copy-btn')) return;
    const isVisible = popoverCard && popoverCard.style.display === 'flex';
    if (popoverCard) {
      popoverCard.style.display = isVisible ? 'none' : 'flex';
    }
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      checkIp();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (currentIpData && currentIpData.ip) {
        try {
          await navigator.clipboard.writeText(currentIpData.ip);
          copyBtn.textContent = 'Copied';
          setTimeout(() => { copyBtn.textContent = 'Copy IP'; }, 1500);
        } catch {
          showToast(`IP: ${currentIpData.ip}`);
        }
      }
    });
  }

  // Close popover when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (popoverCard && !indicatorEl.contains(e.target)) {
      popoverCard.style.display = 'none';
    }
  });

  window.addEventListener('online', checkIp);
  window.addEventListener('offline', () => {
    if (!currentIpData) renderIpData(null);
  });

  if (cached && cached.ip) {
    setTimeout(checkIp, 1200);
  } else {
    setTimeout(checkIp, 150);
  }
}

/**
 * Small Header Countdown Indicator (Beside IP Network Status)
 */
async function initHeaderCountdown() {
  const pillEl = document.getElementById('header-countdown-pill');
  if (!pillEl) return;

  const titleEl = document.getElementById('hdr-cd-title');
  const digitsEl = document.getElementById('hdr-cd-digits');
  const badgeEl = document.getElementById('hdr-cd-badge');

  const popover = document.getElementById('hdr-cd-popover');
  const popoverTitle = document.getElementById('hdr-cd-popover-title');
  const popoverBadge = document.getElementById('hdr-cd-popover-badge');
  const popoverDigits = document.getElementById('hdr-cd-popover-digits');
  const popoverSub = document.getElementById('hdr-cd-popover-sub');
  const popoverFill = document.getElementById('hdr-cd-popover-fill');
  const sprintToggleBtn = document.getElementById('hdr-cd-sprint-toggle');
  const openWidgetBtn = document.getElementById('hdr-cd-open-widget-btn');

  let title = 'CTF';
  let mode = 'date';
  let targetDate = null;
  let startDate = null;
  let sprintMins = 45;
  let sprintRemaining = 45 * 60;
  let isSprintRunning = false;

  async function loadData() {
    title = await StorageService.get('countdownTitle', 'CTF / Engagement Deadline');
    mode = await StorageService.get('countdownMode', 'date');
    let targetIso = await StorageService.get('countdownTargetDate', '');
    let startIso = await StorageService.get('countdownStartDate', '');

    if (!targetIso) {
      const defTarget = new Date();
      defTarget.setDate(defTarget.getDate() + 7);
      defTarget.setHours(23, 59, 59, 0);
      targetIso = defTarget.toISOString();
      startIso = new Date().toISOString();
    }

    targetDate = new Date(targetIso);
    startDate = startIso ? new Date(startIso) : new Date();
    sprintMins = await StorageService.get('countdownSprintMins', 45);
    sprintRemaining = await StorageService.get('countdownSprintRemaining', sprintMins * 60);
    isSprintRunning = await StorageService.get('countdownSprintRunning', false);

    updateDisplay();
  }

  function updateDisplay() {
    const shortTitle = title.length > 8 ? title.slice(0, 8) + '…' : title;
    if (titleEl) titleEl.textContent = `${shortTitle}:`;
    if (popoverTitle) popoverTitle.textContent = title;

    if (mode === 'date') {
      if (sprintToggleBtn) sprintToggleBtn.style.display = 'none';

      const now = new Date();
      const diff = targetDate ? (targetDate - now) : 0;

      if (!targetDate || diff <= 0) {
        if (digitsEl) digitsEl.textContent = '00:00:00';
        if (badgeEl) {
          badgeEl.textContent = 'EXPIRED';
          badgeEl.className = 'hdr-cd-badge is-expired';
        }
        if (popoverBadge) {
          popoverBadge.textContent = 'EXPIRED';
          popoverBadge.className = 'hdr-cd-badge is-expired';
        }
        if (popoverDigits) popoverDigits.textContent = '00d 00h 00m 00s';
        if (popoverSub) popoverSub.textContent = 'Deadline reached!';
        if (popoverFill) popoverFill.style.width = '100%';
        pillEl.title = `${title}: Deadline reached`;
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        if (digitsEl) digitsEl.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
      } else {
        if (digitsEl) digitsEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      if (popoverDigits) {
        popoverDigits.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
      }

      if (diff < 3600000) {
        if (badgeEl) {
          badgeEl.textContent = 'URGENT';
          badgeEl.className = 'hdr-cd-badge is-urgent';
        }
        if (popoverBadge) {
          popoverBadge.textContent = 'URGENT';
          popoverBadge.className = 'hdr-cd-badge is-urgent';
        }
      } else {
        if (badgeEl) {
          badgeEl.textContent = 'LIVE';
          badgeEl.className = 'hdr-cd-badge';
        }
        if (popoverBadge) {
          popoverBadge.textContent = 'LIVE';
          popoverBadge.className = 'hdr-cd-badge';
        }
      }

      const totalSpan = targetDate - startDate;
      let pct = 0;
      if (totalSpan > 0) {
        pct = Math.min(100, Math.max(0, Math.round(((now - startDate) / totalSpan) * 100)));
      }
      if (popoverFill) popoverFill.style.width = `${pct}%`;

      const dateStr = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = targetDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      if (popoverSub) popoverSub.textContent = `Target: ${dateStr} at ${timeStr} (${pct}% elapsed)`;
      pillEl.title = `${title} • Target: ${dateStr} ${timeStr} (${days}d ${hours}h ${minutes}m remaining)`;
    } else {
      // Sprint mode
      if (sprintToggleBtn) {
        sprintToggleBtn.style.display = 'inline-flex';
        sprintToggleBtn.innerHTML = isSprintRunning 
          ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> <span>Pause</span>' 
          : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg> <span>Start</span>';
      }

      if (isSprintRunning && sprintRemaining > 0) {
        sprintRemaining--;
      }

      const totalSecs = sprintMins * 60;
      const mins = Math.floor(sprintRemaining / 60);
      const secs = sprintRemaining % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (digitsEl) digitsEl.textContent = timeStr;
      if (popoverDigits) popoverDigits.textContent = `00d 00h ${timeStr}`;

      if (sprintRemaining === 0) {
        if (badgeEl) {
          badgeEl.textContent = 'DONE';
          badgeEl.className = 'hdr-cd-badge is-expired';
        }
        if (popoverBadge) {
          popoverBadge.textContent = 'DONE';
          popoverBadge.className = 'hdr-cd-badge is-expired';
        }
        if (popoverFill) popoverFill.style.width = '100%';
        if (popoverSub) popoverSub.textContent = `Sprint completed (${sprintMins}m)`;
        isSprintRunning = false;
      } else {
        const badgeText = isSprintRunning ? 'SPRINT' : 'PAUSED';
        const badgeClass = isSprintRunning ? 'hdr-cd-badge' : 'hdr-cd-badge is-urgent';
        if (badgeEl) {
          badgeEl.textContent = badgeText;
          badgeEl.className = badgeClass;
        }
        if (popoverBadge) {
          popoverBadge.textContent = badgeText;
          popoverBadge.className = badgeClass;
        }
        const pct = Math.min(100, Math.max(0, Math.round(((totalSecs - sprintRemaining) / totalSecs) * 100)));
        if (popoverFill) popoverFill.style.width = `${pct}%`;
        if (popoverSub) popoverSub.textContent = `${sprintMins}m Sprint (${pct}% elapsed)`;
      }
      pillEl.title = `${title} • Sprint ${timeStr} (${isSprintRunning ? 'Running' : 'Paused'})`;
    }
  }

  // Toggle popover card
  pillEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('#hdr-cd-sprint-toggle') || e.target.closest('#hdr-cd-open-widget-btn')) return;
    const isVisible = popover && popover.style.display === 'flex';
    if (popover) {
      popover.style.display = isVisible ? 'none' : 'flex';
    }
  });

  // Sprint start/pause from popover
  if (sprintToggleBtn) {
    sprintToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSprintRunning = !isSprintRunning;
      StorageService.set('countdownSprintRunning', isSprintRunning);
      updateDisplay();
    });
  }

  // Open / focus countdown widget
  if (openWidgetBtn) {
    openWidgetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popover) popover.style.display = 'none';

      const countdownWidget = document.querySelector('.widget-countdown');
      if (countdownWidget) {
        countdownWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        countdownWidget.classList.add('is-selected');
        setTimeout(() => countdownWidget.classList.remove('is-selected'), 2000);
        const gearBtn = countdownWidget.querySelector('#cd-gear-btn');
        if (gearBtn) gearBtn.click();
      } else {
        const addBtn = document.getElementById('open-add-widget-btn');
        if (addBtn) addBtn.click();
      }
    });
  }

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (popover && !pillEl.contains(e.target)) {
      popover.style.display = 'none';
    }
  });

  // Sync when storage changes
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.countdownTitle || changes.countdownTargetDate || changes.countdownMode || changes.countdownSprintMins || changes.countdownSprintRunning) {
          loadData();
        }
      }
    });
  }

  await loadData();
  setInterval(updateDisplay, 1000);
}

/**
 * Command Palette (Ctrl + K / Cmd + K)
 */
function initCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('command-palette-input');
  const resultsEl = document.getElementById('command-palette-results');

  if (!modal || !input || !resultsEl) return;

  let selectedIndex = 0;
  let currentResults = [];

  function openPalette() {
    modal.style.display = 'flex';
    modal.classList.add('active');
    input.value = '';
    selectedIndex = 0;
    renderResults('');
    setTimeout(() => { input.focus(); }, 20);
  }

  function closePalette() {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePalette();
    }
  });

  input.addEventListener('input', () => {
    selectedIndex = 0;
    renderResults(input.value.trim());
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        updateSelectedUI();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
        updateSelectedUI();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentResults[selectedIndex]) {
        executeAction(currentResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  });

  async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function buildResults(query) {
    const list = [];
    const qLower = query.toLowerCase();

    // 1. Utility Command Prefixes
    if (query.startsWith('b64 ')) {
      const text = query.slice(4);
      try {
        const encoded = btoa(unescape(encodeURIComponent(text)));
        list.push({
          badge: 'b64',
          title: `Base64 Encoded: ${encoded}`,
          desc: `Click to copy result to clipboard`,
          action: async () => {
            await navigator.clipboard.writeText(encoded);
            showToast('Copied Base64 to clipboard');
            closePalette();
          }
        });
      } catch (err) {
        list.push({ badge: 'error', title: 'Invalid encoding input', desc: err.message, action: () => { } });
      }
      return list;
    }

    if (query.startsWith('b64d ')) {
      const text = query.slice(5);
      try {
        const decoded = decodeURIComponent(escape(atob(text)));
        list.push({
          badge: 'b64',
          title: `Base64 Decoded: ${decoded}`,
          desc: `Click to copy result to clipboard`,
          action: async () => {
            await navigator.clipboard.writeText(decoded);
            showToast('Copied decoded text to clipboard');
            closePalette();
          }
        });
      } catch (err) {
        list.push({ badge: 'error', title: 'Invalid Base64 string', desc: err.message, action: () => { } });
      }
      return list;
    }

    if (query.startsWith('hex ')) {
      const text = query.slice(4);
      const hex = Array.from(new TextEncoder().encode(text)).map(b => b.toString(16).padStart(2, '0')).join('');
      list.push({
        badge: 'hex',
        title: `Hex Encoded: ${hex}`,
        desc: `Click to copy hex to clipboard`,
        action: async () => {
          await navigator.clipboard.writeText(hex);
          showToast('Copied hex to clipboard');
          closePalette();
        }
      });
      return list;
    }

    if (query.startsWith('hexd ')) {
      const text = query.slice(5).replace(/\s+/g, '');
      try {
        const bytes = [];
        for (let i = 0; i < text.length; i += 2) {
          bytes.push(parseInt(text.substr(i, 2), 16));
        }
        const decoded = new TextDecoder().decode(new Uint8Array(bytes));
        list.push({
          badge: 'hex',
          title: `Hex Decoded: ${decoded}`,
          desc: `Click to copy to clipboard`,
          action: async () => {
            await navigator.clipboard.writeText(decoded);
            showToast('Copied decoded text to clipboard');
            closePalette();
          }
        });
      } catch (err) {
        list.push({ badge: 'error', title: 'Invalid hex string', desc: err.message, action: () => { } });
      }
      return list;
    }

    if (query.startsWith('hash ') || query.startsWith('sha ')) {
      const text = query.replace(/^(hash|sha)\s+/, '');
      const hashed = await sha256(text);
      list.push({
        badge: 'sha256',
        title: `SHA-256: ${hashed}`,
        desc: `Click to copy hash to clipboard`,
        action: async () => {
          await navigator.clipboard.writeText(hashed);
          showToast('Copied SHA-256 hash to clipboard');
          closePalette();
        }
      });
      return list;
    }

    if (query.startsWith('url ')) {
      const text = query.slice(4);
      const encoded = encodeURIComponent(text);
      list.push({
        badge: 'url',
        title: `URL Encoded: ${encoded}`,
        desc: `Click to copy to clipboard`,
        action: async () => {
          await navigator.clipboard.writeText(encoded);
          showToast('Copied URL-encoded string to clipboard');
          closePalette();
        }
      });
      return list;
    }

    if (query.startsWith('urld ')) {
      const text = query.slice(5);
      try {
        const decoded = decodeURIComponent(text);
        list.push({
          badge: 'url',
          title: `URL Decoded: ${decoded}`,
          desc: `Click to copy to clipboard`,
          action: async () => {
            await navigator.clipboard.writeText(decoded);
            showToast('Copied URL-decoded string to clipboard');
            closePalette();
          }
        });
      } catch (err) {
        list.push({ badge: 'error', title: 'Invalid URL string', desc: err.message, action: () => { } });
      }
      return list;
    }

    // 2. Dashboard Actions
    const standardActions = [
      {
        badge: 'action',
        title: 'Open Settings',
        desc: 'Customize appearance, greetings, and wallpapers',
        action: () => {
          document.getElementById('settings-modal')?.classList.add('active');
          closePalette();
        }
      },
      {
        badge: 'action',
        title: 'Add Widgets',
        desc: 'Open Widget Library to add cards to dashboard',
        action: () => {
          document.getElementById('open-add-widget-btn')?.click();
          closePalette();
        }
      },
      {
        badge: 'action',
        title: 'Toggle Tasks Panel',
        desc: 'View and manage target to-do items',
        action: () => {
          document.getElementById('toggle-todo-btn')?.click();
          closePalette();
        }
      },
      {
        badge: 'action',
        title: 'Keyboard Shortcuts',
        desc: 'View console hotkeys cheatsheet (Press ? or H)',
        action: () => {
          closePalette();
          setTimeout(() => {
            document.getElementById('open-shortcuts-btn')?.click();
          }, 50);
        }
      },
      {
        badge: 'action',
        title: 'Google Dork Builder (/dorkui)',
        desc: 'Interactive OSINT reconnaissance & operator query builder',
        action: () => {
          closePalette();
          setTimeout(() => {
            if (typeof window.openDorkBuilderModal === 'function') {
              window.openDorkBuilderModal();
            }
          }, 40);
        }
      },
      {
        badge: 'action',
        title: 'Cycle Search Engine',
        desc: 'Switch between Google, DDG, DeepSeek, Torch, Brave, etc. (Press E)',
        action: () => {
          SearchService.cycleEngine();
          closePalette();
        }
      },
      {
        badge: 'action',
        title: 'Shuffle Wallpaper',
        desc: 'Pick a fresh cyber wallpaper from Unsplash (Press B)',
        action: () => {
          document.getElementById('btn-shuffle-unsplash')?.click();
          closePalette();
        }
      },
      {
        badge: 'action',
        title: 'Arrange Widgets Mode',
        desc: 'Drag, reorder, and resize dashboard widgets (Press M or R)',
        action: () => {
          document.getElementById('toggle-arrange-grid-btn')?.click();
          closePalette();
        }
      },
      {
        badge: 'theme',
        title: 'Theme: Charcoal Glass (Dark)',
        desc: 'Switch dashboard to dark charcoal glass theme',
        action: async () => {
          applyTheme('dark');
          await StorageService.set('theme', 'dark');
          closePalette();
        }
      },
      {
        badge: 'theme',
        title: 'Theme: OLED Midnight',
        desc: 'Switch dashboard to deep pitch-black OLED theme',
        action: async () => {
          applyTheme('midnight');
          await StorageService.set('theme', 'midnight');
          closePalette();
        }
      },
      {
        badge: 'theme',
        title: 'Theme: Minimal Light',
        desc: 'Switch dashboard to frosted light appearance',
        action: async () => {
          applyTheme('light');
          await StorageService.set('theme', 'light');
          closePalette();
        }
      }
    ];

    standardActions.forEach(a => {
      if (!query || a.title.toLowerCase().includes(qLower) || a.desc.toLowerCase().includes(qLower) || a.badge.includes(qLower)) {
        list.push(a);
      }
    });

    // 3. Quick Widget Add Actions
    const allWidgets = [
      { id: 'useragents', title: 'User-Agent & Headers' },
      { id: 'payloads', title: 'Pentest Payloads' },
      { id: 'encoder', title: 'Encoder & Hashes' },
      { id: 'commonports', title: 'Common Ports' },
      { id: 'cvss', title: 'CVSS Calculator' },
      { id: 'subnets', title: 'Subnets & CIDR' },
      { id: 'todolist', title: 'To-Do List' },
      { id: 'notes', title: 'Notes Scratchpad' },
      { id: 'github', title: 'GitHub Security Tools' }
    ];

    allWidgets.forEach(w => {
      if (query.includes('add') || query.includes('widget') || w.title.toLowerCase().includes(qLower)) {
        list.push({
          badge: 'widget',
          title: `Add ${w.title}`,
          desc: 'Place widget onto operational dashboard grid',
          action: async () => {
            await WidgetsManager.addWidget(w.id);
            showToast(`Added ${w.title} widget`);
            closePalette();
          }
        });
      }
    });

    // 4. All Dock Links
    const dockLinks = await StorageService.get('dockLinks', {});
    Object.keys(dockLinks).forEach(cat => {
      const items = dockLinks[cat] || [];
      items.forEach(link => {
        if (!query || link.title.toLowerCase().includes(qLower) || (link.desc && link.desc.toLowerCase().includes(qLower))) {
          list.push({
            badge: cat,
            title: link.title,
            desc: link.desc || link.url,
            action: () => {
              window.open(link.url, '_blank', 'noreferrer');
              closePalette();
            }
          });
        }
      });
    });

    // 5. If typing arbitrary query, offer search action
    if (query && list.length < 5) {
      list.push({
        badge: 'search',
        title: `Search Web for "${query}"`,
        desc: 'Execute query in active search engine',
        action: () => {
          SearchService.executeSearch(query);
          closePalette();
        }
      });
    }

    return list;
  }

  async function renderResults(query) {
    currentResults = await buildResults(query);
    resultsEl.innerHTML = '';

    if (currentResults.length === 0) {
      resultsEl.innerHTML = '<div class="palette-empty">No matching commands, tools, or shortcuts</div>';
      return;
    }

    currentResults.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `palette-item ${idx === selectedIndex ? 'is-selected' : ''}`;
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', idx === selectedIndex ? 'true' : 'false');

      div.innerHTML = `
        <div class="palette-item-left">
          <span class="palette-badge">${escapeHtml(item.badge)}</span>
          <div class="palette-item-text">
            <span class="palette-item-title">${escapeHtml(item.title)}</span>
            <span class="palette-item-desc">${escapeHtml(item.desc)}</span>
          </div>
        </div>
        <span class="palette-item-hint">Select</span>
      `;

      div.addEventListener('click', () => {
        executeAction(item);
      });

      resultsEl.appendChild(div);
    });

    updateSelectedUI();
  }

  function updateSelectedUI() {
    const items = resultsEl.querySelectorAll('.palette-item');
    items.forEach((item, idx) => {
      const isSel = idx === selectedIndex;
      item.classList.toggle('is-selected', isSel);
      item.setAttribute('aria-selected', isSel ? 'true' : 'false');
      if (isSel) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function executeAction(item) {
    if (item && typeof item.action === 'function') {
      item.action();
    }
  }

  // Global keydown for Ctrl+K or Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (modal.style.display === 'flex') {
        closePalette();
      } else {
        openPalette();
      }
    }
  });

  return { openPalette, closePalette };
}

/**
 * Google Dork Builder Modal Controller
 */
function initDorkBuilderModal() {
  const modal = document.getElementById('dork-builder-modal');
  const closeBtn = document.getElementById('close-dork-modal-btn');
  const scopeInput = document.getElementById('dork-scope-input');
  const personInput = document.getElementById('dork-person-input');
  const handleInput = document.getElementById('dork-handle-input');
  const saveScopeBtn = document.getElementById('dork-save-scope-btn');
  const scopePill = document.getElementById('dork-modal-scope-pill');
  const scopeNotice = document.getElementById('dork-scope-notice');
  const operatorChips = document.getElementById('dork-operator-chips');
  const categoryTabs = document.getElementById('dork-category-tabs');
  const templatesGrid = document.getElementById('dork-templates-grid');
  const queryInput = document.getElementById('dork-query-input');
  const compiledText = document.getElementById('dork-compiled-text');
  const copyBtn = document.getElementById('dork-copy-btn');
  const launchBtn = document.getElementById('dork-launch-btn');
  const saveCustomBtn = document.getElementById('dork-save-custom-btn');
  const resetQueryBtn = document.getElementById('dork-reset-query-btn');
  const exportBtn = document.getElementById('dork-export-json-btn');
  const importInput = document.getElementById('dork-import-file-input');

  if (!modal) return;

  let activeCategory = 'all';

  window.openDorkBuilderModal = async function (initialQuery = '', category = '') {
    if (typeof DorkService !== 'undefined') {
      await DorkService.init();
    }
    const domain = typeof DorkService !== 'undefined' ? DorkService.getScopeDomain() : 'example.com';
    const person = typeof DorkService !== 'undefined' ? DorkService.getPersonTarget() : 'John Doe';
    const handle = typeof DorkService !== 'undefined' ? DorkService.getHandleTarget() : 'johndoe';
    if (scopeInput) scopeInput.value = domain;
    if (personInput) personInput.value = person;
    if (handleInput) handleInput.value = handle;
    if (scopePill) scopePill.textContent = `SCOPE: ${domain} | TARGET: ${person}`;

    if (category && categoryTabs) {
      activeCategory = category;
      categoryTabs.querySelectorAll('.dork-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.cat === category);
      });
    }

    if (initialQuery) {
      if (queryInput) queryInput.value = initialQuery;
    } else if (queryInput && !queryInput.value) {
      queryInput.value = activeCategory === 'person' ? `"${person}" site:linkedin.com/in/` : `site:${domain}`;
    }

    renderOperators();
    renderTemplates();
    updateCompiledPreview();

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
    if (queryInput) queryInput.focus();
  };

  window.closeDorkBuilderModal = function () {
    modal.classList.remove('active');
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modal.style.display = 'none';
      }
    }, 200);
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeDorkBuilderModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeDorkBuilderModal();
  });

  // Attach to triggers with .open-dork-builder-trigger or href="#dorkui"
  document.querySelectorAll('.open-dork-builder-trigger, [href="#dorkui"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllDockPopovers();
      window.openDorkBuilderModal();
    });
  });

  // Attach to triggers with .open-person-osint-trigger or href="#person-osint"
  document.querySelectorAll('.open-person-osint-trigger, [href="#person-osint"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllDockPopovers();
      window.openDorkBuilderModal('', 'person');
    });
  });

  // Apply scope and target parameters
  async function applyScope() {
    if (typeof DorkService === 'undefined') return;
    const domain = scopeInput ? await DorkService.setScopeDomain(scopeInput.value) : DorkService.getScopeDomain();
    const person = personInput ? await DorkService.setPersonTarget(personInput.value) : DorkService.getPersonTarget();
    const handle = handleInput ? await DorkService.setHandleTarget(handleInput.value) : DorkService.getHandleTarget();
    if (scopeInput) scopeInput.value = domain;
    if (personInput) personInput.value = person;
    if (handleInput) handleInput.value = handle;
    if (scopePill) scopePill.textContent = `SCOPE: ${domain} | TARGET: ${person}`;
    updateCompiledPreview();
    renderTemplates();
    showToast(`Targets updated: ${person} (@${handle}) / ${domain}`);
  }

  if (saveScopeBtn) saveScopeBtn.addEventListener('click', applyScope);
  [scopeInput, personInput, handleInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyScope();
      });
    }
  });

  // Operators render
  function renderOperators() {
    if (!operatorChips || typeof DorkService === 'undefined') return;
    operatorChips.innerHTML = '';
    DorkService.OPERATORS.forEach(opObj => {
      const chip = document.createElement('button');
      chip.className = 'dork-operator-chip';
      chip.type = 'button';
      chip.title = opObj.title;
      chip.textContent = opObj.label;
      chip.addEventListener('click', () => {
        const cur = queryInput.value;
        const insertText = opObj.op === '""' ? '""' : opObj.op;
        if (queryInput.selectionStart || queryInput.selectionStart === 0) {
          const start = queryInput.selectionStart;
          const end = queryInput.selectionEnd;
          queryInput.value = cur.substring(0, start) + insertText + cur.substring(end);
          queryInput.selectionStart = queryInput.selectionEnd = start + insertText.length;
        } else {
          queryInput.value = cur ? `${cur} ${insertText}` : insertText;
        }
        queryInput.focus();
        updateCompiledPreview();
      });
      operatorChips.appendChild(chip);
    });
  }

  // Category filter tabs
  if (categoryTabs) {
    categoryTabs.querySelectorAll('.dork-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.querySelectorAll('.dork-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.cat || 'all';
        renderTemplates();
      });
    });
  }

  // Render templates grid
  function renderTemplates() {
    if (!templatesGrid || typeof DorkService === 'undefined') return;
    templatesGrid.innerHTML = '';

    // Render Evidence & Notes Workbench
    if (activeCategory === 'evidence') {
      const notes = DorkService.getInvestigationNotes();
      const person = DorkService.getPersonTarget();
      const handle = DorkService.getHandleTarget();
      const domain = DorkService.getScopeDomain();

      templatesGrid.innerHTML = `
        <div class="osint-evidence-panel">
          <div class="osint-launchers-section">
            <span class="dork-section-mini-title">VERIFIED OSINT RECON LAUNCHERS (1-CLICK SEARCH):</span>
            <div class="osint-tools-grid">
              ${DorkService.OSINT_TOOLS.map(t => {
        const param = t.category.includes('Username') || t.category.includes('Code') ? handle : (t.category.includes('Domain') || t.category.includes('Archive') ? domain : person);
        const targetUrl = t.getUrl(param);
        return `
                  <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noreferrer" class="osint-tool-card" title="${escapeHtml(t.desc)}">
                    <div class="osint-tool-top">
                      <span class="osint-tool-name">${escapeHtml(t.name)}</span>
                      <span class="osint-tool-cat">${escapeHtml(t.category)}</span>
                    </div>
                    <span class="osint-tool-desc">${escapeHtml(t.desc)}</span>
                    <span class="osint-tool-query">Target: ${escapeHtml(param)} ↗</span>
                  </a>
                `;
      }).join('')}
            </div>
          </div>

          <div class="osint-notes-section">
            <div class="osint-notes-header">
              <span class="dork-section-mini-title">SAVED QUERIES, INVESTIGATION FINDINGS &amp; EVIDENCE LOG:</span>
            </div>
            
            <form id="osint-note-add-form" class="osint-note-form">
              <div class="osint-form-row">
                <input type="text" id="osint-note-target" class="osint-form-input" placeholder="Target / Alias (e.g. ${escapeHtml(person)})" value="${escapeHtml(person)}" required>
                <input type="url" id="osint-note-url" class="osint-form-input" placeholder="Evidence Source URL (e.g. https://linkedin.com/in/...)">
                <select id="osint-note-status" class="osint-form-select">
                  <option value="unverified">Status: Unverified</option>
                  <option value="verified">Status: Confirmed / Verified</option>
                  <option value="disproved">Status: False Positive</option>
                </select>
              </div>
              <div class="osint-form-row">
                <textarea id="osint-note-text" class="osint-form-textarea" rows="2" placeholder="Investigation findings, alias links, public records observations, or email exposures..." required></textarea>
                <button type="submit" class="osint-note-save-btn">+ Save Evidence</button>
              </div>
            </form>

            <div class="osint-notes-list">
              ${notes.length === 0 ? `<div class="dork-empty-card" style="padding: 16px 0;">No investigation notes logged yet. Use the form above to record validated intelligence.</div>` : notes.map(n => `
                <div class="osint-note-item" data-id="${escapeHtml(n.id)}">
                  <div class="osint-note-meta">
                    <div class="osint-note-left">
                      <span class="osint-status-badge status-${escapeHtml(n.status)}">${escapeHtml(n.status.toUpperCase())}</span>
                      <strong class="osint-note-target-name">${escapeHtml(n.target)}</strong>
                      <span class="osint-note-date">${new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button class="osint-note-delete-btn" data-id="${escapeHtml(n.id)}" title="Delete note">&times;</button>
                  </div>
                  <p class="osint-note-content">${escapeHtml(n.note)}</p>
                  ${n.evidenceUrl ? `<a href="${escapeHtml(n.evidenceUrl)}" target="_blank" rel="noreferrer" class="osint-note-link">Source: ${escapeHtml(n.evidenceUrl)} ↗</a>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Wire note form submission
      const noteForm = templatesGrid.querySelector('#osint-note-add-form');
      if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const target = templatesGrid.querySelector('#osint-note-target').value;
          const evidenceUrl = templatesGrid.querySelector('#osint-note-url').value;
          const status = templatesGrid.querySelector('#osint-note-status').value;
          const noteText = templatesGrid.querySelector('#osint-note-text').value;
          if (!noteText.trim()) return;
          await DorkService.addInvestigationNote({ target, evidenceUrl, status, note: noteText });
          showToast('Investigation evidence logged');
          renderTemplates();
        });
      }

      // Wire note deletion
      templatesGrid.querySelectorAll('.osint-note-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          await DorkService.deleteInvestigationNote(id);
          showToast('Investigation note removed');
          renderTemplates();
        });
      });

      return;
    }

    const all = DorkService.getAllTemplates();
    const domain = DorkService.getScopeDomain();
    const person = DorkService.getPersonTarget();
    const handle = DorkService.getHandleTarget();
    const filtered = activeCategory === 'all'
      ? all
      : all.filter(t => t.category === activeCategory);

    if (filtered.length === 0) {
      templatesGrid.innerHTML = `<div class="dork-empty-card">No templates found in this category.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'dork-template-card';

      const isFav = DorkService.isFavorite(item.id);
      const compiled = DorkService.compileQuery(item.query, domain, person, handle);

      card.innerHTML = `
        <div class="dork-card-header">
          <div class="dork-card-title-row">
            <span class="dork-card-badge">${escapeHtml(item.categoryLabel || item.category)}</span>
            <span class="dork-card-title">${escapeHtml(item.title)}</span>
          </div>
          <button class="dork-fav-btn ${isFav ? 'active' : ''}" type="button" title="Favorite template">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        </div>
        <p class="dork-card-desc">${escapeHtml(item.desc)}</p>
        <code class="dork-card-query">${escapeHtml(compiled)}</code>
        <div class="dork-card-actions">
          <button class="dork-card-load-btn" type="button" title="Load into query builder">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Load into Builder</span>
          </button>
          <button class="dork-card-search-btn" type="button" title="Direct Google search">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Search ↗</span>
          </button>
        </div>
      `;

      // Load button
      card.querySelector('.dork-card-load-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        queryInput.value = compiled;
        updateCompiledPreview();
        queryInput.focus();
        showToast(`Loaded: ${item.title}`);
      });

      // Search button
      card.querySelector('.dork-card-search-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        DorkService.openGoogleDork(compiled, domain, person, handle);
      });

      // Favorite button
      card.querySelector('.dork-fav-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const active = await DorkService.toggleFavorite(item.id);
        const svg = e.currentTarget.querySelector('svg');
        e.currentTarget.classList.toggle('active', active);
        svg.setAttribute('fill', active ? 'currentColor' : 'none');
      });

      templatesGrid.appendChild(card);
    });
  }

  // Update compiled preview and sensitive check
  function updateCompiledPreview() {
    if (!queryInput || !compiledText || typeof DorkService === 'undefined') return;
    const domain = DorkService.getScopeDomain();
    const person = DorkService.getPersonTarget();
    const handle = DorkService.getHandleTarget();
    const raw = queryInput.value.trim();
    const compiled = DorkService.compileQuery(raw, domain, person, handle);
    compiledText.textContent = compiled || '(empty)';

    // Sensitivity check
    const isSens = DorkService.isSensitiveQuery(compiled);
    if (scopeNotice) {
      scopeNotice.style.display = isSens ? 'flex' : 'none';
    }
  }

if (queryInput) {
  queryInput.addEventListener('input', updateCompiledPreview);
}

// Copy Query button
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const text = compiledText.textContent;
    if (text && text !== '(empty)') {
      navigator.clipboard.writeText(text);
      showToast('Copied dork query to clipboard');
      copyBtn.querySelector('span').textContent = 'COPIED!';
      setTimeout(() => { copyBtn.querySelector('span').textContent = 'Copy Query'; }, 1200);
    }
  });
}

// Launch button
if (launchBtn) {
  launchBtn.addEventListener('click', () => {
    const text = compiledText.textContent;
    if (text && text !== '(empty)' && typeof DorkService !== 'undefined') {
      DorkService.openGoogleDork(text);
    }
  });
}

// Reset query
if (resetQueryBtn) {
  resetQueryBtn.addEventListener('click', () => {
    const domain = typeof DorkService !== 'undefined' ? DorkService.getScopeDomain() : 'example.com';
    queryInput.value = `site:${domain}`;
    updateCompiledPreview();
    queryInput.focus();
  });
}

// Save custom template
if (saveCustomBtn) {
  saveCustomBtn.addEventListener('click', async () => {
    const q = queryInput.value.trim();
    if (!q) {
      showToast('Please enter a query first');
      return;
    }
    const name = prompt('Enter a name for this custom Google Dork template:');
    if (!name || !name.trim()) return;

    const desc = prompt('Enter an optional description:') || 'User custom dork';
    await DorkService.saveCustomTemplate(name, q, 'custom', desc);
    showToast(`Saved template: ${name}`);
    renderTemplates();
  });
}

// Export JSON
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    if (typeof DorkService === 'undefined') return;
    const jsonStr = DorkService.exportTemplatesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-dorks-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported custom dork templates JSON');
  });
}

// Import JSON
if (importInput) {
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const count = await DorkService.importTemplatesJson(evt.target.result);
        showToast(`Imported ${count} dork templates`);
        renderTemplates();
      } catch (err) {
        showToast('Import failed: ' + (err.message || 'Invalid JSON'));
      }
      importInput.value = '';
    };
    reader.readAsText(file);
  });
}
}

/**
 * Comprehensive Console Keyboard Shortcuts Suite
 */
function setupKeyboardShortcuts() {
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const openShortcutsBtn = document.getElementById('open-shortcuts-btn');
  const closeShortcutsBtn = document.getElementById('close-shortcuts-btn');

  function openShortcuts() {
    if (!shortcutsModal) return;
    shortcutsModal.style.display = 'flex';
    requestAnimationFrame(() => shortcutsModal.classList.add('active'));
  }

  function closeShortcuts() {
    if (!shortcutsModal) return;
    shortcutsModal.classList.remove('active');
    setTimeout(() => {
      if (!shortcutsModal.classList.contains('active')) {
        shortcutsModal.style.display = 'none';
      }
    }, 200);
  }

  function toggleShortcuts() {
    if (shortcutsModal && shortcutsModal.classList.contains('active')) {
      closeShortcuts();
    } else {
      openShortcuts();
    }
  }

  if (openShortcutsBtn) openShortcutsBtn.addEventListener('click', openShortcuts);
  if (closeShortcutsBtn) closeShortcutsBtn.addEventListener('click', closeShortcuts);
  if (shortcutsModal) {
    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) closeShortcuts();
    });
  }

  // Theme Cycling Helper (Dark -> Midnight -> Light)
  async function cycleTheme() {
    const themes = ['dark', 'midnight', 'light'];
    const labels = { dark: 'Charcoal Glass', midnight: 'OLED Midnight', light: 'Frosted Light' };
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    applyTheme(next);
    await StorageService.set('theme', next);
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) themeSelect.value = next;
    showToast(`Theme: ${labels[next]}`);
  }

  window.addEventListener('keydown', (e) => {
    // 1. ESCAPE - Universal Dismiss & Clean Focus
    if (e.key === 'Escape') {
      const addModal = document.getElementById('add-widget-modal');
      const settingsModal = document.getElementById('settings-modal');
      const cmdPalette = document.getElementById('command-palette-modal');
      const ipPopover = document.getElementById('ip-popover-card');
      const todoPanel = document.getElementById('todo-panel');
      const searchHints = document.getElementById('search-hints');
      const searchInput = document.getElementById('main-search-input');
      const searchClear = document.getElementById('search-clear-btn');

      let closedAnything = false;

      const dorkModal = document.getElementById('dork-builder-modal');
      if (dorkModal && dorkModal.classList.contains('active')) {
        if (typeof window.closeDorkBuilderModal === 'function') {
          window.closeDorkBuilderModal();
        } else {
          dorkModal.classList.remove('active');
          dorkModal.style.display = 'none';
        }
        closedAnything = true;
      }
      if (shortcutsModal && shortcutsModal.classList.contains('active')) {
        closeShortcuts();
        closedAnything = true;
      }
      if (cmdPalette && cmdPalette.style.display === 'flex') {
        cmdPalette.style.display = 'none';
        cmdPalette.classList.remove('active');
        closedAnything = true;
      }
      if (ipPopover && ipPopover.style.display === 'flex') {
        ipPopover.style.display = 'none';
        closedAnything = true;
      }
      if (addModal && addModal.classList.contains('active')) {
        addModal.classList.remove('active');
        closedAnything = true;
      }
      if (settingsModal && settingsModal.classList.contains('active')) {
        settingsModal.classList.remove('active');
        closedAnything = true;
      }
      if (todoPanel && todoPanel.classList.contains('active')) {
        todoPanel.classList.remove('active');
        document.getElementById('todo-overlay')?.classList.remove('active');
        closedAnything = true;
      }
      closeAllDockPopovers();

      if (document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        const ghost = document.getElementById('main-search-ghost');
        if (ghost) ghost.value = '';
        if (searchHints) searchHints.style.display = 'none';
        if (searchClear) searchClear.style.display = 'none';
        closedAnything = true;
      }

      if (closedAnything) return;
    }

    // 2. Ignore modifier key combinations (Ctrl, Alt, Meta) except Shift+? for Help
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 3. Do not intercept if typing inside an interactive editable element
    const targetTag = (e.target && e.target.tagName) ? e.target.tagName : '';
    const isEditable = e.target && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag));
    if (isEditable) return;

    // Check if an interactive overlay modal is currently active
    const addModal = document.getElementById('add-widget-modal');
    const settingsModal = document.getElementById('settings-modal');
    const cmdPalette = document.getElementById('command-palette-modal');
    const dorkModal = document.getElementById('dork-builder-modal');
    const isModalActive = (shortcutsModal && shortcutsModal.classList.contains('active')) ||
      (dorkModal && dorkModal.classList.contains('active')) ||
      (addModal && addModal.classList.contains('active')) ||
      (settingsModal && settingsModal.classList.contains('active')) ||
      (cmdPalette && cmdPalette.style.display === 'flex');

    // Key '?' or 'h'/'H' -> Toggle Shortcuts HUD Modal
    if (e.key === '?' || (!isModalActive && (e.key === 'h' || e.key === 'H'))) {
      e.preventDefault();
      toggleShortcuts();
      return;
    }

    // Do not trigger actions if an overlay dialog is active
    if (isModalActive) return;

    const key = e.key.toLowerCase();

    // S or / -> Instant Search Focus
    if (key === 's' || e.key === '/') {
      e.preventDefault();
      const input = document.getElementById('main-search-input');
      if (input) {
        input.focus();
        input.select();
      }
      return;
    }

    // E -> Cycle Search Engine (Google, DDG, Torch, Ahmia, Brave, Startpage, DeepSeek)
    if (key === 'e') {
      e.preventDefault();
      if (typeof SearchService !== 'undefined' && SearchService.cycleEngine) {
        SearchService.cycleEngine();
      }
      return;
    }

    // K -> Quick Launch Command Palette
    if (key === 'k') {
      e.preventDefault();
      const modal = document.getElementById('command-palette-modal');
      const input = document.getElementById('command-palette-input');
      if (modal && input) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        input.value = '';
        setTimeout(() => input.focus(), 20);
      }
      return;
    }

    // T -> Toggle Tasks / To-Do Panel
    if (key === 't') {
      e.preventDefault();
      document.getElementById('toggle-todo-btn')?.click();
      return;
    }

    // O or Comma (,) -> Open Settings Panel
    if (key === 'o' || e.key === ',') {
      e.preventDefault();
      document.getElementById('open-settings-btn')?.click();
      return;
    }

    // B -> Shuffle Wallpaper from Unsplash
    if (key === 'b') {
      e.preventDefault();
      const shuffleBtn = document.getElementById('btn-shuffle-unsplash');
      if (shuffleBtn) {
        shuffleBtn.click();
        showToast('Shuffling background wallpaper...');
      }
      return;
    }

    // P -> Open Wallpaper Settings
    if (key === 'p') {
      e.preventDefault();
      document.getElementById('toggle-wallpaper-btn')?.click();
      return;
    }

    // W or A -> Open Add Widget Catalog
    if (key === 'w' || key === 'a') {
      e.preventDefault();
      document.getElementById('open-add-widget-btn')?.click();
      return;
    }

    // M or R -> Toggle Freeform Arrange Mode
    if (key === 'm' || key === 'r') {
      e.preventDefault();
      document.getElementById('toggle-arrange-grid-btn')?.click();
      return;
    }

    // D -> Cycle Theme (Charcoal Glass -> OLED Midnight -> Frosted Light)
    if (key === 'd') {
      e.preventDefault();
      cycleTheme();
      return;
    }

    // Q -> Next VAPT Principle / Security Quote
    if (key === 'q') {
      e.preventDefault();
      if (typeof QuotesWidget !== 'undefined' && QuotesWidget.nextQuote) {
        const quoteCard = document.querySelector('.widget-card[data-id="quotes"]') || document.querySelector('.widget-quotes');
        QuotesWidget.nextQuote(quoteCard);
        showToast('Next security principle');
      }
      return;
    }

    // C -> Copy Current Security Principle to Clipboard
    if (key === 'c') {
      e.preventDefault();
      if (typeof QuotesWidget !== 'undefined' && QuotesWidget.copyCurrentQuote) {
        const quoteCard = document.querySelector('.widget-card[data-id="quotes"]') || document.querySelector('.widget-quotes');
        QuotesWidget.copyCurrentQuote(quoteCard);
        showToast('Copied security principle to clipboard');
      }
      return;
    }

    // I -> Toggle Network & IP Leak Inspector
    if (key === 'i') {
      e.preventDefault();
      document.getElementById('ip-leak-indicator')?.click();
      return;
    }

    // Number keys 1-6 -> Open Bottom Dock Popover Flyouts
    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const wrappers = document.querySelectorAll('.dock-item-wrapper');
      if (wrappers[idx]) {
        e.preventDefault();
        const btn = wrappers[idx].querySelector('.dock-item');
        if (btn) btn.click();
      }
      return;
    }
  });
}

/**
 * HTML Escaping helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
