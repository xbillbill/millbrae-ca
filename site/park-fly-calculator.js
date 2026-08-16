const nonNegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

const optionalAmount = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return nonNegative(value);
};

export function calculateParkFly(inputs) {
  const parkingDays = Math.ceil(nonNegative(inputs.parkingDays));
  const includedDays = Math.floor(nonNegative(inputs.includedDays));
  const extraDayRate = nonNegative(inputs.extraDayRate);
  const packageTransfer = nonNegative(inputs.packageTransfer);
  const transportCredit = nonNegative(inputs.transportCredit);
  const separateParkingRate = nonNegative(inputs.separateParkingRate);
  const separateTransfer = nonNegative(inputs.separateTransfer);
  const packageQuote = optionalAmount(inputs.packageQuote);
  const roomOnlyQuote = optionalAmount(inputs.roomOnlyQuote);

  const extraDays = Math.max(0, parkingDays - includedDays);
  const extraParking = extraDays * extraDayRate;
  const packageTransferOutOfPocket = Math.max(0, packageTransfer - transportCredit);
  const packageExtras = extraParking + packageTransferOutOfPocket;
  const separateParking = parkingDays * separateParkingRate;
  const parkingOnlyTotal = separateParking + separateTransfer;
  const packageTotal = packageQuote === null ? null : packageQuote + packageExtras;
  const alternativeTotal = roomOnlyQuote === null ? null : roomOnlyQuote + parkingOnlyTotal;
  const breakEvenPackageQuote = alternativeTotal === null ? null : Math.max(0, alternativeTotal - packageExtras);
  const packageSavings = packageTotal === null || alternativeTotal === null
    ? null
    : alternativeTotal - packageTotal;

  return {
    parkingDays,
    extraDays,
    extraParking,
    packageTransferOutOfPocket,
    packageExtras,
    separateParking,
    parkingOnlyTotal,
    packageTotal,
    alternativeTotal,
    breakEvenPackageQuote,
    packageSavings
  };
}

const calculator = typeof document === 'undefined'
  ? null
  : document.querySelector('[data-park-fly-calculator]');

if (calculator) {
  const money = (value, fallback) => value === null
    ? fallback
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const render = () => {
    const data = new FormData(calculator);
    const result = calculateParkFly(Object.fromEntries(data));
    const packageOutput = calculator.querySelector('[data-result="package"]');
    const alternativeOutput = calculator.querySelector('[data-result="alternative"]');
    const parkingOutput = calculator.querySelector('[data-result="parking"]');
    const breakEvenOutput = calculator.querySelector('[data-result="break-even"]');
    const verdict = calculator.querySelector('[data-calculator-verdict]');
    const summary = calculator.querySelector('[data-calculator-summary]');

    packageOutput.value = money(result.packageTotal, 'Enter package quote');
    packageOutput.textContent = packageOutput.value;
    alternativeOutput.value = money(result.alternativeTotal, 'Enter room quote');
    alternativeOutput.textContent = alternativeOutput.value;
    parkingOutput.value = money(result.parkingOnlyTotal, '$0.00');
    parkingOutput.textContent = parkingOutput.value;
    breakEvenOutput.value = money(result.breakEvenPackageQuote, 'Enter room quote');
    breakEvenOutput.textContent = breakEvenOutput.value;

    if (result.packageSavings === null) {
      verdict.textContent = 'Enter both live quotes to calculate the difference.';
      verdict.dataset.state = 'waiting';
    } else if (Math.abs(result.packageSavings) < 0.005) {
      verdict.textContent = 'The two entered plans cost the same.';
      verdict.dataset.state = 'even';
    } else if (result.packageSavings > 0) {
      verdict.textContent = `The package is ${money(result.packageSavings)} less than the room-plus-parking plan.`;
      verdict.dataset.state = 'saves';
    } else {
      verdict.textContent = `The room-plus-parking plan is ${money(Math.abs(result.packageSavings))} less than the package.`;
      verdict.dataset.state = 'costs';
    }

    const dayLabel = result.parkingDays === 1 ? 'day' : 'days';
    summary.textContent = `${result.parkingDays} parking ${dayLabel}; ${result.extraDays} beyond the package allowance; ${money(result.packageExtras)} in package extras.`;
  };

  calculator.addEventListener('submit', (event) => event.preventDefault());
  calculator.addEventListener('input', render);
  render();
}
