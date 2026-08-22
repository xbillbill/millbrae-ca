const form = document.querySelector('[data-knowledge-search]');
const input = document.querySelector('[data-knowledge-search-input]');
const status = document.querySelector('[data-knowledge-search-status]');
const cards = [...document.querySelectorAll('.reference-card')];

if (form && input && status && cards.length) {
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    if (!query) {
      status.textContent = `Showing all ${cards.length} topics.`;
    } else if (visible) {
      status.textContent = `${visible} topic${visible === 1 ? '' : 's'} match “${input.value.trim()}”.`;
    } else {
      status.textContent = `No topic matches “${input.value.trim()}”. Try history, parks, schools, transit, or public resources.`;
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filter();
  });
  input.addEventListener('input', filter);
  filter();
}
