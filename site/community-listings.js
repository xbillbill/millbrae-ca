import { apiRequest } from './aws-client.js';
import { awsConfig } from './aws-config.js?v=20260816';
import { categoryLabel } from './listing-policy.js';

const grid = document.querySelector('[data-listing-grid]');
const status = document.querySelector('[data-directory-status]');
const count = document.querySelector('[data-listing-count]');

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

async function loadListings() {
  if (!awsConfig.enabled) {
    status.textContent = 'The self-service directory is being connected. Local businesses will be able to publish here shortly.';
    count.textContent = 'Opening soon';
    return;
  }

  try {
    const { listings = [] } = await apiRequest('/listings');
    listings.sort((a, b) => a.businessName.localeCompare(b.businessName));
    grid.replaceChildren();
    listings.forEach(renderListing);
    count.textContent = `${listings.length} ${listings.length === 1 ? 'listing' : 'listings'}`;
    status.textContent = listings.length
      ? 'Community listings are submitted and maintained by verified business representatives.'
      : 'No community listings yet. Be the first Millbrae business to add one.';
  } catch {
    status.textContent = 'The directory is temporarily unavailable. Please check back soon.';
    count.textContent = 'Temporarily unavailable';
  }
}

loadListings();
