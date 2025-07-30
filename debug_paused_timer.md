# Debug Steps for Paused Timer Fast-Forward Issue

## Test Scenario
1. Start a timer (e.g., 1 minute)
2. Pause the timer
3. Click "Fast Forward" button
4. Enter a time (e.g., 30 seconds)
5. Click "Confirm"
6. Check if the remaining time is reduced

## Expected Behavior
- Fast-forward button should be visible for paused timers
- Clicking fast-forward should show the time input UI
- Confirming should reduce the remaining time
- UI should update to show new remaining time

## Debug Logging Added
- Added console.log in fastForwardTimer() function
- Added console.log in Fast Forward button click handler
- Added console.log in confirm fast-forward button handler
- Background script already has extensive logging

## Check These Console Messages
1. `[Popup] Fast Forward button clicked` - confirms button is clickable
2. `[Popup] Fast-forward confirm clicked` - confirms time input UI works
3. `[Popup] fastForwardTimer called` - confirms function is called
4. `[Popup] Received fast-forward response` - confirms background responded
5. Background logs showing paused timer fast-forward logic

## Potential Issues to Verify
1. Is the Fast Forward button visible for paused timers?
2. Is the targetTabId correctly set for paused timers?
3. Is the background script correctly handling paused timer fast-forward?
4. Is the popup UI updating correctly after fast-forward?

## Manual Testing Steps
1. Open Chrome DevTools
2. Go to Extensions tab, find untab extension
3. Click "Inspect views: popup" to see popup console
4. Also check "background page" console
5. Start timer, pause it, try fast-forward
6. Watch console logs in both places
