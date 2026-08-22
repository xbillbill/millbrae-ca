import { apiRequest } from './aws-client.js';

const roots = [...document.querySelectorAll('[data-civic-alerts]')];
const fallback = 'https://www.ci.millbrae.ca.us/AlertCenter.aspx';
let latestPayload = null;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const safeUrl = (value) => { try { const url = new URL(value || fallback); return url.protocol === 'https:' && url.hostname === 'www.ci.millbrae.ca.us' ? url.href : fallback; } catch { return fallback; } };

function copy(locale) {
  return locale === 'zh-CN'
    ? { loading: '正在加载近期官方提醒……', unavailable: '官方提醒暂时无法加载。请查看市政府提醒中心。', view: '查看提醒原文 ↗', empty: '目前没有可显示的近期提醒。' }
    : locale === 'es'
      ? { loading: 'Cargando avisos oficiales recientes…', unavailable: 'Los avisos no están disponibles. Consulta el centro oficial.', view: 'Ver aviso oficial ↗', empty: 'No hay avisos recientes disponibles.' }
      : { loading: 'Loading recent official notices…', unavailable: 'Official notices are temporarily unavailable. Check the City Alert Center.', view: 'Read official notice ↗', empty: 'No recent official notices are available.' };
}

function formatDate(value, locale) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : locale === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeZone: 'America/Los_Angeles' }).format(date);
}

function render(payload, locale, root) {
  const labels = copy(locale);
  if (!payload?.alerts?.length) {
    root.innerHTML = `<p class="news-status">${escapeHtml(labels.empty)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></p>`;
    return;
  }
  const limit = Number(root.dataset.alertLimit || 3);
  root.innerHTML = payload.alerts.slice(0, limit).map((item) => `<article class="news-card alert-card"><p class="tag">RECENT CITY ALERT</p><h3>${escapeHtml(item.title)}</h3><p class="news-date">${escapeHtml(formatDate(item.publishedAt, locale))}</p><p>${escapeHtml(item.summary || 'Recent notice published by the City Alert Center.')}</p><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></article>`).join('');
}

async function load() {
  if (!roots.length) return;
  let locale = document.documentElement.lang || 'en';
  roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).loading)}</p>`; });
  try { latestPayload = await apiRequest('/alerts'); roots.forEach((root) => render(latestPayload, locale, root)); }
  catch { roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).unavailable)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(copy(locale).view)}</a></p>`; }); }
  window.addEventListener('localechange', (event) => { locale = event.detail; if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root)); });
}

load();
