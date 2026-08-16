import assert from 'node:assert/strict';
import { ALLOWED_PROVIDERS, LISTING_CATEGORIES, validateListing } from '../backend/policy.mjs';

const valid = {
  businessName: 'Millbrae Test Cafe',
  category: 'cafe-bakery',
  address: '100 Broadway',
  postalCode: '94030',
  website: 'https://example.com',
  phone: '(650) 555-0100',
  authorizedToList: true,
  accurateAndLawful: true
};

assert.equal(validateListing(valid, 'Google').valid, true);
assert.equal(LISTING_CATEGORIES.length, 13);
assert.deepEqual(ALLOWED_PROVIDERS, ['Google', 'Facebook']);
assert.equal(validateListing({ ...valid, businessName: 'Millbrae Cannabis Club' }, 'Google').valid, false);
assert.equal(validateListing({ ...valid, postalCode: '94010' }, 'Google').valid, false);
assert.equal(validateListing({ ...valid, website: 'https://user:secret@example.com' }, 'Google').valid, false);
assert.equal(validateListing(valid, 'password').valid, false);
assert.equal(validateListing({ ...valid, authorizedToList: false }, 'Google').valid, false);

console.log('Backend listing policy tests: OK');
