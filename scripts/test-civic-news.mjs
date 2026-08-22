import assert from 'node:assert/strict';
import { parseNewsRss } from '../backend/civic-news.mjs';

const now = Date.parse('2026-08-21T22:00:00Z');
const feed = `<?xml version="1.0"?><rss><channel><item><title>Back-to-School &amp; Safety</title><link>https://www.ci.millbrae.ca.us/CivicAlerts.aspx?aid=168</link><pubDate>Wed, 12 Aug 2026 14:37:56 -0800</pubDate><description><![CDATA[Slow down &amp; watch <strong>crosswalks</strong>.]]></description><guid>news-168</guid></item><item><title>Future item</title><link>https://www.ci.millbrae.ca.us/CivicAlerts.aspx?aid=999</link><pubDate>Sat, 22 Aug 2026 00:00:00 -0800</pubDate><description>Not yet.</description></item></channel></rss>`;
const news = parseNewsRss(feed, now);
assert.equal(news.length, 1);
assert.equal(news[0].title, 'Back-to-School & Safety');
assert.equal(news[0].summary, 'Slow down & watch crosswalks.');
assert.equal(news[0].url, 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx?aid=168');
assert.equal(news[0].id, 'news-168');
console.log('Civic news parser tests: OK');
