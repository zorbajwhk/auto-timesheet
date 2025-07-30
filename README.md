# TeamSpirit Timesheet Automator

A Chrome extension that automates filling in work schedules on TeamSpirit timesheet pages.

## Features

- Automatically fills in start time (11:00) and end time (20:00) for all weekdays
- Sets work locations dropdown.
- Skips already filled entries
- Provides user feedback during the automation process
- Only works on the correct TeamSpirit page for safety

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to your TeamSpirit Work Time page:
2. Click the extension icon in your Chrome toolbar
3. Click "Start Automation" to begin filling in your timesheet
4. The extension will process each weekday row automatically
5. A completion message will appear when finished

## Configuration

The following settings can be modified in `content.js`:

- `START_TIME`: Default start time (currently "11:00")
- `END_TIME`: Default end time (currently "20:00") 
- `WORK_LOCATION_VALUE`: Work location ID (currently set to "Remote")

## How It Works

1. **Content Script**: Injected into TeamSpirit pages, waits for messages from the popup
2. **Popup Interface**: Provides the user interface and sends automation commands
3. **Automation Logic**: 
   - Finds all weekday rows in the timesheet table
   - Skips rows that are already filled
   - Clicks each empty row to open the time entry form
   - Fills in start time, end time, and work location
   - Submits the form and handles confirmation dialogs
   - Waits between entries to avoid overwhelming the system

## Files

- `manifest.json`: Extension configuration and permissions
- `content.js`: Main automation logic
- `popup.html`: Extension popup interface
- `popup.js`: Popup functionality and communication with content script
- `images/`: Extension icons

## Safety Features

- Only activates on TeamSpirit force.com domains
- Checks for correct page before showing automation controls
- Prevents multiple simultaneous automation runs
- Skips already filled entries to avoid overwriting data
- Provides clear feedback during operation

## Version

Current version: 1.5