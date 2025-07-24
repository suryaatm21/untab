# Active Timers Container Visibility Fix

## Issue

The active timers list and container sometimes fail to render/display beneath the settings, requiring users to click the settings button and scroll to make it appear.

## Root Cause Analysis

The issue was caused by several factors:

1. **Race Conditions**: The `updateActiveTimersList()` function relies on async `chrome.runtime.sendMessage` calls, which can complete at different times than UI state changes.

2. **Incomplete State Management**: Functions like `backToTimersList()`, `hideTimerUI()`, and timer view functions didn't consistently ensure the active timers container was visible.

3. **Missing Error Handling**: No checks for missing DOM elements or failed async calls.

4. **Settings Toggle Interference**: The settings toggle didn't ensure active timers were visible after closing settings.

## Solution Implemented

### 1. Enhanced `updateActiveTimersList()` Function

- Added existence checks for DOM elements before proceeding
- Enhanced logging to track container visibility changes
- Improved error handling for missing elements

### 2. New `ensureActiveTimersVisibility()` Function

```javascript
function ensureActiveTimersVisibility() {
  chrome.runtime.sendMessage({ action: 'getAllTimers' }, function (response) {
    const timers = response && response.timers ? response.timers : {};
    const activeTimersContainer = document.getElementById(
      'active-timers-container',
    );

    if (activeTimersContainer) {
      if (Object.keys(timers).length > 0) {
        activeTimersContainer.style.display = 'block';
      } else {
        activeTimersContainer.style.display = 'none';
      }
    }
  });
}
```

### 3. Strategic Visibility Enforcement

Added calls to `ensureActiveTimersVisibility()` in key locations:

- After settings toggle (with 50ms delay)
- After returning to timers list (with 100ms delay)
- After checking current tab timer (with 100ms delay)
- During DOM initialization (with 200ms delay)

### 4. Enhanced `backToTimersList()` Function

- Added explicit container visibility check after updating timers list
- Included timing delays to handle async race conditions

### 5. Improved `toggleSettings()` Function

- Added automatic active timers visibility restoration when closing settings

### 6. Enhanced Error Handling and Logging

- Added console logging to track container visibility changes
- Added element existence checks before DOM manipulation
- Added debugging output for container state changes

## Technical Details

### Timing Strategy

Different delays are used based on the context:

- **50ms**: After settings toggle (quick UI response)
- **100ms**: After major state changes (moderate delay for async completion)
- **200ms**: During initialization (longer delay for full DOM readiness)

### Visibility Logic

```javascript
// Always check if timers exist before showing container
if (Object.keys(timers).length > 0) {
  activeTimersContainer.style.display = 'block';
} else {
  activeTimersContainer.style.display = 'none';
}
```

### Error Prevention

```javascript
// Ensure elements exist before proceeding
if (!activeTimersList || !activeTimersContainer) {
  console.warn('Active timers elements not found');
  return;
}
```

## Testing Instructions

### Test Case 1: Settings Toggle

1. Open popup with active timers
2. Verify active timers container is visible
3. Open settings
4. Close settings
5. **Expected**: Active timers container should remain/become visible

### Test Case 2: Timer View Navigation

1. Start multiple timers
2. Click "View" on one timer
3. Click "Back" button
4. **Expected**: Active timers list should be visible immediately

### Test Case 3: Tab Switching

1. Start timer on one tab
2. Switch to another tab and open popup
3. **Expected**: Active timers container should be visible

### Test Case 4: Multiple State Changes

1. Start timer
2. Pause/resume timer
3. Open/close settings multiple times
4. **Expected**: Active timers container should remain consistently visible

## Debugging

### Console Output to Monitor

Look for these log messages:

```
Updating active timers list with X timers
Showing active timers container
Hiding active timers container (no timers)
Ensured active timers container is visible
Active timers elements not found
```

### Manual Check in Browser Console

```javascript
// Check container visibility
document.getElementById('active-timers-container').style.display;

// Force visibility check
ensureActiveTimersVisibility();
```

## Files Modified

1. **popup/popup.js**:
   - Enhanced `updateActiveTimersList()` with better error handling and logging
   - Added `ensureActiveTimersVisibility()` utility function
   - Updated `toggleSettings()` to restore visibility after closing
   - Enhanced `backToTimersList()` with explicit visibility management
   - Added strategic visibility checks throughout key functions

The fix ensures the active timers container is consistently visible when it should be, regardless of UI state changes or user interactions.
