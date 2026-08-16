import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'site');
const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const failures = [];
const pages = new Map(htmlFiles.map((file) => [file, readFileSync(join(root, file), 'utf8')]));

const fail = (file, message) => failures.push(`${file}: ${message}`);
const matches = (text, pattern) => [...text.matchAll(pattern)];

for (const [file, html] of pages) {
  const titles = matches(html, /<title>[^<]+<\/title>/gi);
  const descriptions = matches(html, /<meta\s+name="description"\s+content="[^"]+">/gi);
  const canonicals = matches(html, /<link\s+rel="canonical"\s+href="https:\/\/www\.millbrae\.ca\/[^"]*">/gi);
  const h1s = matches(html, /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi);

  if (titles.length !== 1) fail(file, `expected one title, found ${titles.length}`);
  if (descriptions.length !== 1) fail(file, `expected one meta description, found ${descriptions.length}`);
  if (canonicals.length !== 1) fail(file, `expected one canonical URL, found ${canonicals.length}`);
  if (h1s.length !== 1) fail(file, `expected one h1, found ${h1s.length}`);

  const ids = matches(html, /\sid="([^"]+)"/gi).map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) fail(file, `duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);

  for (const script of matches(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      fail(file, `invalid JSON-LD: ${error.message}`);
    }
  }

  for (const link of matches(html, /(?:href|src)="([^"]+)"/gi)) {
    const raw = link[1];
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(raw)) continue;

    const [pathPart, hash] = raw.split('#');
    const targetFile = pathPart || file;
    const targetPath = resolve(dirname(join(root, file)), targetFile);
    if (!existsSync(targetPath)) {
      fail(file, `missing local target ${raw}`);
      continue;
    }

    if (hash && targetFile.endsWith('.html')) {
      const targetHtml = readFileSync(targetPath, 'utf8');
      const escapedHash = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\sid="${escapedHash}"`).test(targetHtml)) fail(file, `missing anchor ${raw}`);
    }
  }
}

const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = matches(sitemap, /<loc>https:\/\/www\.millbrae\.ca\/([^<]*)<\/loc>/g).map((match) => match[1]);
for (const urlPath of sitemapUrls) {
  const file = urlPath || 'index.html';
  if (!pages.has(file)) fail('sitemap.xml', `URL has no HTML file: /${urlPath}`);
}
for (const file of htmlFiles) {
  if (!sitemapUrls.includes(file === 'index.html' ? '' : file)) fail('sitemap.xml', `missing ${file}`);
}

const shuttleFile = 'millbrae-hotels-sfo-shuttle.html';
const inboundShuttleLinks = [...pages.entries()].filter(([file, html]) => file !== shuttleFile && html.includes(`href="${shuttleFile}`));
if (inboundShuttleLinks.length < 3) fail(shuttleFile, `expected at least 3 internal entry points, found ${inboundShuttleLinks.length}`);

if (failures.length) {
  console.error(`Site validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site validation: OK (${htmlFiles.length} pages, ${sitemapUrls.length} sitemap URLs)`);
