const nonNegative = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
};

const optionalAmount = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return nonNegative(value);
};

export function calculateParkingDiscount(values = {}) {
  const parkingDays = Math.max(1, Math.ceil(nonNegative(values.parkingDays, 5)));
  const dailyRate = nonNegative(values.dailyRate, 20.95);
  const freeDays = Math.min(parkingDays, Math.floor(nonNegative(values.freeDays, 2)));
  const percentOff = Math.min(100, nonNegative(values.percentOff, 10));
  const taxesAndFees = nonNegative(values.taxesAndFees);
  const finalQuote = optionalAmount(values.finalQuote);
  const paidDays = parkingDays - freeDays;
  const baseSubtotal = parkingDays * dailyRate;
  const paidDaySubtotal = paidDays * dailyRate;
  const percentSavings = paidDaySubtotal * (percentOff / 100);
  const couponSubtotal = paidDaySubtotal - percentSavings;
  const baseTotal = baseSubtotal + taxesAndFees;
  const couponEstimate = couponSubtotal + taxesAndFees;
  const estimatedSavings = baseTotal - couponEstimate;
  const effectiveDailyRate = couponEstimate / parkingDays;
  const quoteSavings = finalQuote === null ? null : baseTotal - finalQuote;
  const quoteVsEstimate = finalQuote === null ? null : finalQuote - couponEstimate;

  return {
    parkingDays,
    dailyRate,
    freeDays,
    paidDays,
    percentOff,
    taxesAndFees,
    finalQuote,
    baseSubtotal,
    baseTotal,
    percentSavings,
    couponEstimate,
    estimatedSavings,
    effectiveDailyRate,
    quoteSavings,
    quoteVsEstimate
  };
}

const calculator = typeof document === 'undefined'
  ? null
  : document.querySelector('[data-parking-discount-calculator]');

if (calculator) {
  const money = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(value);

  const render = () => {
    const result = calculateParkingDiscount(Object.fromEntries(new FormData(calculator)));
    const results = {
      base: money(result.baseTotal),
      estimate: money(result.couponEstimate),
      savings: money(result.estimatedSavings),
      effective: money(result.effectiveDailyRate),
      quote: result.finalQuote === null ? 'Enter checkout quote' : money(result.finalQuote)
    };
    Object.entries(results).forEach(([name, value]) => {
      const output = calculator.querySelector(`[data-result="${name}"]`);
      output.value = value;
      output.textContent = value;
    });

    const verdict = calculator.querySelector('[data-calculator-verdict]');
    if (result.finalQuote === null) {
      verdict.textContent = `The entered offer estimates ${money(result.estimatedSavings)} in savings. Enter the final checkout quote before choosing it.`;
      verdict.dataset.state = 'waiting';
    } else if (Math.abs(result.quoteVsEstimate) < 0.005) {
      verdict.textContent = `The checkout quote matches the estimate and is ${money(result.estimatedSavings)} below the entered base total.`;
      verdict.dataset.state = 'saves';
    } else if (result.quoteVsEstimate < 0) {
      verdict.textContent = `The checkout quote is ${money(Math.abs(result.quoteVsEstimate))} below the estimate and ${money(result.quoteSavings)} below the entered base total.`;
      verdict.dataset.state = 'saves';
    } else {
      verdict.textContent = `The checkout quote is ${money(result.quoteVsEstimate)} above the estimate. Use the checkout total; taxes, fees, eligibility, or coupon order may differ.`;
      verdict.dataset.state = 'costs';
    }

    calculator.querySelector('[data-calculator-summary]').textContent = `${result.parkingDays} parking days; ${result.freeDays} free; ${result.paidDays} paid; ${result.percentOff}% off paid-day subtotal; ${money(result.taxesAndFees)} entered taxes and fees.`;
  };

  calculator.addEventListener('submit', (event) => event.preventDefault());
  calculator.addEventListener('input', render);
  render();
}
