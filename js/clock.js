/**
 * Clock Widget Logic
 * Displays HH:MM with AM/PM indicator, updates each second, respects 12/24h setting.
 */
const ClockWidget = (() => {
  let format = '12'; // '12' or '24'
  let timerId = null;

  function init(containerElement, clockFormat = '12') {
    format = clockFormat;
    updateDisplay(containerElement);

    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      updateDisplay(containerElement);
    }, 1000);
  }

  function setFormat(newFormat, containerElement) {
    format = newFormat;
    if (containerElement) {
      updateDisplay(containerElement);
    }
  }

  function updateDisplay(container) {
    if (!container) return;

    const timeEl = container.querySelector('.clock-digits');
    const ampmEl = container.querySelector('.clock-ampm');
    const secondsEl = container.querySelector('.clock-seconds');

    if (!timeEl) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (format === '12') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
    }

    const formattedHours = String(hours).padStart(2, '0');

    // Update text content with zero layout shifts
    timeEl.textContent = `${formattedHours}:${minutes}`;

    if (ampmEl) {
      if (format === '12') {
        ampmEl.textContent = ampm;
        ampmEl.style.display = 'inline-block';
      } else {
        ampmEl.textContent = 'HRS';
        ampmEl.style.display = 'inline-block';
      }
    }

    if (secondsEl) {
      secondsEl.textContent = `:${seconds}`;
    }
  }

  function destroy() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return {
    init,
    setFormat,
    destroy
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockWidget;
}
