const asNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateParkingTotals(values) {
  const parkingPeriods = asNonNegativeNumber(values.parkingPeriods);
  const bartChargedDays = asNonNegativeNumber(values.bartChargedDays);
  const travelers = asNonNegativeNumber(values.travelers);
  const bartParkingRate = asNonNegativeNumber(values.bartParkingRate);
  const bartFareOneWay = asNonNegativeNumber(values.bartFareOneWay);
  const sfoRate = asNonNegativeNumber(values.sfoRate);
  const privateRate = asNonNegativeNumber(values.privateRate);
  const privateFees = asNonNegativeNumber(values.privateFees);
  const hasQuote = values.quoteTotal !== '' && values.quoteTotal !== null && values.quoteTotal !== undefined;

  return {
    bart: roundCurrency((bartChargedDays * bartParkingRate) + (travelers * bartFareOneWay * 2)),
    sfo: roundCurrency(parkingPeriods * sfoRate),
    privateBase: roundCurrency((parkingPeriods * privateRate) + privateFees),
    quote: hasQuote ? roundCurrency(asNonNegativeNumber(values.quoteTotal)) : null,
  };
}

const form = typeof document === 'undefined' ? null : document.querySelector('#parking-calculator');

if (form) {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const note = document.querySelector('#calculation-note');

  const update = () => {
    const data = Object.fromEntries(new FormData(form));
    const totals = calculateParkingTotals(data);

    for (const [name, total] of Object.entries(totals)) {
      const output = form.querySelector(`[data-result="${name}"]`);
      output.textContent = total === null ? 'Enter quote' : currency.format(total);
    }

    note.textContent = `Using ${data.parkingPeriods || 0} parking periods, ${data.bartChargedDays || 0} BART charged days, and ${data.travelers || 0} travelers.`;
  };

  form.addEventListener('input', update);
  update();
}
