import assert from 'node:assert/strict';
import { buildSponsorPreview } from '../site/sponsor-preview.js';

const defaults = buildSponsorPreview();
assert.deepEqual(defaults, {
  business: 'Your Millbrae Business',
  offer: 'A clear reason for nearby customers to choose you.',
  cta: 'View this offer',
  context: 'PARKING CALCULATOR'
});

const normalized = buildSponsorPreview({
  business: '  Millbrae    Coffee  ',
  offer: '  Free pastry   with a morning coffee  ',
  cta: '  See   the menu ',
  context: 'dining'
});
assert.deepEqual(normalized, {
  business: 'Millbrae Coffee',
  offer: 'Free pastry with a morning coffee',
  cta: 'See the menu',
  context: 'RESTAURANT GUIDE'
});

const limited = buildSponsorPreview({
  business: 'B'.repeat(70),
  offer: 'O'.repeat(110),
  cta: 'C'.repeat(40),
  context: 'unknown'
});
assert.equal(limited.business.length, 50);
assert.equal(limited.offer.length, 90);
assert.equal(limited.cta.length, 28);
assert.equal(limited.context, 'PARKING CALCULATOR');

console.log('Sponsor preview tests: OK');
