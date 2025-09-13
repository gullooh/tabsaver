# TabSaver Chrome Extension

TabSaver helps you save and restore sets of tabs for recurring tasks. Easily save all open tabs as a named set, view your saved tab sets, and restore any set with one click.

## Features
- **Save Current Tabs:** Save all open tabs in your current window as a named set. If no name is provided, TabSaver will generate one based on the domains of the tabs.
- **View Saved Tab Sets:** See a list of all your saved tab sets.
- **Restore Tab Set:** Open all URLs from a saved tab set in a new Chrome window with separate tabs.
- **Delete Tab Set:** Remove any tab set you no longer need.
- **Local Storage:** All tab sets are stored locally in your browser for privacy and persistence.

## Installation
1. Open Chrome and go to `chrome://extensions`.
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" and select the `tabsaver-extension` folder.

## Usage
1. Click the TabSaver icon in your Chrome toolbar.
2. Enter a name for your tab set (optional).
3. Click "Save Current Tabs" to save all open tabs.
4. View and restore saved tab sets from the popup.

## Files
- `manifest.json`: Chrome extension manifest.
- `popup.html`: Extension popup UI.
- `popup.js`: Popup logic for saving/restoring tab sets.
- `background.js`: (Empty, reserved for future use.)
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`: Extension icons (replace with your own if desired).

## License
MIT
