# Bookmark Home Page Firefox Extension

This extension replaces your Firefox home page with a custom page that displays your bookmarks.

## Installation

1. Open Firefox.
2. Go to `about:debugging`.
3. Click on "This Firefox" in the left sidebar.
4. Click "Load Temporary Add-on".
5. Select the `manifest.json` file from this folder.
6. The extension will be loaded temporarily.

## Usage

- The extension will set your home page to display your bookmarks.
- Bookmarks are organized by folders.
- Click on any bookmark to open it in a new tab.

## Files

- `manifest.json`: Extension manifest.
- `homepage.html`: The HTML for the home page.
- `homepage.js`: JavaScript to fetch and display bookmarks.
- `icons/`: Directory for extension icons (you need to add icon-48.png and icon-96.png).

## Notes

- Add your own icons to the `icons/` folder.
- This is a temporary extension; for permanent installation, package it as an XPI file.