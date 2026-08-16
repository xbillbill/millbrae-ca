const BUSINESSES = Object.freeze({
  hotel: Object.freeze({
    primary: Object.freeze({ label: 'Hotels near SFO', href: 'hotels-near-sfo-millbrae.html' }),
    alternates: Object.freeze(['Early-flight hotel calculator', 'Hotel shuttle guide', 'Park-and-fly calculator', 'SFO travel tools hub']),
    context: 'hotels',
    reason: 'Start beside travelers comparing where to stay, then expand only if another decision page proves relevant.'
  }),
  parking: Object.freeze({
    primary: Object.freeze({ label: 'SFO parking calculator', href: 'sfo-airport-parking-millbrae.html' }),
    alternates: Object.freeze(['Parking vs rideshare', 'Park-and-fly calculator', 'SFO travel tools hub']),
    context: 'parking',
    reason: 'Start beside a live parking-cost comparison, where a rate, transfer detail, or promotion can answer the decision directly.'
  }),
  restaurant: Object.freeze({
    primary: Object.freeze({ label: 'Restaurant guide', href: 'restaurants-in-millbrae.html' }),
    alternates: Object.freeze(['Station & SFO guide', 'SFO travel tools hub']),
    context: 'dining',
    reason: 'Start beside diners choosing a meal. A concise offer and direct ordering or reservation link are the clearest fit.'
  }),
  transport: Object.freeze({
    primary: Object.freeze({ label: 'Hotel shuttle guide', href: 'millbrae-hotels-sfo-shuttle.html' }),
    alternates: Object.freeze(['Parking vs rideshare', 'Station & SFO guide', 'SFO travel tools hub']),
    context: 'shuttle',
    reason: 'Start where travelers are comparing airport transfers, then use broader travel placement only when the service area fits.'
  }),
  local: Object.freeze({
    primary: Object.freeze({ label: 'Station & SFO guide', href: 'millbrae-station-sfo-guide.html' }),
    alternates: Object.freeze(['Restaurant guide', 'SFO travel tools hub']),
    context: 'station',
    reason: 'Start with the guide closest to the customer problem you solve; editorial fit is confirmed before anything is published.'
  })
});

const GOALS = Object.freeze({
  single: Object.freeze({
    plan: 'Founding feature',
    price: '$99 / month',
    summary: 'One prominent, clearly labeled placement at a focused customer decision.'
  }),
  category: Object.freeze({
    plan: 'Category sponsor',
    price: '$249 / month',
    summary: 'One relevant business category reserved across an agreed scope, with exact pages confirmed before publishing.'
  }),
  listing: Object.freeze({
    plan: 'Community listing',
    price: '$0',
    summary: 'An editorially reviewed business name and direct link, without paid placement or guaranteed inclusion.'
  })
});

export function getSponsorFit(input = {}) {
  const business = BUSINESSES[input.business] || BUSINESSES.hotel;
  const goal = GOALS[input.goal] || GOALS.single;
  return {
    plan: goal.plan,
    price: goal.price,
    summary: goal.summary,
    primary: { ...business.primary },
    alternates: [...business.alternates],
    context: business.context,
    reason: business.reason
  };
}

if (typeof document !== 'undefined') {
  const tool = document.querySelector('[data-sponsor-fit-tool]');

  if (tool) {
    const inputs = Object.fromEntries(
      [...tool.querySelectorAll('[data-fit-input]')].map((input) => [input.dataset.fitInput, input])
    );
    const outputs = {
      plan: document.querySelector('[data-fit-plan]'),
      price: document.querySelector('[data-fit-price]'),
      summary: document.querySelector('[data-fit-summary]'),
      primary: document.querySelector('[data-fit-primary]'),
      alternates: document.querySelector('[data-fit-alternates]'),
      reason: document.querySelector('[data-fit-reason]')
    };
    let current = getSponsorFit();

    const render = () => {
      current = getSponsorFit(Object.fromEntries(
        Object.entries(inputs).map(([key, input]) => [key, input.value])
      ));
      outputs.plan.textContent = current.plan;
      outputs.price.textContent = current.price;
      outputs.summary.textContent = current.summary;
      outputs.primary.textContent = `${current.primary.label} →`;
      outputs.primary.href = current.primary.href;
      outputs.alternates.textContent = current.alternates.join(' · ');
      outputs.reason.textContent = current.reason;
    };

    tool.addEventListener('input', render);
    tool.addEventListener('change', render);
    document.querySelector('[data-apply-fit]')?.addEventListener('click', () => {
      const previewContext = document.querySelector('[data-preview-input="context"]');
      if (previewContext) {
        previewContext.value = current.context;
        previewContext.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelector('#preview')?.scrollIntoView({ behavior: 'smooth' });
    });
    render();
  }
}
