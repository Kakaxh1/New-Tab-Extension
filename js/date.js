/**
 * Date Widget Logic
 * Displays MON / 5 / OCT stacked clean typography, updates periodically/at midnight.
 */
const DateWidget = (() => {
  let timerId = null;

  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function init(containerElement) {
    updateDisplay(containerElement);

    if (timerId) clearInterval(timerId);
    // Update every minute to catch date change seamlessly
    timerId = setInterval(() => {
      updateDisplay(containerElement);
    }, 60000);
  }

  function updateDisplay(container) {
    if (!container) return;

    const dayNameEl = container.querySelector('.date-dayname');
    const dayNumEl = container.querySelector('.date-daynum');
    const monthEl = container.querySelector('.date-month');
    const yearEl = container.querySelector('.date-year');

    const now = new Date();
    const dayName = DAYS[now.getDay()];
    const dayNum = now.getDate();
    const month = MONTHS[now.getMonth()];
    const year = now.getFullYear();

    if (dayNameEl) dayNameEl.textContent = dayName;
    if (dayNumEl) dayNumEl.textContent = dayNum;
    if (monthEl) monthEl.textContent = month;
    if (yearEl) yearEl.textContent = year;
  }

  function destroy() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  return {
    init,
    updateDisplay,
    destroy
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateWidget;
}
