// Privacy-safe behavior analytics for Millbrae Local.
// No form values, identity tokens, or personal identifiers are sent.
const CLARITY_PROJECT_ID = 'y5p3epdxnr';
const CLOUDFLARE_ANALYTICS_TOKEN = 'df3ca436f8a84b30af5a85de11ec2023';

window.clarity = window.clarity || function (...args) {
  (window.clarity.q = window.clarity.q || []).push(args);
};

const script = document.createElement('script');
script.async = true;
script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
document.head.append(script);

const cloudflareScript = document.createElement('script');
cloudflareScript.type = 'module';
cloudflareScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
cloudflareScript.dataset.cfBeacon = JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN });
document.head.append(cloudflareScript);

function eventNameForLink(link) {
  const href = link.getAttribute('href') || '';
  if (href.includes('list-your-business')) return 'listing_cta_click';
  if (href.includes('advertise')) return 'advertiser_cta_click';
  if (href.includes('transit') || href.includes('bart.gov') || href.includes('caltrain.com')) return 'transit_link_click';
  if (href.includes('calculator') || href.includes('sfo-tools')) return 'sfo_tool_click';
  if (href.includes('restaurants-in-millbrae')) return 'restaurant_guide_click';
  return null;
}

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a');
  if (!link) return;
  const eventName = eventNameForLink(link);
  if (eventName) window.clarity('event', eventName);
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.matches('form')) window.clarity('event', 'form_submit_attempt');
});

document.querySelectorAll('button, input, textarea, select').forEach((control) => {
  control.setAttribute('data-clarity-mask', 'true');
});

window.clarity('set', 'site_section', location.pathname.split('/').pop() || 'home');
