import assert from 'node:assert/strict';
import { calculateEarlyFlightPlan, formatDuration, formatRelativeTime } from '../site/early-flight-calculator.js';

const defaults = calculateEarlyFlightPlan({
  flightTime: '06:30', arrivalLead: 120, homeTravel: 90, homePrep: 30,
  hotelTransfer: 15, hotelPrep: 20, hotelExtraCost: ''
});
assert.equal(defaults.airportArrival, 270);
assert.equal(defaults.wakeHome, 150);
assert.equal(defaults.wakeHotel, 235);
assert.equal(defaults.sleepMinutes, 85);
assert.equal(defaults.costPerHour, null);

const priced = calculateEarlyFlightPlan({
  flightTime: '06:30', arrivalLead: 120, homeTravel: 90, homePrep: 30,
  hotelTransfer: 15, hotelPrep: 20, hotelExtraCost: 170
});
assert.equal(priced.costPerHour, 120);

const international = calculateEarlyFlightPlan({
  flightTime: '01:15', arrivalLead: 180, homeTravel: 60, homePrep: 20,
  hotelTransfer: 10, hotelPrep: 10, hotelExtraCost: 100
});
assert.equal(formatRelativeTime(international.airportArrival), '10:15 PM · previous day');
assert.equal(formatRelativeTime(international.wakeHome), '8:55 PM · previous day');

assert.equal(calculateEarlyFlightPlan({ flightTime: 'bad' }).airportArrival, 270);
assert.equal(formatRelativeTime(-30), '11:30 PM · previous day');
assert.equal(formatRelativeTime(1530), '1:30 AM · next day');
assert.equal(formatDuration(85), '1 hr 25 min');
assert.equal(formatDuration(60), '1 hr');
assert.equal(formatDuration(35), '35 min');

console.log('Early-flight calculator tests: OK');
