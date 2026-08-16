import assert from 'node:assert/strict';
import { getSponsorFit } from '../site/sponsor-fit.js';

const defaults = getSponsorFit();
assert.equal(defaults.plan, 'Founding feature');
assert.equal(defaults.price, '$99 / month');
assert.deepEqual(defaults.primary, { label: 'Hotels near SFO', href: 'hotels-near-sfo-millbrae.html' });
assert.equal(defaults.context, 'hotels');
assert.deepEqual(defaults.alternates, ['Layover hotel calculator', 'Early-flight hotel calculator', 'Hotel shuttle guide', 'Park-and-fly calculator', 'SFO travel tools hub']);

const parkingCategory = getSponsorFit({ business: 'parking', goal: 'category' });
assert.equal(parkingCategory.plan, 'Category sponsor');
assert.equal(parkingCategory.price, '$249 / month');
assert.equal(parkingCategory.primary.label, 'SFO parking calculator');
assert.equal(parkingCategory.context, 'parking');
assert.deepEqual(parkingCategory.alternates, ['Parking vs rideshare', 'Park-and-fly calculator', 'SFO travel tools hub']);

const restaurantListing = getSponsorFit({ business: 'restaurant', goal: 'listing' });
assert.equal(restaurantListing.plan, 'Community listing');
assert.equal(restaurantListing.price, '$0');
assert.equal(restaurantListing.primary.href, 'restaurants-in-millbrae.html');
assert.equal(restaurantListing.context, 'dining');

const transport = getSponsorFit({ business: 'transport', goal: 'single' });
assert.equal(transport.primary.label, 'Hotel shuttle guide');
assert.equal(transport.context, 'shuttle');

const invalid = getSponsorFit({ business: 'unknown', goal: 'unknown' });
assert.equal(invalid.plan, defaults.plan);
assert.deepEqual(invalid.primary, defaults.primary);

parkingCategory.alternates.push('mutated');
assert.equal(getSponsorFit({ business: 'parking' }).alternates.includes('mutated'), false);

console.log('Sponsor fit tests: OK');
