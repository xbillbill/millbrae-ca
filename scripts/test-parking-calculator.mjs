import assert from 'node:assert/strict';
import { calculateParkingTotals } from '../site/parking-calculator.js';

const defaults = calculateParkingTotals({
  parkingPeriods: 5,
  bartChargedDays: 5,
  travelers: 2,
  bartParkingRate: 10.10,
  bartFareOneWay: 5.85,
  sfoRate: 27,
  privateRate: 20.95,
  privateFees: 0,
  quoteTotal: '',
});

assert.deepEqual(defaults, { bart: 73.90, sfo: 135, privateBase: 104.75, quote: null });

const custom = calculateParkingTotals({
  parkingPeriods: 3,
  bartChargedDays: 2,
  travelers: 1,
  bartParkingRate: 11,
  bartFareOneWay: 6,
  sfoRate: 30,
  privateRate: 18,
  privateFees: 9.50,
  quoteTotal: 72.49,
});

assert.deepEqual(custom, { bart: 34, sfo: 90, privateBase: 63.50, quote: 72.49 });

const invalid = calculateParkingTotals({
  parkingPeriods: -2,
  bartChargedDays: 'invalid',
  travelers: -1,
  bartParkingRate: 10,
  bartFareOneWay: 5,
  sfoRate: 27,
  privateRate: 20,
  privateFees: -4,
  quoteTotal: -10,
});

assert.deepEqual(invalid, { bart: 0, sfo: 0, privateBase: 0, quote: 0 });
console.log('Parking calculator tests: OK');
