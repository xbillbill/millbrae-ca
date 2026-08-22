import { apiRequest } from './aws-client.js';
import { awsConfig } from './aws-config.js?v=20260816';
import { categoryLabel, LISTING_CATEGORIES } from './listing-policy.js';

const grid = document.querySelector('[data-listing-grid]');
const status = document.querySelector('[data-directory-status]');
const count = document.querySelector('[data-listing-count]');
const searchInput = document.querySelector('[data-listing-search]');
const categorySelect = document.querySelector('[data-listing-category]');
let allListings = [];

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
    ? (visible.length === allListings.length ? 'Community listings are submitted and maintained by verified business representatives.' : `Showing ${visible.length} matching ${visible.length === 1 ? 'listing' : 'listings'}.`)
    : 'No listings match those filters. Try another name or category.';
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
    if (!allListings.length) status.textContent = 'No community listings yet. Be the first Millbrae business to add one.';
  } catch {
    status.textContent = 'The directory is temporarily unavailable. Please check back soon.';
    count.textContent = 'Temporarily unavailable';
  }
}

const params = new URLSearchParams(window.location.search);
if (searchInput) searchInput.value = params.get('q') || '';
if (categorySelect) categorySelect.value = params.get('category') || '';
searchInput?.addEventListener('input', () => { syncUrl(); renderFiltered(); });
categorySelect?.addEventListener('change', () => { syncUrl(); renderFiltered(); });

loadListings();
