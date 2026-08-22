import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const site = join(root, 'site');
const localeSource = readFileSync(join(site, 'i18n.js'), 'utf8');
const pages = readdirSync(site).filter((file) => file.endsWith('.html') && file !== 'dog-logo-bottom-preview.html');
const failures = [];

const requiredTranslations = [
  ['Know Millbrae: History, Schools, Events & Resources | Millbrae Local', '了解${ZH_CITY_NAME}：历史、学校、活动与公共资源 | Millbrae Local', 'Conoce Millbrae: historia, escuelas, eventos y recursos | Millbrae Local'],
  ['Explore Millbrae by Topic | Millbrae Local', '按主题探索${ZH_CITY_NAME} | Millbrae Local', 'Explora Millbrae por tema | Millbrae Local'],
  ['Millbrae at a Glance: Facts & Sources | Millbrae Local', '${ZH_CITY_NAME}概览：事实与来源 | Millbrae Local', 'Millbrae de un vistazo: datos y fuentes | Millbrae Local'],
  ['Learn the place behind the address.', '了解地址背后的地方。', 'Conoce el lugar detrás de la dirección.'],
  ['Find the right public door.', '找到正确的公共服务入口。', 'Encuentra la puerta pública correcta.'],
  ['Millbrae has a global map.', '${ZH_CITY_NAME}拥有一张全球地图。', 'Millbrae tiene un mapa global.'],
  ['Millbrae Library & Learning Guide | Millbrae Local', '${ZH_CITY_NAME}图书馆与学习指南 | Millbrae Local', 'Guía de la biblioteca y el aprendizaje de Millbrae | Millbrae Local']
  ,['Millbrae Place Glossary | Millbrae Local', '${ZH_CITY_NAME}地点词典 | Millbrae Local', 'Glosario de lugares de Millbrae | Millbrae Local']
  ,['THE MILLBRAE REFERENCE INDEX', '${ZH_CITY_NAME}参考索引', 'ÍNDICE DE REFERENCIA DE MILLBRAE']
  ,['Local Businesses Are Part of Millbrae\'s Map | Millbrae Local', '${ZH_CITY_NAME}本地商家也是城市地图的一部分 | Millbrae Local', 'Los negocios locales son parte del mapa de Millbrae | Millbrae Local']
  ,['One City, Overlapping Maps | Millbrae Local', '一座城市，多张重叠的地图 | Millbrae Local', 'Una ciudad, mapas superpuestos | Millbrae Local']
  ,['The Quiet Infrastructure Behind a Millbrae Day | Millbrae Local', '密尔布雷一天背后的安静基础设施 | Millbrae Local', 'La infraestructura silenciosa detrás de un día en Millbrae | Millbrae Local']
  ,['Schools Remember a City, Too | Millbrae Local', '学校也记得一座城市 | Millbrae Local', 'Las escuelas también recuerdan una ciudad | Millbrae Local']
  ,['THE MILLBRAE KNOWLEDGE HUB', '${ZH_CITY_NAME}知识中心', 'EL CENTRO DE CONOCIMIENTO DE MILLBRAE']
  ,['Know the city behind the search.', '了解搜索背后的城市。', 'Conoce la ciudad detrás de la búsqueda.']
];

for (const [source, chinese, spanish] of requiredTranslations) {
  if (!localeSource.includes(`'${source}'`) && !localeSource.includes(`"${source}"`)) failures.push(`missing source key: ${source}`);
  if (!localeSource.includes(`'${chinese}'`) && !localeSource.includes(`\`${chinese}\``)) failures.push(`missing Chinese translation: ${chinese}`);
  if (!localeSource.includes(`'${spanish}'`)) failures.push(`missing Spanish translation: ${spanish}`);
}

for (const file of pages) {
  const html = readFileSync(join(site, file), 'utf8');
  if (!html.includes('i18n.js?v=20260918-locale-glossary-v7')) failures.push(`${file}: stale or missing locale cache-bust`);
}

if (failures.length) {
  console.error(`Locale copy tests failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Locale copy tests: OK (${pages.length} pages, ${requiredTranslations.length} key translations)`);
