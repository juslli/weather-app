const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherBox = document.getElementById("weatherBox");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const background = document.querySelector(".background");

const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const weatherTextEl = document.getElementById("weatherText");
const temperatureEl = document.getElementById("temperature");
const windEl = document.getElementById("wind");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const localTimeEl = document.getElementById("localTime");

searchBtn.addEventListener("click", buscarClima);

cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    buscarClima();
  }
});

async function buscarClima() {
  const city = cityInput.value.trim();

  if (!city) {
    mostrarMensagem("Digite uma cidade primeiro.");
    weatherBox.classList.add("hidden");
    return;
  }

  try {
    mostrarLoading(true);
    mostrarMensagem("");
    weatherBox.classList.add("hidden");

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, admin1, country } = place;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      throw new Error("Não foi possível carregar o clima.");
    }

    const current = weatherData.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    cityNameEl.textContent = `${name}${admin1 ? ", " + admin1 : ""}${country ? ", " + country : ""}`;
    weatherIconEl.textContent = weatherInfo.icon;
    weatherTextEl.textContent = weatherInfo.text;
    temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;
    windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    localTimeEl.textContent = formatarDataHora(current.time);

    atualizarBackground(current.weather_code);

    weatherBox.classList.remove("hidden");
  } catch (error) {
    mostrarMensagem(error.message || "Erro ao buscar o clima.");
    weatherBox.classList.add("hidden");
  } finally {
    mostrarLoading(false);
  }
}

function mostrarLoading(show) {
  loading.classList.toggle("hidden", !show);
}

function mostrarMensagem(texto) {
  message.textContent = texto;
}

function formatarDataHora(dateTimeString) {
  const data = new Date(dateTimeString);

  if (isNaN(data.getTime())) {
    return dateTimeString;
  }

  return data
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " •");
}

function getWeatherInfo(code) {
  const weatherCodes = {
    0: { text: "Céu limpo", icon: "☀️" },
    1: { text: "Principalmente limpo", icon: "🌤️" },
    2: { text: "Parcialmente nublado", icon: "⛅" },
    3: { text: "Nublado", icon: "☁️" },
    45: { text: "Névoa", icon: "🌫️" },
    48: { text: "Névoa intensa", icon: "🌫️" },
    51: { text: "Garoa leve", icon: "🌦️" },
    53: { text: "Garoa moderada", icon: "🌦️" },
    55: { text: "Garoa forte", icon: "🌧️" },
    56: { text: "Garoa congelante leve", icon: "🌨️" },
    57: { text: "Garoa congelante forte", icon: "🌨️" },
    61: { text: "Chuva leve", icon: "🌧️" },
    63: { text: "Chuva moderada", icon: "🌧️" },
    65: { text: "Chuva forte", icon: "🌧️" },
    66: { text: "Chuva congelante leve", icon: "🌨️" },
    67: { text: "Chuva congelante forte", icon: "🌨️" },
    71: { text: "Neve leve", icon: "❄️" },
    73: { text: "Neve moderada", icon: "❄️" },
    75: { text: "Neve forte", icon: "❄️" },
    77: { text: "Grãos de neve", icon: "❄️" },
    80: { text: "Pancadas leves", icon: "🌦️" },
    81: { text: "Pancadas moderadas", icon: "🌧️" },
    82: { text: "Pancadas fortes", icon: "⛈️" },
    85: { text: "Pancadas de neve leves", icon: "🌨️" },
    86: { text: "Pancadas de neve fortes", icon: "🌨️" },
    95: { text: "Trovoada", icon: "⛈️" },
    96: { text: "Trovoada com granizo leve", icon: "⛈️" },
    99: { text: "Trovoada com granizo forte", icon: "⛈️" },
  };

  return weatherCodes[code] || { text: "Clima desconhecido", icon: "🌍" };
}

function atualizarBackground(code) {
  background.className = "background";

  if (code === 0 || code === 1) {
    background.classList.add("glow-clear");
  } else if (code === 2 || code === 3) {
    background.classList.add("glow-clouds");
  } else if ([45, 48].includes(code)) {
    background.classList.add("glow-fog");
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    background.classList.add("glow-rain");
  } else if ([95, 96, 99].includes(code)) {
    background.classList.add("glow-storm");
  } else if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code)) {
    background.classList.add("glow-snow");
  } else {
    background.classList.add("glow-clear");
  }
}
