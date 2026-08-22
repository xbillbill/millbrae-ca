const clock = document.querySelector('[data-millbrae-time]');
const weatherIcon = document.querySelector('[data-weather-icon]');
const weatherSummary = document.querySelector('[data-weather-summary]');
const weatherDetail = document.querySelector('[data-weather-detail]');

const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.6001&longitude=-122.4012&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles';

const weatherCodes = {
  0: ['☀', 'Clear sky', '晴朗', 'Cielo despejado'],
  1: ['🌤', 'Mainly clear', '大致晴朗', 'Mayormente despejado'],
  2: ['⛅', 'Partly cloudy', '局部多云', 'Parcialmente nublado'],
  3: ['☁', 'Overcast', '阴天', 'Nublado'],
  45: ['🌫', 'Fog', '雾', 'Niebla'],
  48: ['🌫', 'Rime fog', '冻雾', 'Niebla helada'],
  51: ['🌦', 'Light drizzle', '小雨', 'Llovizna ligera'],
  53: ['🌦', 'Drizzle', '毛毛雨', 'Llovizna'],
  55: ['🌧', 'Heavy drizzle', '大雨', 'Llovizna intensa'],
  61: ['🌦', 'Light rain', '小雨', 'Lluvia ligera'],
  63: ['🌧', 'Rain', '下雨', 'Lluvia'],
  65: ['🌧', 'Heavy rain', '大雨', 'Lluvia intensa'],
  71: ['🌨', 'Light snow', '小雪', 'Nieve ligera'],
  73: ['🌨', 'Snow', '下雪', 'Nieve'],
  75: ['❄', 'Heavy snow', '大雪', 'Nieve intensa'],
  80: ['🌦', 'Rain showers', '阵雨', 'Chubascos'],
  81: ['🌧', 'Rain showers', '阵雨', 'Chubascos'],
  82: ['⛈', 'Heavy rain showers', '强阵雨', 'Chubascos intensos'],
  95: ['⛈', 'Thunderstorm', '雷暴', 'Tormenta'],
  96: ['⛈', 'Thunderstorm with hail', '雷暴伴冰雹', 'Tormenta con granizo'],
  99: ['⛈', 'Thunderstorm with hail', '雷暴伴冰雹', 'Tormenta con granizo']
};

const weatherCopy = {
  en: { feelsLike: 'Feels like', wind: 'Wind', unavailable: 'Weather unavailable', checkBack: 'Check back for current conditions' },
  'zh-CN': { feelsLike: '体感', wind: '风速', unavailable: '天气信息暂时不可用', checkBack: '请稍后查看当前天气' },
  es: { feelsLike: 'Sensación térmica', wind: 'Viento', unavailable: 'Clima no disponible', checkBack: 'Vuelve a consultar las condiciones actuales' }
};

let latestWeather = null;

function renderWeather(current) {
  const locale = document.documentElement.lang === 'zh-CN' || document.documentElement.lang === 'es'
    ? document.documentElement.lang
    : 'en';
  const copy = weatherCopy[locale];
  const weather = weatherCodes[current.weather_code] || ['☼', 'Current conditions', '当前天气', 'Condiciones actuales'];
  const condition = locale === 'zh-CN' ? weather[2] : locale === 'es' ? weather[3] : weather[1];
  if (weatherIcon) weatherIcon.textContent = weather[0];
  weatherSummary.textContent = `${Math.round(current.temperature_2m)}°F · ${condition}`;
  weatherDetail.textContent = `${copy.feelsLike} ${Math.round(current.apparent_temperature)}°F · ${copy.wind} ${Math.round(current.wind_speed_10m)} mph`;
}

async function updateWeather() {
  if (!weatherSummary || !weatherDetail) return;
  try {
    const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Weather request failed');
    const payload = await response.json();
    latestWeather = payload.current;
    renderWeather(latestWeather);
  } catch {
    const locale = document.documentElement.lang === 'zh-CN' || document.documentElement.lang === 'es'
      ? document.documentElement.lang
      : 'en';
    const copy = weatherCopy[locale];
    if (weatherIcon) weatherIcon.textContent = '☼';
    weatherSummary.textContent = copy.unavailable;
    weatherDetail.textContent = copy.checkBack;
  }
}

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

updateWeather();
window.setInterval(updateWeather, 10 * 60_000);
window.addEventListener('localechange', () => {
  if (latestWeather) renderWeather(latestWeather);
});
