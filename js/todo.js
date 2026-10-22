4444/**
 * To-Do List Right Side Panel Controller
 * Handles task creation, completion toggle, deletion, filtering, and persistence.
 */
const TodoManager = (() => {
  let todos = [];
  let currentFilter = 'all'; // 'all', 'active', 'completed'

  let panelEl = null;
  let overlayEl = null;
  let listEl = null;
  let inputEl = null;
  let addBtn = null;
  let counterEl = null;
  let emptyStateEl = null;

  async function init() {
    panelEl = document.getElementById('todo-panel');
    overlayEl = document.getElementById('todo-panel-overlay');
    listEl = document.getElementById('todo-list');
    inputEl = document.getElementById('todo-input');
    addBtn = document.getElementById('todo-add-btn');
    counterEl = document.getElementById('todo-counter');
    emptyStateEl = document.getElementById('todo-empty-state');

    const toggleBtn = document.getElementById('toggle-todo-btn');
    const closeBtn = document.getElementById('close-todo-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-todo-btn');

    // Load saved todos
    todos = await StorageService.get('todoList', StorageService.DEFAULTS.todoList);

    // Bind panel open/close
    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePanel);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }

    if (overlayEl) {
      overlayEl.addEventListener('click', closePanel);
    }

    // Add task events
    if (addBtn) {
      addBtn.addEventListener('click', handleAddTask);
    }

    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddTask();
        }
      });
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        render();
      });
    });

    // Clear completed
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', async () => {
        todos = todos.filter(t => !t.completed);
        await saveTodos();
        render();
      });
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelEl && panelEl.classList.contains('active')) {
        closePanel();
      }
    });

    // Listen for changes from embedded widgets or other panels
    window.addEventListener('vapt-todo-change', async (e) => {
      if (e.detail && e.detail.source !== 'panel') {
        todos = e.detail.todos || await StorageService.get('todoList', StorageService.DEFAULTS.todoList);
        render();
      }
    });

    render();
  }

  function togglePanel() {
    if (!panelEl) return;
    const isActive = panelEl.classList.contains('active');
    if (isActive) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    if (!panelEl) return;
    panelEl.classList.add('active');
    panelEl.setAttribute('aria-hidden', 'false');
    if (overlayEl) overlayEl.classList.add('active');
    if (inputEl) {
      setTimeout(() => inputEl.focus(), 150);
    }
  }

  function closePanel() {
    if (!panelEl) return;
    panelEl.classList.remove('active');
    panelEl.setAttribute('aria-hidden', 'true');
    if (overlayEl) overlayEl.classList.remove('active');
  }

  async function handleAddTask() {
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      text,
      completed: false
    };

    todos.unshift(newTask);
    inputEl.value = '';
    await saveTodos();
    render();
  }

  async function toggleTask(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    await saveTodos();
    render();
  }

  async function deleteTask(id) {
    todos = todos.filter(t => t.id !== id);
    await saveTodos();
    render();
  }

  async function saveTodos(fromSource = 'panel') {
    await StorageService.set('todoList', todos);
    window.dispatchEvent(new CustomEvent('vapt-todo-change', { detail: { todos, source: fromSource } }));
  }

  function render() {
    if (!listEl) return;
    listEl.innerHTML = '';

    const filtered = todos.filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    // Update Counter
    if (counterEl) {
      const completedCount = todos.filter(t => t.completed).length;
      counterEl.textContent = `${completedCount}/${todos.length}`;
    }

    if (emptyStateEl) {
      emptyStateEl.style.display = filtered.length === 0 ? 'block' : 'none';
    }

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;

      // Custom Checkbox
      const checkBtn = document.createElement('button');
      checkBtn.className = 'todo-check-btn';
      checkBtn.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
      if (task.completed) {
        checkBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }
      checkBtn.addEventListener('click', () => toggleTask(task.id));

      // Task Text (textContent ensures XSS safety)
      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = task.text;
      textSpan.addEventListener('click', () => toggleTask(task.id));

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'todo-delete-btn';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      li.appendChild(checkBtn);
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      listEl.appendChild(li);
    });
  }

  return {
    init,
    openPanel,
    closePanel,
    togglePanel,
    render,
    getTodos: () => [...todos]
  };
})();

// Export or initialize
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoManager;
}
