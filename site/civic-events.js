import { apiRequest } from './aws-client.js';

const roots = [...document.querySelectorAll('[data-civic-events]')];
const eventSearch = document.querySelector('[data-event-search]');
const fallback = 'https://www.ci.millbrae.ca.us/calendar.aspx';
let latestPayload = null;
let locale = document.documentElement.lang || 'en';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const safeUrl = (value) => { try { const url = new URL(value || fallback); return url.protocol === 'https:' ? url.href : fallback; } catch { return fallback; } };

function copy(locale) {
  return locale === 'zh-CN'
    ? { loading: '正在加载近期活动……', unavailable: '当前活动暂时无法加载。请查看市政府官方日历。', view: '查看详情 ↗', empty: '目前没有可显示的近期活动。', noMatch: '没有活动符合此搜索。', placeholder: '标题、类别或地点' }
    : locale === 'es'
      ? { loading: 'Cargando eventos próximos…', unavailable: 'Los eventos actuales no están disponibles. Consulta el calendario oficial de la ciudad.', view: 'Ver detalles ↗', empty: 'No hay próximos eventos para mostrar.', noMatch: 'Ningún evento coincide con la búsqueda.', placeholder: 'Título, categoría o ubicación' }
      : { loading: 'Loading upcoming events…', unavailable: 'Current events are temporarily unavailable. Check the official City calendar.', view: 'View details ↗', empty: 'No upcoming events are available to show.', noMatch: 'No upcoming event matches this search.', placeholder: 'Title, category, or location' };
}

function formatDate(value, locale) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : locale === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Los_Angeles' }).format(date);
}

function render(payload, locale, root) {
  const labels = copy(locale);
  if (!payload?.events?.length) {
    root.innerHTML = `<p class="event-status">${escapeHtml(labels.empty)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></p>`;
    return;
  }
  const query = (eventSearch?.value || '').trim().toLocaleLowerCase();
  const events = query ? payload.events.filter((event) => `${event.title} ${event.category} ${event.location || ''}`.toLocaleLowerCase().includes(query)) : payload.events;
  if (!events.length) {
    root.innerHTML = `<p class="event-status">${escapeHtml(labels.noMatch)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></p>`;
    return;
  }
  const limit = Number(root.dataset.eventLimit || 6);
  root.innerHTML = events.slice(0, limit).map((event) => `<article class="event-card"><p class="tag">${escapeHtml(event.category)}</p><h3>${escapeHtml(event.title)}</h3><p class="event-time">${escapeHtml(formatDate(event.start, locale))}</p>${event.location ? `<p class="event-location">${escapeHtml(event.location)}</p>` : ''}<a href="${escapeHtml(safeUrl(event.url))}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></article>`).join('');
}

async function load() {
  if (!roots.length) return;
  locale = document.documentElement.lang || 'en';
  if (eventSearch) eventSearch.placeholder = copy(locale).placeholder;
  roots.forEach((root) => { root.innerHTML = `<p class="event-status">${escapeHtml(copy(locale).loading)}</p>`; });
  try { latestPayload = await apiRequest('/events'); roots.forEach((root) => render(latestPayload, locale, root)); }
  catch { roots.forEach((root) => { root.innerHTML = `<p class="event-status">${escapeHtml(copy(locale).unavailable)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(copy(locale).view)}</a></p>`; }); }
}

if (eventSearch) {
  const params = new URLSearchParams(window.location.search);
  eventSearch.value = params.get('q') || '';
  eventSearch.addEventListener('input', () => {
    const url = new URL(window.location.href);
    const query = eventSearch.value.trim();
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root));
  });
}
window.addEventListener('localechange', (event) => { locale = event.detail; if (eventSearch) eventSearch.placeholder = copy(locale).placeholder; if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root)); });
load();
setInterval(load, 5 * 60 * 1000);
