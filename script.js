document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weatherForm');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const widgetsContainer = document.getElementById('widgetsContainer');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const latitude = parseFloat(latitudeInput.value.trim());
        const longitude = parseFloat(longitudeInput.value.trim());
        if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
            addWeatherWidget(latitude, longitude);
        } else {
            alert('Пожалуйста, введите правильные координаты.');
        }
    });

    function isValidLatitude(latitude) {
        return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
    }

    function isValidLongitude(longitude) {
        return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
    }

    function addWeatherWidget(latitude, longitude) {
        const widgetContainer = document.createElement('div');
        widgetContainer.classList.add('widget-container');

        const closeButton = document.createElement('button');
        closeButton.classList.add('close-button');
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            widgetsContainer.removeChild(widgetContainer);
        });

        const widget = document.createElement('div');
        widget.classList.add('weather-widget');
        widget.innerHTML = '<div class="loading">Загрузка...</div>';

        const mapContainer = document.createElement('div');
        mapContainer.classList.add('map-container');
        const mapId = 'mapid-' + latitude + '-' + longitude;
        mapContainer.id = mapId;

        widgetContainer.appendChild(closeButton);
        widgetContainer.appendChild(widget);
        widgetContainer.appendChild(mapContainer);

        widgetsContainer.appendChild(widgetContainer);

        getWeather(latitude, longitude, widget, mapContainer, mapId);
    }

    async function getWeather(latitude, longitude, widget, mapContainer, mapId) {
        const apiKey = 'b65131903b0b3acd1c6f94794dad9dc8';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            displayWeather(data, widget, latitude, longitude, mapContainer, mapId);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            widget.innerHTML = `<p>Ошибка получения данных о погоде: ${error.message}</p>`;
        }
    }

    function displayWeather(data, widget, latitude, longitude, mapContainer, mapId) {
        if (data.cod !== 200) {
            widget.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        const temperature = Math.round(data.main.temp);
        const windSpeed = data.wind.speed;
        const localTime = getLocalTime(data.timezone);
        const weatherIcon = getWeatherIconUrl(data.weather[0].icon);

        widget.innerHTML = `
            <img src="${weatherIcon}" alt="${data.weather[0].description}">
            <p>Температура: ${temperature}°</p>
            <p>Скорость ветра: ${windSpeed} м/с</p>
            <p>Местное время: ${localTime}</p>
        `;

        addMapToWidget(latitude, longitude, mapId);
    }

    function getWeatherIconUrl(icon) {
        return `http://openweathermap.org/img/wn/${icon}.png`;
    }

    function getLocalTime(timezone) {
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utcTime + (timezone * 1000));
        return localTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function addMapToWidget(latitude, longitude, mapId) {
        const map = L.map(mapId).setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Вы здесь.')
            .openPopup();
    }
});
