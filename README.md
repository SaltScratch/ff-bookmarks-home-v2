# Bookmark Home Page — Firefox Extension

A Firefox extension that transforms your homepage and new tab into a beautiful, customizable bookmark dashboard. It displays your bookmarks in a clean grid layout with a folder sidebar, live weather, and a clock — all over a random background photo.

## Features

- **Bookmark Dashboard** — Browse your bookmarks in a visual grid with favicons, organized by folder.
- **Folder Sidebar** — Navigate your bookmark hierarchy via a collapsible tree view. Toggle visibility with the **☰** button in the header.
- **Breadcrumb & Sub-folder Navigation** — When the sidebar is hidden, drill into sub-folders using clickable breadcrumbs and sub-folder buttons.
- **Drag & Drop Reordering** — Reorder bookmarks within a folder by dragging and dropping them onto another bookmark.
- **Edit & Delete Bookmarks** — Click the ☰ button on any bookmark card to rename it, delete it, or upload a custom icon.
- **Custom Icons** — Replace any bookmark's favicon with your own uploaded image, persisted in local storage.
- **Live Weather Widget** — Shows the current temperature and conditions for any city worldwide (powered by [Open-Meteo](https://open-meteo.com/), no API key required). Includes live search with city/region/country disambiguation.
- **Clock & Date** — Displays the current time and date in any timezone you choose.
- **Random Background** — A full-screen photo from [Lorem Picsum](https://picsum.photos/) refreshes on each load.
- **Configurable Settings** — Pick the root bookmark folder, timezone, and weather city via the Settings page. Toggle the sidebar on or off with one click.

## Installation

### From AMO (recommended)

Install directly from the Firefox Add-ons site:
<https://addons.mozilla.org/en-US/firefox/addon/bookmark-home-page/>

### From source

1. Clone or download this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click **"This Firefox"** in the left sidebar, then **"Load Temporary Add-on…"**.
4. Select the `manifest.json` file from the repo.
5. The extension is now loaded until you restart Firefox.

## Usage

1. **Set your homepage** — The extension automatically sets your homepage and new tab to the bookmark dashboard.
2. **Create a root folder** — In Firefox Bookmarks, create a folder (default name: **Speed Dial**) and add bookmarks or sub-folders to it.
3. **Browse** — Click the sidebar tree to navigate. Click any bookmark card to open it.
4. **Toggle sidebar** — Click the **☰ / ✕** button in the top-left header to show or hide the folder sidebar.
5. **Reorder bookmarks** — Drag a bookmark card and drop it onto another to change its position within the folder.
6. **Manage bookmarks** — Hover a card to reveal the ☰ button, then choose **Edit**, **Delete**, or **Set Icon**.
7. **Configure** — Click **Settings** (top-right) or go to the extension's preferences page to:
   - Select a different root folder
   - Change the timezone for the clock
   - Search for and select a city for the weather widget (coordinates are saved for fast lookups)

## Permissions

| Permission | Purpose |
|---|---|
| `bookmarks` | Read and display your bookmark tree |
| `tabs` | Open bookmarks in new tabs |
| `storage` | Persist settings (root folder, timezone, city, sidebar visibility, custom icons, and weather coordinates) |

## Tech

- **Manifest V2** — Firefox WebExtension
- **APIs** — `browser.bookmarks`, `browser.storage`, `browser.tabs`
- **Weather** — [Open-Meteo API](https://open-meteo.com/) (free, no key): geocoding for city search + forecast for coordinates
- **Background images** — [Lorem Picsum](https://picsum.photos/)
- **Favicon fallback** — [DuckDuckGo Icon API](https://icons.duckduckgo.com/)

## License

Public Domain — see [UNLICENSE](UNLICENSE).
