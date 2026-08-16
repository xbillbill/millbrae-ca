import assert from 'node:assert/strict';
import { calculateRideshareComparison } from '../site/rideshare-calculator.js';

const defaults = calculateRideshareComparison({
  parkingDays: 5,
  parkingRate: 27,
  parkingDiscount: 0,
  drivingExtras: 12,
  outboundFare: 45,
  returnFare: 45,
  tipPercent: 15
});

assert.deepEqual(defaults, {
  parking: 147,
  rideshare: 103.5,
  quotedFares: 90,
  difference: 43.5,
  winner: 'rideshare',
  breakEvenDays: 3.4,
  rideshareWinsDay: 4
});

const parkingWins = calculateRideshareComparison({
  parkingDays: 2,
  parkingRate: 30,
  parkingDiscount: 10,
  drivingExtras: 5,
  outboundFare: 50,
  returnFare: 60,
  tipPercent: 20
});
assert.deepEqual(parkingWins, {
  parking: 55,
  rideshare: 132,
  quotedFares: 110,
  difference: 77,
  winner: 'parking',
  breakEvenDays: 4.6,
  rideshareWinsDay: 5
});

const tie = calculateRideshareComparison({
  parkingDays: 3,
  parkingRate: 20,
  parkingDiscount: 0,
  drivingExtras: 0,
  outboundFare: 30,
  returnFare: 30,
  tipPercent: 0
});
assert.equal(tie.winner, 'tie');
assert.equal(tie.difference, 0);
assert.equal(tie.rideshareWinsDay, 4);

const zeroRate = calculateRideshareComparison({
  parkingDays: -2,
  parkingRate: 0,
  parkingDiscount: 50,
  drivingExtras: 'invalid',
  outboundFare: -10,
  returnFare: 25,
  tipPercent: -5
});
assert.deepEqual(zeroRate, {
  parking: 0,
  rideshare: 25,
  quotedFares: 25,
  difference: 25,
  winner: 'parking',
  breakEvenDays: null,
  rideshareWinsDay: null
});

console.log('Parking vs rideshare calculator tests: OK');
