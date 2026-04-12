document.addEventListener('DOMContentLoaded', function() {
    // ========================================================================
    // Constants & state
    // ========================================================================
    const folderTree = document.getElementById('folder-tree');
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const settingsButton = document.getElementById('settings-button');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
    const timeContainer = document.querySelector('.time-container');
    const weatherContainer = document.getElementById('weather');

    const DEFAULT_ROOT_FOLDER = 'Speed Dial';
    const DEFAULT_TIMEZONE = 'Australia/Perth';
    const DEFAULT_CITY = 'Perth';
    const DEFAULT_FAVICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2NjYzRkZiIvPgo8cGF0aCBkPSJtMTYgNHYxNmg4VjE2SDE2VjR6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';

    let rootFolder = DEFAULT_ROOT_FOLDER;
    let timezone = DEFAULT_TIMEZONE;
    let city = DEFAULT_CITY;
    let weatherLat = '';
    let weatherLon = '';
    let isSidebarVisible = true;
    let currentFolder = null;
    let currentPathStack = [];

    // ========================================================================
    // Weather
    // ========================================================================
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
     * Uses stored coordinates if available, otherwise geocodes the city name.
     *
     * @returns {void}
     */
    function updateWeather() {
        if (weatherLat && weatherLon) {
            fetchWeatherForCoords(parseFloat(weatherLat), parseFloat(weatherLon));
        } else {
            geocodeAndFetchWeather(city);
        }
    }

    /**
     * Fetches weather for known coordinates.
     *
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     * @returns {void}
     */
    function fetchWeatherForCoords(lat, lon) {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true';
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(weatherData) {
                var weather = weatherData.current_weather;
                var desc = weatherCodeToDescription(weather.weathercode);
                weatherContainer.textContent = desc + ' ' + Math.round(weather.temperature) + '°C';
            })
            .catch(function(error) {
                console.error('Error fetching weather:', error);
                weatherContainer.textContent = '🌡️ ' + city;
            });
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
                    fetchWeatherForCoords(result.latitude, result.longitude);
                } else {
                    weatherContainer.textContent = city + ' not found';
                }
            })
            .catch(function(error) {
                console.error('Error geocoding city:', error);
                weatherContainer.textContent = city + ' not found';
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
    sidebarToggleButton.addEventListener('click', toggleSidebar);

    /**
     * Toggles the sidebar visibility.
     *
     * @returns {void}
     */
    function toggleSidebar() {
        isSidebarVisible = !isSidebarVisible;
        browser.storage.local.set({ hideSidebar: !isSidebarVisible });
        applySidebarVisibility(!isSidebarVisible);
    }

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
        return browser.storage.local.get(['rootFolder', 'timezone', 'city', 'hideSidebar', 'weatherLat', 'weatherLon'])
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
        weatherLat = result.weatherLat || '';
        weatherLon = result.weatherLon || '';
        isSidebarVisible = !result.hideSidebar;
        applySidebarVisibility(result.hideSidebar || false);
    }

    /**
     * Shows or hides the sidebar.
     *
     * @param {boolean} hideSidebar - Whether to hide the sidebar.
     * @returns {void}
     */
    function applySidebarVisibility(hideSidebar) {
        folderTree.style.display = hideSidebar ? 'none' : '';
        isSidebarVisible = !hideSidebar;
        var icon = isSidebarVisible ? '✕' : '☰';
        sidebarToggleButton.className = isSidebarVisible ? 'hide' : 'show';
        var span = sidebarToggleButton.querySelector('span') || document.createElement('span');
        span.textContent = icon;
        if (!sidebarToggleButton.querySelector('span')) {
            sidebarToggleButton.appendChild(span);
        }
        sidebarToggleButton.title = isSidebarVisible ? 'Hide sidebar' : 'Show sidebar';
        if (currentFolder) {
            showBookmarksForFolder(currentFolder, currentPathStack);
        }
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
     * @param {string} parentFolderId - The ID of the parent folder (for reordering).
     * @returns {HTMLDivElement} The bookmark element.
     */
    function createBookmarkItem(bookmarkItem, parentFolderId) {
        var item = document.createElement('div');
        item.className = 'bookmark-item';
        item.draggable = true;
        item.dataset.bookmarkId = bookmarkItem.id;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);

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

    // ========================================================================
    // Drag and Drop
    // ========================================================================

    var draggedBookmarkId = null;

    /**
     * Handles the drag start event.
     *
     * @param {DragEvent} e
     * @returns {void}
     */
    function handleDragStart(e) {
        draggedBookmarkId = this.dataset.bookmarkId;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedBookmarkId);
    }

    /**
     * Handles the drag end event.
     *
     * @returns {void}
     */
    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedBookmarkId = null;
        document.querySelectorAll('.bookmark-item.drag-over').forEach(function(el) {
            el.classList.remove('drag-over');
        });
    }

    /**
     * Handles the drag over event (required to allow drop).
     *
     * @param {DragEvent} e
     * @returns {void}
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handles the drag enter event.
     *
     * @returns {void}
     */
    function handleDragEnter(e) {
        e.preventDefault();
        if (this.dataset.bookmarkId !== draggedBookmarkId) {
            this.classList.add('drag-over');
        }
    }

    /**
     * Handles the drag leave event.
     *
     * @returns {void}
     */
    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    /**
     * Handles the drop event to reorder bookmarks.
     *
     * @param {DragEvent} e
     * @returns {void}
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');

        var targetBookmarkId = this.dataset.bookmarkId;
        if (!draggedBookmarkId || !targetBookmarkId || draggedBookmarkId === targetBookmarkId) {
            return;
        }

        reorderBookmark(draggedBookmarkId, targetBookmarkId);
    }

    /**
     * Moves a bookmark before/after another within the same folder.
     *
     * @param {string} draggedId - The ID of the dragged bookmark.
     * @param {string} targetId - The ID of the target bookmark.
     * @returns {void}
     */
    function reorderBookmark(draggedId, targetId) {
        // Get all bookmarks in the current folder to compute new index
        var grid = bookmarksContainer.querySelector('.bookmark-grid');
        if (!grid) return;

        var items = Array.from(grid.querySelectorAll('.bookmark-item'));
        var draggedIdx = items.findIndex(function(el) { return el.dataset.bookmarkId === draggedId; });
        var targetIdx = items.findIndex(function(el) { return el.dataset.bookmarkId === targetId; });

        if (draggedIdx === -1 || targetIdx === -1) return;

        // Use the bookmarks.move API: move dragged bookmark to the target index
        // Firefox bookmarks API: browser.bookmarks.move(id, { index: newIndex })
        // We move to targetIdx so dragged bookmark ends up at that position
        browser.bookmarks.move(draggedId, { index: targetIdx }).then(function() {
            // Re-render to reflect the new order
            if (currentFolder) {
                browser.bookmarks.getSubTree(currentFolder.id).then(function(nodes) {
                    if (nodes.length > 0) {
                        showBookmarksForFolder(nodes[0], currentPathStack);
                    }
                });
            }
        }).catch(function(err) {
            console.error('Error reordering bookmark:', err);
        });
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
        currentFolder = folderItem;
        if (!pathStack) {
            pathStack = buildPathStack(folderItem);
        }
        currentPathStack = pathStack;

        bookmarksContainer.innerHTML = '';

        if (!isSidebarVisible) {
            renderBreadcrumb(pathStack);
        }

        var grid = document.createElement('div');
        grid.className = 'bookmark-grid';
        bookmarksContainer.appendChild(grid);

        var bookmarks = folderItem.children ? folderItem.children.filter(function(c) { return c.url; }) : [];
        bookmarks.forEach(function(bm) { grid.appendChild(createBookmarkItem(bm, folderItem.id)); });

        var subFolders = folderItem.children ? folderItem.children.filter(function(c) { return !c.url; }) : [];
        if (!isSidebarVisible && subFolders.length > 0) {
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
