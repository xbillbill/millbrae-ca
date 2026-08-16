import assert from 'node:assert/strict';
import { calculateParkingDiscount } from '../site/parking-discount-calculator.js';

const defaults = calculateParkingDiscount({
  parkingDays: 5, dailyRate: 20.95, freeDays: 2,
  percentOff: 10, taxesAndFees: 0, finalQuote: ''
});
assert.equal(defaults.paidDays, 3);
assert.equal(defaults.baseSubtotal, 104.75);
assert.equal(defaults.couponEstimate, 56.565);
assert.equal(defaults.estimatedSavings, 48.185);
assert.ok(Math.abs(defaults.effectiveDailyRate - 11.313) < 1e-9);
assert.equal(defaults.finalQuote, null);

const withFees = calculateParkingDiscount({
  parkingDays: 5, dailyRate: 20.95, freeDays: 2,
  percentOff: 10, taxesAndFees: 15, finalQuote: 75
});
assert.equal(withFees.couponEstimate, 71.565);
assert.ok(Math.abs(withFees.quoteVsEstimate - 3.435) < 1e-9);
assert.equal(withFees.quoteSavings, 44.75);

const capped = calculateParkingDiscount({ parkingDays: 3, dailyRate: 20, freeDays: 9, percentOff: 150 });
assert.equal(capped.freeDays, 3);
assert.equal(capped.paidDays, 0);
assert.equal(capped.percentOff, 100);
assert.equal(capped.couponEstimate, 0);

console.log('Parking discount calculator tests: OK');
