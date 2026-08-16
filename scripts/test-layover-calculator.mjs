import assert from 'node:assert/strict';
import { calculateLayoverPlan } from '../site/layover-calculator.js';
import { formatRelativeTime } from '../site/early-flight-calculator.js';

const defaults = calculateLayoverPlan({
  arrivalTime: '20:00', departureTime: '06:30', departureDay: 'next',
  arrivalProcess: 60, outboundTravel: 25, settleTime: 20,
  returnTravel: 25, departureLead: 120, packTime: 20, hotelCost: ''
});
assert.equal(defaults.layoverMinutes, 630);
assert.equal(defaults.hotelArrival, 1285);
assert.equal(defaults.lightsOut, 1305);
assert.equal(defaults.wakeHotel, 1665);
assert.equal(defaults.usableRest, 360);
assert.equal(defaults.roomWindow, 400);
assert.equal(defaults.costPerRestHour, null);
assert.equal(defaults.feasible, true);
assert.equal(formatRelativeTime(defaults.wakeHotel), '3:45 AM · next day');

const priced = calculateLayoverPlan({
  arrivalTime: '20:00', departureTime: '06:30', departureDay: 'next',
  arrivalProcess: 60, outboundTravel: 25, settleTime: 20,
  returnTravel: 25, departureLead: 120, packTime: 20, hotelCost: 180
});
assert.equal(priced.costPerRestHour, 30);

const daytime = calculateLayoverPlan({
  arrivalTime: '08:00', departureTime: '18:00', departureDay: 'same',
  arrivalProcess: 30, outboundTravel: 20, settleTime: 10,
  returnTravel: 20, departureLead: 120, packTime: 10, hotelCost: 120
});
assert.equal(daytime.layoverMinutes, 600);
assert.equal(daytime.usableRest, 390);
assert.equal(daytime.feasible, true);

const impossible = calculateLayoverPlan({ arrivalTime: '20:00', departureTime: '06:30', departureDay: 'same' });
assert.equal(impossible.layoverMinutes, 0);
assert.equal(impossible.feasible, false);

console.log('Layover calculator tests: OK');
