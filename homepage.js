document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('bookmarks-container');
    const settingsButton = document.getElementById('settings-button');
    const defaultRootFolder = 'Speed Dial';
    let rootFolder = defaultRootFolder;

    settingsButton.addEventListener('click', function() {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else {
            window.open('options.html', '_blank');
        }
    });

    // Time display
    const timeContainer = document.querySelector('.time-container');
    let timezone = 'Australia/Perth';
    const updateTime = () => {
        const now = new Date();
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const timeString = now.toLocaleTimeString('en-AU', options);
        timeContainer.textContent = `🕐 ${timeString}`;
    };

    const defaultColumns = 5;
    let columnCount = defaultColumns;

    function getSettings() {
        return browser.storage.local.get(['columnCount', 'rootFolder', 'timezone']).then(function(result) {
            const storedColumns = parseInt(result.columnCount, 10);
            columnCount = Number.isInteger(storedColumns) && storedColumns > 0 ? storedColumns : defaultColumns;
            rootFolder = result.rootFolder && result.rootFolder.trim() ? result.rootFolder.trim() : defaultRootFolder;
            timezone = result.timezone && result.timezone.trim() ? result.timezone.trim() : 'Australia/Perth';
        }).catch(function(error) {
            console.error('Error loading settings:', error);
            columnCount = defaultColumns;
            rootFolder = defaultRootFolder;
            timezone = 'Australia/Perth';
        });
    }
    function displayBookmarks(bookmarkItem, parentContainer, isRoot = false) {
        const targetContainer = parentContainer || container;

        console.log('Processing bookmark item:', bookmarkItem.title || bookmarkItem.url);
        if (bookmarkItem.url) {
            // It's a bookmark
            const item = document.createElement('div');
            item.className = 'bookmark-item';

            const link = document.createElement('a');
            link.href = bookmarkItem.url;
            link.className = 'bookmark-link';
            link.target = '_self';

            const favicon = document.createElement('img');
            favicon.className = 'bookmark-favicon';
            favicon.alt = '';
            favicon.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2NjYzRkZiIvPgo8cGF0aCBkPSJtMTYgNHYxNmg4VjE2SDE2VjR6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
            browser.storage.local.get('customIcons').then(result => {
                const icons = result.customIcons || {};
                if (icons[bookmarkItem.id]) {
                    favicon.src = icons[bookmarkItem.id];
                } else {
                    try {
                        const url = new URL(bookmarkItem.url);
                        favicon.src = `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
                    } catch (e) {
                        // keep default
                    }
                }
            });
            favicon.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2NjYzRkZiIvPgo8cGF0aCBkPSJtMTYgNHYxNmg4VjE2SDE2VjR6IiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
            };

            const titleSpan = document.createElement('span');
            titleSpan.className = 'bookmark-title';
            const rawTitle = bookmarkItem.title || bookmarkItem.url;
            titleSpan.textContent = rawTitle;
            link.title = rawTitle;

            link.appendChild(favicon);
            link.appendChild(titleSpan);
            item.appendChild(link);

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-button';
            editButton.textContent = '✎';
            editButton.title = 'Edit bookmark title';
            editButton.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                if (!bookmarkItem.id) {
                    return;
                }
                const newTitle = prompt('Enter new bookmark title:', bookmarkItem.title || bookmarkItem.url);
                if (newTitle === null) {
                    return;
                }
                const trimmed = newTitle.trim();
                if (!trimmed) {
                    alert('Title cannot be empty.');
                    return;
                }
                browser.bookmarks.update(bookmarkItem.id, { title: trimmed }).then(function(updated) {
                    bookmarkItem.title = trimmed;
                    titleSpan.textContent = trimmed;
                    link.title = trimmed;
                }).catch(function(error) {
                    console.error('Error updating bookmark:', error);
                    alert('Unable to update bookmark title.');
                });
            });
            item.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete bookmark';
            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                if (!bookmarkItem.id) {
                    return;
                }
                const confirmed = confirm('Delete this bookmark?');
                if (!confirmed) {
                    return;
                }
                browser.bookmarks.remove(bookmarkItem.id).then(function() {
                    item.remove();
                }).catch(function(error) {
                    console.error('Error deleting bookmark:', error);
                    alert('Unable to delete bookmark.');
                });
            });
            item.appendChild(deleteButton);

            const setIconButton = document.createElement('button');
            setIconButton.type = 'button';
            setIconButton.className = 'set-icon-button';
            setIconButton.textContent = '⬆';
            setIconButton.title = 'Set custom icon';
            setIconButton.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const base64 = event.target.result;
                            browser.storage.local.get('customIcons').then(result => {
                                const icons = result.customIcons || {};
                                icons[bookmarkItem.id] = base64;
                                browser.storage.local.set({ customIcons: icons });
                                favicon.src = base64;
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                });
                input.click();
            });
            item.appendChild(setIconButton);
            targetContainer.appendChild(item);
        } else if (bookmarkItem.children && bookmarkItem.children.length > 0) {
            // It's a folder
            const folderDiv = document.createElement('div');
            folderDiv.className = 'bookmark-folder';

            const header = document.createElement('div');
            header.className = 'folder-header';

            const folderTitle = document.createElement('h2');
            folderTitle.textContent = ' ' + bookmarkItem.title;
            header.appendChild(folderTitle);

            let folderContent;
            if (isRoot) {
                folderContent = document.createElement('div');
                folderContent.className = 'folder-content';
            } else {
                const toggleButton = document.createElement('button');
                toggleButton.type = 'button';
                toggleButton.className = 'folder-toggle-button';
                toggleButton.textContent = '+';
                toggleButton.title = 'Expand folder';
                toggleButton.addEventListener('click', function(event) {
                    event.stopPropagation();
                    const isCollapsed = folderContent.style.display === 'none';
                    folderContent.style.display = isCollapsed ? '' : 'none';
                    toggleButton.textContent = isCollapsed ? '−' : '+';
                    toggleButton.title = isCollapsed ? 'Collapse folder' : 'Expand folder';
                });
                // header.insertBefore(toggleButton, folderTitle);
                folderTitle.insertBefore(toggleButton, folderTitle.firstChild);

                folderContent = document.createElement('div');
                folderContent.className = 'folder-content';
                folderContent.style.display = 'none';
            }

            folderDiv.appendChild(header);
            folderDiv.appendChild(folderContent);
            targetContainer.appendChild(folderDiv);

            // Separate bookmarks and subfolders
            const bookmarks = bookmarkItem.children.filter(child => child.url);
            const folders = bookmarkItem.children.filter(child => !child.url);

            if (bookmarks.length > 0) {
                const grid = document.createElement('div');
                grid.className = 'bookmark-grid';
                grid.style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;
                folderContent.appendChild(grid);
                bookmarks.forEach(child => displayBookmarks(child, grid));
            }

            folders.forEach(child => displayBookmarks(child, folderContent, false));
        }
    }

    function findRoot(bookmarkItem) {
        console.log('Checking bookmark item:', bookmarkItem.title || bookmarkItem.url);
        if (bookmarkItem.children && bookmarkItem.title === rootFolder) {
            console.log('Found root folder:', bookmarkItem.title);
            displayBookmarks(bookmarkItem, null, true);
        } else if (bookmarkItem.children && bookmarkItem.children.length > 0) {
            const folders = bookmarkItem.children.filter(child => !child.url);
            folders.forEach(child => findRoot(child));
        }
    }
    
    getSettings().then(function() {
        updateTime();
        setInterval(updateTime, 1000);
        return browser.bookmarks.getTree();
    }).then(function(bookmarkTree) {
        bookmarkTree.forEach(function(root) {
            root.children.forEach(child => findRoot(child));
        });
    }).catch(function(error) {
        console.error('Error fetching bookmarks:', error);
        container.textContent = 'Error loading bookmarks.';
    });
});