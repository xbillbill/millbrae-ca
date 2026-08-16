import { createPublicKey, verify as verifySignature } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ALLOWED_PROVIDERS, validateListing } from './policy.mjs';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true }
});
const tableName = process.env.TABLE_NAME;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const issuers = new Set(['accounts.google.com', 'https://accounts.google.com']);
const dailyUpdateLimit = Number(process.env.DAILY_UPDATE_LIMIT || 10);
let jwksCache = null;
let directoryCache = null;

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
