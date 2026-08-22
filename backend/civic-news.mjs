function decodeXml(value = '') {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function cleanText(value = '') {
  return decodeXml(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}

function tagValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeXml(match[1]).trim() : '';
}

function normalizeNewsUrl(value = '') {
  try {
    const url = new URL(value, 'https://www.ci.millbrae.ca.us');
    return url.protocol === 'https:' && url.hostname === 'www.ci.millbrae.ca.us'
      ? url.href
      : 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx';
  } catch {
    return 'https://www.ci.millbrae.ca.us/CivicAlerts.aspx';
  }
}

export function parseNewsRss(text, now = Date.now()) {
  const items = String(text).match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return items.map((item) => {
    const title = cleanText(tagValue(item, 'title'));
    const link = normalizeNewsUrl(tagValue(item, 'link'));
    const summary = cleanText(tagValue(item, 'description'));
    const published = new Date(tagValue(item, 'pubDate'));
    return {
      id: tagValue(item, 'guid') || link,
      title,
      summary,
      publishedAt: Number.isFinite(published.getTime()) ? published.toISOString() : '',
      url: link
    };
  }).filter((item) => item.title && item.url && (!item.publishedAt || Date.parse(item.publishedAt) <= now))
    .sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0));
}
