import { formatDuration, formatRelativeTime } from './early-flight-calculator.js';

const nonNegative = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
};

const parseTime = (value, fallback) => {
  const match = String(value ?? '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? (hours * 60) + minutes : fallback;
};

export function calculateLayoverPlan(values = {}) {
  const arrival = parseTime(values.arrivalTime, 1200);
  const departureClock = parseTime(values.departureTime, 390);
  const departure = departureClock + (values.departureDay === 'same' ? 0 : 1440);
  const arrivalProcess = nonNegative(values.arrivalProcess, 60);
  const outboundTravel = nonNegative(values.outboundTravel, 25);
  const settleTime = nonNegative(values.settleTime, 20);
  const returnTravel = nonNegative(values.returnTravel, 25);
  const departureLead = nonNegative(values.departureLead, 120);
  const packTime = nonNegative(values.packTime, 20);
  const layoverMinutes = Math.max(0, departure - arrival);
  const hotelArrival = arrival + arrivalProcess + outboundTravel;
  const lightsOut = hotelArrival + settleTime;
  const airportReturn = departure - departureLead;
  const leaveHotel = airportReturn - returnTravel;
  const wakeHotel = leaveHotel - packTime;
  const usableRest = Math.max(0, wakeHotel - lightsOut);
  const roomWindow = Math.max(0, leaveHotel - hotelArrival);
  const hasCost = values.hotelCost !== '' && values.hotelCost !== null && values.hotelCost !== undefined;
  const hotelCost = hasCost ? nonNegative(values.hotelCost) : null;
  const costPerRestHour = hotelCost !== null && usableRest > 0
    ? Math.round((hotelCost / (usableRest / 60)) * 100) / 100
    : null;

  return {
    arrival,
    departure,
    layoverMinutes,
    hotelArrival,
    lightsOut,
    wakeHotel,
    leaveHotel,
    airportReturn,
    usableRest,
    roomWindow,
    hotelCost,
    costPerRestHour,
    feasible: departure > arrival && usableRest > 0
  };
}

const calculator = typeof document === 'undefined'
  ? null
  : document.querySelector('[data-layover-calculator]');

if (calculator) {
  const money = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(value);

  const render = () => {
    const result = calculateLayoverPlan(Object.fromEntries(new FormData(calculator)));
    const times = {
      'hotel-arrival': result.hotelArrival,
      'lights-out': result.lightsOut,
      'wake-hotel': result.wakeHotel,
      'leave-hotel': result.leaveHotel,
      'airport-return': result.airportReturn
    };

    Object.entries(times).forEach(([name, value]) => {
      const output = calculator.querySelector(`[data-result="${name}"]`);
      output.value = formatRelativeTime(value);
      output.textContent = output.value;
    });

    const durationOutputs = {
      layover: result.layoverMinutes,
      room: result.roomWindow,
      rest: result.usableRest
    };
    Object.entries(durationOutputs).forEach(([name, value]) => {
      const output = calculator.querySelector(`[data-result="${name}"]`);
      output.value = formatDuration(value);
      output.textContent = output.value;
    });

    const cost = calculator.querySelector('[data-result="cost-hour"]');
    cost.value = result.costPerRestHour === null ? 'Enter hotel cost' : money(result.costPerRestHour);
    cost.textContent = cost.value;

    const verdict = calculator.querySelector('[data-calculator-verdict]');
    if (!result.feasible) {
      verdict.textContent = 'These assumptions leave no usable rest window. Check the day selection and reduce only buffers you can safely change.';
      verdict.dataset.state = 'costs';
    } else if (result.hotelCost === null) {
      verdict.textContent = `This plan leaves ${formatDuration(result.usableRest)} for rest and ${formatDuration(result.roomWindow)} at the hotel. Enter the room cost to price the rest window.`;
      verdict.dataset.state = 'waiting';
    } else {
      verdict.textContent = `This plan leaves ${formatDuration(result.usableRest)} for rest at ${money(result.costPerRestHour)} per usable hour. Whether that tradeoff is worth it is your call.`;
      verdict.dataset.state = 'saves';
    }
  };

  calculator.addEventListener('submit', (event) => event.preventDefault());
  calculator.addEventListener('input', render);
  calculator.addEventListener('change', render);
  render();
}
