const DEFAULTS = Object.freeze({
  business: 'Your Millbrae Business',
  offer: 'A clear reason for nearby customers to choose you.',
  cta: 'View this offer',
  context: 'PARKING CALCULATOR'
});

const LIMITS = Object.freeze({ business: 50, offer: 90, cta: 28 });

const CONTEXTS = Object.freeze({
  parking: 'PARKING CALCULATOR',
  hotels: 'HOTEL GUIDE',
  dining: 'RESTAURANT GUIDE',
  station: 'STATION & SFO GUIDE'
});

function normalize(value, fallback, limit) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  return (normalized || fallback).slice(0, limit);
}

export function buildSponsorPreview(input = {}) {
  return {
    business: normalize(input.business, DEFAULTS.business, LIMITS.business),
    offer: normalize(input.offer, DEFAULTS.offer, LIMITS.offer),
    cta: normalize(input.cta, DEFAULTS.cta, LIMITS.cta),
    context: CONTEXTS[input.context] || DEFAULTS.context
  };
}

if (typeof document !== 'undefined') {
  const tool = document.querySelector('[data-sponsor-preview-tool]');

  if (tool) {
    const inputs = Object.fromEntries(
      [...tool.querySelectorAll('[data-preview-input]')].map((input) => [input.dataset.previewInput, input])
    );
    const outputs = {
      business: document.querySelector('[data-preview-business]'),
      offer: document.querySelector('[data-preview-offer]'),
      cta: document.querySelector('[data-preview-cta]'),
      context: document.querySelector('[data-preview-context]')
    };

    const render = () => {
      const preview = buildSponsorPreview(Object.fromEntries(
        Object.entries(inputs).map(([key, input]) => [key, input.value])
      ));
      Object.entries(outputs).forEach(([key, output]) => {
        if (output) output.textContent = preview[key];
      });
    };

    tool.addEventListener('input', render);
    tool.addEventListener('change', render);
    render();
  }
}
