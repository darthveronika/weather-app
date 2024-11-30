document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weatherForm');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const widgetsContainer = document.getElementById('widgetsContainer');

    form.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(event) {
        event.preventDefault();
        const latitude = parseFloat(latitudeInput.value.trim());
        const longitude = parseFloat(longitudeInput.value.trim());
        if (isValidCoordinates(latitude, longitude)) {
            addWeatherWidget(latitude, longitude);
        } else {
            alert('Пожалуйста, введите правильные координаты');
        }
    }

    function isValidCoordinates(latitude, longitude) {
        return isValidLatitude(latitude) && isValidLongitude(longitude);
    }

    function isValidLatitude(latitude) {
        return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
    }

    function isValidLongitude(longitude) {
        return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
    }

    function addWeatherWidget(latitude, longitude) {
        const widgetContainer = createWidgetContainer();
        const widget = createWeatherWidget();
        const mapContainer = createMapContainer(latitude, longitude);

        widgetContainer.appendChild(widget);
        widgetContainer.appendChild(mapContainer);

        widgetsContainer.appendChild(widgetContainer);

        getWeather(latitude, longitude, widget, mapContainer);
    }

    function createWidgetContainer() {
        const container = document.createElement('div');
        container.classList.add('widget-container');
        const closeButton = createCloseButton(container);
        container.appendChild(closeButton);
        return container;
    }

    function createCloseButton(container) {
        const button = document.createElement('button');
        button.classList.add('close-button');
        button.textContent = '×';
        button.addEventListener('click', () => {
            widgetsContainer.removeChild(container);
        });
        return button;
    }

    function createWeatherWidget() {
        const widget = document.createElement('div');
        widget.classList.add('weather-widget');
        widget.innerHTML = '<div class="loading">Загрузка...</div>';
        return widget;
    }

    function createMapContainer(latitude, longitude) {
        const mapContainer = document.createElement('div');
        mapContainer.classList.add('map-container');
        mapContainer.id = `mapid-${latitude}-${longitude}`;
        return mapContainer;
    }

    async function getWeather(latitude, longitude, widget, mapContainer) {
        const apiKey = 'b65131903b0b3acd1c6f94794dad9dc8'; 
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.cod !== 200) throw new Error(data.message);
            displayWeather(data, widget, latitude, longitude, mapContainer);
        } catch (error) {
            displayError(widget, error);
        }
    }

    function displayWeather(data, widget, latitude, longitude, mapContainer) {
        const { main, wind, weather, timezone } = data;
        const temperature = Math.round(main.temp);
        const windSpeed = wind.speed;
        const weatherIcon = getWeatherIconUrl(weather[0].icon);
        const localTime = getLocalTime(timezone);

        widget.innerHTML = `
            <img src="${weatherIcon}" alt="${weather[0].description}">
            <p>Температура: ${temperature}°</p>
            <p>Скорость ветра: ${windSpeed} м/с</p>
            <p>Местное время: ${localTime}</p>
        `;
        addMapToWidget(latitude, longitude, mapContainer);
    }

    function displayError(widget, error) {
        widget.innerHTML = `<p>Ошибка получения данных о погоде: ${error.message}</p>`;
    }

    function getWeatherIconUrl(icon) {
        return `http://openweathermap.org/img/wn/${icon}.png`;
    }

    function getLocalTime(timezone) {
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utcTime + timezone * 1000);
        return localTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function addMapToWidget(latitude, longitude, mapContainer) {
        const map = L.map(mapContainer.id).setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Вы здесь')
            .openPopup();
    }
});
