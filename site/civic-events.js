import { apiRequest } from './aws-client.js';

const roots = [...document.querySelectorAll('[data-civic-events]')];
const fallback = 'https://www.ci.millbrae.ca.us/calendar.aspx';
let latestPayload = null;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const safeUrl = (value) => { try { const url = new URL(value || fallback); return url.protocol === 'https:' ? url.href : fallback; } catch { return fallback; } };

function copy(locale) {
  return locale === 'zh-CN'
    ? { loading: '正在加载近期活动……', unavailable: '当前活动暂时无法加载。请查看市政府官方日历。', view: '查看详情 ↗', empty: '目前没有可显示的近期活动。' }
    : locale === 'es'
      ? { loading: 'Cargando eventos próximos…', unavailable: 'Los eventos actuales no están disponibles. Consulta el calendario oficial de la ciudad.', view: 'Ver detalles ↗', empty: 'No hay próximos eventos para mostrar.' }
      : { loading: 'Loading upcoming events…', unavailable: 'Current events are temporarily unavailable. Check the official City calendar.', view: 'View details ↗', empty: 'No upcoming events are available to show.' };
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
  const limit = Number(root.dataset.eventLimit || 6);
  root.innerHTML = payload.events.slice(0, limit).map((event) => `<article class="event-card"><p class="tag">${escapeHtml(event.category)}</p><h3>${escapeHtml(event.title)}</h3><p class="event-time">${escapeHtml(formatDate(event.start, locale))}</p>${event.location ? `<p class="event-location">${escapeHtml(event.location)}</p>` : ''}<a href="${escapeHtml(safeUrl(event.url))}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></article>`).join('');
}

async function load() {
  if (!roots.length) return;
  let locale = document.documentElement.lang || 'en';
  roots.forEach((root) => { root.innerHTML = `<p class="event-status">${escapeHtml(copy(locale).loading)}</p>`; });
  try { latestPayload = await apiRequest('/events'); roots.forEach((root) => render(latestPayload, locale, root)); }
  catch { roots.forEach((root) => { root.innerHTML = `<p class="event-status">${escapeHtml(copy(locale).unavailable)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(copy(locale).view)}</a></p>`; }); }
  window.addEventListener('localechange', (event) => { locale = event.detail; if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root)); });
}

load();
