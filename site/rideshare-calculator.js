const asNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateRideshareComparison(values = {}) {
  const parkingDays = asNonNegativeNumber(values.parkingDays);
  const parkingRate = asNonNegativeNumber(values.parkingRate);
  const parkingDiscount = asNonNegativeNumber(values.parkingDiscount);
  const drivingExtras = asNonNegativeNumber(values.drivingExtras);
  const outboundFare = asNonNegativeNumber(values.outboundFare);
  const returnFare = asNonNegativeNumber(values.returnFare);
  const tipPercent = asNonNegativeNumber(values.tipPercent);
  const quotedFares = outboundFare + returnFare;
  const parking = roundCurrency(Math.max(0, (parkingDays * parkingRate) - parkingDiscount) + drivingExtras);
  const rideshare = roundCurrency(quotedFares * (1 + (tipPercent / 100)));
  const signedDifference = roundCurrency(parking - rideshare);
  const difference = Math.abs(signedDifference);
  const winner = Math.abs(signedDifference) < 0.01 ? 'tie' : signedDifference < 0 ? 'parking' : 'rideshare';
  const breakEvenDays = parkingRate > 0
    ? Math.max(0, (rideshare - drivingExtras + parkingDiscount) / parkingRate)
    : null;
  const rideshareWinsDay = breakEvenDays === null ? null : Math.floor(breakEvenDays + 1e-9) + 1;

  return {
    parking,
    rideshare,
    quotedFares: roundCurrency(quotedFares),
    difference,
    winner,
    breakEvenDays: breakEvenDays === null ? null : Math.round(breakEvenDays * 10) / 10,
    rideshareWinsDay
  };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('[data-rideshare-calculator]');

  if (form) {
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const verdict = form.querySelector('[data-rideshare-verdict]');
    const summary = form.querySelector('[data-rideshare-summary]');
    const resultLabel = form.querySelector('[data-result-label]');
    const breakEvenLabel = form.querySelector('[data-break-even-label]');

    const update = () => {
      const data = Object.fromEntries(new FormData(form));
      const result = calculateRideshareComparison(data);
      form.querySelector('[data-result="parking"]').textContent = currency.format(result.parking);
      form.querySelector('[data-result="rideshare"]').textContent = currency.format(result.rideshare);
      form.querySelector('[data-result="difference"]').textContent = currency.format(result.difference);
      form.querySelector('[data-result="breakEven"]').textContent = result.breakEvenDays === null ? 'No break-even' : `${result.breakEvenDays.toFixed(1)} days`;

      if (result.winner === 'tie') {
        verdict.textContent = 'The two options cost the same with these inputs.';
        resultLabel.textContent = 'The totals are equal';
      } else {
        const winnerLabel = result.winner === 'parking' ? 'Drive + park' : 'Rideshare';
        verdict.textContent = `${winnerLabel} costs ${currency.format(result.difference)} less for this trip.`;
        resultLabel.textContent = `${winnerLabel} costs less`;
      }
      verdict.dataset.state = result.winner;

      breakEvenLabel.textContent = result.rideshareWinsDay === null
        ? 'A zero parking rate has no day-based break-even'
        : `Rideshare starts winning on day ${result.rideshareWinsDay}`;
      summary.textContent = `${data.parkingDays || 0} parking periods at ${currency.format(asNonNegativeNumber(data.parkingRate))}; ${currency.format(result.quotedFares)} in ride quotes before tip.`;
    };

    form.addEventListener('input', update);
    update();
  }
}
