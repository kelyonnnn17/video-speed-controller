# Video Speed Controller

A minimal Chrome extension to control the playback speed of any video or audio on any webpage.

## Features

- **Speed Range** — 0.1× (slow-mo) up to 16× (fast-forward)
- **Preset Buttons** — One-click speeds: 0.25×, 0.5×, 1×, 1.5×, 2×
- **Reset Button** — Instantly snap back to 1×
- **Persisted Speed** — Your chosen speed is saved and auto-applied whenever you visit a new page
- **Works Everywhere** — Applies to all `<video>` and `<audio>` elements, including dynamically loaded players (e.g. YouTube)

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right)
4. Click **Load unpacked** and select the project folder

To pick up any code changes, click the **↺ refresh** button on the extension card in `chrome://extensions/`.

## File Structure

```
video-speed-controller/
├── manifest.json   # Extension config (Manifest V3)
├── background.js   # Service worker (install listener)
├── content.js      # Injected into pages — sets playbackRate, auto-applies saved speed
├── popup.html      # Popup UI
├── popup.js        # Popup logic — slider, presets, reset, chrome.storage
├── style.css       # Popup styles
└── icons/          # Extension icons (16px, 48px, 128px)
```

## How It Works

- `popup.js` saves the selected speed to `chrome.storage.local` and sends it to the active tab via `chrome.tabs.sendMessage`
- `content.js` listens for that message and sets `playbackRate` on all media elements
- On every page load, `content.js` also reads the saved speed from `chrome.storage.local` and applies it automatically
- A `MutationObserver` in `content.js` re-applies the speed to any media elements added to the DOM after initial load

## License

MIT
