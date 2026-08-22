const form = document.querySelector('[data-knowledge-search]');
const input = document.querySelector('[data-knowledge-search-input]');
const status = document.querySelector('[data-knowledge-search-status]');
const cards = [...document.querySelectorAll('.reference-card')];

const statusCopy = {
  en: { all: (count) => `Showing all ${count} topics.`, match: (count, query) => `${count} topic${count === 1 ? '' : 's'} match “${query}”.`, none: (query) => `No topic matches “${query}”. Try history, parks, schools, transit, or public resources.`, placeholder: 'Try parks, schools, BART, history, water…' },
  'zh-CN': { all: (count) => `显示全部 ${count} 个主题。`, match: (count, query) => `有 ${count} 个主题匹配“${query}”。`, none: (query) => `没有主题匹配“${query}”。可以试试历史、公园、学校、交通或公共资源。`, placeholder: '试试搜索公园、学校、BART、历史、水务……' },
  es: { all: (count) => `Se muestran los ${count} temas.`, match: (count, query) => `${count} tema${count === 1 ? '' : 's'} coincide${count === 1 ? '' : 'n'} con “${query}”.`, none: (query) => `Ningún tema coincide con “${query}”. Prueba historia, parques, escuelas, transporte o recursos públicos.`, placeholder: 'Prueba parques, escuelas, BART, historia, agua…' }
};

if (form && input && status && cards.length) {
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const copy = statusCopy[document.documentElement.lang] || statusCopy.en;
    let visible = 0;
    for (const card of cards) {
      const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    if (!query) {
      status.textContent = copy.all(cards.length);
    } else if (visible) {
      status.textContent = copy.match(visible, input.value.trim());
    } else {
      status.textContent = copy.none(input.value.trim());
    }
  };

  const syncLocale = () => {
    const copy = statusCopy[document.documentElement.lang] || statusCopy.en;
    input.placeholder = copy.placeholder;
    filter();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filter();
  });
  input.addEventListener('input', filter);
  window.addEventListener('localechange', syncLocale);
  filter();
  syncLocale();
}
