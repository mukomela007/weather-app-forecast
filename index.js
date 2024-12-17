// index.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '2fd716b301877f9d73d9bec2b9da2d02'; // Replace with your OpenWeatherMap API key
    const getWeatherBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('searchBar');
    const weatherResult = document.getElementById('currentWeather');
    const forecastDiv = document.getElementById('forecast');
    const saveCityBtn = document.getElementById('saveCityBtn');
    const savedCitiesDiv = document.getElementById('savedCities');
    const unitToggle = document.getElementById('unitSelect');
    const languageSelect = document.getElementById('languageSelect');
    let unit = 'metric';

    getWeatherBtn.addEventListener('click', function() {
        const city = cityInput.value;
        if (city) {
            getWeatherData(city);
        }
    });

    saveCityBtn.addEventListener('click', function() {
        const city = cityInput.value;
        if (city) {
            saveCity(city);
        }
    });

    unitToggle.addEventListener('change', function(e) {
        unit = e.target.value;
        const city = cityInput.value;
        if (city) {
            getWeatherData(city);
        }
    });

    languageSelect.addEventListener('change', function() {
        loadLanguage(this.value);
    });

    function getWeatherData(city, lat = null, lon = null) {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
        if (lat !== null && lon !== null) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
        }
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather data fetch failed');
                }
                return response.json();
            })
            .then(data => {
                updateWeatherWidget(data);
                updateForecast(data.coord.lat, data.coord.lon);
                updateBackground(data.weather[0].main.toLowerCase());
            })
            .catch(error => {
                displayError('Failed to fetch weather data. Please check the city name or try again later.');
                console.error('Error fetching weather data:', error);
            });
    }

    function updateWeatherWidget(data) {
        const localTime = new Date((data.dt + data.timezone) * 1000).toLocaleTimeString('en-US', { timeZone: 'UTC' });
        weatherResult.innerHTML = `
            <div class="weather-widget">
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                <div class="weather-details">
                    <h2>${data.name}</h2>
                    <p>Temperature: ${data.main.temp} ${unit === 'metric' ? '°C' : '°F'}</p>
                    <p>Condition: ${data.weather[0].description}</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind Speed: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
                    <p>Local Time: ${localTime}</p>
                </div>
            </div>
        `;
    }

    function updateForecast(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Forecast data fetch failed');
                }
                return response.json();
            })
            .then(data => {
                forecastDiv.innerHTML = '<h2>5-Day Forecast</h2>';
                const forecastList = data.list.filter((item, index) => index % 8 === 0); // Get daily forecasts
                forecastList.forEach(day => {
                    const date = new Date(day.dt_txt).toLocaleDateString();
                    forecastDiv.innerHTML += `
                        <div class="forecast-day">
                            <h3>${date}</h3>
                            <p>Temp: ${day.main.temp} ${unit === 'metric' ? '°C' : '°F'}</p>
                            <p>${day.weather[0].description}</p>
                            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="weather-icon">
                        </div>
                    `;
                });
            })
            .catch(error => {
                displayError('Failed to fetch forecast data. Please try again later.');
                console.error('Error fetching forecast data:', error);
            });
    }

    function updateBackground(weatherCondition) {
        const body = document.body;
        body.className = ''; // Clear existing classes
        switch (weatherCondition) {
            case 'clear':
                body.classList.add('sunny');
                break;
            case 'clouds':
                body.classList.add('cloudy');
                break;
            case 'rain':
                body.classList.add('rainy');
                break;
            case 'snow':
                body.classList.add('snowy');
                break;
            default:
                body.classList.add('default');
                break;
        }
    }

    function saveCity(city) {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
        if (!savedCities.includes(city)) {
            savedCities.push(city);
            localStorage.setItem('savedCities', JSON.stringify(savedCities));
            displaySavedCities();
        }
    }

    function displaySavedCities() {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
        savedCitiesDiv.innerHTML = '<h2>Saved Cities</h2><ul id="cityList"></ul>';
        const cityList = document.getElementById('cityList');
        savedCities.forEach(city => {
            const listItem = document.createElement('li');
            listItem.textContent = city;
            listItem.addEventListener('click', () => getWeatherData(city));
            cityList.appendChild(listItem);
        });
    }

    function displayError(message) {
        weatherResult.innerHTML = `<p class="error">${message}</p>`;
    }

    function loadLanguage(lang) {
        fetch(`./${lang}.json`)
            .then(response => response.json())
            .then(data => {
                document.querySelector('h1').innerText = data.title;
                document.querySelector('#searchBar').placeholder = data.placeholder;
                document.querySelector('#searchBtn').innerText = data.getWeather;
                document.querySelector('#geoLocationBtn').innerText = data.geoLocation;
                document.querySelector('#saveCityBtn').innerText = data.saveCity;
                document.querySelector('#languageSelect').value = lang;
            })
            .catch(error => {
                displayError('Failed to load language file.');
                console.error('Error loading language file:', error);
            });
    }

    // Load default language and saved cities
    loadLanguage('en');
    displaySavedCities();
});
