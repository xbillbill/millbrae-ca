document.querySelector('#interest-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const success = document.querySelector('#success');
  success.hidden = false;
  form.querySelector('button').textContent = 'Interest received ✓';
  form.querySelectorAll('input, textarea').forEach((field) => { field.disabled = true; });
});
