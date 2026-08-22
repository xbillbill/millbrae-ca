const form = document.querySelector('[data-knowledge-search]');
const input = document.querySelector('[data-knowledge-search-input]');
const status = document.querySelector('[data-knowledge-search-status]');
const results = document.querySelector('[data-knowledge-search-results]');
const cards = [...document.querySelectorAll('.reference-card')];
const urlQuery = new URLSearchParams(window.location.search).get('q') || '';

const guideIndex = [
  { topic: 'START HERE', title: 'Know Millbrae', description: 'History, civic life, schools, transit, events, and direct answers with sources nearby.', href: 'know-millbrae.html', keywords: 'history city facts timeline incorporation' },
  { topic: 'TOPIC INDEX', title: 'Explore Millbrae by topic', description: 'Browse the city through neighborhoods, parks, families, civic life, stories, businesses, and sources.', href: 'explore-millbrae.html', keywords: 'index topics guide' },
  { topic: 'HISTORY & CULTURE', title: 'Millbrae history, culture, and local memory', description: 'Find museums, archives, the library, community media, and cultural organizations that preserve the city’s story.', href: 'millbrae-history-culture.html', keywords: 'museum archive library train depot culture memory' },
  { topic: 'INTEREST STORIES', title: 'Millbrae stories', description: 'Read short explainers about rail, place names, public spaces, schools, SFO, calendars, and local memory.', href: 'millbrae-stories.html', keywords: 'stories people places rail airport' },
  { topic: 'SCHOOLS & FAMILIES', title: 'Schools and families', description: 'Connect district calendars, enrollment, services, recreation, youth programs, and family resources.', href: 'millbrae-schools-families.html', keywords: 'school district MESD Mills children youth recreation calendar enrollment' },
  { topic: 'CIVIC LIFE & EVENTS', title: 'Civic life, events, and news', description: 'Follow official City events, News Flash items, agendas, school and library calendars, and current civic updates.', href: 'millbrae-civic-events-news.html', keywords: 'calendar meetings council agenda news events recreation' },
  { topic: 'COMMUNITY NEWS', title: 'Community news guide', description: 'Distinguish City announcements, public records, reporting, community media, school updates, and alerts.', href: 'millbrae-community-news.html', keywords: 'news media newspaper MCTV alerts reporting' },
  { topic: 'CITY GOVERNMENT', title: 'How Millbrae government works', description: 'Understand the Council–Manager structure, departments, commissions, records, and public pathways.', href: 'millbrae-government-guide.html', keywords: 'council manager mayor departments commissions clerk public records' },
  { topic: 'PLANNING & GROWTH', title: 'Planning and growth', description: 'Read the General Plan, station-area planning, downtown, housing, mobility, and project-review pathways.', href: 'millbrae-planning-growth.html', keywords: '2040 general plan housing station downtown development zoning' },
  { topic: 'NEIGHBORHOODS', title: 'Millbrae neighborhoods', description: 'Use formal maps and place anchors to understand downtown, the station, parks, school areas, and the Bayside edge.', href: 'millbrae-neighborhoods.html', keywords: 'map downtown station Bayside boundaries residential' },
  { topic: 'PARKS & PLACES', title: 'Parks and places', description: 'Find City parks, recreation, the Spur Trail, regional parks, public facilities, and the places people use every day.', href: 'millbrae-parks-places.html', keywords: 'parks trail recreation playground Junipero Serra Crystal Springs' },
  { topic: 'BUSINESSES', title: 'Millbrae businesses and directory', description: 'Find local places with clear labels for official resources, community listings, editorial guides, and paid placement.', href: 'millbrae-businesses.html', keywords: 'business restaurant directory food shopping services' },
  { topic: 'PUBLIC RESOURCES', title: 'Millbrae public resources', description: 'Find emergency paths, utilities, public works, library, transit, city contacts, and public help.', href: 'millbrae-public-resources.html', keywords: 'police fire emergency utility water garbage library public works' },
  { topic: 'LIVE WEATHER', title: 'Today in Millbrae', description: 'See current Millbrae weather, local time, and the live conditions shown on the homepage.', href: 'index.html#top', keywords: 'weather temperature forecast rain wind current conditions time' },
  { topic: 'TRANSIT & SFO', title: 'Millbrae Station and SFO guide', description: 'Plan BART, Caltrain, SamTrans, parking, hotel connections, and live departures near SFO.', href: 'millbrae-station-sfo-guide.html', keywords: 'BART Caltrain SamTrans station airport parking hotel shuttle train' },
  { topic: 'SOURCES & METHOD', title: 'Source registry and editorial method', description: 'See which agencies maintain the facts, what refreshes live, and how corrections are handled.', href: 'millbrae-sources.html', keywords: 'sources official agency method correction evidence' }
];

const statusCopy = {
  en: { all: (count) => `Showing all ${count} topics.`, match: (count, query, guides) => `${count ? `${count} topic${count === 1 ? '' : 's'}` : 'No topic cards'} match “${query}”${guides ? `, plus ${guides} guide page${guides === 1 ? '' : 's'}` : ''}.`, none: (query) => `No topic or guide matches “${query}”. Try history, parks, schools, transit, or public resources.`, placeholder: 'Try parks, schools, BART, history, water…', guides: 'Related guide pages' },
  'zh-CN': { all: (count) => `显示全部 ${count} 个主题。`, match: (count, query, guides) => `${count ? `${count} 个主题` : '没有主题卡'}匹配“${query}”${guides ? `，另有 ${guides} 个指南页面` : ''}。`, none: (query) => `没有主题或指南匹配“${query}”。可以试试历史、公园、学校、交通或公共资源。`, placeholder: '试试搜索公园、学校、BART、历史、水务……', guides: '相关指南页面' },
  es: { all: (count) => `Se muestran los ${count} temas.`, match: (count, query, guides) => `${count ? `${count} tema${count === 1 ? '' : 's'}` : 'Ninguna tarjeta temática'} coincide${count === 1 ? '' : 'n'} con “${query}”${guides ? ` y ${guides} página${guides === 1 ? '' : 's'} de guía` : ''}.`, none: (query) => `Ningún tema ni guía coincide con “${query}”. Prueba historia, parques, escuelas, transporte o recursos públicos.`, placeholder: 'Prueba parques, escuelas, BART, historia, agua…', guides: 'Páginas de guía relacionadas' }
};

const renderGuideResults = (query, copy) => {
  if (!results) return 0;
  results.replaceChildren();
  if (!query) {
    results.hidden = true;
    return 0;
  }
  const matches = guideIndex.filter((guide) => `${guide.topic} ${guide.title} ${guide.description} ${guide.keywords}`.toLocaleLowerCase().includes(query));
  if (!matches.length) {
    results.hidden = true;
    return 0;
  }
  results.hidden = false;
  const heading = document.createElement('h3');
  heading.textContent = copy.guides;
  results.append(heading);
  const list = document.createElement('div');
  list.className = 'knowledge-search-result-list';
  for (const guide of matches) {
    const article = document.createElement('article');
    article.className = 'knowledge-search-result';
    const tag = document.createElement('p');
    tag.className = 'tag';
    tag.textContent = guide.topic;
    const title = document.createElement('h4');
    const link = document.createElement('a');
    link.href = guide.href;
    link.textContent = guide.title;
    title.append(link);
    const description = document.createElement('p');
    description.textContent = guide.description;
    article.append(tag, title, description);
    list.append(article);
  }
  results.append(list);
  return matches.length;
};

if (form && input && status && cards.length) {
  input.value = urlQuery;

  const syncQuery = () => {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  };

  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    const copy = statusCopy[document.documentElement.lang] || statusCopy.en;
    let visible = 0;
    for (const card of cards) {
      const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    const guideCount = renderGuideResults(query, copy);
    if (!query) {
      status.textContent = copy.all(cards.length);
    } else if (visible || guideCount) {
      status.textContent = copy.match(visible, input.value.trim(), guideCount);
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
    syncQuery();
    filter();
  });
  input.addEventListener('input', filter);
  window.addEventListener('localechange', syncLocale);
  filter();
  syncLocale();
}
