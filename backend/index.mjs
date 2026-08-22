import { createPublicKey, verify as verifySignature } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ALLOWED_PROVIDERS, validateListing } from './policy.mjs';
import { parseIcalendar } from './civic-events.mjs';
import { parseNewsRss } from './civic-news.mjs';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true }
});
const tableName = process.env.TABLE_NAME;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const caltrainApiKey = process.env.CALTRAIN_API_KEY;
const issuers = new Set(['accounts.google.com', 'https://accounts.google.com']);
const dailyUpdateLimit = Number(process.env.DAILY_UPDATE_LIMIT || 10);
const caltrainCacheKey = 'TRANSIT#CALTRAIN';
const caltrainCacheSeconds = 5 * 60;
let jwksCache = null;
let directoryCache = null;
let caltrainMemoryCache = null;
let civicEventsCache = null;
let civicNewsCache = null;
let civicAgendaCache = null;
let civicAlertCache = null;

const civicEventFeeds = Object.freeze([
  { category: 'City Events', url: 'https://www.ci.millbrae.ca.us/common/modules/iCalendar/iCalendar.aspx?catID=26&feed=calendar' },
  { category: 'Community Events', url: 'https://www.ci.millbrae.ca.us/common/modules/iCalendar/iCalendar.aspx?catID=28&feed=calendar' }
]);
const civicNewsFeed = 'https://www.ci.millbrae.ca.us/RSSFeed.aspx?ModID=1&CID=All-newsflash.xml';
const civicAgendaFeed = 'https://www.ci.millbrae.ca.us/RSSFeed.aspx?ModID=65&CID=All-0';
const civicAlertFeed = 'https://www.ci.millbrae.ca.us/RSSFeed.aspx?ModID=63&CID=All-0';

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  body: JSON.stringify(body)
});

function decodePart(part) {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

async function getJwks() {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', { signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error('Identity keys unavailable');
  const { keys } = await response.json();
  jwksCache = { keys, expiresAt: Date.now() + 6 * 60 * 60 * 1000 };
  return keys;
}

async function authenticate(event) {
  const authorization = event.headers?.authorization || event.headers?.Authorization || '';
  if (!authorization.startsWith('Bearer ')) throw Object.assign(new Error('Sign in is required.'), { statusCode: 401 });
  const token = authorization.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) throw Object.assign(new Error('Invalid sign-in token.'), { statusCode: 401 });

  let header;
  let claims;
  try {
    header = decodePart(parts[0]);
    claims = decodePart(parts[1]);
  } catch {
    throw Object.assign(new Error('Invalid sign-in token.'), { statusCode: 401 });
  }
  if (header.alg !== 'RS256' || !issuers.has(claims.iss) || claims.aud !== googleClientId || claims.exp * 1000 <= Date.now()) {
    throw Object.assign(new Error('The sign-in session is invalid or expired.'), { statusCode: 401 });
  }
  const key = (await getJwks()).find((item) => item.kid === header.kid);
  if (!key) throw Object.assign(new Error('The sign-in token could not be verified.'), { statusCode: 401 });
  const verified = verifySignature('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  if (!verified) throw Object.assign(new Error('The sign-in token could not be verified.'), { statusCode: 401 });

  const provider = 'Google';
  if (!ALLOWED_PROVIDERS.includes(provider)) throw Object.assign(new Error('Use an approved social sign-in provider.'), { statusCode: 403 });
  return { ownerId: claims.sub, provider };
}

function publicListing(item) {
  if (!item) return null;
  return {
    businessName: item.businessName,
    category: item.category,
    address: item.address,
    city: 'Millbrae',
    postalCode: '94030',
    website: item.website || '',
    phone: item.phone || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

async function useUpdateAllowance(ownerId) {
  const today = new Date().toISOString().slice(0, 10);
  const expiresAt = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;
  try {
    await documentClient.send(new UpdateCommand({
      TableName: tableName,
      Key: { ownerId: `RATE#${ownerId}#${today}` },
      UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :one, expiresAt = :expiresAt',
      ConditionExpression: 'attribute_not_exists(#count) OR #count < :limit',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':zero': 0, ':one': 1, ':limit': dailyUpdateLimit, ':expiresAt': expiresAt }
    }));
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') throw Object.assign(new Error('Daily update limit reached. Try again tomorrow.'), { statusCode: 429 });
    throw error;
  }
}

async function listDirectory() {
  if (directoryCache && directoryCache.expiresAt > Date.now()) return directoryCache.listings;
  const result = await documentClient.send(new QueryCommand({
    TableName: tableName,
    IndexName: 'directory-index',
    KeyConditionExpression: 'directoryPk = :published',
    ExpressionAttributeValues: { ':published': 'PUBLIC' },
    Limit: 100,
    ScanIndexForward: true
  }));
  const listings = (result.Items || []).map(publicListing);
  directoryCache = { listings, expiresAt: Date.now() + 60_000 };
  return listings;
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

async function getCivicEvents() {
  const now = Date.now();
  if (civicEventsCache?.expiresAt > now) return civicEventsCache.payload;
  const feeds = await Promise.all(civicEventFeeds.map(async ({ category, url }) => {
    const response = await fetch(url, { headers: { 'user-agent': 'MillbraeLocal/1.0 (+https://www.millbrae.ca/)' }, signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error(`${category} feed unavailable`);
    return parseIcalendar(await response.text(), category, now);
  }));
  const events = [...new Map(feeds.flat().map((event) => [event.id, event])).values()]
    .sort((left, right) => Date.parse(left.start) - Date.parse(right.start))
    .slice(0, 20);
  const payload = { events, updatedAt: new Date(now).toISOString(), source: 'City of Millbrae iCalendar feeds' };
  civicEventsCache = { payload, expiresAt: now + 5 * 60_000 };
  return payload;
}

async function getCivicNews() {
  const now = Date.now();
  if (civicNewsCache?.expiresAt > now) return civicNewsCache.payload;
  const response = await fetch(civicNewsFeed, { headers: { 'user-agent': 'MillbraeLocal/1.0 (+https://www.millbrae.ca/)' }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error('City news feed unavailable');
  const news = parseNewsRss(await response.text(), now).slice(0, 12);
  const payload = { news, updatedAt: new Date(now).toISOString(), source: 'City of Millbrae News Flash RSS' };
  civicNewsCache = { payload, expiresAt: now + 5 * 60_000 };
  return payload;
}

async function getCivicAgendas() {
  const now = Date.now();
  if (civicAgendaCache?.expiresAt > now) return civicAgendaCache.payload;
  const response = await fetch(civicAgendaFeed, { headers: { 'user-agent': 'MillbraeLocal/1.0 (+https://www.millbrae.ca/)' }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error('City agenda feed unavailable');
  const agendas = parseNewsRss(await response.text(), now).slice(0, 12);
  const payload = { agendas, updatedAt: new Date(now).toISOString(), source: 'City of Millbrae Agenda Center RSS' };
  civicAgendaCache = { payload, expiresAt: now + 5 * 60_000 };
  return payload;
}

async function getCivicAlerts() {
  const now = Date.now();
  if (civicAlertCache?.expiresAt > now) return civicAlertCache.payload;
  const response = await fetch(civicAlertFeed, { headers: { 'user-agent': 'MillbraeLocal/1.0 (+https://www.millbrae.ca/)' }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error('City alert feed unavailable');
  const alerts = parseNewsRss(await response.text(), now).slice(0, 8);
  const payload = { alerts, updatedAt: new Date(now).toISOString(), source: 'City of Millbrae Alert Center RSS' };
  civicAlertCache = { payload, expiresAt: now + 5 * 60_000 };
  return payload;
}

function normalizeBartResponse(data, receivedAt = Date.now()) {
  const station = asArray(data?.root?.station)[0];
  const departures = [];
  for (const train of asArray(station?.etd)) {
    for (const estimate of asArray(train.estimate)) {
      const rawMinutes = estimate.minutes || '';
      const minutes = Number(rawMinutes);
      departures.push({
        destination: train.destination || 'BART train',
        direction: estimate.direction || '',
        minutes: rawMinutes,
        departureAt: Number.isFinite(minutes)
          ? new Date(receivedAt + (minutes * 60_000)).toISOString()
          : (rawMinutes === 'Leaving' ? new Date(receivedAt).toISOString() : ''),
        platform: estimate.platform || '',
        color: estimate.color || '',
        delaySeconds: Number(estimate.delay || 0),
        cancelled: estimate.cancelflag === '1'
      });
    }
  }
  return { station: station?.name || 'Millbrae', departures };
}

async function getBartDepartures() {
  const response = await fetch('http://api.bart.gov/api/etd.aspx?cmd=etd&orig=MLBR&key=MW9S-E7SL-26DU-VV8V&json=y', {
    headers: { 'user-agent': 'MillbraeLocal/1.0 (+https://www.millbrae.ca/)' },
    signal: AbortSignal.timeout(2500)
  });
  if (!response.ok) throw new Error('BART live data unavailable');
  return normalizeBartResponse(await response.json(), Date.now());
}

function normalizeCaltrainResponse(data, direction) {
  const visits = asArray(data?.ServiceDelivery?.StopMonitoringDelivery?.MonitoredStopVisit);
  return visits.map((visit) => {
    const journey = visit.MonitoredVehicleJourney || {};
    const call = journey.MonitoredCall || {};
    return {
      direction,
      destination: call.DestinationDisplay || journey.DestinationName || 'Caltrain',
      line: journey.LineRef || '',
      expectedArrivalTime: call.ExpectedArrivalTime || call.AimedArrivalTime || '',
      expectedDepartureTime: call.ExpectedDepartureTime || call.AimedDepartureTime || '',
      vehicle: journey.VehicleRef || ''
    };
  });
}

async function getCaltrainDepartures() {
  if (!caltrainApiKey) throw new Error('Caltrain live data is not configured');
  const now = Date.now();
  if (caltrainMemoryCache?.expiresAt > now) return caltrainMemoryCache.payload;
  const cached = await documentClient.send(new GetCommand({
    TableName: tableName,
    Key: { ownerId: caltrainCacheKey }
  }));
  if (cached.Item?.payload && Number(cached.Item.expiresAt || 0) * 1000 > now) {
    caltrainMemoryCache = { payload: cached.Item.payload, expiresAt: Number(cached.Item.expiresAt) * 1000 };
    return cached.Item.payload;
  }
  const stops = [
    { stopCode: '70061', direction: 'Northbound' },
    { stopCode: '70062', direction: 'Southbound' }
  ];
  const feeds = await Promise.all(stops.map(async ({ stopCode, direction }) => {
    const url = new URL('https://api.511.org/transit/StopMonitoring');
    url.searchParams.set('api_key', caltrainApiKey);
    url.searchParams.set('agency', 'CT');
    url.searchParams.set('stopcode', stopCode);
    url.searchParams.set('format', 'json');
    const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error('Caltrain live data unavailable');
    return normalizeCaltrainResponse(await response.json(), direction);
  }));
  const payload = { station: 'Millbrae', departures: feeds.flat(), updatedAt: new Date(now).toISOString() };
  const expiresAt = Math.floor(now / 1000) + caltrainCacheSeconds;
  await documentClient.send(new PutCommand({
    TableName: tableName,
    Item: { ownerId: caltrainCacheKey, entityType: 'transit-cache', payload, expiresAt }
  }));
  caltrainMemoryCache = { payload, expiresAt: expiresAt * 1000 };
  return payload;
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  if (Buffer.byteLength(raw) > 10_000) throw Object.assign(new Error('Listing data is too large.'), { statusCode: 413 });
  try {
    return JSON.parse(raw);
  } catch {
    throw Object.assign(new Error('Listing data is invalid.'), { statusCode: 400 });
  }
}

export async function handler(event) {
  const method = event.requestContext?.http?.method || 'GET';
  const path = (event.rawPath || '/').replace(/\/+$/, '') || '/';
  try {
    if (method === 'GET' && path === '/listings') {
      return json(200, { listings: await listDirectory() }, { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });
    }

    if (method === 'GET' && path === '/transit/bart') {
      return json(200, { ...await getBartDepartures(), updatedAt: new Date().toISOString() }, { 'cache-control': 'public, max-age=30, stale-while-revalidate=60' });
    }

    if (method === 'GET' && path === '/transit/caltrain') {
      return json(200, await getCaltrainDepartures(), { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });
    }

    if (method === 'GET' && path === '/events') {
      return json(200, await getCivicEvents(), { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' });
    }

    if (method === 'GET' && path === '/news') {
      return json(200, await getCivicNews(), { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' });
    }

    if (method === 'GET' && path === '/agendas') {
      return json(200, await getCivicAgendas(), { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' });
    }

    if (method === 'GET' && path === '/alerts') {
      return json(200, await getCivicAlerts(), { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' });
    }

    if (method === 'GET' && path === '/me') {
      const identity = await authenticate(event);
      const result = await documentClient.send(new GetCommand({ TableName: tableName, Key: { ownerId: `LISTING#${identity.ownerId}` } }));
      return json(200, { listing: publicListing(result.Item) });
    }

    if (method === 'PUT' && path === '/listing') {
      const identity = await authenticate(event);
      const validation = validateListing(parseBody(event), identity.provider);
      if (!validation.valid) return json(400, { error: validation.errors.join(' ') });
      await useUpdateAllowance(identity.ownerId);
      const key = { ownerId: `LISTING#${identity.ownerId}` };
      const existing = await documentClient.send(new GetCommand({ TableName: tableName, Key: key }));
      const now = new Date().toISOString();
      const item = {
        ...key,
        ...validation.listing,
        entityType: 'listing',
        status: 'published',
        directoryPk: 'PUBLIC',
        directorySk: `${validation.listing.businessName.toLocaleLowerCase('en-US')}#${identity.ownerId}`,
        createdAt: existing.Item?.createdAt || now,
        updatedAt: now
      };
      await documentClient.send(new PutCommand({ TableName: tableName, Item: item }));
      directoryCache = null;
      return json(200, { listing: publicListing(item) });
    }

    if (method === 'DELETE' && path === '/listing') {
      const identity = await authenticate(event);
      await useUpdateAllowance(identity.ownerId);
      await documentClient.send(new DeleteCommand({ TableName: tableName, Key: { ownerId: `LISTING#${identity.ownerId}` } }));
      directoryCache = null;
      return json(200, { deleted: true });
    }

    return json(404, { error: 'Not found.' });
  } catch (error) {
    console.error(JSON.stringify({ name: error.name, message: error.message, path, method }));
    return json(error.statusCode || 500, { error: error.statusCode ? error.message : 'The service is temporarily unavailable.' });
  }
}
