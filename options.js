document.addEventListener('DOMContentLoaded', function() {
    const rootFolderSelect = document.getElementById('root-folder');
    const timezoneInput = document.getElementById('timezone');
    const weatherCityInput = document.getElementById('weather-city');
    const citySearchResults = document.getElementById('city-search-results');
    const clearCityButton = document.getElementById('clear-city');
    const saveButton = document.getElementById('save');
    const backToHomeButton = document.getElementById('back-to-home');
    const status = document.getElementById('status');
    const defaultRootFolder = 'Speed Dial';
    const defaultTimezone = 'Australia/Perth';
    const defaultWeatherCity = 'Perth';

    let searchTimeout = null;

    // Common IANA timezones
    const timezones = [
        'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
        'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota',
        'America/Chicago', 'America/Denver', 'America/Edmonton', 'America/Halifax',
        'America/Los_Angeles', 'America/Mexico_City', 'America/New_York',
        'America/Phoenix', 'America/Santiago', 'America/Sao_Paulo',
        'America/St_Johns', 'America/Toronto', 'America/Vancouver',
        'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong',
        'Asia/Jakarta', 'Asia/Jerusalem', 'Asia/Karachi', 'Asia/Kathmandu',
        'Asia/Kolkata', 'Asia/Manila', 'Asia/Seoul', 'Asia/Shanghai',
        'Asia/Singapore', 'Asia/Taipei', 'Asia/Tehran', 'Asia/Tokyo',
        'Atlantic/Azores', 'Atlantic/Reykjavik',
        'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Darwin',
        'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',
        'Europe/Amsterdam', 'Europe/Athens', 'Europe/Berlin', 'Europe/Brussels',
        'Europe/Budapest', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Helsinki',
        'Europe/Istanbul', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid',
        'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Prague',
        'Europe/Rome', 'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw',
        'Europe/Zurich', 'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Guam',
        'Pacific/Honolulu', 'UTC'
    ];

    function collectFolders(bookmarkItem, folders) {
        // Add this folder if it has a title
        if (bookmarkItem.title && !bookmarkItem.url) {
            folders.add(bookmarkItem.title);
        }
        if (!bookmarkItem.children) return;
        bookmarkItem.children.forEach(function(child) {
            if (!child.url) {
                collectFolders(child, folders);
            }
        });
    }

    // Populate timezone datalist
    const timezoneDatalist = document.getElementById('timezone-list');
    timezones.forEach(function(tz) {
        const opt = document.createElement('option');
        opt.value = tz;
        timezoneDatalist.appendChild(opt);
    });

    browser.bookmarks.getTree().then(function(tree) {
        const folderSet = new Set();
        tree.forEach(function(root) {
            (root.children || []).forEach(function(child) {
                if (!child.url) {
                    collectFolders(child, folderSet);
                }
            });
        });

        const folders = Array.from(folderSet).sort();
        folders.forEach(function(name) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            rootFolderSelect.appendChild(opt);
        });

        browser.storage.local.get(['rootFolder', 'timezone', 'city', 'weatherLat', 'weatherLon']).then(function(result) {
            const savedFolder = result.rootFolder || defaultRootFolder;
            rootFolderSelect.value = savedFolder;
            if (!rootFolderSelect.value && rootFolderSelect.options.length > 0) {
                rootFolderSelect.selectedIndex = 0;
            }
            timezoneInput.value = result.timezone || defaultTimezone;
            weatherCityInput.value = result.city || defaultWeatherCity;
            weatherCityInput.dataset.lat = result.weatherLat || '';
            weatherCityInput.dataset.lon = result.weatherLon || '';
            clearCityButton.classList.toggle('visible', weatherCityInput.value.length > 0);
        });
    }).catch(function(error) {
        console.error('Error loading folders:', error);
        timezoneInput.value = defaultTimezone;
    });

    // Live city search
    weatherCityInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        var query = weatherCityInput.value.trim();
        clearCityButton.classList.toggle('visible', query.length > 0);
        if (query.length < 2) {
            citySearchResults.classList.remove('open');
            citySearchResults.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(function() {
            searchCities(query);
        }, 300);
    });

    clearCityButton.addEventListener('click', function() {
        weatherCityInput.value = '';
        delete weatherCityInput.dataset.lat;
        delete weatherCityInput.dataset.lon;
        clearCityButton.classList.remove('visible');
        citySearchResults.classList.remove('open');
        citySearchResults.innerHTML = '';
        weatherCityInput.focus();
    });

    weatherCityInput.addEventListener('blur', function() {
        setTimeout(function() {
            citySearchResults.classList.remove('open');
            citySearchResults.innerHTML = '';
        }, 200);
    });

    function searchCities(query) {
        var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=10';
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                citySearchResults.innerHTML = '';
                if (!data.results || data.results.length === 0) {
                    citySearchResults.classList.remove('open');
                    return;
                }
                data.results.forEach(function(result) {
                    var item = document.createElement('div');
                    item.className = 'city-search-result-item';
                    var name = result.name;
                    if (result.admin1) name += ', ' + result.admin1;
                    if (result.country) name += ', ' + result.country;
                    item.textContent = name;
                    item.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        var fullName = result.name;
                        if (result.admin1) fullName += ', ' + result.admin1;
                        if (result.country) fullName += ', ' + result.country;
                        weatherCityInput.value = fullName;
                        weatherCityInput.dataset.lat = result.latitude;
                        weatherCityInput.dataset.lon = result.longitude;
                        citySearchResults.classList.remove('open');
                        citySearchResults.innerHTML = '';
                    });
                    citySearchResults.appendChild(item);
                });
                citySearchResults.classList.add('open');
            })
            .catch(function(error) {
                console.error('Error searching cities:', error);
                citySearchResults.classList.remove('open');
            });
    }

    saveButton.addEventListener('click', function() {
        const rootFolder = rootFolderSelect.value.trim() || defaultRootFolder;
        const timezone = timezoneInput.value.trim() || defaultTimezone;
        const weatherCity = weatherCityInput.value.trim();
        const weatherLat = weatherCity ? (weatherCityInput.dataset.lat || '') : '';
        const weatherLon = weatherCity ? (weatherCityInput.dataset.lon || '') : '';
        browser.storage.local.set({ rootFolder: rootFolder, timezone: timezone, city: weatherCity || defaultWeatherCity, weatherLat: weatherLat, weatherLon: weatherLon }).then(function() {
            status.textContent = 'Saved.';
            setTimeout(function() {
                status.textContent = '';
            }, 1500);
        }).catch(function(error) {
            console.error('Error saving settings:', error);
            status.textContent = 'Unable to save settings.';
        });
    });

    backToHomeButton.addEventListener('click', function() {
        window.location.href = 'homepage.html';
    });
});