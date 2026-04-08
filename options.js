document.addEventListener('DOMContentLoaded', function() {
    const rootFolderSelect = document.getElementById('root-folder');
    const timezoneInput = document.getElementById('timezone');
    const weatherCityInput = document.getElementById('weather-city');
    const hideSidebarCheckbox = document.getElementById('hide-sidebar');
    const saveButton = document.getElementById('save');
    const backToHomeButton = document.getElementById('back-to-home');
    const status = document.getElementById('status');
    const defaultRootFolder = 'Speed Dial';
    const defaultTimezone = 'Australia/Perth';
    const defaultWeatherCity = 'Perth';

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

    // Populate city datalist
    const cities = [
        'Abu Dhabi', 'Abuja', 'Accra', 'Addis Ababa', 'Adelaide', 'Algiers',
        'Almaty', 'Amman', 'Amsterdam', 'Anchorage', 'Ankara', 'Athens',
        'Atlanta', 'Auckland', 'Baghdad', 'Bangkok', 'Bangalore', 'Barcelona',
        'Beijing', 'Beirut', 'Belgrade', 'Berlin', 'Bogota', 'Boston',
        'Brasilia', 'Bratislava', 'Brisbane', 'Brussels', 'Bucharest', 'Budapest',
        'Buenos Aires', 'Cairo', 'Calgary', 'Cape Town', 'Caracas', 'Casablanca',
        'Chennai', 'Chengdu', 'Chicago', 'Christchurch', 'Colombo', 'Copenhagen',
        'Dakar', 'Dallas', 'Dar es Salaam', 'Darwin', 'Delhi', 'Denver',
        'Detroit', 'Dhaka', 'Doha', 'Dubai', 'Dublin', 'Durban',
        'Edinburgh', 'Edmonton', 'Frankfurt', 'Gaza', 'Geneva', 'Guangzhou',
        'Guatemala City', 'Hanoi', 'Havana', 'Helsinki', 'Ho Chi Minh City',
        'Hong Kong', 'Honolulu', 'Houston', 'Islamabad', 'Istanbul', 'Jakarta',
        'Jeddah', 'Jerusalem', 'Johannesburg', 'Kabul', 'Karachi', 'Kathmandu',
        'Khartoum', 'Kigali', 'Kingston', 'Kinshasa', 'Kolkata', 'Kuala Lumpur',
        'Kuwait City', 'Kyiv', 'Lagos', 'Lahore', 'La Paz', 'Lima',
        'Lisbon', 'Ljubljana', 'London', 'Los Angeles', 'Luanda', 'Luxembourg',
        'Lyon', 'Madrid', 'Manila', 'Maputo', 'Marrakech', 'Melbourne',
        'Mexico City', 'Miami', 'Milan', 'Minneapolis', 'Minsk', 'Montreal',
        'Moscow', 'Mumbai', 'Munich', 'Muscat', 'Nairobi', 'New Orleans',
        'New York', 'Osaka', 'Oslo', 'Ottawa', 'Paris', 'Perth',
        'Phnom Penh', 'Phoenix', 'Port Moresby', 'Prague', 'Pretoria', 'Quito',
        'Rabat', 'Reykjavik', 'Riga', 'Rio de Janeiro', 'Riyadh', 'Rome',
        'San Francisco', 'San Jose', 'San Juan', 'San Salvador', 'Sanaa',
        'Santiago', 'Santo Domingo', 'Sao Paulo', 'Sarajevo', 'Seattle', 'Seoul',
        'Shanghai', 'Shenzhen', 'Singapore', 'Skopje', 'Sofia', 'Stockholm',
        'Suva', 'Sydney', 'Taipei', 'Tallinn', 'Tashkent', 'Tbilisi',
        'Tehran', 'Tel Aviv', 'The Hague', 'Tirana', 'Tokyo', 'Toronto',
        'Toulouse', 'Tripoli', 'Tunis', 'Ulaanbaatar', 'Vancouver', 'Vatican City',
        'Venice', 'Vienna', 'Vientiane', 'Vilnius', 'Warsaw', 'Washington DC',
        'Wellington', 'Yangon', 'Yaounde', 'Yerevan', 'Zagreb', 'Zurich'
    ];
    const cityDatalist = document.getElementById('city-list');
    cities.forEach(function(name) {
        const opt = document.createElement('option');
        opt.value = name;
        cityDatalist.appendChild(opt);
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

        browser.storage.local.get(['rootFolder', 'timezone', 'hideSidebar', 'city']).then(function(result) {
            const savedFolder = result.rootFolder || defaultRootFolder;
            rootFolderSelect.value = savedFolder;
            if (!rootFolderSelect.value && rootFolderSelect.options.length > 0) {
                rootFolderSelect.selectedIndex = 0;
            }
            timezoneInput.value = result.timezone || defaultTimezone;
            weatherCityInput.value = result.city || defaultWeatherCity;
            hideSidebarCheckbox.checked = !!result.hideSidebar;
        });
    }).catch(function(error) {
        console.error('Error loading folders:', error);
        timezoneInput.value = defaultTimezone;
        hideSidebarCheckbox.checked = false;
    });

    saveButton.addEventListener('click', function() {
        const rootFolder = rootFolderSelect.value.trim() || defaultRootFolder;
        const timezone = timezoneInput.value.trim() || defaultTimezone;
        const weatherCity = weatherCityInput.value.trim() || defaultWeatherCity;
        const hideSidebar = hideSidebarCheckbox.checked;
        browser.storage.local.set({ rootFolder: rootFolder, timezone: timezone, city: weatherCity, hideSidebar: hideSidebar }).then(function() {
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