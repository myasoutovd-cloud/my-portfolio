document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const countrySelect = document.getElementById('country');
    const dateInput = document.getElementById('date');
    const messageInput = document.getElementById('message');
    const entryForm = document.getElementById('entryForm');
    const postsContainer = document.getElementById('postsContainer');
    const searchInput = document.getElementById('searchInput');
    const filterCountrySelect = document.getElementById('filterCountry');

    let posts = [];
    let countries = [];
    let activeModalOverlay = null; // Замок для предотвращения дублирования модалок

    // Кастомный диалог подтверждения (Promise-based) с защитой от багов
    const customConfirm = (title, message) => {
        return new Promise((resolve) => {
            // Если окно уже открыто — игнорируем повторный вызов
            if (activeModalOverlay) {
                return;
            }

            const overlay = document.createElement('div');
            overlay.classList.add('modal-overlay');
            activeModalOverlay = overlay;

            overlay.innerHTML = `
                <div class="modal-card">
                    <h3 class="modal-title">${title}</h3>
                    <p class="modal-text">${message}</p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" id="modalCancel">Отмена</button>
                        <button class="modal-btn modal-btn-confirm" id="modalConfirm">Удалить</button>
                    </div>
                </div>
            `;

            document.body.append(overlay);

            const confirmBtn = overlay.querySelector('#modalConfirm');
            const cancelBtn = overlay.querySelector('#modalCancel');

            // Фокусируемся на кнопке отмены, чтобы случайный Enter не удалял запись
            confirmBtn.focus();

            requestAnimationFrame(() => overlay.classList.add('active'));

            let isClosed = false;

            const close = (result) => {
                if (isClosed) return;
                isClosed = true;

                confirmBtn.disabled = true;
                cancelBtn.disabled = true;

                document.removeEventListener('keydown', handleKeyDown);
                overlay.classList.remove('active');

                setTimeout(() => {
                    overlay.remove();
                    activeModalOverlay = null; // Освобождаем замок
                    resolve(result);
                }, 250);
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    close(false);
                }
            };

            confirmBtn.addEventListener('click', () => close(true));
            cancelBtn.addEventListener('click', () => close(false));
            document.addEventListener('keydown', handleKeyDown);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
        });
    };

    // Универсальный request на базе fetch
    const request = async (config) => {
        try {
            const response = await fetch(config.url, {
                method: config.method || 'GET'
            });

            if (!response.ok) {
                throw new Error(response.status);
            }

            const data = await response.json();
            config.success(data);
        } catch (err) {
            config.error(err.message || 'Connection error');
        }
    };

    // Загрузка стран
    const loadCountries = () => {
        if (loader) loader.style.display = 'block';

        request({
            url: 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json',
            success: data => {
                countries = data
                    .filter(c => c.iso2 && c.iso2.length === 2)
                    .map(c => {
                        const code = c.iso2.toLowerCase();
                        return {
                            name: { common: c.name },
                            flags: {
                                png: `https://flagcdn.com/w320/${code}.png`,
                                svg: `https://flagcdn.com/${code}.svg`
                            }
                        };
                    })
                    .sort((a, b) => a.name.common.localeCompare(b.name.common));

                countrySelect.innerHTML = '<option value="" disabled selected>Select a country...</option>';

                const fragment = document.createDocumentFragment();
                countries.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.name.common;
                    option.textContent = c.name.common;
                    fragment.append(option);
                });
                countrySelect.append(fragment);

                if (loader) loader.style.display = 'none';
            },
            error: err => {
                alert('Ошибка при загрузке стран: ' + err);
                if (loader) loader.style.display = 'none';
            }
        });
    };

    const savePosts = () => localStorage.setItem('travelDiary', JSON.stringify(posts));

    // Функция обновления списка стран в селекте фильтра
    const updateCountryFilter = () => {
        if (!filterCountrySelect) return;

        const currentSelection = filterCountrySelect.value;
        const uniqueCountries = [...new Set(posts.map(p => p.country))].sort();

        filterCountrySelect.innerHTML = '<option value="all">All Countries</option>';
        uniqueCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            filterCountrySelect.append(option);
        });

        if (uniqueCountries.includes(currentSelection)) {
            filterCountrySelect.value = currentSelection;
        } else {
            filterCountrySelect.value = 'all';
        }
    };

    // Отрисовка постов с учётом поиска и фильтрации
    const renderPosts = () => {
        postsContainer.innerHTML = '';

        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCountry = filterCountrySelect ? filterCountrySelect.value : 'all';

        const filteredPosts = posts.filter(post => {
            const matchesSearch = post.message.toLowerCase().includes(searchQuery);
            const matchesCountry = selectedCountry === 'all' || post.country === selectedCountry;
            return matchesSearch && matchesCountry;
        });

        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '<p class="empty">No matching entries found...</p>';
            return;
        }

        filteredPosts.forEach((post, index) => {
            const postEl = document.createElement('div');
            postEl.classList.add('post');
            postEl.dataset.id = post.id;

            const header = document.createElement('div');
            header.classList.add('post-header');

            const meta = document.createElement('div');
            meta.classList.add('post-meta');
            meta.innerHTML = `
                <span class="post-number">Post #${index + 1}</span>
                <span class="post-date">at <b>${post.date}</b></span>
                <span class="post-country">
                    being in: <b>${post.country}</b>
                    ${post.flag ? `<img class="post-flag" src="${post.flag}" alt="${post.country} flag" onerror="this.style.display='none'">` : ''}
                </span>
            `;

            const actions = document.createElement('div');
            actions.classList.add('post-actions');

            const editBtn = document.createElement('button');
            editBtn.classList.add('post-edit');
            editBtn.textContent = '✎ Edit';

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('post-remove');
            removeBtn.textContent = '✖ Remove';

            actions.append(editBtn, removeBtn);
            header.append(meta, actions);

            const body = document.createElement('div');
            body.classList.add('post-body');
            const p = document.createElement('p');
            p.textContent = post.message;
            body.append(p);

            postEl.append(header, body);
            postsContainer.append(postEl);

            removeBtn.addEventListener('click', () => deletePost(post.id, post.date));

            editBtn.addEventListener('click', () => {
                const originalText = post.message;
                body.innerHTML = `
                    <textarea class="edit-area"></textarea>
                    <div class="edit-controls">
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    </div>
                `;

                const textarea = body.querySelector('.edit-area');
                textarea.value = originalText;

                const saveBtn = body.querySelector('.save-btn');
                const cancelBtn = body.querySelector('.cancel-btn');

                saveBtn.addEventListener('click', () => {
                    const newText = textarea.value.trim();
                    if (!newText) {
                        alert('Текст не может быть пустым');
                        return;
                    }

                    post.message = newText;
                    savePosts();
                    renderPosts();
                });

                cancelBtn.addEventListener('click', () => {
                    body.innerHTML = '';
                    const resetP = document.createElement('p');
                    resetP.textContent = originalText;
                    body.append(resetP);
                });
            });
        });
    };

    const loadPosts = () => {
        try {
            const saved = localStorage.getItem('travelDiary');
            if (saved) {
                posts = JSON.parse(saved);
                updateCountryFilter();
                renderPosts();
            }
        } catch (error) {
            alert('Ошибка при загрузке записей: ' + error.message);
            posts = [];
            localStorage.removeItem('travelDiary');
        }
    };

    const deletePost = async (id, date) => {
        const confirmed = await customConfirm('Удаление записи', `Вы действительно хотите удалить запись от ${date}?`);
        if (!confirmed) return;

        posts = posts.filter(post => post.id !== id);
        savePosts();
        updateCountryFilter();
        renderPosts();
    };

    entryForm.addEventListener('submit', e => {
        e.preventDefault();

        try {
            const country = countrySelect.value;
            const date = dateInput.value;
            const message = messageInput.value.trim();

            if (!country || !date || !message) {
                alert('Пожалуйста, заполните все поля');
                return;
            }

            const found = countries.find(c => c.name.common === country);
            const flag = found?.flags?.svg || found?.flags?.png || '';

            const newPost = {
                id: Date.now(),
                country,
                date,
                message,
                flag
            };

            posts.push(newPost);
            savePosts();
            updateCountryFilter();
            renderPosts();
            entryForm.reset();

        } catch (error) {
            alert('Ошибка при добавлении записи: ' + error.message);
        }
    });

    if (searchInput) searchInput.addEventListener('input', renderPosts);
    if (filterCountrySelect) filterCountrySelect.addEventListener('change', renderPosts);

    loadCountries();
    loadPosts();

    flatpickr(dateInput, {
        dateFormat: "d-m-Y",
        altInput: true,
        altFormat: "d.m.Y",
        maxDate: "today",
        locale: "ru"
    });
});