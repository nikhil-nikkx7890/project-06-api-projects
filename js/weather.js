const WEATHER_API = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}&q=`;
const FORECAST_API = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${CONFIG.OPENWEATHER_API_KEY}&q=`;

const citySearch = document.querySelector("#citySearch");
const weatherDisplay = document.querySelector("#weatherDisplay");
const currentWeatherDiv = document.querySelector("#currentWeather");
const forecastGrid = document.querySelector("#forecastGrid");
const spinner = document.querySelector("#loadingSpinner");
const initialMessage = document.querySelector("#initialMessage");

function getWeatherIconURL(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

function toggleLoading(show) {
  if (show) {
    spinner.classList.add("active");
    weatherDisplay.style.display = "none";
    initialMessage.style.display = "none";
  } else {
    spinner.classList.remove("active");
  }
}

function showError(msg) {
  weatherDisplay.style.display = "none";
  initialMessage.style.display = "block";
  initialMessage.innerHTML = `
    <div class="error-message">
      <i class="bi bi-exclamation-circle"></i>
      <h3 class="mt-3">Oops!</h3>
      <p class="text-muted">${msg}</p>
    </div>
  `;
}
async function getWeather(city) {
  toggleLoading(true);

  const weatherRes = await fetch(WEATHER_API + encodeURIComponent(city));
  if (!weatherRes || !weatherRes.ok) {
    toggleLoading(false);
    showError("City not found or network error");
    return;
  }
  const weatherData = await weatherRes.json();

  const forecastRes = await fetch(FORECAST_API + encodeURIComponent(city));
  if (!forecastRes || !forecastRes.ok) {
    toggleLoading(false);
    showError("Could not fetch forecast");
    return;
  }
  const forecastData = await forecastRes.json();

  toggleLoading(false);
  displayCurrentWeather(weatherData);
  displayForecast(forecastData);
  weatherDisplay.style.display = "block";
}
function displayCurrentWeather(data) {
  const { name, main, weather, wind } = data;
  const { temp, feels_like, humidity, pressure } = main;
  const { description, icon } = weather[0];

  currentWeatherDiv.innerHTML = `
    <div class="weather-card">
      <div class="d-flex align-items-center justify-content-center gap-4 flex-wrap">
        <div style="text-align:center">
          <img src="${getWeatherIconURL(icon)}" alt="${description}" class="weather-icon">
          <div class="text-muted" style="text-transform:capitalize">${description}</div>
        </div>
        <div>
          <h2 style="margin:0">${name}</h2>
          <div class="weather-temp">${Math.round(temp)}°C</div>
          <div class="text-muted">Feels like ${Math.round(feels_like)}°C</div>
        </div>
        <div class="weather-details">
          <div class="weather-detail-item">
            <i class="bi bi-droplet"></i>
            <span class="label">Humidity</span>
            <span class="value">${humidity}%</span>
          </div>
          <div class="weather-detail-item">
            <i class="bi bi-wind"></i>
            <span class="label">Wind</span>
            <span class="value">${Math.round(wind.speed)} m/s</span>
          </div>
          <div class="weather-detail-item">
            <i class="bi bi-speedometer2"></i>
            <span class="label">Pressure</span>
            <span class="value">${pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
function displayForecast(data) {
  const list = data.list || [];
  const daily = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const hour = item.dt_txt.split(" ")[1].split(":")[0];
    if (!daily[date]) daily[date] = item;
    if (hour === "12") daily[date] = item;
  });

  const days = Object.keys(daily).slice(0, 5);
  forecastGrid.innerHTML = days
    .map((date) => {
      const f = daily[date];
      const { main, weather, dt_txt } = f;
      const { temp } = main;
      const { icon, description } = weather[0];
      const dayName = new Date(dt_txt).toLocaleDateString("en-US", {
        weekday: "short",
      });

      return `
        <div class="forecast-card">
          <p style="margin:0; font-weight:700">${dayName}</p>
          <img src="${getWeatherIconURL(icon)}" alt="${description}" style="width:60px; height:60px;">
          <p class="text-muted" style="text-transform:capitalize; margin:0.4rem 0 0 0">${description}</p>
          <p style="margin:0.4rem 0 0 0; font-weight:700">${Math.round(temp)}°C</p>
        </div>
      `;
    })
    .join("");
}

citySearch.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const city = this.value.trim();
    if (city) getWeather(city);
  }
});

window.addEventListener("load", function () {
  getWeather("Jaipur");
});
