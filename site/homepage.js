const clock = document.querySelector('[data-millbrae-time]');
const weatherIcon = document.querySelector('[data-weather-icon]');
const weatherSummary = document.querySelector('[data-weather-summary]');
const weatherDetail = document.querySelector('[data-weather-detail]');

const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=37.6001&longitude=-122.4012&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles';

const weatherCodes = {
  0: ['☀', 'Clear sky'],
  1: ['🌤', 'Mainly clear'],
  2: ['⛅', 'Partly cloudy'],
  3: ['☁', 'Overcast'],
  45: ['🌫', 'Fog'],
  48: ['🌫', 'Rime fog'],
  51: ['🌦', 'Light drizzle'],
  53: ['🌦', 'Drizzle'],
  55: ['🌧', 'Heavy drizzle'],
  61: ['🌦', 'Light rain'],
  63: ['🌧', 'Rain'],
  65: ['🌧', 'Heavy rain'],
  71: ['🌨', 'Light snow'],
  73: ['🌨', 'Snow'],
  75: ['❄', 'Heavy snow'],
  80: ['🌦', 'Rain showers'],
  81: ['🌧', 'Rain showers'],
  82: ['⛈', 'Heavy rain showers'],
  95: ['⛈', 'Thunderstorm'],
  96: ['⛈', 'Thunderstorm with hail'],
  99: ['⛈', 'Thunderstorm with hail']
};

async function updateWeather() {
  if (!weatherSummary || !weatherDetail) return;
  try {
    const response = await fetch(weatherUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Weather request failed');
    const payload = await response.json();
    const current = payload.current;
    const [icon, condition] = weatherCodes[current.weather_code] || ['☼', 'Current conditions'];
    if (weatherIcon) weatherIcon.textContent = icon;
    weatherSummary.textContent = `${Math.round(current.temperature_2m)}°F · ${condition}`;
    weatherDetail.textContent = `Feels like ${Math.round(current.apparent_temperature)}°F · Wind ${Math.round(current.wind_speed_10m)} mph`;
  } catch {
    if (weatherIcon) weatherIcon.textContent = '☼';
    weatherSummary.textContent = 'Weather unavailable';
    weatherDetail.textContent = 'Check back for current conditions';
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
