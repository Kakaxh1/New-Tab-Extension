/**
 * CyberTab Icon Animation Engine & Controller
 * Powers GPU-accelerated SVG micro-interactions and Lottie animation integration.
 * Strictly ZERO emojis - Pure vector graphics & keyframes.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.IconAnimator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CHECKMARK_SVG = `
    <svg class="icon-draw-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  const IconAnimator = {
    /**
     * Trigger smooth 360-degree spin on an element or its child SVG
     */
    spin: function (el, duration = 650) {
      if (!el) return;
      const target = el.tagName === 'svg' ? el : (el.querySelector('svg') || el);
      target.classList.remove('icon-spin');
      // Trigger reflow to restart animation
      void target.offsetWidth;
      target.classList.add('icon-spin');
      setTimeout(() => {
        target.classList.remove('icon-spin');
      }, duration);
    },

    /**
     * Trigger elastic spring pop on an element
     */
    pop: function (el, duration = 450) {
      if (!el) return;
      const target = el.tagName === 'svg' ? el : (el.querySelector('svg') || el);
      target.classList.remove('icon-pop');
      void target.offsetWidth;
      target.classList.add('icon-pop');
      setTimeout(() => {
        target.classList.remove('icon-pop');
      }, duration);
    },

    /**
     * Trigger 3D perspective flip
     */
    flip: function (el, duration = 700) {
      if (!el) return;
      const target = el.tagName === 'svg' ? el : (el.querySelector('svg') || el);
      target.classList.remove('icon-flip');
      void target.offsetWidth;
      target.classList.add('icon-flip');
      setTimeout(() => {
        target.classList.remove('icon-flip');
      }, duration);
    },

    /**
     * Trigger temporary pulse
     */
    pulse: function (el, duration = 1200) {
      if (!el) return;
      const target = el.tagName === 'svg' ? el : (el.querySelector('svg') || el);
      target.classList.add('icon-pulse');
      setTimeout(() => {
        target.classList.remove('icon-pulse');
      }, duration);
    },

    /**
     * Morph button icon to a drawn checkmark with spring feedback, then restore original
     */
    morphSuccess: function (btn, duration = 1400) {
      if (!btn) return;
      const originalHtml = btn.innerHTML;
      const hasSvg = !!btn.querySelector('svg');
      btn.classList.add('icon-pop');

      if (hasSvg) {
        let morphed = btn.innerHTML.replace(/<svg[\s\S]*?<\/svg>/, CHECKMARK_SVG.trim());
        if (morphed.includes('Copy')) {
          morphed = morphed.replace(/Copy/g, 'Copied');
        }
        btn.innerHTML = morphed;
      } else {
        const text = btn.textContent.trim().toLowerCase() === 'copy' ? 'Copied' : (btn.textContent || 'Done');
        btn.innerHTML = CHECKMARK_SVG.trim() + ' <span>' + text + '</span>';
      }

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('icon-pop');
      }, duration);
    },

    /**
     * Initialize a Lottie vector animation inside a container
     */
    loadLottie: function (container, animationDataOrPath, options = {}) {
      if (!window.lottie) {
        console.warn('Lottie library not loaded. Falling back to SVG.');
        return null;
      }
      if (!container) return null;

      const isData = typeof animationDataOrPath === 'object';
      const animConfig = {
        container: container,
        renderer: options.renderer || 'svg',
        loop: options.loop !== undefined ? options.loop : false,
        autoplay: options.autoplay !== undefined ? options.autoplay : false,
        animationData: isData ? animationDataOrPath : undefined,
        path: !isData ? animationDataOrPath : undefined
      };

      const anim = window.lottie.loadAnimation(animConfig);

      // Interactive hover trigger if requested
      if (options.trigger === 'hover') {
        container.addEventListener('mouseenter', () => anim.play());
        container.addEventListener('mouseleave', () => anim.stop());
      } else if (options.trigger === 'click') {
        container.addEventListener('click', () => {
          anim.goToAndPlay(0, true);
        });
      }

      return anim;
    },

    /**
     * Auto-bind micro-interactions across existing dashboard elements
     */
    autoBind: function () {
      // 1. Settings buttons -> mechanical gear rotation
      document.querySelectorAll('#open-settings-btn, #lan-cfg-btn, .btn-gear').forEach(btn => {
        btn.setAttribute('data-icon-anim', 'gear');
      });

      // 2. Sync and refresh buttons -> elastic spin
      document.querySelectorAll('#lan-sync-btn, #lan-popup-sync-btn, .btn-sync').forEach(btn => {
        btn.setAttribute('data-icon-anim', 'spin');
        btn.addEventListener('click', () => IconAnimator.spin(btn, 700));
      });

      // 3. Wallpaper shuffle buttons -> 3D flip
      document.querySelectorAll('#btn-shuffle-unsplash, #toggle-wallpaper-btn, .btn-shuffle').forEach(btn => {
        btn.setAttribute('data-icon-anim', 'flip');
        btn.addEventListener('click', () => IconAnimator.flip(btn, 700));
      });

      // 4. Copy buttons -> morph to checkmark & elastic pop
      document.querySelectorAll('#lan-copy-btn, #lan-popup-copy-btn, .btn-copy').forEach(btn => {
        btn.addEventListener('click', () => IconAnimator.pop(btn));
      });

      // 5. Radar / Telemetry indicators -> pulse
      document.querySelectorAll('#network-telemetry-pill, #lan-dot, #lan-popup-dot').forEach(el => {
        el.addEventListener('mouseenter', () => IconAnimator.pulse(el, 1500));
      });
    }
  };

  // Run autoBind on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IconAnimator.autoBind());
  } else {
    IconAnimator.autoBind();
  }

  return IconAnimator;
}));
