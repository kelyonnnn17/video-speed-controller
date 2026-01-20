# Video Speed Controller Extension

Advanced Chrome extension for controlling video and audio playback speed with per-site settings, overlays, and more.

## Features

- **Advanced Speed Control** - Adjust playback speed from 0.25× to 10× with precision
- **Per-Site Settings** - Remember different speeds for different websites
- **Speed Overlay** - Visual indicator showing current speed on videos
- **Keyboard Shortcuts** - Control speed without opening popup
- **Clean, Minimal UI** - Simple and intuitive interface

## Installation

### From GitHub Release (Recommended)

1. Go to [Releases](https://github.com/yourusername/video-speed-controller-1/releases)
2. Download the latest `.zip` file
3. Extract the zip file
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable **Developer Mode** (toggle in top-right)
6. Click **Load unpacked**
7. Select the extracted folder

### From Source

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the folder containing the extension files

## Usage

### Popup Interface
- Click the extension icon in the toolbar to open the popup
- Use the slider to set exact speed
- Click settings button to configure preferences

### Keyboard Shortcuts

- **Ctrl+Shift+Up** (Mac: **Cmd+Shift+Up**) - Increase speed by 0.25×
- **Ctrl+Shift+Down** (Mac: **Cmd+Shift+Down**) - Decrease speed by 0.25×
- **Ctrl+Shift+0** (Mac: **Cmd+Shift+0**) - Reset to 1×
- **Ctrl+Shift+S** (Mac: **Cmd+Shift+S**) - Toggle speed overlay

### Popup Keyboard Shortcuts
- **↑** - Increase speed by 0.1×
- **↓** - Decrease speed by 0.1×
- **0** - Reset to 1×

## Settings

- **Remember speed per site** - Saves different speeds for each domain
- **Show speed overlay on videos** - Displays current speed on video players
- **Auto-apply speed on page load** - Automatically applies saved speed when page loads

## Development

### File Structure

```
video-speed-controller-1/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (keyboard shortcuts)
├── content.js          # Content script (media control, overlay)
├── popup.html          # Popup UI structure
├── popup.js            # Popup logic and interactions
├── style.css           # Popup styling
├── package.sh          # Local packaging script
└── icons/              # Extension icons
```

### Testing Changes

1. **Make changes** to files
2. Go to `chrome://extensions/`
3. Click **reload** button on the extension
4. Click extension icon to see changes

### Making Changes

1. **Edit UI**: Modify `popup.html` and `style.css`
   - Reload extension in Chrome to see changes

2. **Edit Logic**: Modify `popup.js`, `content.js`, or `background.js`
   - Reload extension in Chrome to test changes
   - Check browser console for errors

3. **Edit Config**: Modify `manifest.json`
   - May need to remove and re-add extension if permissions change

## Development & Deployment

This project includes automated packaging via GitHub Actions.

**Quick Start:**
- Push to `main` branch → Automatically packages and creates a release
- Download `.zip` from Releases → Extract → Load as unpacked extension in Chrome
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

**Manual Packaging:**
```bash
./package.sh
```
Creates a `.zip` file ready to use.

## Version

**Current Version**: 2.0.0

## License

This project is licensed under the MIT License.
