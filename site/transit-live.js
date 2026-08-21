import { apiRequest } from './aws-client.js';

const board = document.querySelector('[data-transit-board]');
const list = document.querySelector('[data-bart-departures]');
const status = document.querySelector('[data-transit-status]');
const updated = document.querySelector('[data-transit-updated]');

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  parent.append(element);
}

function formatMinutes(value) {
  if (value === 'Leaving') return 'Leaving';
  const minutes = Number(value);
  return Number.isFinite(minutes) ? `${minutes} min` : String(value || '—');
}

function renderDepartures(departures) {
  list.replaceChildren();
  departures.slice(0, 6).forEach((departure) => {
    const row = document.createElement('div');
    row.className = 'departure-row';
    const detail = document.createElement('div');
    addText(detail, 'strong', '', departure.destination);
    addText(detail, 'span', '', `${departure.direction || 'BART'}${departure.platform ? ` · Platform ${departure.platform}` : ''}`);
    row.append(detail);
    addText(row, 'span', 'departure-minutes', departure.cancelled ? 'Cancelled' : formatMinutes(departure.minutes));
    list.append(row);
  });
}

async function loadBartDepartures() {
  if (!board) return;
  try {
    const data = await apiRequest('/transit/bart');
    renderDepartures(data.departures || []);
    status.textContent = data.departures?.length ? 'Next departures from Millbrae' : 'No live BART departures are currently listed.';
    updated.textContent = `Updated ${new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(data.updatedAt || Date.now()))}`;
  } catch {
    list.replaceChildren();
    status.textContent = 'Live BART data is temporarily unavailable.';
    updated.textContent = 'Use the official board for the latest status.';
  }
}

loadBartDepartures();
window.setInterval(loadBartDepartures, 60_000);
