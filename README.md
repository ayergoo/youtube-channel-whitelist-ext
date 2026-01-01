# YouTube Channel Whitelist Extension

A Chrome extension that allows you to whitelist YouTube channels and restrict viewing to only those channels. Videos from non-whitelisted channels are blocked, and recommendations from non-whitelisted channels are automatically hidden.

## Features

- ✅ **Whitelist Management**: Add and remove YouTube channels from your whitelist
- 🚫 **Channel Blocking**: Automatically block access to videos from non-whitelisted channels
- 🎯 **Smart Filtering**: Hide video recommendations from non-whitelisted channels
- 🎨 **Beautiful UI**: Clean and modern popup interface for managing your whitelist
- 🔄 **Toggle On/Off**: Easily enable or disable the extension without losing your whitelist
- 📱 **Sync Across Devices**: Your whitelist syncs across all your Chrome browsers

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/ayergoo/youtube-channel-whitelist-ext.git
   cd youtube-channel-whitelist-ext
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The YouTube Channel Whitelist extension should now appear in your extensions list

## Usage

### Adding Channels to Whitelist

1. Click the extension icon in your Chrome toolbar to open the popup

2. Enter a channel ID or @username in the input field:
   - Channel ID format: `UCxxxxxxxxxxxxxx` (found in channel URL)
   - Handle format: `@username` (the new YouTube handle format)

3. Click "Add Channel" or press Enter

### Removing Channels

1. Open the extension popup

2. Find the channel you want to remove in the list

3. Click the "Remove" button next to the channel

### Enabling/Disabling the Extension

Use the toggle switch at the top of the popup to enable or disable the extension. When disabled, all YouTube videos will be accessible.

## How It Works

### Channel Detection

The extension monitors YouTube pages and detects:
- Channel pages (e.g., `/channel/UCxxxxx` or `/@username`)
- Video pages (extracts channel information from the page)
- Video recommendations across YouTube

### Blocking Behavior

When you visit a video or channel page that's not whitelisted:
- The page is replaced with a blocked notification
- You can go back or add the channel to your whitelist directly from the blocked page

### Video Hiding

As you browse YouTube:
- Video recommendations from non-whitelisted channels are automatically hidden
- The extension continuously monitors for dynamically loaded content
- Your homepage and sidebar recommendations will only show whitelisted channels

## Supported Channel Formats

- **Legacy Channel IDs**: `UCxxxxxxxxxxxxxx` (24 characters starting with UC)
- **YouTube Handles**: `@username` (the new @ format)

## Finding Channel IDs

To find a channel ID:
1. Visit the channel page on YouTube
2. Look at the URL:
   - New format: `youtube.com/@username`
   - Old format: `youtube.com/channel/UCxxxxx`
3. Copy the ID or handle and add it to the whitelist

## Privacy

This extension:
- ✅ Stores data locally using Chrome's sync storage
- ✅ Only runs on YouTube.com
- ✅ Does not collect or transmit any personal data
- ✅ Does not track your browsing history
- ✅ Source code is fully open and auditable

## Permissions

The extension requires the following permissions:
- `storage`: To save your whitelist across browser sessions
- `tabs`: To detect URL changes on YouTube (SPA navigation)
- `host_permissions` for YouTube: To run content scripts on YouTube pages

## Development

### Project Structure

```
youtube-channel-whitelist-ext/
├── manifest.json          # Extension manifest file
├── background.js          # Service worker for data management
├── content.js            # Content script for YouTube pages
├── popup.html            # Popup UI HTML
├── popup.js              # Popup UI logic
├── popup.css             # Popup UI styles
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Components

- **Manifest v3**: Uses the latest Chrome extension manifest version
- **Service Worker**: Handles whitelist data and extension state
- **Content Script**: Monitors YouTube pages and enforces whitelist rules
- **Popup Interface**: Provides user-friendly whitelist management

## Troubleshooting

### Videos not being blocked

1. Make sure the extension is enabled (check the toggle in the popup)
2. Refresh the YouTube page after making changes to your whitelist
3. Check that you've entered the correct channel ID or handle

### Recommendations still showing

The extension hides recommendations dynamically. If you see recommendations briefly before they disappear, this is normal behavior as the extension needs time to process the page content.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is an independent project and is not affiliated with, endorsed by, or sponsored by YouTube or Google.