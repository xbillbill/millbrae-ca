import { apiRequest } from './aws-client.js';

const board = document.querySelector('[data-transit-board]');
const bartList = document.querySelector('[data-bart-departures]');
const bartStatus = document.querySelector('[data-transit-status]');
const bartUpdated = document.querySelector('[data-transit-updated]');
const caltrainList = document.querySelector('[data-caltrain-departures]');
const caltrainStatus = document.querySelector('[data-caltrain-status]');
const caltrainUpdated = document.querySelector('[data-caltrain-updated]');
const transitClock = document.querySelector('[data-transit-clock]');

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZoneName: 'short'
});

function updateTransitClock() {
  if (transitClock) transitClock.textContent = clockFormatter.format(new Date());
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function formatMinutes(value) {
  if (value === 'Leaving') return 'Leaving';
  const minutes = Number(value);
  return Number.isFinite(minutes) ? `${minutes} min` : String(value || '—');
}

function formatDepartureTime(value) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles'
  }).format(date);
}

function formatMinutesLeft(value, fallback) {
  if (!value) return formatMinutes(fallback);
  const departureAt = new Date(value).getTime();
  if (!Number.isFinite(departureAt)) return formatMinutes(fallback);
  const minutes = Math.max(0, Math.ceil((departureAt - Date.now()) / 60_000));
  return minutes === 0 ? 'Due' : `${minutes} min`;
}

function addDepartureMeta(parent, departureAt, fallbackMinutes) {
  const meta = document.createElement('div');
  meta.className = 'departure-meta';
  addText(meta, 'strong', 'departure-time', formatDepartureTime(departureAt));
  const minutes = addText(meta, 'span', 'departure-minutes', formatMinutesLeft(departureAt, fallbackMinutes));
  if (departureAt) minutes.dataset.departureAt = departureAt;
  parent.append(meta);
}

function formatCaltrainTime(value) {
  if (!value) return 'Time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).format(date);
}

function renderBart(departures) {
  bartList.replaceChildren();
  departures.slice(0, 6).forEach((departure) => {
    const row = document.createElement('div');
    row.className = 'departure-row';
    const detail = document.createElement('div');
    addText(detail, 'strong', '', departure.destination);
    addText(detail, 'span', '', `${departure.direction || 'BART'}${departure.platform ? ` · Platform ${departure.platform}` : ''}`);
    row.append(detail);
    if (departure.cancelled) addText(row, 'span', 'departure-minutes', 'Cancelled');
    else addDepartureMeta(row, departure.departureAt, departure.minutes);
    bartList.append(row);
  });
}

function renderCaltrain(departures) {
  caltrainList.replaceChildren();
  departures.slice(0, 8).forEach((departure) => {
    const row = document.createElement('div');
    row.className = 'departure-row';
    const detail = document.createElement('div');
    addText(detail, 'strong', '', `${departure.direction} · ${departure.destination}`);
    addText(detail, 'span', '', departure.line || 'Caltrain');
    row.append(detail);
    addDepartureMeta(row, departure.expectedArrivalTime, '');
    caltrainList.append(row);
  });
}

function refreshDepartureCountdowns() {
  document.querySelectorAll('[data-departure-at]').forEach((element) => {
    element.textContent = formatMinutesLeft(element.dataset.departureAt, '');
  });
}

async function refresh() {
  if (!board) return;
  const [bart, caltrain] = await Promise.allSettled([apiRequest('/transit/bart'), apiRequest('/transit/caltrain')]);
  if (bart.status === 'fulfilled') {
    renderBart(bart.value.departures || []);
    bartStatus.textContent = bart.value.departures?.length ? 'Next departures from Millbrae' : 'No live BART departures are currently listed.';
    bartUpdated.textContent = `Updated ${new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(bart.value.updatedAt || Date.now()))}`;
  } else {
    bartList.replaceChildren();
    bartStatus.textContent = 'Live BART data is temporarily unavailable.';
    bartUpdated.textContent = 'Use the official board for the latest status.';
  }
  if (caltrain.status === 'fulfilled') {
    renderCaltrain(caltrain.value.departures || []);
    caltrainStatus.textContent = caltrain.value.departures?.length ? 'Live arrivals for both directions' : 'No upcoming Caltrain arrivals were returned.';
    caltrainUpdated.textContent = `Updated ${new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(caltrain.value.updatedAt || Date.now()))}`;
  } else {
    caltrainList.replaceChildren();
    caltrainStatus.textContent = 'Live Caltrain data is temporarily unavailable.';
    caltrainUpdated.textContent = 'Use the official boards for the latest status.';
  }
}

refresh();
updateTransitClock();
refreshDepartureCountdowns();
window.setInterval(updateTransitClock, 1_000);
window.setInterval(refreshDepartureCountdowns, 60_000);
window.setInterval(refresh, 60_000);
