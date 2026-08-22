import { apiRequest } from './aws-client.js';

const roots = [...document.querySelectorAll('[data-civic-news]')];
const fallback = 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx';
let latestPayload = null;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const safeUrl = (value) => { try { const url = new URL(value || fallback); return url.protocol === 'https:' && url.hostname === 'www.ci.millbrae.ca.us' ? url.href : fallback; } catch { return fallback; } };

function copy(locale) {
  return locale === 'zh-CN'
    ? { loading: '正在加载市政新闻……', unavailable: '市政新闻暂时无法加载。请查看官方新闻页。', view: '阅读原文 ↗', empty: '目前没有可显示的市政新闻。' }
    : locale === 'es'
      ? { loading: 'Cargando noticias de la ciudad…', unavailable: 'Las noticias no están disponibles. Consulta la página oficial.', view: 'Leer la fuente ↗', empty: 'No hay noticias disponibles.' }
      : { loading: 'Loading City News Flash…', unavailable: 'City news is temporarily unavailable. Check the official news page.', view: 'Read source ↗', empty: 'No City News Flash items are available.' };
}

function formatDate(value, locale) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : locale === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeZone: 'America/Los_Angeles' }).format(date);
}

function render(payload, locale, root) {
  const labels = copy(locale);
  if (!payload?.news?.length) {
    root.innerHTML = `<p class="news-status">${escapeHtml(labels.empty)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></p>`;
    return;
  }
  const limit = Number(root.dataset.newsLimit || 4);
  root.innerHTML = payload.news.slice(0, limit).map((item) => `<article class="news-card"><p class="tag">CITY NEWS FLASH</p><h3>${escapeHtml(item.title)}</h3><p class="news-date">${escapeHtml(formatDate(item.publishedAt, locale))}</p><p>${escapeHtml(item.summary)}</p><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener">${escapeHtml(labels.view)}</a></article>`).join('');
}

async function load() {
  if (!roots.length) return;
  let locale = document.documentElement.lang || 'en';
  roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).loading)}</p>`; });
  try { latestPayload = await apiRequest('/news'); roots.forEach((root) => render(latestPayload, locale, root)); }
  catch { roots.forEach((root) => { root.innerHTML = `<p class="news-status">${escapeHtml(copy(locale).unavailable)} <a href="${fallback}" target="_blank" rel="noopener">${escapeHtml(copy(locale).view)}</a></p>`; }); }
  window.addEventListener('localechange', (event) => { locale = event.detail; if (latestPayload) roots.forEach((root) => render(latestPayload, locale, root)); });
}

load();
setInterval(load, 5 * 60 * 1000);
