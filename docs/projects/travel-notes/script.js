document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const countrySelect = document.getElementById('country');
    const dateInput = document.getElementById('date');
    const messageInput = document.getElementById('message');
    const entryForm = document.getElementById('entryForm');
    const postsContainer = document.getElementById('postsContainer');

    let posts = [];
    let countries = [];


    const loadCountries = () => {
        try {
            loader.style.display = 'block';
            request({
                url: `https://restcountries.com/v3.1/all?fields=name,flags`,
                success: data => {
                    countries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
                    countries.forEach(c => {
                        const option = document.createElement('option');
                        option.value = c.name.common;
                        option.textContent = c.name.common;
                        countrySelect.append(option);
                    });
                },
                error: err => alert('Ошибка при загрузке стран: ' + err)
            });
        } catch (err) {
            console.log(err)
        } finally {
            loader.style.display = 'none';
        }
    };


    const savePosts = () => localStorage.setItem('travelDiary', JSON.stringify(posts));

    const renderPosts = () => {
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="empty">No entries yet...</p>';
            return;
        }

        posts.forEach((post, index) => {
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
                ${post.flag ? `<img class="post-flag" src="${post.flag}" alt="${post.country} flag">` : ''}
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
            body.innerHTML = `<p>${post.message}</p>`;

            postEl.append(header, body);
            postsContainer.append(postEl);

            removeBtn.addEventListener('click', () => deletePost(post.id, post.date));

            editBtn.addEventListener('click', () => {
                const originalText = post.message;
                body.innerHTML = `
                <textarea class="edit-area">${originalText}</textarea>
                <div class="edit-controls">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;

                const textarea = body.querySelector('.edit-area');
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
                    body.innerHTML = `<p>${originalText}</p>`;
                });
            });
        });
    };


    const loadPosts = () => {
        try {
            const saved = localStorage.getItem('travelDiary');
            if (saved) {
                posts = JSON.parse(saved);
                renderPosts();
            }
        } catch (error) {
            alert('Ошибка при загрузке записей: ' + error.message);
            posts = [];
            localStorage.removeItem('travelDiary');
        }
    };


    const deletePost = (id, date) => {
        const confirmDelete = confirm(`Удалить запись от ${date}?`);
        if (!confirmDelete) return;

        posts = posts.filter(post => post.id !== id);
        savePosts();
        renderPosts();
    };


    entryForm.addEventListener('submit', e => {
        e.preventDefault();

        try {
            const country = countrySelect.value;
            const date = dateInput.value;
            const message = messageInput.value;

            if (!country || !date || !message) {
                alert('Пожалуйста, заполните все поля');
                return;
            }

            const found = countries.find(c => c.name.common === country);
            const flag = found ?.flags ?.png || '';

            const newPost = {
                id: Date.now(),
                country,
                date,
                message,
                flag
            };

            posts.push(newPost);
            savePosts();
            renderPosts();
            entryForm.reset();

        } catch (error) {
            alert('Ошибка при добавлении записи: ' + error.message);
        }
    });

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