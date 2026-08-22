const form = document.querySelector('[data-knowledge-search]');
const input = document.querySelector('[data-knowledge-search-input]');
const status = document.querySelector('[data-knowledge-search-status]');
const results = document.querySelector('[data-knowledge-search-results]');
const cards = [...document.querySelectorAll('.reference-card')];
const urlQuery = new URLSearchParams(window.location.search).get('q') || '';

const guideIndex = [
  { topic: 'START HERE', title: 'Know Millbrae', description: 'History, civic life, schools, transit, events, and direct answers with sources nearby.', href: 'know-millbrae.html', keywords: 'history city facts timeline incorporation' },
  { topic: 'REFERENCE', title: 'Millbrae at a glance', description: 'Date-labeled population, geography, housing, language, history, and regional context with the source beside each fact.', href: 'millbrae-facts.html', keywords: 'facts population census geography area households housing language demographics incorporation data statistics' },
  { topic: 'TOPIC INDEX', title: 'Explore Millbrae by topic', description: 'Browse the city through neighborhoods, parks, families, civic life, stories, businesses, and sources.', href: 'explore-millbrae.html', keywords: 'index topics guide' },
  { topic: 'HISTORY & CULTURE', title: 'Millbrae history, culture, and local memory', description: 'Find museums, archives, the library, community media, and cultural organizations that preserve the city’s story.', href: 'millbrae-history-culture.html', keywords: 'museum archive library train depot culture memory' },
  { topic: 'INTEREST STORIES', title: 'Millbrae stories', description: 'Read short explainers about rail, place names, public spaces, schools, SFO, calendars, and local memory.', href: 'millbrae-stories.html', keywords: 'stories people places rail airport' },
  { topic: 'FEATURE STORY', title: 'One station, many scales', description: 'A long-form story about how Millbrae Station connects local streets, regional rail, county buses, and SFO.', href: 'millbrae-story-station.html', keywords: 'station regional hinge transfer BART Caltrain SamTrans SFO story' },
  { topic: 'FEATURE STORY', title: 'What Millbrae remembers', description: 'A long-form history story about the name, land grant, Mills estate, railroad, depot, and incorporation.', href: 'millbrae-story-name.html', keywords: 'name history land grant Mills estate railroad depot incorporation culture' },
  { topic: 'FEATURE STORY', title: 'The school day is a community map', description: 'A long-form story about Millbrae schools, family routines, district boundaries, recreation, and libraries.', href: 'millbrae-story-schools.html', keywords: 'school family district calendar boundary recreation library children education' },
  { topic: 'FEATURE STORY', title: 'Public space is part of Millbrae’s memory', description: 'A long-form story about parks, the Spur Trail, recreation, cultural activity, and the civic meaning of public places.', href: 'millbrae-story-public-space.html', keywords: 'parks trail Spur Recreation public space culture art playground open space civic history' },
  { topic: 'FEATURE STORY', title: 'Millbrae has a global map', description: 'A long-form story about sister cities, friendship cities, cultural exchange, and the civic bodies that maintain those relationships.', href: 'millbrae-story-global-connections.html', keywords: 'sister cities friendship cities international culture exchange La Serena Mosta Hanyu Taishan Ramallah Dongguan' },
  { topic: 'FEATURE STORY', title: 'Local businesses are part of Millbrae’s map', description: 'A long-form story about commercial corridors, transit, community listings, and the labels that make a local directory trustworthy.', href: 'millbrae-story-businesses.html', keywords: 'business businesses corridor downtown Broadway El Camino Real Millbrae Avenue directory listings commerce shopping' },
  { topic: 'FEATURE STORY', title: 'One city, overlapping maps', description: 'A long-form story about neighborhoods, school communities, planning maps, parks, transit, and the boundaries that answer different questions.', href: 'millbrae-story-neighborhoods.html', keywords: 'neighborhoods neighborhood maps planning school boundaries parks transit Bayside station downtown hillsides place geography' },
  { topic: 'FEATURE STORY', title: 'The quiet infrastructure behind a Millbrae day', description: 'A long-form story about public resources, emergency pathways, utilities, libraries, alerts, and transit ownership.', href: 'millbrae-story-public-resources.html', keywords: 'public resources infrastructure emergency fire water sewer streets library alerts utilities transit Millbrae Works services' },
  { topic: 'SCHOOLS & FAMILIES', title: 'Schools and families', description: 'Connect district calendars, enrollment, services, recreation, youth programs, and family resources.', href: 'millbrae-schools-families.html', keywords: 'school district MESD Mills children youth recreation calendar enrollment' },
  { topic: 'CIVIC LIFE & EVENTS', title: 'Civic life, events, and news', description: 'Follow official City events, News Flash items, agendas, school and library calendars, and current civic updates.', href: 'millbrae-civic-events-news.html', keywords: 'calendar meetings council agenda news events recreation' },
  { topic: 'CIVIC PARTICIPATION', title: 'How to participate in Millbrae civic life', description: 'Find the right civic doorway for meetings, agendas, records, service requests, commissions, youth, seniors, and community programs.', href: 'millbrae-civic-participation.html', keywords: 'participation public comment meeting agenda records request commission youth senior Millbrae Works civic' },
  { topic: 'COMMUNITY NEWS', title: 'Community news guide', description: 'Distinguish City announcements, public records, reporting, community media, school updates, and alerts.', href: 'millbrae-community-news.html', keywords: 'news media newspaper MCTV alerts reporting' },
  { topic: 'CITY GOVERNMENT', title: 'How Millbrae government works', description: 'Understand the Council–Manager structure, departments, commissions, records, and public pathways.', href: 'millbrae-government-guide.html', keywords: 'council manager mayor departments commissions clerk public records' },
  { topic: 'PLANNING & GROWTH', title: 'Planning and growth', description: 'Read the General Plan, station-area planning, downtown, housing, mobility, and project-review pathways.', href: 'millbrae-planning-growth.html', keywords: '2040 general plan housing station downtown development zoning' },
  { topic: 'NEIGHBORHOODS', title: 'Millbrae neighborhoods', description: 'Use formal maps and place anchors to understand downtown, the station, parks, school areas, and the Bayside edge.', href: 'millbrae-neighborhoods.html', keywords: 'map downtown station Bayside boundaries residential' },
  { topic: 'PARKS & PLACES', title: 'Parks and places', description: 'Find City parks, recreation, the Spur Trail, regional parks, public facilities, and the places people use every day.', href: 'millbrae-parks-places.html', keywords: 'parks trail recreation playground Junipero Serra Crystal Springs' },
  { topic: 'BUSINESSES', title: 'Millbrae businesses and directory', description: 'Find local places with clear labels for official resources, community listings, editorial guides, and paid placement.', href: 'millbrae-businesses.html', keywords: 'business restaurant directory food shopping services' },
  { topic: 'PUBLIC RESOURCES', title: 'Millbrae public resources', description: 'Find emergency paths, utilities, public works, library, transit, city contacts, and public help.', href: 'millbrae-public-resources.html', keywords: 'police fire emergency utility water garbage library public works' },
  { topic: 'LIBRARY & LEARNING', title: 'Millbrae Library and learning guide', description: 'Find the library, makerspace, digital help, language programs, family learning, and the sources behind current services.', href: 'millbrae-library-learning.html', keywords: 'library makerspace books learning digital help language programs WiFi school family seniors' },
  { topic: 'REFERENCE', title: 'Millbrae place glossary', description: 'Decode the recurring places and terms across Millbrae history, neighborhoods, parks, transit, businesses, and civic life.', href: 'millbrae-glossary.html', keywords: 'glossary terms places station El Camino Real Spur Trail Bayside Manor Mills Estate SFO library works museum' },
  { topic: 'LIVE WEATHER', title: 'Today in Millbrae', description: 'See current Millbrae weather, local time, and the live conditions shown on the homepage.', href: 'index.html#top', keywords: 'weather temperature forecast rain wind current conditions time' },
  { topic: 'TRANSIT & SFO', title: 'Millbrae Station and SFO guide', description: 'Plan BART, Caltrain, SamTrans, parking, hotel connections, and live departures near SFO.', href: 'millbrae-station-sfo-guide.html', keywords: 'BART Caltrain SamTrans station airport parking hotel shuttle train' },
  { topic: 'SOURCES & METHOD', title: 'Source registry and editorial method', description: 'See which agencies maintain the facts, what refreshes live, and how corrections are handled.', href: 'millbrae-sources.html', keywords: 'sources official agency method correction evidence' }
];

const queryAliases = {
  'zh-CN': { '公园': 'parks places trail', '学校': 'schools families school', '历史': 'history culture story', '交通': 'transit station train', '公共资源': 'public resources services', '新闻': 'news community civic', '活动': 'events calendar civic', '商家': 'businesses directory restaurants story commerce corridor', '天气': 'weather current conditions', '来源': 'sources method evidence', '人口': 'population facts census', '社区': 'community neighborhoods', '参与': 'participation civic commission meeting', '图书馆': 'library learning makerspace', '学习': 'library learning school education', '词典': 'glossary terms places', '地点': 'places neighborhoods station parks' },
  es: { parque: 'parks places trail', parques: 'parks places trail', escuela: 'schools families school', escuelas: 'schools families school', historia: 'history culture story', transporte: 'transit station train', recursos: 'public resources services', noticias: 'news community civic', eventos: 'events calendar civic', negocios: 'businesses directory restaurants story commerce corridor', clima: 'weather current conditions', fuentes: 'sources method evidence', población: 'population facts census', comunidad: 'community neighborhoods' }
};

const localizedResultCopy = {
  'zh-CN': {
    'Know Millbrae': { topic: '从这里开始', title: `了解${'密尔布雷'}`, description: '从历史、城市生活、学校、交通和活动开始了解这座城市。' },
    'Millbrae at a glance': { topic: '参考资料', title: `${'密尔布雷'}概览`, description: '带有日期的人口、地理、住房、语言、历史和区域背景资料。' },
    'Explore Millbrae by topic': { topic: '主题索引', title: `按主题探索${'密尔布雷'}`, description: '按社区、公园、家庭、市政生活、故事、商家和来源浏览城市。' },
    'Millbrae history, culture, and local memory': { topic: '历史与文化', title: `${'密尔布雷'}历史、文化与地方记忆`, description: '了解保存城市故事的博物馆、档案馆、图书馆、社区媒体和文化机构。' },
    'Millbrae stories': { topic: '兴趣故事', title: `${'密尔布雷'}故事`, description: '阅读关于铁路、地名、公共空间、学校、SFO、日历和地方记忆的短篇解释。' },
    'Civic life, events, and news': { topic: '市政生活与活动', title: `${'密尔布雷'}市政生活、活动与新闻`, description: '关注官方活动、新闻快讯、议程、学校和图书馆日历及市政更新。' },
    'How to participate in Millbrae civic life': { topic: '市政参与', title: '如何参与密尔布雷市政生活', description: '为会议、议程、记录、服务请求、委员会、青少年、老年人和社区项目找到正确入口。' },
    'Community news guide': { topic: '社区新闻', title: '社区新闻指南', description: '区分市政府公告、公共记录、独立报道、社区媒体、学校更新和提醒。' },
    'Millbrae public resources': { topic: '公共资源', title: `${'密尔布雷'}公共资源`, description: '查找紧急服务、公共设施、图书馆、交通、市政府联系方式和公共帮助。' },
    'Millbrae Library and learning guide': { topic: '图书馆与学习', title: `${'密尔布雷'}图书馆与学习指南`, description: '查找图书馆、创客空间、数字帮助、语言项目、家庭学习和当前服务来源。' },
    'Millbrae place glossary': { topic: '参考资料', title: `${'密尔布雷'}地点词典`, description: '解释历史、社区、公园、交通、商家和市政生活中反复出现的地点与术语。' },
    'Schools and families': { topic: '学校与家庭', title: '学校与家庭', description: '连接学区日历、入学、服务、休闲活动、青少年项目和家庭资源。' },
    'Millbrae Station and SFO guide': { topic: '交通与 SFO', title: `${'密尔布雷'}车站与 SFO 指南`, description: '规划 BART、Caltrain、SamTrans、停车、酒店接驳和实时到站信息。' },
    'One station, many scales': { topic: '兴趣故事', title: '一座车站，多种尺度', description: '了解车站如何连接本地街道、区域铁路、县级公交和 SFO。' },
    'What Millbrae remembers': { topic: '兴趣故事', title: `${'密尔布雷'}记得什么`, description: '从地名、土地授予、Mills 庄园、铁路、车站到建市，了解城市的历史故事。' },
    'The school day is a community map': { topic: '兴趣故事', title: '上学日是一张社区地图', description: '了解学校、家庭日常、学区边界、休闲活动和图书馆如何连接起来。' },
    'Public space is part of Millbrae’s memory': { topic: '兴趣故事', title: `${'密尔布雷'}公共空间也是城市记忆`, description: '了解公园、Spur Trail、休闲活动、文化活动和公共空间的市政意义。' },
    'Millbrae has a global map': { topic: '兴趣故事', title: `${'密尔布雷'}拥有一张全球地图`, description: '了解姐妹城市、友好城市、文化交流以及维护这些关系的市政机构。' },
    'Local businesses are part of Millbrae’s map': { topic: '兴趣故事', title: `${'密尔布雷'}本地商家也是城市地图的一部分`, description: '了解商业走廊、交通、社区商家信息以及让本地目录值得信赖的标签。' },
    'One city, overlapping maps': { topic: '兴趣故事', title: '一座城市，多张重叠的地图', description: '了解社区、学校、规划地图、公园、交通以及回答不同问题的边界。' },
    'The quiet infrastructure behind a Millbrae day': { topic: '兴趣故事', title: '密尔布雷一天背后的安静基础设施', description: '了解公共资源、紧急服务、公共设施、图书馆、提醒和交通各自的责任。' },
    'How Millbrae government works': { topic: '城市政府', title: `${'密尔布雷'}政府如何运作`, description: '了解市议会—城市经理制度、部门、委员会、记录和公共参与路径。' },
    'Planning and growth': { topic: '规划与发展', title: '规划与发展', description: '了解总体规划、车站区域、商业中心、住房、交通和项目审查路径。' },
    'Millbrae neighborhoods': { topic: '社区', title: `${'密尔布雷'}社区`, description: '使用正式地图和地点标志了解市中心、车站、公园、学校区域和 Bayside 边缘。' },
    'Parks and places': { topic: '公园与地点', title: '公园与地点', description: '查找城市公园、休闲活动、Spur Trail、区域公园、公共设施和日常使用的地方。' },
    'Millbrae businesses and directory': { topic: '企业', title: `${'密尔布雷'}商家与目录`, description: '查找官方资源、社区提交信息、编辑指南和付费展示，并保留清晰标签。' },
    'Source registry and editorial method': { topic: '来源与方法', title: '来源登记与编辑方法', description: '了解哪些机构维护事实、哪些内容实时更新，以及如何处理更正。' }
  },
  es: {
    'Know Millbrae': { topic: 'PRIMEROS PASOS', title: 'Conoce Millbrae', description: 'Empieza con la historia, la vida cívica, las escuelas, el transporte y los eventos.' },
    'Millbrae at a glance': { topic: 'REFERENCIA', title: 'Millbrae de un vistazo', description: 'Datos fechados sobre población, geografía, vivienda, idioma, historia y contexto regional.' },
    'Explore Millbrae by topic': { topic: 'ÍNDICE TEMÁTICO', title: 'Explora Millbrae por tema', description: 'Explora la ciudad por vecindarios, parques, familias, vida cívica, historias, negocios y fuentes.' },
    'Millbrae history, culture, and local memory': { topic: 'HISTORIA Y CULTURA', title: 'Historia, cultura y memoria local de Millbrae', description: 'Encuentra museos, archivos, biblioteca, medios comunitarios y organizaciones culturales.' },
    'Millbrae stories': { topic: 'HISTORIAS', title: 'Historias de Millbrae', description: 'Lee explicaciones sobre trenes, nombres, espacios públicos, escuelas, SFO, calendarios y memoria local.' },
    'Civic life, events, and news': { topic: 'VIDA CÍVICA Y EVENTOS', title: 'Vida cívica, eventos y noticias de Millbrae', description: 'Sigue eventos oficiales, noticias, agendas, calendarios escolares y actualizaciones cívicas.' },
    'How to participate in Millbrae civic life': { topic: 'PARTICIPACIÓN CÍVICA', title: 'Cómo participar en la vida cívica de Millbrae', description: 'Encuentra la puerta correcta para reuniones, agendas, registros, solicitudes, comisiones, juventud, mayores y programas comunitarios.' },
    'Community news guide': { topic: 'NOTICIAS COMUNITARIAS', title: 'Guía de noticias comunitarias', description: 'Distingue anuncios oficiales, registros públicos, reportajes, medios comunitarios y alertas.' },
    'Millbrae public resources': { topic: 'RECURSOS PÚBLICOS', title: 'Recursos públicos de Millbrae', description: 'Encuentra emergencias, obras públicas, biblioteca, transporte, contactos y ayuda pública.' },
    'Millbrae Library and learning guide': { topic: 'BIBLIOTECA Y APRENDIZAJE', title: 'Guía de la biblioteca y el aprendizaje de Millbrae', description: 'Encuentra biblioteca, makerspace, ayuda digital, programas de idiomas, aprendizaje familiar y fuentes actuales.' },
    'Millbrae place glossary': { topic: 'REFERENCIA', title: 'Glosario de lugares de Millbrae', description: 'Aclara los lugares y términos que aparecen en la historia, vecindarios, parques, transporte, negocios y vida cívica de Millbrae.' },
    'Schools and families': { topic: 'ESCUELAS Y FAMILIAS', title: 'Escuelas y familias', description: 'Conecta calendarios escolares, inscripción, servicios, recreación, juventud y recursos familiares.' },
    'Millbrae Station and SFO guide': { topic: 'TRANSPORTE Y SFO', title: 'Guía de la estación Millbrae y SFO', description: 'Planifica BART, Caltrain, SamTrans, estacionamiento, hoteles y salidas en vivo.' },
    'One station, many scales': { topic: 'HISTORIAS', title: 'Una estación, muchas escalas', description: 'Cómo la estación conecta calles locales, trenes regionales, autobuses del condado y SFO.' },
    'What Millbrae remembers': { topic: 'HISTORIAS', title: 'Lo que Millbrae recuerda', description: 'Una historia sobre el nombre, la concesión de tierras, Mills, el ferrocarril, el depósito y la incorporación.' },
    'The school day is a community map': { topic: 'HISTORIAS', title: 'El día escolar es un mapa comunitario', description: 'Cómo las escuelas, familias, límites, recreación y bibliotecas forman una rutina conectada.' },
    'Public space is part of Millbrae’s memory': { topic: 'HISTORIAS', title: 'El espacio público es parte de la memoria de Millbrae', description: 'Parques, Spur Trail, recreación, cultura y el significado cívico de los espacios públicos.' },
    'Millbrae has a global map': { topic: 'HISTORIAS', title: 'Millbrae tiene un mapa global', description: 'Ciudades hermanas, ciudades de amistad, intercambio cultural y los organismos cívicos que mantienen esas relaciones.' },
    'Local businesses are part of Millbrae’s map': { topic: 'HISTORIAS', title: 'Los negocios locales son parte del mapa de Millbrae', description: 'Una historia sobre corredores comerciales, transporte, anuncios comunitarios y etiquetas confiables.' },
    'One city, overlapping maps': { topic: 'HISTORIAS', title: 'Una ciudad, mapas superpuestos', description: 'Una historia sobre vecindarios, escuelas, mapas de planificación, parques, transporte y límites para distintas preguntas.' },
    'The quiet infrastructure behind a Millbrae day': { topic: 'HISTORIAS', title: 'La infraestructura silenciosa detrás de un día en Millbrae', description: 'Una historia sobre recursos públicos, emergencias, servicios, bibliotecas, alertas y transporte.' },
    'How Millbrae government works': { topic: 'GOBIERNO MUNICIPAL', title: 'Cómo funciona el gobierno de Millbrae', description: 'La estructura de Consejo–Administrador, departamentos, comisiones, registros y participación pública.' },
    'Planning and growth': { topic: 'PLANIFICACIÓN Y CRECIMIENTO', title: 'Planificación y crecimiento', description: 'Plan General, área de la estación, centro, vivienda, movilidad y revisión de proyectos.' },
    'Millbrae neighborhoods': { topic: 'VECINDARIOS', title: 'Vecindarios de Millbrae', description: 'Mapas formales y lugares de referencia para conocer el centro, la estación, parques, escuelas y Bayside.' },
    'Parks and places': { topic: 'PARQUES Y LUGARES', title: 'Parques y lugares', description: 'Parques, recreación, Spur Trail, espacios regionales, instalaciones públicas y lugares cotidianos.' },
    'Millbrae businesses and directory': { topic: 'NEGOCIOS', title: 'Negocios y directorio de Millbrae', description: 'Lugares locales con etiquetas claras para recursos oficiales, anuncios comunitarios, guías editoriales y publicidad.' },
    'Source registry and editorial method': { topic: 'FUENTES Y MÉTODO', title: 'Registro de fuentes y método editorial', description: 'Qué agencias mantienen los datos, qué se actualiza en vivo y cómo se gestionan las correcciones.' }
  }
};

const statusCopy = {
  en: { all: (count) => `Showing all ${count} topics.`, match: (count, query, guides) => `${count} topic${count === 1 ? '' : 's'} match “${query}”${guides ? `, plus ${guides} guide page${guides === 1 ? '' : 's'}` : ''}.`, guideOnly: (count, query) => `No topic cards match “${query}”, but ${count} guide page${count === 1 ? '' : 's'} do.`, none: (query) => `No topic or guide matches “${query}”. Try history, parks, schools, transit, or public resources.`, placeholder: 'Try parks, schools, BART, history, water…', guides: 'Related guide pages' },
  'zh-CN': { all: (count) => `显示全部 ${count} 个主题。`, match: (count, query, guides) => `${count} 个主题匹配“${query}”${guides ? `，另有 ${guides} 个指南页面` : ''}。`, guideOnly: (count, query) => `没有主题卡匹配“${query}”，但有 ${count} 个指南页面。`, none: (query) => `没有主题或指南匹配“${query}”。可以试试历史、公园、学校、交通或公共资源。`, placeholder: '试试搜索公园、学校、BART、历史、水务……', guides: '相关指南页面' },
  es: { all: (count) => `Se muestran los ${count} temas.`, match: (count, query, guides) => `${count} tema${count === 1 ? '' : 's'} coincide${count === 1 ? '' : 'n'} con “${query}”${guides ? ` y ${guides} página${guides === 1 ? '' : 's'} de guía` : ''}.`, guideOnly: (count, query) => `Ninguna tarjeta temática coincide con “${query}”, pero sí ${count} página${count === 1 ? '' : 's'} de guía.`, none: (query) => `Ningún tema ni guía coincide con “${query}”. Prueba historia, parques, escuelas, transporte o recursos públicos.`, placeholder: 'Prueba parques, escuelas, BART, historia, agua…', guides: 'Páginas de guía relacionadas' }
};

const renderGuideResults = (query, copy) => {
  if (!results) return 0;
  results.replaceChildren();
  if (!query) {
    results.hidden = true;
    return 0;
  }
  const aliases = queryAliases[document.documentElement.lang]?.[query] || '';
  const terms = [query, ...aliases.split(/\s+/)].filter(Boolean).map((term) => term.toLocaleLowerCase());
  const matches = guideIndex.filter((guide) => {
    const searchText = `${guide.topic} ${guide.title} ${guide.description} ${guide.keywords}`.toLocaleLowerCase();
    return terms.some((term) => searchText.includes(term));
  });
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
    const localized = localizedResultCopy[document.documentElement.lang]?.[guide.title] || guide;
    const article = document.createElement('article');
    article.className = 'knowledge-search-result';
    const tag = document.createElement('p');
    tag.className = 'tag';
    tag.textContent = localized.topic;
    const title = document.createElement('h4');
    const link = document.createElement('a');
    link.href = guide.href;
    link.textContent = localized.title;
    title.append(link);
    const description = document.createElement('p');
    description.textContent = localized.description;
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
      status.textContent = visible ? copy.match(visible, input.value.trim(), guideCount) : copy.guideOnly(guideCount, input.value.trim());
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
