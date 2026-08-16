import { readFile } from 'node:fs/promises';

const key = process.env.INDEXNOW_KEY;
const host = 'www.millbrae.ca';
const endpoint = 'https://api.indexnow.org/indexnow';

if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error('INDEXNOW_KEY must be 8–128 letters, numbers, or dashes.');
}

const sitemap = await readFile(new URL('../site/sitemap.xml', import.meta.url), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/www\.millbrae\.ca\/[^<]*)<\/loc>/g)].map((match) => match[1]);

if (urlList.length === 0) {
  throw new Error('No millbrae.ca URLs found in site/sitemap.xml.');
}

const payload = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList,
};

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const responseBody = await response.text();
  throw new Error(`IndexNow returned HTTP ${response.status}: ${responseBody}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with HTTP ${response.status}.`);
