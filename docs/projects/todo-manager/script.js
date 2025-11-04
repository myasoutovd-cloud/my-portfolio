// ====== CONSTANTS ======
const STORAGE_KEY = 'todo_items_v1';
const FILTER_KEY = 'todo_filter_v1';

// ====== ELEMENTS ======
const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const listEl = document.getElementById('todoList');
const counterEl = document.getElementById('counter');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = Array.from(document.querySelectorAll('.filters .chip'));

// ====== STATE ======
let items = loadItems();
let currentFilter = loadFilter();
setActiveFilterButton(currentFilter);

// ====== INIT ======
render();

// ====== EVENTS ======
form.addEventListener('submit', e => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    const newItem = {
        id: Date.now(),
        text,
        done: false,
        createdAt: Date.now()
    };

    items.unshift(newItem);
    saveItems();
    input.value = '';
    render();
});

listEl.addEventListener('click', e => {
    const li = e.target.closest('li.item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.classList.contains('check')) {
        toggleDone(id);
    }

    if (e.target.classList.contains('del-btn')) {
        removeItem(id);
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        saveFilter();
        setActiveFilterButton(currentFilter);
        render();
    });
});

clearCompletedBtn.addEventListener('click', () => {
    const hadCompleted = items.some(i => i.done);
    if (!hadCompleted) return;
    items = items.filter(i => !i.done);
    saveItems();
    render();
});

// ====== ACTIONS ======
function toggleDone(id) {
    items = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    saveItems();
    render();
}

function removeItem(id) {
    items = items.filter(i => i.id !== id);
    saveItems();
    render();
}

// ====== RENDER ======
function render() {
    const filtered = applyFilter(items, currentFilter);
    listEl.innerHTML = '';

    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'Задач нет — добавьте первую!';
        listEl.appendChild(empty);
    } else {
        const frag = document.createDocumentFragment();
        filtered.forEach(item => frag.appendChild(renderItem(item)));
        listEl.appendChild(frag);
    }

    const remaining = items.filter(i => !i.done).length;
    counterEl.textContent = `${remaining} активных`;
}

function renderItem(item) {
    const li = document.createElement('li');
    li.className = 'item';
    li.dataset.id = item.id;
    li.innerHTML = `
    <input type="checkbox" class="check" ${item.done ? 'checked' : ''} aria-label="Готово">
    <div class="text ${item.done ? 'done' : ''}">${escapeHtml(item.text)}</div>
    <div class="actions">
      <button class="icon-btn del-btn" title="Удалить" aria-label="Удалить">🗑</button>
    </div>
  `;
    return li;
}

// ====== HELPERS ======
function applyFilter(arr, filter) {
    if (filter === 'active') return arr.filter(i => !i.done);
    if (filter === 'completed') return arr.filter(i => i.done);
    return arr;
}

function setActiveFilterButton(filter) {
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
}

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFilter() {
    localStorage.setItem(FILTER_KEY, currentFilter);
}

function loadFilter() {
    return localStorage.getItem(FILTER_KEY) || 'all';
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}