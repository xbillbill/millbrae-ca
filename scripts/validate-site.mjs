import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const root = join(projectRoot, 'site');
const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html') && file !== 'dog-logo-bottom-preview.html').sort();
const failures = [];
const pages = new Map(htmlFiles.map((file) => [file, readFileSync(join(root, file), 'utf8')]));
const socialImageUrl = 'https://www.millbrae.ca/millbrae-sfo-social.jpg';
const socialImagePath = join(root, 'millbrae-sfo-social.jpg');

const fail = (file, message) => failures.push(`${file}: ${message}`);
const matches = (text, pattern) => [...text.matchAll(pattern)];

for (const [file, html] of pages) {
  if (!html.includes('analytics.js?v=20260822')) fail(file, 'missing analytics instrumentation');
  if (!html.includes('i18n.js?v=')) fail(file, 'missing i18n instrumentation');
  const titles = matches(html, /<title>[^<]+<\/title>/gi);
  const descriptions = matches(html, /<meta\s+name="description"\s+content="[^"]+">/gi);
  const canonicals = matches(html, /<link\s+rel="canonical"\s+href="https:\/\/www\.millbrae\.ca\/[^"]*">/gi);
  const h1s = matches(html, /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/gi);

  if (titles.length !== 1) fail(file, `expected one title, found ${titles.length}`);
  if (descriptions.length !== 1) fail(file, `expected one meta description, found ${descriptions.length}`);
  if (canonicals.length !== 1) fail(file, `expected one canonical URL, found ${canonicals.length}`);
  if (h1s.length !== 1) fail(file, `expected one h1, found ${h1s.length}`);
  if (!html.includes(`<meta property="og:image" content="${socialImageUrl}">`)) fail(file, 'missing canonical Open Graph image');
  if (!html.includes('<meta property="og:image:width" content="1200">')) fail(file, 'missing Open Graph image width');
  if (!html.includes('<meta property="og:image:height" content="630">')) fail(file, 'missing Open Graph image height');
  if (!html.includes('<meta name="twitter:card" content="summary_large_image">')) fail(file, 'missing large Twitter card');
  if (!html.includes(`<meta name="twitter:image" content="${socialImageUrl}">`)) fail(file, 'missing Twitter image');
  if (!html.includes('<meta name="twitter:image:alt" content="')) fail(file, 'missing Twitter image alt text');

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

    const [rawPath, hash] = raw.split('#');
    const pathPart = rawPath.split('?')[0];
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

if (!existsSync(socialImagePath)) {
  fail('millbrae-sfo-social.jpg', 'missing social preview asset');
} else if (statSync(socialImagePath).size > 500_000) {
  fail('millbrae-sfo-social.jpg', 'social preview asset exceeds 500 KB');
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

const parkFlyFile = 'sfo-park-and-fly-hotel-calculator.html';
const inboundParkFlyLinks = [...pages.entries()].filter(([file, html]) => file !== parkFlyFile && html.includes(`href="${parkFlyFile}`));
if (inboundParkFlyLinks.length < 3) fail(parkFlyFile, `expected at least 3 internal entry points, found ${inboundParkFlyLinks.length}`);

const stationGuideHtml = pages.get('millbrae-station-sfo-guide.html') || '';
for (const requiredTransitSignal of ['id="live-transit"', 'data-transit-board', 'data-caltrain-departures', 'transit-live.js', 'https://www.caltrain.com/stops']) {
  if (!stationGuideHtml.includes(requiredTransitSignal)) fail('millbrae-station-sfo-guide.html', `missing live transit signal: ${requiredTransitSignal}`);
}

const civicEventsHtml = pages.get('millbrae-civic-events-news.html') || '';
for (const requiredCivicEventSignal of ['data-civic-events', 'civic-events.js', 'data-civic-news', 'civic-news.js', 'data-civic-agendas', 'civic-agendas.js', 'https://www.ci.millbrae.ca.us/calendar.aspx', 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx', 'https://www.ci.millbrae.ca.us/AgendaCenter', 'https://www.millbraeschooldistrict.org/Calendar', 'https://www.smcl.org/events/']) {
  if (!civicEventsHtml.includes(requiredCivicEventSignal)) fail('millbrae-civic-events-news.html', `missing civic events signal: ${requiredCivicEventSignal}`);
}
if (!civicEventsHtml.includes('data-event-search')) fail('millbrae-civic-events-news.html', 'missing live event search control');
const communityNewsHtml = pages.get('millbrae-community-news.html') || '';
for (const requiredCommunityNewsSignal of ['data-civic-news', 'civic-news.js', 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx']) {
  if (!communityNewsHtml.includes(requiredCommunityNewsSignal)) fail('millbrae-community-news.html', `missing live community-news signal: ${requiredCommunityNewsSignal}`);
}
const resourcesHtml = pages.get('millbrae-public-resources.html') || '';
for (const requiredAlertSignal of ['data-civic-alerts', 'civic-alerts.js', 'https://www.ci.millbrae.ca.us/AlertCenter.aspx']) {
  if (!resourcesHtml.includes(requiredAlertSignal)) fail('millbrae-public-resources.html', `missing public alert signal: ${requiredAlertSignal}`);
}
const homepageHtml = pages.get('index.html') || '';
for (const requiredHomepageEventSignal of ['data-civic-events', 'civic-events.js', 'data-civic-news', 'civic-news.js', 'millbrae-civic-events-news.html']) {
  if (!homepageHtml.includes(requiredHomepageEventSignal)) fail('index.html', `missing homepage events signal: ${requiredHomepageEventSignal}`);
}

const rideshareFile = 'sfo-parking-vs-rideshare-calculator.html';
const inboundRideshareLinks = [...pages.entries()].filter(([file, html]) => file !== rideshareFile && html.includes(`href="${rideshareFile}`));
if (inboundRideshareLinks.length < 3) fail(rideshareFile, `expected at least 3 internal entry points, found ${inboundRideshareLinks.length}`);

const earlyFlightFile = 'sfo-early-flight-hotel-calculator.html';
const inboundEarlyFlightLinks = [...pages.entries()].filter(([file, html]) => file !== earlyFlightFile && html.includes(`href="${earlyFlightFile}`));
if (inboundEarlyFlightLinks.length < 3) fail(earlyFlightFile, `expected at least 3 internal entry points, found ${inboundEarlyFlightLinks.length}`);

const layoverFile = 'sfo-layover-hotel-calculator.html';
const inboundLayoverLinks = [...pages.entries()].filter(([file, html]) => file !== layoverFile && html.includes(`href="${layoverFile}`));
if (inboundLayoverLinks.length < 3) fail(layoverFile, `expected at least 3 internal entry points, found ${inboundLayoverLinks.length}`);

const parkingDiscountFile = 'sfo-parking-promo-code-calculator.html';
const inboundParkingDiscountLinks = [...pages.entries()].filter(([file, html]) => file !== parkingDiscountFile && html.includes(`href="${parkingDiscountFile}`));
if (inboundParkingDiscountLinks.length < 3) fail(parkingDiscountFile, `expected at least 3 internal entry points, found ${inboundParkingDiscountLinks.length}`);
const parkingDiscountHtml = pages.get(parkingDiscountFile) || '';
const discountPresets = new Map([[3, '$41.90'], [5, '$59.71'], [7, '$94.28'], [8, '$99.51'], [10, '$125.70'], [14, '$188.55']]);
for (const [days, total] of discountPresets) {
  if (!parkingDiscountHtml.includes(`data-offer-stay="${days}"`)) fail(parkingDiscountFile, `missing ${days}-day official offer row`);
  if (!parkingDiscountHtml.includes(`<strong>${total}</strong>`)) fail(parkingDiscountFile, `missing ${days}-day offer subtotal ${total}`);
}
if (!parkingDiscountHtml.includes('name="percentOff" type="number" min="0" max="100" step="1" value="5"')) fail(parkingDiscountFile, 'default offer must use the eligible 5-day 2-free + 5% terms');

const toolsFile = 'sfo-tools.html';
const toolsHtml = pages.get(toolsFile) || '';
const requiredTools = [
  'sfo-parking-promo-code-calculator.html',
  'sfo-layover-hotel-calculator.html',
  'sfo-early-flight-hotel-calculator.html',
  'sfo-parking-vs-rideshare-calculator.html',
  'sfo-airport-parking-millbrae.html',
  'sfo-park-and-fly-hotel-calculator.html',
  'millbrae-hotels-sfo-shuttle.html',
  'hotels-near-sfo-millbrae.html',
  'millbrae-station-sfo-guide.html'
];
for (const requiredTool of requiredTools) {
  if (!toolsHtml.includes(`href="${requiredTool}"`)) fail(toolsFile, `missing tool link ${requiredTool}`);
}
const inboundToolsLinks = [...pages.entries()].filter(([file, html]) => file !== toolsFile && html.includes(`href="${toolsFile}`));
if (inboundToolsLinks.length < 8) fail(toolsFile, `expected at least 8 internal entry points, found ${inboundToolsLinks.length}`);

const advertiseHtml = pages.get('advertise.html') || '';
if (!advertiseHtml.includes('data-sponsor-fit-tool')) fail('advertise.html', 'missing sponsor-fit recommender');
if (!advertiseHtml.includes('data-sponsor-preview-tool')) fail('advertise.html', 'missing sponsor preview');
if (!advertiseHtml.includes('href="list-your-business.html"')) fail('advertise.html', 'free listing must use self-service flow');

const directoryHtml = pages.get('community.html') || '';
if (!directoryHtml.includes('data-listing-grid')) fail('community.html', 'missing dynamic listing directory');
if (!directoryHtml.includes('src="community-listings.js')) fail('community.html', 'missing directory controller');
for (const requiredDirectorySearchSignal of ['data-listing-search', 'data-listing-category', 'data-directory-filters']) {
  if (!directoryHtml.includes(requiredDirectorySearchSignal)) fail('community.html', `missing directory search signal: ${requiredDirectorySearchSignal}`);
}

const listingFormHtml = pages.get('list-your-business.html') || '';
if (!listingFormHtml.includes('data-provider-buttons')) fail('list-your-business.html', 'missing social sign-in controls');
if (!listingFormHtml.includes('data-listing-form')) fail('list-your-business.html', 'missing self-service listing form');
if (!listingFormHtml.includes('name="authorizedToList"')) fail('list-your-business.html', 'missing representative attestation');
if (!listingFormHtml.includes('name="accurateAndLawful"')) fail('list-your-business.html', 'missing content attestation');
if (/mailto:/i.test(listingFormHtml)) fail('list-your-business.html', 'self-service flow must not depend on email');
if (/type="email"/i.test(listingFormHtml)) fail('list-your-business.html', 'self-service flow must not collect email');

const homeHtml = pages.get('index.html') || '';
for (const requiredLocalSignal of ['Millbrae, California', 'Bay Area', 'addressCountry":"US', 'data-millbrae-time', 'independent editor', 'href="#about"']) {
  if (!homeHtml.includes(requiredLocalSignal)) fail('index.html', `missing homepage local/trust signal: ${requiredLocalSignal}`);
}
if (!homeHtml.includes('src="homepage.js')) fail('index.html', 'missing Millbrae local-time controller');
if (!homeHtml.includes('$27/day')) fail('index.html', 'missing SFO Long-Term homepage micro-data');

const storiesHtml = pages.get('millbrae-stories.html') || '';
if ((storiesHtml.match(/class="story-card"/g) || []).length !== 11) fail('millbrae-stories.html', 'story archive count must match its eleven-story heading');
for (const requiredStory of ['millbrae-story-public-space.html', 'millbrae-story-businesses.html', 'millbrae-story-neighborhoods.html', 'millbrae-story-public-resources.html', 'millbrae-story-school-community.html']) {
  if (!storiesHtml.includes(`href="${requiredStory}"`)) fail('millbrae-stories.html', `missing story archive link ${requiredStory}`);
}
if (storiesHtml.includes('Next research threads include school-community history, neighborhood memory')) fail('millbrae-stories.html', 'story archive contains stale neighborhood future-work copy');
if (!storiesHtml.includes('history, rail, neighborhoods, schools, businesses, public resources, culture')) fail('millbrae-stories.html', 'story archive metadata does not describe current coverage');
const schoolCommunityInbound = [...pages.entries()].filter(([file, html]) => file !== 'millbrae-story-school-community.html' && html.includes('href="millbrae-story-school-community.html"'));
if (schoolCommunityInbound.length < 3) fail('millbrae-story-school-community.html', `expected at least 3 internal entry points, found ${schoolCommunityInbound.length}`);

const sourcesHtml = pages.get('millbrae-sources.html') || '';
for (const requiredCoverageSignal of ['COVERAGE MAP', 'Facts and geography', 'Schools and families', 'Neighborhoods and planning', 'Civic government and participation', 'Civic news and events', 'Public resources and alerts', 'Weather and local conditions', 'Editorial stories and glossary']) {
  if (!sourcesHtml.includes(requiredCoverageSignal)) fail('millbrae-sources.html', `missing coverage-map subject: ${requiredCoverageSignal}`);
}
const historyHtml = pages.get('millbrae-history-culture.html') || '';
for (const requiredHistorySignal of ['A COMPACT TIMELINE', 'aria-label="Millbrae history timeline"', 'https://www.caltrain.com/about-caltrain/caltrain-history/historic-stations/millbrae-1978', 'https://www.bart.gov/sites/default/files/docs/FINALMillbrae_Statn_Acc_Circ_Plan07262016.pdf']) {
  if (!historyHtml.includes(requiredHistorySignal)) fail('millbrae-history-culture.html', `missing history timeline signal: ${requiredHistorySignal}`);
}
for (const requiredCorrectionSignal of ['CORRECTIONS · SOURCE LEADS', 'A correction needs a checkable trail.', 'Millbrae Local correction protocol', 'list-your-business.html', 'millbrae-community-news.html']) {
  if (!sourcesHtml.includes(requiredCorrectionSignal)) fail('millbrae-sources.html', `missing correction protocol signal: ${requiredCorrectionSignal}`);
}

const awsConfig = readFileSync(join(root, 'aws-config.js'), 'utf8');
for (const setting of ['enabled', 'apiBaseUrl', 'googleClientId']) {
  if (!awsConfig.includes(setting)) fail('aws-config.js', `missing ${setting} configuration`);
}

const infrastructurePath = join(projectRoot, 'infrastructure', 'template.yaml');
if (!existsSync(infrastructurePath)) {
  fail('infrastructure/template.yaml', 'missing AWS self-service stack');
} else {
  const infrastructure = readFileSync(infrastructurePath, 'utf8');
  if (!/BillingMode: PROVISIONED[\s\S]*ReadCapacityUnits: 1[\s\S]*WriteCapacityUnits: 1/.test(infrastructure)) fail('infrastructure/template.yaml', 'DynamoDB must stay provisioned at 1 read and 1 write unit');
  if (!infrastructure.includes('ReservedConcurrentExecutions: 2')) fail('infrastructure/template.yaml', 'missing Lambda concurrency guardrail');
  if (infrastructure.includes('AWS::Cognito')) fail('infrastructure/template.yaml', 'direct Google SSO should not provision Cognito');
  if (!infrastructure.includes('RetentionInDays: 3')) fail('infrastructure/template.yaml', 'missing short log retention');
}

const parkingHtml = pages.get('sfo-airport-parking-millbrae.html') || '';
if (!parkingHtml.includes('<title>SFO Parking Cost: 3, 5, 7 &amp; 14 Days + Calculator (2026)</title>')) fail('sfo-airport-parking-millbrae.html', 'missing exact-duration search title');
if (!parkingHtml.includes('<h1>How much does SFO parking cost?</h1>')) fail('sfo-airport-parking-millbrae.html', 'missing direct cost question heading');
if (!parkingHtml.includes('"@type":"WebApplication","name":"SFO Parking Cost Calculator"')) fail('sfo-airport-parking-millbrae.html', 'missing calculator structured data');
const durationTotals = new Map([[1, '$27.00'], [3, '$81.00'], [5, '$135.00'], [7, '$189.00'], [10, '$270.00'], [14, '$378.00']]);
for (const [days, total] of durationTotals) {
  if (!parkingHtml.includes(`data-parking-days="${days}" data-sfo-total="${total}"`)) fail('sfo-airport-parking-millbrae.html', `missing ${days}-day SFO total ${total}`);
}

if (failures.length) {
  console.error(`Site validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site validation: OK (${htmlFiles.length} pages, ${sitemapUrls.length} sitemap URLs)`);
