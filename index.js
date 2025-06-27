const API_KEY = "ac98f8f89e437e27501a5090a1f0048a";

const searchForm = document.querySelector("[data-searchForm]");
const searchInput = document.querySelector("[data-searchInput]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const introSection = document.querySelector(".intro-section");
const wrapper = document.querySelector(".wrapper");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cityName = searchInput.value.trim();
  if (cityName !== "") fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");

  try {
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoResponse.json();
    if (!geoData.length) {
      alert("City not found!");
      loadingScreen.classList.remove("active");
      return;
    }

    const { lat, lon } = geoData[0];

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await weatherResponse.json();

    renderWeather(data);
  } catch (err) {
    alert("Error fetching weather data.");
  } finally {
    loadingScreen.classList.remove("active");
  }
}

function renderWeather(data) {
  document.querySelector("[data-cityName]").innerText = data.name;
  document.querySelector("[data-countryIcon]").src = `https://flagcdn.com/144x108/${data.sys.country.toLowerCase()}.png`;
  document.querySelector("[data-weatherDesc]").innerText = data.weather[0].description;
  document.querySelector("[data-weatherIcon]").src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  document.querySelector("[data-temp]").innerText = `${data.main.temp} °C`;
  document.querySelector("[data-windspeed]").innerText = `${data.wind.speed} m/s`;
  document.querySelector("[data-humidity]").innerText = `${data.main.humidity}%`;
  document.querySelector("[data-cloudiness]").innerText = `${data.clouds.all}%`;

  userInfoContainer.classList.add("active");

  // Hide the intro and remove center layout
  introSection.classList.add("hidden");
  wrapper.classList.remove("initial-center");
}

