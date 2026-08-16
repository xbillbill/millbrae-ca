export const LISTING_CATEGORIES = Object.freeze([
  'restaurant', 'cafe-bakery', 'hotel-lodging', 'retail', 'professional-service',
  'home-service', 'health-wellness', 'personal-care', 'transportation',
  'automotive', 'education-childcare', 'arts-entertainment', 'nonprofit-community'
]);

export const ALLOWED_PROVIDERS = Object.freeze(['Google', 'Facebook']);

const categories = new Set(LISTING_CATEGORIES);
const prohibitedPattern = /\b(?:adult\s*(?:service|entertainment)|escort|cannabis|marijuana|dispensary|vape|tobacco|firearm|ammunition|casino|gambling|sportsbook|payday\s*loan|counterfeit|fake\s*id|stolen\s*goods|controlled\s*substance)\b/i;
const safeTextPattern = /^[^<>\u0000-\u001f\u007f]+$/;
const phonePattern = /^[0-9()+.\-\s]{7,24}$/;
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

export function validateListing(input = {}, provider = '') {
  const listing = {
    businessName: clean(input.businessName),
    category: clean(input.category),
    address: clean(input.address),
    city: 'Millbrae',
    postalCode: clean(input.postalCode),
    website: clean(input.website),
    phone: clean(input.phone),
    provider: clean(provider),
    authorizedToList: input.authorizedToList === true,
    accurateAndLawful: input.accurateAndLawful === true
  };
  const errors = [];

  if (listing.businessName.length < 2 || listing.businessName.length > 80 || !safeTextPattern.test(listing.businessName)) errors.push('Enter a valid business name.');
  if (prohibitedPattern.test(listing.businessName)) errors.push('This business type is not eligible for automatic community publishing.');
  if (!categories.has(listing.category)) errors.push('Choose an eligible community category.');
  if (listing.address.length < 4 || listing.address.length > 120 || !safeTextPattern.test(listing.address)) errors.push('Enter a valid Millbrae street address.');
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
  if (!ALLOWED_PROVIDERS.includes(listing.provider)) errors.push('Use an approved social sign-in provider.');
  if (!listing.authorizedToList) errors.push('Confirm that you are authorized to manage this listing.');
  if (!listing.accurateAndLawful) errors.push('Confirm that the listing is accurate, lawful, and follows the content policy.');

  return { listing, errors, valid: errors.length === 0 };
}
