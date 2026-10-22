/**
 * Security Quotes System for VAPT & Red Team Principles
 * Includes curated principles, smooth fade transitions, click-to-cycle, and category filtering.
 */
const QuotesWidget = (() => {
  const QUOTES = [
    {
      text: "A hidden endpoint is not an access control.",
      author: "VAPT PRINCIPLE",
      category: "auth"
    },
    {
      text: "A valid request can still be an invalid action.",
      author: "VAPT PRINCIPLE",
      category: "logic"
    },
    {
      text: "The interesting bugs usually live between two features that work perfectly on their own.",
      author: "VAPT PRINCIPLE",
      category: "logic"
    },
    {
      text: "Authentication proves who you are. Authorization decides what you are allowed to access.",
      author: "VAPT PRINCIPLE",
      category: "auth"
    },
    {
      text: "Enumeration turns assumptions into attack surface.",
      author: "VAPT PRINCIPLE",
      category: "recon"
    },
    {
      text: "Every implicit trust relationship is an attack path waiting for enumeration.",
      author: "VAPT PRINCIPLE",
      category: "recon"
    },
    {
      text: "The best payload is useless when you do not understand the application first.",
      author: "VAPT PRINCIPLE",
      category: "recon"
    },
    {
      text: "Security testing is not finding bugs. It is proving what an attacker can chain together.",
      author: "VAPT PRINCIPLE",
      category: "exploit"
    },
    {
      text: "Client-side validation is a UX feature, never a security boundary.",
      author: "VAPT PRINCIPLE",
      category: "auth"
    },
    {
      text: "Complex systems fail in complex ways; the vulnerability is often the gap between architectural assumptions.",
      author: "VAPT PRINCIPLE",
      category: "logic"
    },
    {
      text: "If you don't map the state machine, you can't break the business logic.",
      author: "VAPT PRINCIPLE",
      category: "logic"
    },
    {
      text: "Defense in depth only works if the layers do not share the same single point of failure.",
      author: "VAPT PRINCIPLE",
      category: "architecture"
    }
  ];

  let currentIndex = 0;
  let activeCategory = 'all';

  function getFilteredQuotes() {
    if (activeCategory === 'all') return QUOTES;
    return QUOTES.filter(q => q.category === activeCategory);
  }

  function init(containerElement, initialCategory = 'all') {
    activeCategory = initialCategory;
    const pool = getFilteredQuotes();
    // Randomize initial quote
    currentIndex = Math.floor(Math.random() * pool.length);
    renderQuote(containerElement, false);

    // Event listener on quote container for click-to-cycle
    if (containerElement) {
      containerElement.addEventListener('click', (e) => {
        // Prevent click if clicking specific interactive buttons like copy
        if (e.target.closest('.quote-copy-btn')) return;
        nextQuote(containerElement);
      });
    }
  }

  function setCategory(category, containerElement) {
    activeCategory = category;
    currentIndex = 0;
    renderQuote(containerElement, true);
  }

  function nextQuote(containerElement) {
    const pool = getFilteredQuotes();
    if (pool.length === 0) return;
    currentIndex = (currentIndex + 1) % pool.length;
    renderQuote(containerElement, true);
  }

  function renderQuote(container, animate = true) {
    if (!container) return;

    const textEl = container.querySelector('.quote-text');
    const authorEl = container.querySelector('.quote-author');
    const pool = getFilteredQuotes();
    const current = pool[currentIndex] || pool[0];

    if (!current) return;

    if (animate && textEl) {
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(4px)';
      if (authorEl) authorEl.style.opacity = '0';

      setTimeout(() => {
        textEl.textContent = `"${current.text}"`;
        if (authorEl) authorEl.textContent = `— ${current.author}`;

        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
        if (authorEl) authorEl.style.opacity = '1';
      }, 180);
    } else {
      if (textEl) {
        textEl.textContent = `"${current.text}"`;
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
      }
      if (authorEl) {
        authorEl.textContent = `— ${current.author}`;
        authorEl.style.opacity = '1';
      }
    }
  }

  function copyCurrentQuote(containerElement) {
    const pool = getFilteredQuotes();
    const current = pool[currentIndex] || pool[0];
    if (current && navigator.clipboard) {
      const fullText = `"${current.text}" — ${current.author}`;
      navigator.clipboard.writeText(fullText);
      return true;
    }
    return false;
  }

  return {
    QUOTES,
    init,
    nextQuote,
    setCategory,
    copyCurrentQuote
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuotesWidget;
}
