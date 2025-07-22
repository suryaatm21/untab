
# Untab

Closes the current or selected tab after a set timer to help manage media consumption and focus.

## Features

- Set a timer to close the current or any selected tab
- Chrome notifications warn users of upcoming tab closures (user-enabled)
- Stop, fast-forward, extend, or cancel any timer
- View and manage multiple active timers with a sortable list (alphabetical, most/least time left)
- Responsive popup UI with analog clock, digital timer, and stopwatch display
- Settings panel for warning time and notification preferences
- All timer controls (pause/resume, stop, extend, fast-forward) are accessible and visually distinct
- Robust state management: timers persist and update correctly when popup is reopened
- Security: no sensitive data stored, all user input validated

## UI/UX Highlights

- Modern, responsive popup design using Poppins and Inter fonts
- Analog clock widget with real-time hands
- Green resume button, yellow pause button, red stop button (with correct hover/focus states)
- Settings section sandwiched between dividers for clarity
- All controls and settings are accessible and keyboard-friendly

## How It Works

1. Set a timer for the current or any tab
2. Manage timers from the popup: pause/resume, stop, extend, fast-forward
3. Receive Chrome notifications before tab closes (if enabled)
4. View all active timers and sort as needed

## Development Notes

- Code follows strict style, accessibility, and security guidelines
- All recent changes are atomic and documented
- See popup.js and popup.css for main UI and logic
