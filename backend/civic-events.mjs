function unescapeIcs(value = '') {
  return value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}

function cleanIcsText(value = '') {
  return unescapeIcs(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeEventUrl(value = '') {
  try {
    const url = new URL(value, 'https://www.ci.millbrae.ca.us');
    return url.protocol === 'https:' && url.hostname === 'www.ci.millbrae.ca.us'
      ? url.href
      : 'https://www.ci.millbrae.ca.us/calendar.aspx';
  } catch {
    return 'https://www.ci.millbrae.ca.us/calendar.aspx';
  }
}

function localTimeToIso(value, timeZone = 'America/Los_Angeles') {
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!match) return '';
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  if (!value.includes('T')) return `${year}-${month}-${day}`;
  const utcGuess = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(utcGuess));
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value: part }) => [type, part]));
  const localAsUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return new Date(utcGuess - (localAsUtc - utcGuess)).toISOString();
}

export function parseIcalendar(text, category, now = Date.now()) {
  const lines = String(text).replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let current = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT') {
      if (current?.summary && current.start) {
        const start = localTimeToIso(current.start, current.timeZone);
        const startMs = start.length === 10 ? Date.parse(`${start}T00:00:00-07:00`) : Date.parse(start);
        if (Number.isFinite(startMs) && startMs >= now - 86_400_000) events.push({
          id: current.uid || `${category}-${start}-${current.summary}`,
          category,
          title: cleanIcsText(current.summary),
          start,
          end: current.end ? localTimeToIso(current.end, current.timeZone) : '',
          location: cleanIcsText(current.location || ''),
          url: normalizeEventUrl(current.url)
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const property = line.slice(0, separator);
    const rawValue = line.slice(separator + 1);
    const [name, ...params] = property.split(';');
    const timeZone = params.find((param) => param.startsWith('TZID='))?.slice(5) || 'America/Los_Angeles';
    const key = { SUMMARY: 'summary', DTSTART: 'start', DTEND: 'end', LOCATION: 'location', URL: 'url', UID: 'uid' }[name];
    if (key) { current[key] = unescapeIcs(rawValue); if (name === 'DTSTART' || name === 'DTEND') current.timeZone = timeZone; }
  }
  return events;
}
