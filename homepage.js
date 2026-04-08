document.addEventListener('DOMContentLoaded', function() {
    // ========================================================================
    // Constants & state
    // ========================================================================
    const folderTree = document.getElementById('folder-tree');
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const settingsButton = document.getElementById('settings-button');
    const timeContainer = document.querySelector('.time-container');
    const weatherContainer = document.getElementById('weather');

    const DEFAULT_ROOT_FOLDER = 'Speed Dial';
    const DEFAULT_TIMEZONE = 'Australia/Perth';
    const DEFAULT_CITY = 'Perth';
    const DEFAULT_FAVICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2NjYzRkZiIvPgo8cGF0aCBkPSJtMTYgNHYxNmg4VjE2SDE2VjR6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';

    let rootFolder = DEFAULT_ROOT_FOLDER;
    let timezone = DEFAULT_TIMEZONE;
    let city = DEFAULT_CITY;

    // ========================================================================
    // Weather
    // ========================================================================
    const CITY_COORDS = {
        'Abu Dhabi': { lat: 24.45, lon: 54.65 },
        'Abuja': { lat: 9.06, lon: 7.49 },
        'Accra': { lat: 5.60, lon: -0.19 },
        'Addis Ababa': { lat: 9.03, lon: 38.74 },
        'Adelaide': { lat: -34.93, lon: 138.60 },
        'Algiers': { lat: 36.75, lon: 3.06 },
        'Almaty': { lat: 43.22, lon: 76.85 },
        'Amman': { lat: 31.95, lon: 35.93 },
        'Amsterdam': { lat: 52.37, lon: 4.90 },
        'Anchorage': { lat: 61.22, lon: -149.90 },
        'Ankara': { lat: 39.93, lon: 32.85 },
        'Athens': { lat: 37.98, lon: 23.73 },
        'Atlanta': { lat: 33.75, lon: -84.39 },
        'Auckland': { lat: -36.85, lon: 174.76 },
        'Baghdad': { lat: 33.31, lon: 44.37 },
        'Bangkok': { lat: 13.76, lon: 100.50 },
        'Bangalore': { lat: 12.97, lon: 77.59 },
        'Barcelona': { lat: 41.39, lon: 2.17 },
        'Beijing': { lat: 39.90, lon: 116.40 },
        'Beirut': { lat: 33.89, lon: 35.50 },
        'Belgrade': { lat: 44.79, lon: 20.47 },
        'Berlin': { lat: 52.52, lon: 13.41 },
        'Bogota': { lat: 4.71, lon: -74.07 },
        'Boston': { lat: 42.36, lon: -71.06 },
        'Brasilia': { lat: -15.79, lon: -47.88 },
        'Bratislava': { lat: 48.15, lon: 17.11 },
        'Brisbane': { lat: -27.47, lon: 153.03 },
        'Brussels': { lat: 50.85, lon: 4.35 },
        'Bucharest': { lat: 44.43, lon: 26.10 },
        'Budapest': { lat: 47.50, lon: 19.04 },
        'Buenos Aires': { lat: -34.60, lon: -58.38 },
        'Cairo': { lat: 30.04, lon: 31.24 },
        'Calgary': { lat: 51.05, lon: -114.07 },
        'Cape Town': { lat: -33.92, lon: 18.42 },
        'Caracas': { lat: 10.49, lon: -66.88 },
        'Casablanca': { lat: 33.57, lon: -7.59 },
        'Chennai': { lat: 13.08, lon: 80.27 },
        'Chengdu': { lat: 30.57, lon: 104.07 },
        'Chicago': { lat: 41.88, lon: -87.63 },
        'Christchurch': { lat: -43.53, lon: 172.64 },
        'Colombo': { lat: 6.93, lon: 79.85 },
        'Copenhagen': { lat: 55.68, lon: 12.57 },
        'Dakar': { lat: 14.69, lon: -17.44 },
        'Dallas': { lat: 32.78, lon: -96.80 },
        'Dar es Salaam': { lat: -6.79, lon: 39.28 },
        'Darwin': { lat: -12.46, lon: 130.84 },
        'Delhi': { lat: 28.61, lon: 77.21 },
        'Denver': { lat: 39.74, lon: -104.99 },
        'Detroit': { lat: 42.33, lon: -83.05 },
        'Dhaka': { lat: 23.81, lon: 90.41 },
        'Doha': { lat: 25.29, lon: 51.53 },
        'Dubai': { lat: 25.20, lon: 55.27 },
        'Dublin': { lat: 53.35, lon: -6.26 },
        'Durban': { lat: -29.86, lon: 31.02 },
        'Edinburgh': { lat: 55.95, lon: -3.19 },
        'Edmonton': { lat: 53.55, lon: -113.49 },
        'Frankfurt': { lat: 50.11, lon: 8.68 },
        'Gaza': { lat: 31.50, lon: 34.47 },
        'Geneva': { lat: 46.20, lon: 6.15 },
        'Guangzhou': { lat: 23.13, lon: 113.26 },
        'Guatemala City': { lat: 14.63, lon: -90.51 },
        'Hanoi': { lat: 21.03, lon: 105.85 },
        'Havana': { lat: 23.11, lon: -82.37 },
        'Helsinki': { lat: 60.17, lon: 24.94 },
        'Ho Chi Minh City': { lat: 10.82, lon: 106.63 },
        'Hong Kong': { lat: 22.32, lon: 114.17 },
        'Honolulu': { lat: 21.31, lon: -157.86 },
        'Houston': { lat: 29.76, lon: -95.37 },
        'Islamabad': { lat: 33.69, lon: 73.04 },
        'Istanbul': { lat: 41.01, lon: 28.98 },
        'Jakarta': { lat: -6.21, lon: 106.85 },
        'Jeddah': { lat: 21.49, lon: 39.19 },
        'Jerusalem': { lat: 31.77, lon: 35.23 },
        'Johannesburg': { lat: -26.20, lon: 28.05 },
        'Kabul': { lat: 34.53, lon: 69.17 },
        'Karachi': { lat: 24.86, lon: 67.01 },
        'Kathmandu': { lat: 27.72, lon: 85.32 },
        'Khartoum': { lat: 15.60, lon: 32.53 },
        'Kigali': { lat: -1.94, lon: 29.87 },
        'Kingston': { lat: 18.00, lon: -76.78 },
        'Kinshasa': { lat: -4.44, lon: 15.27 },
        'Kolkata': { lat: 22.57, lon: 88.36 },
        'Kuala Lumpur': { lat: 3.14, lon: 101.69 },
        'Kuwait City': { lat: 29.38, lon: 47.99 },
        'Kyiv': { lat: 50.45, lon: 30.52 },
        'Lagos': { lat: 6.52, lon: 3.38 },
        'Lahore': { lat: 31.52, lon: 74.36 },
        'La Paz': { lat: -16.50, lon: -68.15 },
        'Lima': { lat: -12.05, lon: -77.04 },
        'Lisbon': { lat: 38.72, lon: -9.14 },
        'Ljubljana': { lat: 46.06, lon: 14.51 },
        'London': { lat: 51.51, lon: -0.13 },
        'Los Angeles': { lat: 34.05, lon: -118.24 },
        'Luanda': { lat: -8.84, lon: 13.23 },
        'Luxembourg': { lat: 49.61, lon: 6.13 },
        'Lyon': { lat: 45.76, lon: 4.83 },
        'Madrid': { lat: 40.42, lon: -3.70 },
        'Manila': { lat: 14.60, lon: 120.98 },
        'Maputo': { lat: -25.97, lon: 32.58 },
        'Marrakech': { lat: 31.63, lon: -8.01 },
        'Melbourne': { lat: -37.81, lon: 144.96 },
        'Mexico City': { lat: 19.43, lon: -99.13 },
        'Miami': { lat: 25.76, lon: -80.19 },
        'Milan': { lat: 45.46, lon: 9.19 },
        'Minneapolis': { lat: 44.98, lon: -93.27 },
        'Minsk': { lat: 53.90, lon: 27.56 },
        'Montreal': { lat: 45.50, lon: -73.57 },
        'Moscow': { lat: 55.76, lon: 37.62 },
        'Mumbai': { lat: 19.08, lon: 72.88 },
        'Munich': { lat: 48.14, lon: 11.58 },
        'Muscat': { lat: 23.59, lon: 58.54 },
        'Nairobi': { lat: -1.29, lon: 36.82 },
        'New Orleans': { lat: 29.95, lon: -90.07 },
        'New York': { lat: 40.71, lon: -74.01 },
        'Osaka': { lat: 34.69, lon: 135.50 },
        'Oslo': { lat: 59.91, lon: 10.75 },
        'Ottawa': { lat: 45.42, lon: -75.70 },
        'Paris': { lat: 48.86, lon: 2.35 },
        'Perth': { lat: -31.95, lon: 115.86 },
        'Phnom Penh': { lat: 11.55, lon: 104.92 },
        'Phoenix': { lat: 33.45, lon: -112.07 },
        'Port Moresby': { lat: -9.44, lon: 147.18 },
        'Prague': { lat: 50.08, lon: 14.43 },
        'Pretoria': { lat: -25.75, lon: 28.19 },
        'Quito': { lat: -0.18, lon: -78.47 },
        'Rabat': { lat: 34.02, lon: -6.84 },
        'Reykjavik': { lat: 64.15, lon: -21.94 },
        'Riga': { lat: 56.95, lon: 24.11 },
        'Rio de Janeiro': { lat: -22.91, lon: -43.17 },
        'Riyadh': { lat: 24.71, lon: 46.68 },
        'Rome': { lat: 41.90, lon: 12.50 },
        'San Francisco': { lat: 37.77, lon: -122.42 },
        'San Jose': { lat: 37.34, lon: -121.89 },
        'San Juan': { lat: 18.47, lon: -66.12 },
        'San Salvador': { lat: 13.69, lon: -89.22 },
        'Sanaa': { lat: 15.37, lon: 44.19 },
        'Santiago': { lat: -33.45, lon: -70.67 },
        'Santo Domingo': { lat: 18.49, lon: -69.94 },
        'Sao Paulo': { lat: -23.55, lon: -46.63 },
        'Sarajevo': { lat: 43.86, lon: 18.41 },
        'Seattle': { lat: 47.61, lon: -122.33 },
        'Seoul': { lat: 37.57, lon: 126.98 },
        'Shanghai': { lat: 31.23, lon: 121.47 },
        'Shenzhen': { lat: 22.54, lon: 114.06 },
        'Singapore': { lat: 1.35, lon: 103.82 },
        'Skopje': { lat: 42.00, lon: 21.43 },
        'Sofia': { lat: 42.70, lon: 23.32 },
        'Stockholm': { lat: 59.33, lon: 18.07 },
        'Suva': { lat: -18.14, lon: 178.44 },
        'Sydney': { lat: -33.87, lon: 151.21 },
        'Taipei': { lat: 25.03, lon: 121.57 },
        'Tallinn': { lat: 59.44, lon: 24.75 },
        'Tashkent': { lat: 41.30, lon: 69.28 },
        'Tbilisi': { lat: 41.72, lon: 44.79 },
        'Tehran': { lat: 35.69, lon: 51.39 },
        'Tel Aviv': { lat: 32.09, lon: 34.78 },
        'The Hague': { lat: 52.07, lon: 4.30 },
        'Tirana': { lat: 41.33, lon: 19.82 },
        'Tokyo': { lat: 35.68, lon: 139.69 },
        'Toronto': { lat: 43.65, lon: -79.38 },
        'Toulouse': { lat: 43.60, lon: 1.44 },
        'Tripoli': { lat: 32.90, lon: 13.19 },
        'Tunis': { lat: 36.81, lon: 10.18 },
        'Ulaanbaatar': { lat: 47.89, lon: 106.91 },
        'Vancouver': { lat: 49.28, lon: -123.12 },
        'Vatican City': { lat: 41.90, lon: 12.45 },
        'Venice': { lat: 45.44, lon: 12.32 },
        'Vienna': { lat: 48.21, lon: 16.37 },
        'Vientiane': { lat: 17.97, lon: 102.63 },
        'Vilnius': { lat: 54.69, lon: 25.28 },
        'Warsaw': { lat: 52.23, lon: 21.01 },
        'Washington DC': { lat: 38.91, lon: -77.04 },
        'Wellington': { lat: -41.29, lon: 174.78 },
        'Yangon': { lat: 16.87, lon: 96.19 },
        'Yaounde': { lat: 3.87, lon: 11.52 },
        'Yerevan': { lat: 40.18, lon: 44.51 },
        'Zagreb': { lat: 45.81, lon: 15.98 },
        'Zurich': { lat: 47.38, lon: 8.54 }
    };

    const WEATHER_CODE_MAP = {
        0: '☀️ Clear',
        1: '🌤️ Mainly clear',
        2: '⛅ Partly cloudy',
        3: '☁️ Overcast',
        45: '🌫️ Foggy',
        48: '🌫️ Rime fog',
        51: '🌦️ Light drizzle',
        53: '🌦️ Drizzle',
        55: '🌦️ Heavy drizzle',
        61: '🌧️ Light rain',
        63: '🌧️ Rain',
        65: '🌧️ Heavy rain',
        66: '🌨️ Freezing rain',
        67: '🌨️ Heavy freezing rain',
        71: '🌨️ Light snow',
        73: '🌨️ Snow',
        75: '🌨️ Heavy snow',
        77: '🌨️ Snow grains',
        80: '🌧️ Light showers',
        81: '🌧️ Showers',
        82: '⛈️ Heavy showers',
        85: '🌨️ Light snow showers',
        86: '🌨️ Heavy snow showers',
        95: '⛈️ Thunderstorm',
        96: '⛈️ Thunderstorm with hail',
        99: '⛈️ Severe thunderstorm'
    };

    /**
     * Converts a WMO weather code to a human-readable description.
     *
     * @param {number} code - The WMO weather code.
     * @returns {string} A short description with emoji.
     */
    function weatherCodeToDescription(code) {
        return WEATHER_CODE_MAP[code] || '🌡️ Unknown';
    }

    /**
     * Fetches and displays the current weather for the configured city.
     * Uses the geocoding API for custom cities not in the lookup table.
     *
     * @returns {void}
     */
    function updateWeather() {
        var coords = CITY_COORDS[city];
        if (coords) {
            fetchWeatherForCoords(coords);
        } else {
            geocodeAndFetchWeather(city);
        }
    }

    /**
     * Fetches weather for known coordinates.
     *
     * @param {Object} coords - { lat, lon }.
     * @returns {void}
     */
    function fetchWeatherForCoords(coords) {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + coords.lat + '&longitude=' + coords.lon + '&current_weather=true';
        fetchWeather(url);
    }

    /**
     * Geocodes a city name to coordinates, then fetches weather.
     *
     * @param {string} cityName - The city name to geocode.
     * @returns {void}
     */
    function geocodeAndFetchWeather(cityName) {
        var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(cityName) + '&count=1';
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.results && data.results.length > 0) {
                    var result = data.results[0];
                    fetchWeatherForCoords({ lat: result.latitude, lon: result.longitude });
                } else {
                    weatherContainer.textContent = '🌡️ ' + cityName;
                }
            })
            .catch(function(error) {
                console.error('Error geocoding city:', error);
                weatherContainer.textContent = '🌡️ ' + cityName;
            });
    }

    /**
     * Fetches weather data from the Open-Meteo API and updates the display.
     *
     * @param {string} url - The full API URL.
     * @returns {void}
     */
    function fetchWeather(url) {
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                var weather = data.current_weather;
                var desc = weatherCodeToDescription(weather.weathercode);
                weatherContainer.textContent = desc + ' ' + Math.round(weather.temperature) + '°C';
            })
            .catch(function(error) {
                console.error('Error fetching weather:', error);
                weatherContainer.textContent = '🌡️ ' + city;
            });
    }

    // ========================================================================
    // Settings
    // ========================================================================
    settingsButton.addEventListener('click', openSettings);

    /**
     * Opens the extension's options/settings page.
     *
     * @returns {void}
     */
    function openSettings() {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else {
            window.open('options.html', '_blank');
        }
    }

    /**
     * Updates the time display with the current time and date in the configured timezone.
     *
     * @returns {void}
     */
    function updateTime() {
        var now = new Date();
        var timeOptions = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        var dateOptions = {
            timeZone: timezone,
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        };
        var timeString = now.toLocaleTimeString('en-AU', timeOptions);
        var dateString = now.toLocaleDateString('en-AU', dateOptions);
        timeContainer.textContent = dateString + '  ' + '🕐 ' + timeString;
    }

    /**
     * Retrieves saved settings from browser storage.
     *
     * @returns {Promise<void>}
     */
    function getSettings() {
        return browser.storage.local.get(['rootFolder', 'timezone', 'hideSidebar', 'city'])
            .then(applySettings)
            .catch(handleSettingsError);
    }

    /**
     * Applies retrieved settings to module state.
     *
     * @param {Object} result - The raw settings from storage.
     * @returns {void}
     */
    function applySettings(result) {
        rootFolder = parseString(result.rootFolder, DEFAULT_ROOT_FOLDER);
        timezone = parseString(result.timezone, DEFAULT_TIMEZONE);
        city = parseString(result.city, DEFAULT_CITY);
        applySidebarVisibility(!!result.hideSidebar);
    }

    /**
     * Shows or hides the sidebar.
     *
     * @param {boolean} hideSidebar - Whether to hide the sidebar.
     * @returns {void}
     */
    function applySidebarVisibility(hideSidebar) {
        folderTree.style.display = hideSidebar ? 'none' : '';
    }

    /**
     * Handles settings retrieval errors; resets to defaults.
     *
     * @param {Error} error - The error that occurred.
     * @returns {void}
     */
    function handleSettingsError(error) {
        console.error('Error loading settings:', error);
        rootFolder = DEFAULT_ROOT_FOLDER;
        timezone = DEFAULT_TIMEZONE;
        city = DEFAULT_CITY;
        applySidebarVisibility(false);
    }

    /**
     * Trims a string value, falling back to a default if empty.
     *
     * @param {*} value - The raw value from storage.
     * @param {string} defaultValue - The fallback value.
     * @returns {string} The trimmed value or default.
     */
    function parseString(value, defaultValue) {
        return value && value.trim() ? value.trim() : defaultValue;
    }

    // ========================================================================
    // Favicon
    // ========================================================================

    /**
     * Creates a favicon image element for a bookmark.
     *
     * @param {Object} bookmarkItem - The bookmark with id and url.
     * @returns {HTMLImageElement} The favicon element.
     */
    function createFavicon(bookmarkItem) {
        var favicon = document.createElement('img');
        favicon.className = 'bookmark-favicon';
        favicon.alt = '';
        favicon.src = DEFAULT_FAVICON;
        favicon.onerror = handleFaviconError;
        loadFavicon(favicon, bookmarkItem);
        return favicon;
    }

    /**
     * Resets favicon to the default when loading fails.
     *
     * @this {HTMLImageElement}
     * @returns {void}
     */
    function handleFaviconError() {
        this.src = DEFAULT_FAVICON;
    }

    /**
     * Loads a custom icon from storage, or falls back to DuckDuckGo.
     *
     * @param {HTMLImageElement} favicon - The image element to update.
     * @param {Object} bookmarkItem - The bookmark with id and url.
     * @returns {void}
     */
    function loadFavicon(favicon, bookmarkItem) {
        browser.storage.local.get('customIcons').then(function(result) {
            var icons = result.customIcons || {};
            if (icons[bookmarkItem.id]) {
                favicon.src = icons[bookmarkItem.id];
            } else {
                favicon.src = getDuckDuckGoIconUrl(bookmarkItem.url);
            }
        });
    }

    /**
     * Builds a DuckDuckGo favicon URL from a webpage URL.
     *
     * @param {string} url - The webpage URL.
     * @returns {string} The icon URL or the default favicon.
     */
    function getDuckDuckGoIconUrl(url) {
        try {
            return 'https://icons.duckduckgo.com/ip3/' + new URL(url).hostname + '.ico';
        } catch (e) {
            return DEFAULT_FAVICON;
        }
    }

    // ========================================================================
    // Bookmark menu
    // ========================================================================

    /**
     * Creates the ☰ menu button and dropdown with Edit, Delete, Set Icon actions.
     *
     * @param {Object} bookmarkItem - The bookmark with id, title, url.
     * @param {HTMLSpanElement} titleSpan - The title span to update on edit.
     * @param {HTMLAnchorElement} link - The anchor to update on edit.
     * @param {HTMLElement} item - The bookmark container.
     * @param {HTMLImageElement} favicon - The favicon element.
     * @returns {HTMLDivElement} The menu container.
     */
    function createBookmarkMenu(bookmarkItem, titleSpan, link, item, favicon) {
        var menuContainer = document.createElement('div');
        menuContainer.className = 'bookmark-menu';

        var menuButton = document.createElement('button');
        menuButton.type = 'button';
        menuButton.className = 'bookmark-menu-button';
        menuButton.textContent = '☰';
        menuButton.title = 'Bookmark actions';

        var dropdown = document.createElement('div');
        dropdown.className = 'bookmark-menu-dropdown';
        dropdown.appendChild(createMenuEditAction(bookmarkItem, titleSpan, link, dropdown));
        dropdown.appendChild(createMenuDeleteAction(bookmarkItem, item, dropdown));
        dropdown.appendChild(createMenuSetIconAction(bookmarkItem, favicon, dropdown));

        menuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', function closeMenu(event) {
            if (!menuContainer.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });

        menuContainer.appendChild(menuButton);
        menuContainer.appendChild(dropdown);
        return menuContainer;
    }

    /**
     * Creates the "Edit" menu item.
     *
     * @param {Object} bookmarkItem - The bookmark to edit.
     * @param {HTMLSpanElement} titleSpan - The title span to update.
     * @param {HTMLAnchorElement} link - The anchor to update.
     * @param {HTMLDivElement} dropdown - The dropdown to close after action.
     * @returns {HTMLButtonElement}
     */
    function createMenuEditAction(bookmarkItem, titleSpan, link, dropdown) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'bookmark-menu-item';
        button.textContent = '✎ Edit';
        button.title = 'Edit bookmark title';
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            dropdown.classList.remove('open');
            if (!bookmarkItem.id) return;

            var newTitle = prompt('Enter new bookmark title:', bookmarkItem.title || bookmarkItem.url);
            if (newTitle === null) return;

            var trimmed = newTitle.trim();
            if (!trimmed) {
                alert('Title cannot be empty.');
                return;
            }

            browser.bookmarks.update(bookmarkItem.id, { title: trimmed })
                .then(function(updated) {
                    titleSpan.textContent = trimmed;
                    link.title = trimmed;
                })
                .catch(function(error) {
                    console.error('Error updating bookmark:', error);
                    alert('Unable to update bookmark title.');
                });
        });
        return button;
    }

    /**
     * Creates the "Delete" menu item.
     *
     * @param {Object} bookmarkItem - The bookmark to delete.
     * @param {HTMLElement} item - The container to remove.
     * @param {HTMLDivElement} dropdown - The dropdown to close after action.
     * @returns {HTMLButtonElement}
     */
    function createMenuDeleteAction(bookmarkItem, item, dropdown) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'bookmark-menu-item bookmark-menu-item--danger';
        button.textContent = '× Delete';
        button.title = 'Delete bookmark';
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            dropdown.classList.remove('open');
            if (!bookmarkItem.id) return;

            if (!confirm('Delete this bookmark?')) return;

            browser.bookmarks.remove(bookmarkItem.id)
                .then(function() { item.remove(); })
                .catch(function(error) {
                    console.error('Error deleting bookmark:', error);
                    alert('Unable to delete bookmark.');
                });
        });
        return button;
    }

    /**
     * Creates the "Set Icon" menu item.
     *
     * @param {Object} bookmarkItem - The bookmark to set the icon for.
     * @param {HTMLImageElement} favicon - The favicon element to update.
     * @param {HTMLDivElement} dropdown - The dropdown to close after action.
     * @returns {HTMLButtonElement}
     */
    function createMenuSetIconAction(bookmarkItem, favicon, dropdown) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'bookmark-menu-item';
        button.textContent = '⬆ Set Icon';
        button.title = 'Set custom icon';
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            dropdown.classList.remove('open');

            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;

                var reader = new FileReader();
                reader.onload = function(ev) {
                    var base64 = ev.target.result;
                    browser.storage.local.get('customIcons').then(function(result) {
                        var icons = result.customIcons || {};
                        icons[bookmarkItem.id] = base64;
                        browser.storage.local.set({ customIcons: icons });
                        favicon.src = base64;
                    });
                };
                reader.readAsDataURL(file);
            });
            input.click();
        });
        return button;
    }

    // ========================================================================
    // Bookmark item
    // ========================================================================

    /**
     * Creates a complete bookmark item with favicon, title, and action menu.
     *
     * @param {Object} bookmarkItem - The bookmark with url, title, id.
     * @returns {HTMLDivElement} The bookmark element.
     */
    function createBookmarkItem(bookmarkItem) {
        var item = document.createElement('div');
        item.className = 'bookmark-item';

        var link = document.createElement('a');
        link.href = bookmarkItem.url;
        link.className = 'bookmark-link';
        link.target = '_self';

        var favicon = createFavicon(bookmarkItem);
        var topRow = document.createElement('div');
        topRow.className = 'bookmark-top-row';
        topRow.appendChild(favicon);

        var titleSpan = createBookmarkTitle(bookmarkItem, link);

        link.appendChild(topRow);
        link.appendChild(titleSpan);
        item.appendChild(link);
        item.appendChild(createBookmarkMenu(bookmarkItem, titleSpan, link, item, favicon));

        return item;
    }

    /**
     * Creates the title span for a bookmark.
     *
     * @param {Object} bookmarkItem - The bookmark with title and url.
     * @param {HTMLAnchorElement} link - The anchor to set the title attribute on.
     * @returns {HTMLSpanElement}
     */
    function createBookmarkTitle(bookmarkItem, link) {
        var titleSpan = document.createElement('span');
        titleSpan.className = 'bookmark-title';
        var rawTitle = bookmarkItem.title || bookmarkItem.url;
        titleSpan.textContent = rawTitle;
        link.title = rawTitle;
        return titleSpan;
    }

    // ========================================================================
    // Folder tree
    // ========================================================================

    /**
     * Gets the display name (last segment) from a folder path.
     *
     * @param {string} fullPath - The full folder path.
     * @returns {string}
     */
    function getFolderDisplayName(fullPath) {
        var parts = (fullPath || '').split('/');
        return parts[parts.length - 1];
    }

    // Parent references for breadcrumb path tracing
    var folderParents = new Map();

    /**
     * Traces the path from root to a folder using parent references.
     *
     * @param {Object} folderItem - The target folder.
     * @returns {Array<Object>} Array of folders from root to target.
     */
    function buildPathStack(folderItem) {
        var path = [];
        var current = folderItem;
        while (current) {
            path.unshift(current);
            current = folderParents.get(current.id) || null;
        }
        return path;
    }

    /**
     * Creates a folder tree node for the sidebar.
     *
     * @param {Object} folderItem - The folder node.
     * @param {number} indent - Pixel indentation.
     * @returns {HTMLDivElement}
     */
    function createFolderTreeNode(folderItem, indent) {
        var node = document.createElement('div');
        node.className = 'tree-node';
        node.dataset.id = folderItem.id;

        var row = document.createElement('div');
        row.className = 'tree-row';
        row.style.paddingLeft = indent + 'px';

        var hasChildren = folderItem.children && folderItem.children.some(function(c) { return !c.url; });
        var toggleIcon = document.createElement('span');
        toggleIcon.className = 'tree-toggle';
        toggleIcon.textContent = hasChildren ? '▸' : ' ';

        var folderLabel = document.createElement('span');
        folderLabel.className = 'tree-label';
        folderLabel.textContent = getFolderDisplayName(folderItem.title || '');

        row.appendChild(toggleIcon);
        row.appendChild(folderLabel);
        node.appendChild(row);

        if (hasChildren) {
            var childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            childrenContainer.style.display = 'none';
            node.appendChild(childrenContainer);

            toggleIcon.addEventListener('click', function() {
                var isOpen = childrenContainer.style.display !== 'none';
                childrenContainer.style.display = isOpen ? 'none' : '';
                toggleIcon.textContent = isOpen ? '▸' : '▾';
            });
        }

        row.addEventListener('click', function(event) {
            event.stopPropagation();
            showBookmarksForFolder(folderItem);
            document.querySelectorAll('.tree-row.active').forEach(function(el) { el.classList.remove('active'); });
            row.classList.add('active');
        });

        return node;
    }

    /**
     * Recursively builds the folder tree in the sidebar.
     *
     * @param {Object} folderItem - The current folder.
     * @param {HTMLElement} parentContainer - Where to append nodes.
     * @param {number} level - Nesting depth.
     * @param {Object} [parentFolder] - Parent folder reference.
     */
    function buildTree(folderItem, parentContainer, level, parentFolder) {
        if (!folderItem) return;

        if (parentFolder) {
            folderParents.set(folderItem.id, parentFolder);
        }

        var indent = level * 16;
        var node = createFolderTreeNode(folderItem, indent);
        parentContainer.appendChild(node);

        var childrenContainer = node.querySelector('.tree-children');
        if (childrenContainer) {
            var folders = folderItem.children ? folderItem.children.filter(function(c) { return !c.url; }) : [];
            folders.forEach(function(folder) {
                buildTree(folder, childrenContainer, level + 1, folderItem);
            });
        }
    }

    // ========================================================================
    // Show bookmarks
    // ========================================================================

    /**
     * Displays a folder's bookmarks in the right panel with breadcrumb navigation.
     *
     * @param {Object} folderItem - The folder to display.
     * @param {Array<Object>} [pathStack] - Optional pre-computed path.
     * @returns {void}
     */
    function showBookmarksForFolder(folderItem, pathStack) {
        bookmarksContainer.innerHTML = '';

        if (!pathStack) {
            pathStack = buildPathStack(folderItem);
        }

        renderBreadcrumb(pathStack);

        var grid = document.createElement('div');
        grid.className = 'bookmark-grid';
        bookmarksContainer.appendChild(grid);

        var bookmarks = folderItem.children ? folderItem.children.filter(function(c) { return c.url; }) : [];
        bookmarks.forEach(function(bm) { grid.appendChild(createBookmarkItem(bm)); });

        var subFolders = folderItem.children ? folderItem.children.filter(function(c) { return !c.url; }) : [];
        if (subFolders.length > 0) {
            var subFolderContainer = document.createElement('div');
            subFolderContainer.className = 'sub-folder-row';
            bookmarksContainer.appendChild(subFolderContainer);
            subFolders.forEach(function(sf) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sub-folder-btn';
                btn.textContent = '📁 ' + getFolderDisplayName(sf.title || '');
                btn.addEventListener('click', function() {
                    showBookmarksForFolder(sf, buildPathStack(sf));
                    document.querySelectorAll('.tree-row.active').forEach(function(el) { el.classList.remove('active'); });
                    var treeNode = folderTree.querySelector('[data-id="' + sf.id + '"] > .tree-row');
                    if (treeNode) treeNode.classList.add('active');
                    var parent = treeNode ? treeNode.closest('.tree-children') : null;
                    if (parent) {
                        parent.style.display = '';
                        var toggle = parent.previousElementSibling ? parent.previousElementSibling.querySelector('.tree-toggle') : null;
                        if (toggle) toggle.textContent = '▾';
                    }
                });
                subFolderContainer.appendChild(btn);
            });
        }

        if (bookmarks.length === 0 && subFolders.length === 0) {
            var emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = 'This folder is empty.';
            bookmarksContainer.appendChild(emptyMsg);
        }
    }

    /**
     * Renders the breadcrumb navigation bar.
     *
     * @param {Array<Object>} pathStack - The folder path from root to current.
     * @returns {void}
     */
    function renderBreadcrumb(pathStack) {
        var breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        pathStack.forEach(function(folder, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'breadcrumb-item';
            btn.textContent = getFolderDisplayName(folder.title || '');
            (function(folderRef, index) {
                btn.addEventListener('click', function() {
                    showBookmarksForFolder(folderRef, pathStack.slice(0, index + 1));
                    document.querySelectorAll('.tree-row.active').forEach(function(el) { el.classList.remove('active'); });
                    var treeNode = folderTree.querySelector('[data-id="' + folderRef.id + '"] > .tree-row');
                    if (treeNode) treeNode.classList.add('active');
                });
            })(folder, i);
            breadcrumb.appendChild(btn);

            if (i < pathStack.length - 1) {
                var sep = document.createElement('span');
                sep.className = 'breadcrumb-sep';
                sep.textContent = '›';
                breadcrumb.appendChild(sep);
            }
        });
        bookmarksContainer.appendChild(breadcrumb);
    }

    // ========================================================================
    // Find root folder
    // ========================================================================

    /**
     * Recursively searches for the configured root folder.
     *
     * @param {Object} bookmarkItem - The current node.
     * @returns {Object|null}
     */
    function findRoot(bookmarkItem) {
        if (bookmarkItem.children && bookmarkItem.title === rootFolder) {
            return bookmarkItem;
        }
        if (bookmarkItem.children && bookmarkItem.children.length > 0) {
            for (var i = 0; i < bookmarkItem.children.length; i++) {
                var child = bookmarkItem.children[i];
                if (!child.url) {
                    var found = findRoot(child);
                    if (found) return found;
                }
            }
        }
        return null;
    }

    // ========================================================================
    // Initialize
    // ========================================================================

    /**
     * Handles bookmark tree fetch errors.
     *
     * @param {Error} error
     * @returns {void}
     */
    function handleBookmarkError(error) {
        console.error('Error fetching bookmarks:', error);
        bookmarksContainer.textContent = 'Error loading bookmarks.';
    }

    /**
     * Initializes the app with the root folder node.
     *
     * @param {Object} rootNode - The root bookmark folder.
     */
    function initApp(rootNode) {
        buildTree(rootNode, folderTree, 0);

        // Auto-expand root folder
        var rootNodeEl = folderTree.querySelector('.tree-node');
        if (rootNodeEl) {
            var children = rootNodeEl.querySelector('.tree-children');
            var toggle = rootNodeEl.querySelector('.tree-toggle');
            if (children && toggle) {
                children.style.display = '';
                toggle.textContent = '▾';
            }
        }

        showBookmarksForFolder(rootNode);
        var firstRow = folderTree.querySelector('.tree-row');
        if (firstRow) firstRow.classList.add('active');
    }

    // ========================================================================
    // Boot
    // ========================================================================
    getSettings().then(function() {
        updateTime();
        setInterval(updateTime, 1000);
        updateWeather();
        setInterval(updateWeather, 600000);
        return browser.bookmarks.getTree();
    }).then(function(bookmarkTree) {
        for (var i = 0; i < bookmarkTree.length; i++) {
            var root = bookmarkTree[i];
            var children = root.children || [];
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                if (!child.url) {
                    var rootNode = findRoot(child);
                    if (rootNode) {
                        initApp(rootNode);
                        return;
                    }
                }
            }
        }
        bookmarksContainer.textContent = 'Folder "' + rootFolder + '" not found.';
    }).catch(handleBookmarkError);
});
