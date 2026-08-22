import { apiRequest } from './aws-client.js';
import { awsConfig } from './aws-config.js?v=20260816';
import { categoryLabel, LISTING_CATEGORIES } from './listing-policy.js';

const grid = document.querySelector('[data-listing-grid]');
const status = document.querySelector('[data-directory-status]');
const count = document.querySelector('[data-listing-count]');
const searchInput = document.querySelector('[data-listing-search]');
const categorySelect = document.querySelector('[data-listing-category]');
let allListings = [];
let locale = document.documentElement.lang || 'en';

const copy = {
  en: { placeholder: 'Name, address, or category', allCategories: 'All categories', all: 'Community listings are submitted and maintained by verified business representatives.', filtered: (n) => `Showing ${n} matching ${n === 1 ? 'listing' : 'listings'}.`, empty: 'No listings match those filters. Try another name or category.', none: 'No community listings yet. Be the first Millbrae business to add one.', unavailable: 'The directory is temporarily unavailable. Please check back soon.', categories: {} },
  'zh-CN': { placeholder: '名称、地址或类别', allCategories: '全部类别', all: '社区商家信息由经过验证的商家代表提交和维护。', filtered: (n) => `显示 ${n} 条匹配的商家信息。`, empty: '没有商家信息符合筛选条件。请尝试其他名称或类别。', none: '目前还没有社区商家信息。欢迎成为第一个发布信息的密尔布雷商家。', unavailable: '目录暂时无法使用，请稍后再试。', categories: { restaurant: '餐厅', 'cafe-bakery': '咖啡馆或烘焙店', 'hotel-lodging': '酒店或住宿', retail: '零售店', 'professional-service': '专业服务', 'home-service': '家庭服务', 'health-wellness': '健康或保健', 'personal-care': '个人护理', transportation: '交通服务', automotive: '汽车服务', 'education-childcare': '教育或托育', 'arts-entertainment': '艺术或娱乐', 'nonprofit-community': '非营利或社区组织' } },
  es: { placeholder: 'Nombre, dirección o categoría', allCategories: 'Todas las categorías', all: 'Los negocios de la comunidad son enviados y mantenidos por representantes verificados.', filtered: (n) => `Se muestran ${n} ${n === 1 ? 'anuncio coincidente' : 'anuncios coincidentes'}.`, empty: 'Ningún anuncio coincide con esos filtros. Prueba otro nombre o categoría.', none: 'Aún no hay anuncios comunitarios. Sé el primer negocio de Millbrae en agregar uno.', unavailable: 'El directorio no está disponible temporalmente. Vuelve a intentarlo pronto.', categories: { restaurant: 'Restaurante', 'cafe-bakery': 'Café o panadería', 'hotel-lodging': 'Hotel u hospedaje', retail: 'Tienda minorista', 'professional-service': 'Servicio profesional', 'home-service': 'Servicio para el hogar', 'health-wellness': 'Salud o bienestar', 'personal-care': 'Cuidado personal', transportation: 'Transporte', automotive: 'Automotriz', 'education-childcare': 'Educación o cuidado infantil', 'arts-entertainment': 'Arte o entretenimiento', 'nonprofit-community': 'Organización comunitaria o sin fines de lucro' } }
};

const labels = () => copy[locale] || copy.en;
function syncLocale() {
  locale = document.documentElement.lang || 'en';
  if (searchInput) searchInput.placeholder = labels().placeholder;
  if (categorySelect) {
    categorySelect.options[0].textContent = labels().allCategories;
    [...categorySelect.options].slice(1).forEach((option) => { option.textContent = labels().categories[option.value] || option.textContent; });
  }
  if (allListings.length) renderFiltered();
}

for (const [value, label] of LISTING_CATEGORIES) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  categorySelect?.append(option);
}

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderListing(listing) {
  const card = document.createElement('article');
  card.className = 'listing-card';
  addText(card, 'p', 'tag', categoryLabel(listing.category).toUpperCase());
  addText(card, 'h2', '', listing.businessName);
  addText(card, 'p', 'listing-address', `${listing.address}, Millbrae, CA ${listing.postalCode}`);

  const links = document.createElement('div');
  links.className = 'listing-links';
  if (listing.website) {
    const website = document.createElement('a');
    website.href = listing.website;
    website.target = '_blank';
    website.rel = 'noopener nofollow';
    website.textContent = 'Visit website ↗';
    links.append(website);
  }
  if (listing.phone) {
    const phone = document.createElement('a');
    phone.href = `tel:${listing.phone.replace(/[^\d+]/g, '')}`;
    phone.textContent = listing.phone;
    links.append(phone);
  }
  card.append(links);
  grid.append(card);
}

function syncUrl() {
  const url = new URL(window.location.href);
  const query = searchInput?.value.trim() || '';
  const category = categorySelect?.value || '';
  if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
  if (category) url.searchParams.set('category', category); else url.searchParams.delete('category');
  window.history.replaceState({}, '', url);
}

function renderFiltered() {
  const query = (searchInput?.value || '').trim().toLocaleLowerCase();
  const category = categorySelect?.value || '';
  const visible = allListings.filter((listing) => {
    const haystack = `${listing.businessName} ${listing.address} ${categoryLabel(listing.category)}`.toLocaleLowerCase();
    return (!query || haystack.includes(query)) && (!category || listing.category === category);
  });
  grid.replaceChildren();
  visible.forEach(renderListing);
  count.textContent = `${visible.length} ${visible.length === 1 ? 'listing' : 'listings'}`;
  status.textContent = visible.length
    ? (visible.length === allListings.length ? labels().all : labels().filtered(visible.length))
    : labels().empty;
}

async function loadListings() {
  if (!awsConfig.enabled) {
    status.textContent = 'The self-service directory is being connected. Local businesses will be able to publish here shortly.';
    count.textContent = 'Opening soon';
    return;
  }

  try {
    const { listings = [] } = await apiRequest('/listings');
    allListings = listings.sort((a, b) => a.businessName.localeCompare(b.businessName));
    renderFiltered();
    if (!allListings.length) status.textContent = labels().none;
  } catch {
    status.textContent = labels().unavailable;
    count.textContent = 'Temporarily unavailable';
  }
}

const params = new URLSearchParams(window.location.search);
if (searchInput) searchInput.value = params.get('q') || '';
if (categorySelect) categorySelect.value = params.get('category') || '';
searchInput?.addEventListener('input', () => { syncUrl(); renderFiltered(); });
categorySelect?.addEventListener('change', () => { syncUrl(); renderFiltered(); });
window.addEventListener('localechange', syncLocale);
syncLocale();

loadListings();
