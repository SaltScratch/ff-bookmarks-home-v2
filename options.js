document.addEventListener('DOMContentLoaded', function() {
    const rootFolderInput = document.getElementById('root-folder');
    const columnInput = document.getElementById('column-count');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
    const defaultRootFolder = 'Speed Dial';

    browser.storage.local.get(['columnCount', 'rootFolder']).then(function(result) {
        const columnCount = parseInt(result.columnCount, 10);
        columnInput.value = Number.isInteger(columnCount) && columnCount > 0 ? columnCount : 5;
        rootFolderInput.value = result.rootFolder || defaultRootFolder;
    }).catch(function(error) {
        console.error('Error loading settings:', error);
        columnInput.value = 5;
        rootFolderInput.value = defaultRootFolder;
    });

    saveButton.addEventListener('click', function() {
        let columnCount = parseInt(columnInput.value, 10);
        if (!Number.isInteger(columnCount) || columnCount < 1) {
            columnCount = 5;
            columnInput.value = columnCount;
        }
        const rootFolder = rootFolderInput.value.trim() || defaultRootFolder;
        browser.storage.local.set({ columnCount: columnCount, rootFolder: rootFolder }).then(function() {
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