import assert from 'node:assert/strict';
import { calculateParkFly } from '../site/park-fly-calculator.js';

const sevenDayTrip = calculateParkFly({
  parkingDays: 7,
  packageQuote: 250,
  includedDays: 10,
  extraDayRate: 11,
  packageTransfer: 50,
  transportCredit: 25,
  roomOnlyQuote: 180,
  separateParkingRate: 27,
  separateTransfer: 0
});

assert.deepEqual(sevenDayTrip, {
  parkingDays: 7,
  extraDays: 0,
  extraParking: 0,
  packageTransferOutOfPocket: 25,
  packageExtras: 25,
  separateParking: 189,
  parkingOnlyTotal: 189,
  packageTotal: 275,
  alternativeTotal: 369,
  breakEvenPackageQuote: 344,
  packageSavings: 94
});

const twelveDayTrip = calculateParkFly({
  parkingDays: 11.2,
  packageQuote: 300,
  includedDays: 10,
  extraDayRate: 11,
  packageTransfer: 20,
  transportCredit: 25,
  roomOnlyQuote: 190,
  separateParkingRate: 27,
  separateTransfer: 12
});

assert.equal(twelveDayTrip.parkingDays, 12);
assert.equal(twelveDayTrip.extraDays, 2);
assert.equal(twelveDayTrip.extraParking, 22);
assert.equal(twelveDayTrip.packageTransferOutOfPocket, 0);
assert.equal(twelveDayTrip.packageTotal, 322);
assert.equal(twelveDayTrip.alternativeTotal, 526);
assert.equal(twelveDayTrip.breakEvenPackageQuote, 504);
assert.equal(twelveDayTrip.packageSavings, 204);

const missingQuotes = calculateParkFly({
  parkingDays: 5,
  packageQuote: '',
  includedDays: 7,
  extraDayRate: 15,
  packageTransfer: 0,
  transportCredit: 30,
  roomOnlyQuote: '',
  separateParkingRate: 27,
  separateTransfer: 0
});

assert.equal(missingQuotes.packageTotal, null);
assert.equal(missingQuotes.alternativeTotal, null);
assert.equal(missingQuotes.breakEvenPackageQuote, null);
assert.equal(missingQuotes.packageSavings, null);
assert.equal(missingQuotes.parkingOnlyTotal, 135);

const expensivePackage = calculateParkFly({
  parkingDays: 7,
  packageQuote: 400,
  includedDays: 10,
  extraDayRate: 11,
  packageTransfer: 0,
  transportCredit: 25,
  roomOnlyQuote: 180,
  separateParkingRate: 27,
  separateTransfer: 0
});

assert.equal(expensivePackage.packageSavings, -31);

console.log('Park-and-fly calculator tests: OK');
