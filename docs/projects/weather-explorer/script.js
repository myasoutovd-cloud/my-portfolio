
const GEOCODE  = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=ru&name=';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';


const cityInput  = document.getElementById('city');
const unitsSel   = document.getElementById('units');
const btn        = document.getElementById('searchBtn');

const loader     = document.getElementById('loader');
const errorBox   = document.getElementById('error');

const currentBox = document.getElementById('current');
const hourlyBox  = document.getElementById('hourly');
const dailyBox   = document.getElementById('daily');


const toggleLoader = (flag) => { loader.classList.toggle('show', !!flag); };
const show = (node, flag) => { node.hidden = !flag; };
const parseMaybeJSON = (x) => { try { return (typeof x === 'string') ? JSON.parse(x) : x; } catch { return null; } };
const toHour = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:00`; };
const toDay = (iso) => { const d = new Date(iso); const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']; return `${days[d.getDay()]} ${d.getDate()}`; };
const toHumanTime = (iso) => { const d = new Date(iso); return d.toLocaleString(); };
const icon = (code) => {
    if (code === 0) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅️';
    if ([45, 48].includes(code)) return '🌫';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌦';
    if ([61, 63, 65].includes(code)) return '🌧';
    if ([66, 67].includes(code)) return '🌧❄️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈';
    return '🌡';
};
const escapeHtml = (s) => String(s).replace(/[&<>\"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// ========= STATE =========
let debounceId = null;

// ========= CORE FLOW (ОБЪЯВЛЯЕМ СНАЧАЛА!) =========
const loadWeather = () => {
    const query = cityInput.value.trim();
    if (!query) return;

    toggleLoader(true);
    show(errorBox, false);
    currentBox.hidden = true;
    hourlyBox.innerHTML = '';
    dailyBox.innerHTML = '';

    // 1) Геокодинг
    requestPromise({ url: GEOCODE + encodeURIComponent(query), method: 'GET' })
        .then((raw) => {
            const data = parseMaybeJSON(raw);
            if (!data || !data.results || !data.results.length) throw new Error('not_found');

            const place = data.results[0];

            // 2) Прогноз
            const params = new URLSearchParams({
                latitude: String(place.latitude),
                longitude: String(place.longitude),
                current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
                hourly: 'temperature_2m,weather_code',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                timezone: 'auto',
                temperature_unit: unitsSel.value === 'fahrenheit' ? 'fahrenheit' : 'celsius',
                wind_speed_unit: 'ms',
            });

            return requestPromise({ url: `${FORECAST}?${params.toString()}`, method: 'GET' })
                .then((rawForecast) => {
                    const wx = parseMaybeJSON(rawForecast);
                    renderAll(place, wx);
                });
        })
        .catch(() => {
            show(errorBox, true);
        })
        .finally(() => {
            toggleLoader(false);
        });
};

// ========= RENDER =========
const renderAll = (place, wx) => {
    renderCurrent(place, wx);
    renderHourly(wx);
    renderDaily(wx);
};

const renderCurrent = (place, wx) => {
    const c = wx.current;
    currentBox.innerHTML =
        `<div>
      <div class="badge">${escapeHtml(place.name)}${place.country ? ', ' + escapeHtml(place.country) : ''}</div>
      <div class="temp">${Math.round(c.temperature_2m)}°</div>
      <div class="meta">${icon(c.weather_code)} · Влажность ${Math.round(c.relative_humidity_2m)}% · Ветер ${c.wind_speed_10m} м/с</div>
    </div>
    <div style="text-align:right">
      <div class="meta">Обновлено: ${toHumanTime(c.time)}</div>
      <div class="meta">Координаты: ${Number(wx.latitude).toFixed(2)}, ${Number(wx.longitude).toFixed(2)}</div>
    </div>`;
    currentBox.hidden = false;
};

const renderHourly = (wx) => {
    const { hourly } = wx;
    const limit = 12;
    const cards = [];
    for (let i = 0; i < Math.min(limit, hourly.time.length); i += 1) {
        cards.push({
            time: toHour(hourly.time[i]),
            t: Math.round(hourly.temperature_2m[i]),
            code: hourly.weather_code[i],
        });
    }
    hourlyBox.innerHTML = cards.map((h) => (
        `<div class="hour">
      <div>${h.time}</div>
      <div class="big">${icon(h.code)}</div>
      <div>${h.t}°</div>
    </div>`
    )).join('');
};

const renderDaily = (wx) => {
    const { daily } = wx;
    const dCards = [];
    for (let j = 0; j < daily.time.length; j += 1) {
        dCards.push({
            day: toDay(daily.time[j]),
            code: daily.weather_code[j],
            tmin: Math.round(daily.temperature_2m_min[j]),
            tmax: Math.round(daily.temperature_2m_max[j]),
        });
    }
    dailyBox.innerHTML = dCards.map((d) => (
        `<div class="day">
      <div>${d.day}</div>
      <div class="big">${icon(d.code)}</div>
      <div class="range">${d.tmax}° / ${d.tmin}°</div>
    </div>`
    )).join('');
};

// ========= INIT & EVENTS (ТЕПЕРЬ ПОСЛЕ ОБЪЯВЛЕНИЙ) =========
cityInput.value = 'Bishkek';

const init = () => loadWeather();
init();

btn.addEventListener('click', () => loadWeather());
unitsSel.addEventListener('change', () => loadWeather());

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loadWeather();
    }
});

cityInput.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
        if (!cityInput.value.trim()) return;
        loadWeather();
    }, 400);
});