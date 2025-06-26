const userTab = document.querySelector("[data-userWeather]"); 
const searchTab = document.querySelector("[data-searchWeather]");  //data-searchWeather.  this is custom attribute
 const userContainer = document.querySelector(".weather-container");   //.weather-container. this is class

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");  


let oldTab = userTab;
const API_KEY = "cb3ad75f0c632d9ec1e928cda9db05f3";
oldTab.classList.add("current-tab");
getfromSessionStorage();



//loading till we get info

function switchTab(newTab) {
    if (newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
//here search form active nhi hai so we have to active search form
        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();    //to get cordinates from local storage
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        //if local cordinate is not there then fetch from grant location window
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);  //function to fetch userweatherinfo based on loacal coordinates
    }
}
//fetch ap for user info
async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    grantAccessContainer.classList.remove("active"); //grant permisssion remove
    loadingScreen.classList.add("active"); //loader visible

    try { //api call
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active"); //loading remove
        userInfoContainer.classList.add("active"); //userinfo active
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather data.");
    }
}

function renderWeatherInfo(weatherInfo) { //to put data in ui
    const cityName = document.querySelector("[data-cityName]");   //values which we need to put in website
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
     
    //fetch value from weatherinfo object and put in ui
    cityName.innerText = weatherInfo?.name;  //cityname is directly inside weather info object in json
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}
//function to get current location based on latitude and longitude
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude, //to store current lattitude and longitude cordinates
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]"); //to create button to call get location after clicking that button
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); //default mthod ko hata deta hai
    let cityName = searchInput.value;
    if (cityName === "") return;
    else fetchSearchWeatherInfo(cityName);
});


//search weather api call

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active"); //first need to active loader
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        // 1st API Call — Get coordinates from city
        const geoResponse = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
        );
        const geoData = await geoResponse.json();
        if (!geoData.length) {
            alert("City not found!");
            loadingScreen.classList.remove("active");
            return;
        }

        const { lat, lon } = geoData[0];

        // 2nd API Call — Get weather using coordinates
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(weatherData);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("Error fetching weather data.");
    }
}
