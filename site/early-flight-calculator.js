const nonNegative = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
};

const parseTime = (value, fallback = 390) => {
  const match = String(value ?? '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? (hours * 60) + minutes : fallback;
};

export function formatRelativeTime(totalMinutes) {
  const rounded = Math.round(totalMinutes);
  const dayOffset = Math.floor(rounded / 1440);
  const normalized = ((rounded % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hours12 = hours24 % 12 || 12;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const dayLabel = dayOffset < 0
    ? ` · ${Math.abs(dayOffset) === 1 ? 'previous day' : `${Math.abs(dayOffset)} days earlier`}`
    : dayOffset > 0
      ? ` · ${dayOffset === 1 ? 'next day' : `${dayOffset} days later`}`
      : '';
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}${dayLabel}`;
}

export function formatDuration(totalMinutes) {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export function calculateEarlyFlightPlan(values = {}) {
  const flight = parseTime(values.flightTime);
  const arrivalLead = nonNegative(values.arrivalLead, 120);
  const homeTravel = nonNegative(values.homeTravel, 90);
  const homePrep = nonNegative(values.homePrep, 30);
  const hotelTransfer = nonNegative(values.hotelTransfer, 15);
  const hotelPrep = nonNegative(values.hotelPrep, 20);
  const airportArrival = flight - arrivalLead;
  const leaveHome = airportArrival - homeTravel;
  const wakeHome = leaveHome - homePrep;
  const leaveHotel = airportArrival - hotelTransfer;
  const wakeHotel = leaveHotel - hotelPrep;
  const sleepMinutes = wakeHotel - wakeHome;
  const hasCost = values.hotelExtraCost !== '' && values.hotelExtraCost !== null && values.hotelExtraCost !== undefined;
  const hotelExtraCost = hasCost ? nonNegative(values.hotelExtraCost) : null;
  const costPerHour = hotelExtraCost !== null && sleepMinutes > 0
    ? Math.round((hotelExtraCost / (sleepMinutes / 60)) * 100) / 100
    : null;

  return {
    airportArrival,
    leaveHome,
    wakeHome,
    leaveHotel,
    wakeHotel,
    sleepMinutes,
    hotelExtraCost,
    costPerHour
  };
}

const calculator = typeof document === 'undefined'
  ? null
  : document.querySelector('[data-early-flight-calculator]');

if (calculator) {
  const money = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

  const render = () => {
    const result = calculateEarlyFlightPlan(Object.fromEntries(new FormData(calculator)));
    const timeOutputs = {
      arrival: result.airportArrival,
      'home-wake': result.wakeHome,
      'home-leave': result.leaveHome,
      'hotel-wake': result.wakeHotel,
      'hotel-leave': result.leaveHotel
    };

    Object.entries(timeOutputs).forEach(([name, value]) => {
      const output = calculator.querySelector(`[data-result="${name}"]`);
      output.value = formatRelativeTime(value);
      output.textContent = output.value;
    });

    const sleep = calculator.querySelector('[data-result="sleep"]');
    sleep.value = result.sleepMinutes > 0 ? formatDuration(result.sleepMinutes) : 'No time saved';
    sleep.textContent = sleep.value;

    const cost = calculator.querySelector('[data-result="cost-hour"]');
    cost.value = result.costPerHour === null ? 'Enter added cost' : money(result.costPerHour);
    cost.textContent = cost.value;

    const verdict = calculator.querySelector('[data-calculator-verdict]');
    if (result.sleepMinutes <= 0) {
      verdict.textContent = 'These assumptions do not make the hotel morning later. Check the transfer and preparation times.';
      verdict.dataset.state = 'costs';
    } else if (result.hotelExtraCost === null) {
      verdict.textContent = `The hotel plan moves wake-up ${formatDuration(result.sleepMinutes)} later. Enter the added cost to price each extra hour.`;
      verdict.dataset.state = 'waiting';
    } else {
      verdict.textContent = `The hotel plan buys ${formatDuration(result.sleepMinutes)} at ${money(result.costPerHour)} per extra hour. Whether that is worth it is your call.`;
      verdict.dataset.state = 'saves';
    }
  };

  calculator.addEventListener('submit', (event) => event.preventDefault());
  calculator.addEventListener('input', render);
  render();
}
