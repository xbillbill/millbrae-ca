const clock = document.querySelector('[data-millbrae-time]');

if (clock) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const updateClock = () => {
    clock.textContent = formatter.format(new Date());
  };

  updateClock();
  window.setInterval(updateClock, 30_000);
}
