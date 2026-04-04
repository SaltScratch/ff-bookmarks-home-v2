document.addEventListener('DOMContentLoaded', function() {
    const rootFolderInput = document.getElementById('root-folder');
    const columnInput = document.getElementById('column-count');
    const timezoneInput = document.getElementById('timezone');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
    const defaultRootFolder = 'Speed Dial';
    const defaultTimezone = 'Australia/Perth';

    browser.storage.local.get(['columnCount', 'rootFolder', 'timezone']).then(function(result) {
        const columnCount = parseInt(result.columnCount, 10);
        columnInput.value = Number.isInteger(columnCount) && columnCount > 0 ? columnCount : 5;
        rootFolderInput.value = result.rootFolder || defaultRootFolder;
        timezoneInput.value = result.timezone || defaultTimezone;
    }).catch(function(error) {
        console.error('Error loading settings:', error);
        columnInput.value = 5;
        rootFolderInput.value = defaultRootFolder;
        timezoneInput.value = defaultTimezone;
    });

    saveButton.addEventListener('click', function() {
        let columnCount = parseInt(columnInput.value, 10);
        if (!Number.isInteger(columnCount) || columnCount < 1) {
            columnCount = 5;
            columnInput.value = columnCount;
        }
        const rootFolder = rootFolderInput.value.trim() || defaultRootFolder;
        const timezone = timezoneInput.value.trim() || defaultTimezone;
        browser.storage.local.set({ columnCount: columnCount, rootFolder: rootFolder, timezone: timezone }).then(function() {
            status.textContent = 'Saved.';
            setTimeout(function() {
                status.textContent = '';
            }, 1500);
        }).catch(function(error) {
            console.error('Error saving settings:', error);
            status.textContent = 'Unable to save settings.';
        });
    });
});