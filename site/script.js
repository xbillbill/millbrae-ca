document.querySelector('#interest-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const success = document.querySelector('#success');
  const data = new FormData(form);
  const subject = `Millbrae Local partner request — ${data.get('business')}`;
  const body = [
    `Name: ${data.get('name')}`,
    `Business: ${data.get('business')}`,
    `Email: ${data.get('email')}`,
    '',
    'What we offer:',
    data.get('note') || '(not provided)',
    '',
    'I would like founding partner information for Millbrae Local.'
  ].join('\n');

  window.location.href = `mailto:bill.wang@bavi.work?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  success.hidden = false;
  form.querySelector('button').textContent = 'Email ready ✓';
});
