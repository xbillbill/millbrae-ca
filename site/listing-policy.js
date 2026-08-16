export const LISTING_CATEGORIES = Object.freeze([
  ['restaurant', 'Restaurant'],
  ['cafe-bakery', 'Cafe or bakery'],
  ['hotel-lodging', 'Hotel or lodging'],
  ['retail', 'Retail shop'],
  ['professional-service', 'Professional service'],
  ['home-service', 'Home service'],
  ['health-wellness', 'Health or wellness'],
  ['personal-care', 'Personal care'],
  ['transportation', 'Transportation'],
  ['automotive', 'Automotive'],
  ['education-childcare', 'Education or childcare'],
  ['arts-entertainment', 'Arts or entertainment'],
  ['nonprofit-community', 'Nonprofit or community organization']
]);

export const ALLOWED_SSO_PROVIDERS = Object.freeze(['Google', 'Facebook']);

const categoryIds = new Set(LISTING_CATEGORIES.map(([id]) => id));
const prohibitedPattern = /\b(?:adult\s*(?:service|entertainment)|escort|cannabis|marijuana|dispensary|vape|tobacco|firearm|ammunition|casino|gambling|sportsbook|payday\s*loan|counterfeit|fake\s*id|stolen\s*goods|controlled\s*substance)\b/i;
const phonePattern = /^[0-9()+.\-\s]{7,24}$/;
const safeTextPattern = /^[^<>\u0000-\u001f\u007f]+$/;

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

export function normalizeListing(values = {}) {
  return {
    businessName: clean(values.businessName),
    category: clean(values.category),
    address: clean(values.address),
    city: 'Millbrae',
    postalCode: clean(values.postalCode),
    website: clean(values.website),
    phone: clean(values.phone),
    provider: clean(values.provider),
    authorizedToList: values.authorizedToList === true || values.authorizedToList === 'on',
    accurateAndLawful: values.accurateAndLawful === true || values.accurateAndLawful === 'on'
  };
}

export function validateListing(values = {}) {
  const listing = normalizeListing(values);
  const errors = [];

  if (listing.businessName.length < 2 || listing.businessName.length > 80 || !safeTextPattern.test(listing.businessName)) {
    errors.push('Enter a business name between 2 and 80 characters without markup.');
  }
  if (prohibitedPattern.test(listing.businessName)) {
    errors.push('This business type is not eligible for automatic community publishing.');
  }
  if (!categoryIds.has(listing.category)) errors.push('Choose an eligible community category.');
  if (listing.address.length < 4 || listing.address.length > 120 || !safeTextPattern.test(listing.address)) {
    errors.push('Enter a valid Millbrae street address without markup.');
  }
  if (listing.postalCode !== '94030') errors.push('Free community listings currently require a 94030 address.');
  if (listing.website) {
    try {
      const url = new URL(listing.website);
      if (url.protocol !== 'https:' || url.username || url.password || listing.website.length > 200) throw new Error('invalid');
    } catch {
      errors.push('Website must be a complete HTTPS address.');
    }
  }
  if (listing.phone && !phonePattern.test(listing.phone)) errors.push('Enter a valid phone number.');
  if (!listing.website && !listing.phone) errors.push('Add at least one public website or phone number.');
  if (listing.provider && !ALLOWED_SSO_PROVIDERS.includes(listing.provider)) errors.push('Use an approved social sign-in provider.');
  if (!listing.authorizedToList) errors.push('Confirm that you are authorized to manage this listing.');
  if (!listing.accurateAndLawful) errors.push('Confirm that the listing is accurate, lawful, and follows the content policy.');

  return { listing, errors, valid: errors.length === 0 };
}

export function categoryLabel(category) {
  return LISTING_CATEGORIES.find(([id]) => id === category)?.[1] || 'Local business';
}
