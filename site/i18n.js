const LOCALE_KEY = 'millbrae-locale';
const ZH_CITY_NAME = '密尔布雷';
const sourceByNode = new WeakMap();
const sourceTitle = document.title;
const pendingTranslations = new Set();

const translations = {
  'zh-CN': {
    'Millbrae, California Restaurants, BART & SFO Guide | Millbrae Local': `${ZH_CITY_NAME}，加州餐厅、BART 与 SFO 指南 | Millbrae Local`,
    'Millbrae Station to SFO: BART, Parking & Hotels (2026)': `${ZH_CITY_NAME}车站到 SFO：BART、停车与酒店（2026）`,
    'Directory': '目录',
    'Know Millbrae': `了解${ZH_CITY_NAME}`,
    'Explore topics': '按主题探索',
    'Sources': '来源',
    'Search': '搜索',
    'Search the Millbrae knowledge map': `搜索${ZH_CITY_NAME}知识地图`,
    'Restaurants': '餐厅',
    'Hotels': '酒店',
    'SFO tools': 'SFO 工具',
    'Advertise': '广告合作',
    'Live transit': '实时交通',
    'List your business': '发布商家信息',
    'Add your business': '添加商家',
    'View directory': '查看目录',
    'Request a spot': '申请展示位',
    'Choose a tool': '选择工具',
    'Reach travelers': '触达旅客',
    'Reach shuttle travelers': '触达接驳车旅客',
    'Compare live quotes': '比较实时报价',
    'Compare your quotes': '比较你的报价',
    'Calculate savings': '计算节省金额',
    'Made for Millbrae, by people who love Millbrae': `为${ZH_CITY_NAME}而做，由热爱${ZH_CITY_NAME}的人打造`,
    'Your shortcut to a better day in town.': '让你在城里过得更好的一站式捷径。',
    'Find a good meal, a useful service, or your next neighborhood favorite — without scrolling through a dozen tabs.': '寻找美食、实用服务或下一个社区最爱，无需在十几个标签页之间来回切换。',
    'How we curate': '了解我们的策划方式',
    'Curated by Millbrae Local’s independent editor.': '由 Millbrae Local 独立编辑策划。',
    'Guides are checked against official sources and local business websites; paid placement never changes editorial inclusion.': '指南会与官方来源和本地商家网站核对；付费展示不会改变编辑收录。',
    'Explore the guide': '探索指南',
    'Own a local business? List it free →': '经营本地商家？免费发布 →',
    'TODAY IN MILLBRAE': `今天的${ZH_CITY_NAME}`,
    'A little city with': '一座小城，拥有',
    'excellent timing.': '出色的出行节奏。',
    'Local time': '当地时间',
    'Pacific Time': '太平洋时间',
    'Start here': '从这里开始',
    'What are you looking for?': '你在寻找什么？',
    'Curated shortcuts for locals, visitors, and people passing through.': '为居民、访客和过境旅客整理的实用捷径。',
    'Eat in Millbrae': `在${ZH_CITY_NAME}用餐`,
    'Breakfast, dumplings, and dinner': '早餐、饺子和晚餐',
    'Local business directory': '本地商家目录',
    'Community-submitted listings': '社区提交的信息',
    'SFO travel tools': 'SFO 出行工具',
    'Parking, rideshare, hotels, and trains': '停车、网约车、酒店和火车',
    'The local shortlist': '本地精选',
    'Good plans, less guesswork.': '更好的计划，少一点猜测。',
    'Add your business free →': '免费添加商家 →',
    'See SFO parking costs': '查看 SFO 停车费用',
    'Pick your next meal': '选择下一顿饭',
    'Find a hotel shuttle': '查找酒店接驳车',
    'For local businesses': '面向本地商家',
    'Be the answer when someone asks.': '成为别人提问时的答案。',
    'Browse the directory →': '浏览目录 →',
    'THREE QUICK STEPS': '三个简单步骤',
    'Sign in': '登录',
    'Use an approved social identity.': '使用受支持的社交账号。',
    'Add the facts': '填写信息',
    'Name, category, address, website, and phone.': '名称、类别、地址、网站和电话。',
    'Publish': '发布',
    'Eligible listings appear automatically.': '符合条件的信息会自动显示。',
    'List your business free →': '免费发布商家信息 →',
    'About this guide': '关于本指南',
    'Read our placement policy →': '阅读展示政策 →',
    'Live at Millbrae Station': `${ZH_CITY_NAME}车站实时信息`,
    'Check the next train before you go.': '出发前查看下一班列车。',
    'BART and Caltrain estimates refresh automatically. Use the official boards for alerts and disruption details.': 'BART 和 Caltrain 预计到站时间会自动刷新。服务提醒和中断详情请查看官方信息板。',
    'BART · LIVE ESTIMATES': 'BART · 实时预计',
    'Millbrae BART': `${ZH_CITY_NAME} BART`,
    'Next departures from Millbrae': `从${ZH_CITY_NAME}出发的下一班车`,
    'CALTRAIN · LIVE ARRIVALS': 'CALTRAIN · 实时到站',
    'Millbrae Caltrain': `${ZH_CITY_NAME} Caltrain`,
    'Live arrivals for both directions': '双向实时到站信息',
    'Official BART board ↗': 'BART 官方信息板 ↗',
    'Official Caltrain boards ↗': 'Caltrain 官方信息板 ↗',
    'Parking': '停车',
    'Hotels': '酒店',
    'FAQ': '常见问题',
    'Compare': '比较',
    'SFO shuttles': 'SFO 接驳车',
    'Early flight?': '早班机？',
    'Layover?': '转机时间？',
    'Choose by trip': '按行程选择',
    'Parking math': '停车费用计算',
    'Current offers': '当前优惠',
    'Calculator': '计算器',
    'What to check': '需要检查什么',
    'Official links': '官方链接',
    'Coupon rules': '优惠券规则',
    'What to include': '需要包含什么',
    'Partner position': '合作伙伴展示位',
    'Loading community listings…': '正在加载社区商家信息…',
    'Loading': '正在加载',
    'For hotels and travel services': '面向酒店和出行服务商',
    'For SFO travel businesses': '面向 SFO 出行商家',
    'FUTURE PAID POSITION': '未来付费展示位',
    'Before booking': '预订前',
    'Calculator help': '计算器帮助',
    'Five terms can reverse the result.': '五项条款可能改变结果。',
    'Millbrae travel desk · Checked August 16, 2026': `${ZH_CITY_NAME}出行台 · 已于 2026 年 8 月 16 日核查`,
    'Millbrae travel desk · Offers checked August 16, 2026': `${ZH_CITY_NAME}出行台 · 优惠已于 2026 年 8 月 16 日核查`,
    'Millbrae travel desk · SFO rate checked August 16, 2026': `${ZH_CITY_NAME}出行台 · SFO 费率已于 2026 年 8 月 16 日核查`,
    'Quick answer': '快速答案',
    'Live departures': '实时出发信息',
    'The quick answer': '快速答案',
    'Common questions.': '常见问题。',
    'Independent guide': '独立指南',
    'Independent comparison:': '独立比较：',
    'Independent calculator:': '独立计算器：',
    'Community listing': '社区商家信息',
    'Paid placement': '付费展示',
    'Not open yet.': '尚未开放。',
    'Create a free listing →': '免费发布信息 →',
    'See the rollout →': '查看推出计划 →',
    'No business currently sponsors this guide.': '目前没有商家赞助本指南。',
    'Before booking': '预订前',
    'Verify live service before travel': '出行前确认实时服务',
    'Independent local guide · Not affiliated with the City of Millbrae': `独立本地指南 · 与${ZH_CITY_NAME}市政府无关联`,
    'English': '英语',
    '中文': '中文',
    'Español': '西班牙语'
  },
  es: {
    'Millbrae, California Restaurants, BART & SFO Guide | Millbrae Local': 'Guía de restaurantes, BART y SFO de Millbrae, California | Millbrae Local',
    'Millbrae Station to SFO: BART, Parking & Hotels (2026)': 'De la estación Millbrae a SFO: BART, estacionamiento y hoteles (2026)',
    'Directory': 'Directorio',
    'Know Millbrae': 'Conoce Millbrae',
    'Explore topics': 'Explorar temas',
    'Sources': 'Fuentes',
    'Search': 'Buscar',
    'Search the Millbrae knowledge map': 'Buscar en el mapa de conocimiento de Millbrae',
    'Restaurants': 'Restaurantes',
    'Hotels': 'Hoteles',
    'SFO tools': 'Herramientas SFO',
    'Advertise': 'Anúnciate',
    'Live transit': 'Tránsito en vivo',
    'List your business': 'Publica tu negocio',
    'Add your business': 'Agrega tu negocio',
    'View directory': 'Ver directorio',
    'Request a spot': 'Solicitar un espacio',
    'Choose a tool': 'Elige una herramienta',
    'Reach travelers': 'Llega a los viajeros',
    'Reach shuttle travelers': 'Llega a viajeros de los hoteles',
    'Compare live quotes': 'Compara cotizaciones actuales',
    'Compare your quotes': 'Compara tus cotizaciones',
    'Calculate savings': 'Calcula tus ahorros',
    'Made for Millbrae, by people who love Millbrae': 'Hecho para Millbrae, por personas que aman Millbrae',
    'Your shortcut to a better day in town.': 'Tu atajo para disfrutar mejor la ciudad.',
    'Find a good meal, a useful service, or your next neighborhood favorite — without scrolling through a dozen tabs.': 'Encuentra una buena comida, un servicio útil o tu próximo favorito del vecindario, sin revisar una docena de pestañas.',
    'How we curate': 'Cómo seleccionamos',
    'Curated by Millbrae Local’s independent editor.': 'Seleccionado por el editor independiente de Millbrae Local.',
    'Guides are checked against official sources and local business websites; paid placement never changes editorial inclusion.': 'Las guías se verifican con fuentes oficiales y sitios de negocios locales; los anuncios pagados no cambian la inclusión editorial.',
    'Explore the guide': 'Explora la guía',
    'Own a local business? List it free →': '¿Tienes un negocio local? Publícalo gratis →',
    'TODAY IN MILLBRAE': 'HOY EN MILLBRAE',
    'A little city with': 'Una pequeña ciudad con',
    'excellent timing.': 'un ritmo excelente.',
    'Local time': 'Hora local',
    'Pacific Time': 'Hora del Pacífico',
    'Start here': 'Empieza aquí',
    'What are you looking for?': '¿Qué estás buscando?',
    'Curated shortcuts for locals, visitors, and people passing through.': 'Atajos seleccionados para residentes, visitantes y personas de paso.',
    'Eat in Millbrae': 'Come en Millbrae',
    'Breakfast, dumplings, and dinner': 'Desayuno, dumplings y cena',
    'Local business directory': 'Directorio de negocios locales',
    'Community-submitted listings': 'Anuncios enviados por la comunidad',
    'SFO travel tools': 'Herramientas de viaje a SFO',
    'Parking, rideshare, hotels, and trains': 'Estacionamiento, viajes compartidos, hoteles y trenes',
    'The local shortlist': 'La selección local',
    'Good plans, less guesswork.': 'Buenos planes, menos dudas.',
    'Add your business free →': 'Agrega tu negocio gratis →',
    'See SFO parking costs': 'Consulta el costo del estacionamiento en SFO',
    'Pick your next meal': 'Elige tu próxima comida',
    'Find a hotel shuttle': 'Encuentra un transporte del hotel',
    'For local businesses': 'Para negocios locales',
    'Be the answer when someone asks.': 'Sé la respuesta cuando alguien pregunte.',
    'Browse the directory →': 'Explora el directorio →',
    'THREE QUICK STEPS': 'TRES PASOS RÁPIDOS',
    'Sign in': 'Inicia sesión',
    'Use an approved social identity.': 'Usa una identidad social aprobada.',
    'Add the facts': 'Agrega los datos',
    'Name, category, address, website, and phone.': 'Nombre, categoría, dirección, sitio web y teléfono.',
    'Publish': 'Publica',
    'Eligible listings appear automatically.': 'Los anuncios elegibles aparecen automáticamente.',
    'List your business free →': 'Publica tu negocio gratis →',
    'About this guide': 'Sobre esta guía',
    'Read our placement policy →': 'Lee nuestra política de anuncios →',
    'Live at Millbrae Station': 'En vivo en la estación Millbrae',
    'Check the next train before you go.': 'Consulta el próximo tren antes de salir.',
    'BART and Caltrain estimates refresh automatically. Use the official boards for alerts and disruption details.': 'Las estimaciones de BART y Caltrain se actualizan automáticamente. Consulta los paneles oficiales para alertas e interrupciones.',
    'BART · LIVE ESTIMATES': 'BART · ESTIMACIONES EN VIVO',
    'Millbrae BART': 'BART Millbrae',
    'Next departures from Millbrae': 'Próximas salidas desde Millbrae',
    'CALTRAIN · LIVE ARRIVALS': 'CALTRAIN · LLEGADAS EN VIVO',
    'Millbrae Caltrain': 'Caltrain Millbrae',
    'Live arrivals for both directions': 'Llegadas en vivo en ambas direcciones',
    'Official BART board ↗': 'Panel oficial de BART ↗',
    'Official Caltrain boards ↗': 'Paneles oficiales de Caltrain ↗',
    'Parking': 'Estacionamiento',
    'Hotels': 'Hoteles',
    'FAQ': 'Preguntas frecuentes',
    'Compare': 'Comparar',
    'SFO shuttles': 'Transportes SFO',
    'Early flight?': '¿Vuelo temprano?',
    'Layover?': '¿Escala?',
    'Choose by trip': 'Elige por viaje',
    'Parking math': 'Cálculo de estacionamiento',
    'Current offers': 'Ofertas actuales',
    'Calculator': 'Calculadora',
    'What to check': 'Qué revisar',
    'Official links': 'Enlaces oficiales',
    'Coupon rules': 'Reglas de cupones',
    'What to include': 'Qué incluir',
    'Partner position': 'Espacio para socios',
    'Loading community listings…': 'Cargando anuncios comunitarios…',
    'Loading': 'Cargando',
    'For hotels and travel services': 'Para hoteles y servicios de viaje',
    'For SFO travel businesses': 'Para negocios de viajes a SFO',
    'FUTURE PAID POSITION': 'ESPACIO PAGADO FUTURO',
    'Before booking': 'Antes de reservar',
    'Calculator help': 'Ayuda de la calculadora',
    'Five terms can reverse the result.': 'Cinco términos pueden cambiar el resultado.',
    'Millbrae travel desk · Checked August 16, 2026': 'Centro de viajes de Millbrae · Revisado el 16 de agosto de 2026',
    'Millbrae travel desk · Offers checked August 16, 2026': 'Centro de viajes de Millbrae · Ofertas revisadas el 16 de agosto de 2026',
    'Millbrae travel desk · SFO rate checked August 16, 2026': 'Centro de viajes de Millbrae · Tarifa de SFO revisada el 16 de agosto de 2026',
    'Quick answer': 'Respuesta rápida',
    'Live departures': 'Salidas en vivo',
    'The quick answer': 'La respuesta rápida',
    'Common questions.': 'Preguntas frecuentes.',
    'Independent guide': 'Guía independiente',
    'Independent comparison:': 'Comparación independiente:',
    'Independent calculator:': 'Calculadora independiente:',
    'Community listing': 'Anuncio comunitario',
    'Paid placement': 'Anuncio pagado',
    'Not open yet.': 'Aún no está abierto.',
    'Create a free listing →': 'Crea un anuncio gratis →',
    'See the rollout →': 'Ver el lanzamiento →',
    'No business currently sponsors this guide.': 'Ningún negocio patrocina actualmente esta guía.',
    'Before booking': 'Antes de reservar',
    'Verify live service before travel': 'Confirma el servicio antes de viajar',
    'Independent local guide · Not affiliated with the City of Millbrae': 'Guía local independiente · No está afiliada con la ciudad de Millbrae',
    'English': 'English',
    '中文': 'Chino',
    'Español': 'Español'
  }
};

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeChineseCityName(value, locale) {
  if (locale !== 'zh-CN') return value;
  return value.replace(/米尔布雷|米爾布雷|Millbrae/g, ZH_CITY_NAME);
}

function translateTextNodes(root, locale) {
  const dictionary = translations[locale] || {};
  const cache = readTranslationCache(locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|SELECT|OPTION|INPUT|TEXTAREA)$/.test(parent.tagName)) continue;
    if (parent.closest('[data-i18n-ignore]')) continue;
    if (!sourceByNode.has(node)) sourceByNode.set(node, node.nodeValue);
    const source = sourceByNode.get(node);
    const key = normalize(source);
    if (!key) continue;
    const translated = locale === 'en' ? source : (dictionary[key] || cache[key]);
    const localized = translated ? normalizeChineseCityName(translated, locale) : translated;
    if (localized) node.nodeValue = source.replace(key, localized);
    else if (locale === 'zh-CN') node.nodeValue = normalizeChineseCityName(source, locale);
    else if (locale === 'en') node.nodeValue = source;
  }
}

function readTranslationCache(locale) {
  try { return JSON.parse(localStorage.getItem(`millbrae-translations-${locale}`) || '{}'); } catch { return {}; }
}

function writeTranslationCache(locale, cache) {
  try { localStorage.setItem(`millbrae-translations-${locale}`, JSON.stringify(cache)); } catch { /* storage is optional */ }
}

async function translateMissingCopy(locale) {
  if (locale === 'en') return;
  const dictionary = translations[locale] || {};
  const cache = readTranslationCache(locale);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const missing = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|SELECT|OPTION|INPUT|TEXTAREA)$/.test(parent.tagName) || parent.closest('[data-i18n-ignore]')) continue;
    const source = sourceByNode.get(node) || node.nodeValue;
    const key = normalize(source);
    if (key.length > 3 && !dictionary[key] && !cache[key] && !pendingTranslations.has(key)) missing.add(key);
  }
  const keys = [...missing];
  for (let index = 0; index < keys.length; index += 8) {
    await Promise.all(keys.slice(index, index + 8).map(async (key) => {
      pendingTranslations.add(key);
      try {
        const url = new URL('https://translate.googleapis.com/translate_a/single');
        url.searchParams.set('client', 'gtx');
        url.searchParams.set('sl', 'en');
        url.searchParams.set('tl', locale === 'zh-CN' ? 'zh-CN' : 'es');
        url.searchParams.set('dt', 't');
        url.searchParams.set('q', key);
        const response = await fetch(url);
        const data = await response.json();
        const translated = data?.[0]?.map((part) => part?.[0] || '').join('').trim();
        if (translated) cache[key] = translated;
      } catch { /* bundled translations remain available offline */ }
      pendingTranslations.delete(key);
    }));
  }
  if (localStorage.getItem(LOCALE_KEY) !== locale) return;
  writeTranslationCache(locale, cache);
  translateTextNodes(document.body, locale);
  if (sourceTitle && !dictionary[normalize(sourceTitle)] && cache[normalize(sourceTitle)]) {
    document.title = normalizeChineseCityName(cache[normalize(sourceTitle)], locale);
  }
}

function applyLocale(locale) {
  const selected = ['en', 'zh-CN', 'es'].includes(locale) ? locale : 'en';
  document.documentElement.lang = selected === 'zh-CN' ? 'zh-CN' : selected;
  translateTextNodes(document.body, selected);
  void translateMissingCopy(selected);
  const localizedTitle = selected === 'en' ? sourceTitle : (translations[selected]?.[normalize(sourceTitle)] || sourceTitle);
  document.title = normalizeChineseCityName(localizedTitle, selected);
  window.dispatchEvent(new CustomEvent('localechange', { detail: selected }));
  const selector = document.querySelector('[data-language-selector]');
  if (selector) selector.value = selected;
  localStorage.setItem(LOCALE_KEY, selected);
}

function addSelector() {
  const header = document.querySelector('.site-header');
  if (!header || header.querySelector('[data-language-selector]')) return;
  const label = document.createElement('label');
  label.className = 'language-picker';
  label.setAttribute('data-i18n-ignore', 'true');
  label.innerHTML = '<span class="sr-only">Language</span><select data-language-selector aria-label="Language"><option value="en">EN</option><option value="zh-CN">中文</option><option value="es">ES</option></select>';
  label.querySelector('select').addEventListener('change', (event) => applyLocale(event.target.value));
  header.append(label);
}

function normalizeHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const brand = header.querySelector('.brand');
  if (brand) brand.href = 'index.html';
  const nav = header.querySelector('nav');
  if (nav) nav.innerHTML = '<a href="know-millbrae.html">Know Millbrae</a><a href="explore-millbrae.html">Explore topics</a><a href="millbrae-sources.html">Sources</a><a href="community.html">Directory</a><a href="restaurants-in-millbrae.html">Restaurants</a><a href="millbrae-station-sfo-guide.html#live-transit">Live transit</a><a href="sfo-tools.html">SFO tools</a>';
  const cta = header.querySelector('.button-small');
  if (cta) {
    cta.href = 'list-your-business.html';
    cta.textContent = 'List your business';
  }
}

function localeFromUrl() {
  const requested = new URLSearchParams(window.location.search).get('lang')
    || new URLSearchParams(window.location.search).get('locale');
  if (requested === 'zh') return 'zh-CN';
  return ['en', 'zh-CN', 'es'].includes(requested) ? requested : '';
}

normalizeHeader();
addSelector();
applyLocale(localeFromUrl() || localStorage.getItem(LOCALE_KEY) || 'en');

new MutationObserver((records) => {
  if ((localStorage.getItem(LOCALE_KEY) || 'en') === 'en') return;
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) translateTextNodes(node, localStorage.getItem(LOCALE_KEY));
  }
}).observe(document.body, { childList: true, subtree: true });
