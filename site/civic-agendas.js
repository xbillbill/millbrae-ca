import { apiRequest } from './aws-client.js';

const roots = [...document.querySelectorAll('[data-civic-agendas]')];
const fallback = 'https://www.ci.millbrae.ca.us/AgendaCenter';
let latestPayload = null;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const safeUrl = (value) => { try { const url = new URL(value || fallback); return url.protocol === 'https:' && url.hostname === 'www.ci.millbrae.ca.us' ? url.href : fallback; } catch { return fallback; } };

function copy(locale) {
  return locale === 'zh-CN'
    ? { loading: '正在加载议程更新……', unavailable: '议程更新暂时无法加载。请查看官方议程中心。', view: '查看官方记录 ↗', empty: '目前没有可显示的议程更新。' }
    : locale === 'es'
      ? { loading: 'Cargando agendas…', unavailable: 'Las agendas no están disponibles. Consulta el centro oficial.', view: 'Ver registro oficial ↗', empty: 'No hay actualizaciones de agendas disponibles.' }
      : { loading: 'Loading agenda updates…', unavailable: 'Agenda updates are temporarily unavailable. Check the official Agenda Center.', view: 'Open official record ↗', empty: 'No agenda updates are available.' };
}

function formatDate(value, locale) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : locale === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeZone: 'America/Los_Angeles' }).format(date);
}

function render(payload, locale, root) {
  const labels = copy(locale);
  if (!payload?.agendas?.length) {
    root.innerHTML = `<p class="news-status">${escapeHtml(labels.empty)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></p>`;
    return;
  }
  const limit = Number(root.dataset.agendaLimit || 4);
  root.innerHTML = payload.agendas.slice(0, limit).map((item) => `<article class="news-card agenda-card"><p class="tag">AGENDA CENTER UPDATE</p><h3>${escapeHtml(item.title)}</h3><p class="news-date">${escapeHtml(formatDate(item.publishedAt, locale))}</p><p>${escapeHtml(item.summary || 'Agenda, minutes, or meeting record update published by the City.')}</p><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></article>`).join('');
}

async function load() {
  if (!roots.length) return;
  let locale = document.documentElement.lang || 'en';
  roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).loading)}</p>`; });
  try { latestPayload = await apiRequest('/agendas'); roots.forEach((root) => render(latestPayload, locale, root)); }
  catch { roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).unavailable)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(copy(locale).view)}</a></p>`; }); }
  window.addEventListener('localechange', (event) => { locale = event.detail; if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root)); });
}

load();
