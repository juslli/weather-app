const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const windSpeed = document.getElementById("windSpeed");
const apparentTemp = document.getElementById("apparentTemp");
const humidity = document.getElementById("humidity");
const timeNow = document.getElementById("timeNow");

function translateWeatherCode(code) {
  const weatherCodes = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Névoa",
    48: "Névoa com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    56: "Garoa congelante leve",
    57: "Garoa congelante intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    66: "Chuva congelante leve",
    67: "Chuva congelante forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Grãos de neve",
    80: "Pancadas de chuva fracas",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    85: "Pancadas de neve fracas",
    86: "Pancadas de neve fortes",
    95: "Trovoada",
    96: "Trovoada com granizo leve",
    99: "Trovoada com granizo forte"
  };

  return weatherCodes[code] || "Clima indisponível";
}

function showMessage(text) {
  message.textContent = text;
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  console.log("URL cidade:", url);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Erro ao buscar cidade.");
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("Cidade não encontrada.");
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;

  console.log("URL clima:", url);

  const response = await fetch(url);
  const rawText = await response.text();

  console.log("Resposta bruta da API:", rawText);

  let data;

  try {
    data = JSON.parse(rawText);
  } catch (error) {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!response.ok || data.error) {
    throw new Error(data.reason || "Erro ao buscar clima.");
  }

  return data;
}

async function searchWeather() {
  const city = cityInput.value.trim();

  if (city === "") {
    showMessage("Digite uma cidade primeiro.");
    weatherResult.classList.add("hidden");
    return;
  }

  showMessage("Buscando clima...");
  weatherResult.classList.add("hidden");

  try {
    const location = await getCoordinates(city);
    const weatherData = await getWeather(location.latitude, location.longitude);

    cityName.textContent = `${location.name}${location.admin1 ? ", " + location.admin1 : ""}`;
    weatherDescription.textContent = translateWeatherCode(weatherData.current.weather_code);
    temperature.textContent = `${Math.round(weatherData.current.temperature_2m)}°C`;
    windSpeed.textContent = `${Math.round(weatherData.current.wind_speed_10m)} km/h`;
    apparentTemp.textContent = `${Math.round(weatherData.current.apparent_temperature)}°C`;
    humidity.textContent = `${weatherData.current.relative_humidity_2m}%`;

    const rawTime = weatherData.current.time;
    timeNow.textContent = rawTime ? rawTime.replace("T", " ") : "--";

    showMessage("");
    weatherResult.classList.remove("hidden");
  } catch (error) {
    console.error("Erro completo:", error);
    showMessage(error.message);
    weatherResult.classList.add("hidden");
  }
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});
