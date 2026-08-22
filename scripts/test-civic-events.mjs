import assert from 'node:assert/strict';
import { parseIcalendar } from '../backend/civic-events.mjs';

const now = Date.parse('2026-08-21T12:00:00-07:00');
const feed = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:test-1\nDTSTART;TZID=America/Los_Angeles:20260825T190000\nDTEND;TZID=America/Los_Angeles:20260825T210000\nSUMMARY:City Council Meeting\nLOCATION:621 Magnolia Avenue\nURL:https://www.ci.millbrae.ca.us/calendar.aspx?EID=1\nEND:VEVENT\nEND:VCALENDAR`;
const events = parseIcalendar(feed, 'City Events', now);
assert.equal(events.length, 1);
assert.equal(events[0].title, 'City Council Meeting');
assert.equal(events[0].category, 'City Events');
assert.equal(events[0].location, '621 Magnolia Avenue');
assert.equal(events[0].start, '2026-08-26T02:00:00.000Z');
console.log('Civic events parser tests: OK');
