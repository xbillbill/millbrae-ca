import assert from 'node:assert/strict';
import { ALLOWED_SSO_PROVIDERS, LISTING_CATEGORIES, normalizeListing, validateListing } from '../site/listing-policy.js';

const validInput = {
  businessName: '  Millbrae Test Cafe  ',
  category: 'cafe-bakery',
  address: '  100 Broadway  ',
  postalCode: '94030',
  website: 'https://example.com',
  phone: '(650) 555-0100',
  provider: 'Google',
  authorizedToList: true,
  accurateAndLawful: true
};

const valid = validateListing(validInput);
assert.equal(valid.valid, true);
assert.deepEqual(valid.errors, []);
assert.equal(valid.listing.businessName, 'Millbrae Test Cafe');
assert.equal(valid.listing.city, 'Millbrae');
assert.equal(LISTING_CATEGORIES.length, 13);
assert.deepEqual(ALLOWED_SSO_PROVIDERS, ['Google', 'Facebook']);

assert.equal(validateListing({ ...validInput, category: 'gambling' }).valid, false);
assert.equal(validateListing({ ...validInput, businessName: 'Millbrae Cannabis Club' }).valid, false);
assert.equal(validateListing({ ...validInput, postalCode: '94010' }).valid, false);
assert.equal(validateListing({ ...validInput, website: 'http://example.com' }).valid, false);
assert.equal(validateListing({ ...validInput, website: 'https://user:secret@example.com' }).valid, false);
assert.equal(validateListing({ ...validInput, website: '', phone: '' }).valid, false);
assert.equal(validateListing({ ...validInput, businessName: '<img src=x>' }).valid, false);
assert.equal(validateListing({ ...validInput, provider: 'password' }).valid, false);
assert.equal(validateListing({ ...validInput, authorizedToList: false }).valid, false);
assert.equal(validateListing({ ...validInput, accurateAndLawful: false }).valid, false);

const normalized = normalizeListing({ ...validInput, businessName: 'A   B' });
assert.equal(normalized.businessName, 'A B');

console.log('Community listing policy tests: OK');
