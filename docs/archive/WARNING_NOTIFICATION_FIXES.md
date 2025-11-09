# Warning Notification Fixes

## Issues Fixed

### 1. Warning Alarms Not Rescheduled for Timer Extensions/Fast-forwards
**Root Cause**: When timers were extended or fast-forwarded, warning alarms were rescheduled but the `warningShown` flag wasn't reset, and insufficient debugging made it hard to track.

**Fixes Applied**:
- **Enhanced extend timer logic**: Added debug logging to track warning alarm rescheduling
- **Enhanced fast-forward logic**: Added debug logging to track warning alarm rescheduling  
- **Reset warning flag**: Both extend and fast-forward now reset `warningShown = false`

### 2. Warning Time Updates Not Triggering for Active Timers
**Root Cause**: The `updateWarningTimeForActiveTimers` function didn't reset the `warningShown` flag, so even when new warning alarms were scheduled, they wouldn't show if a warning had already been displayed.

**Fixes Applied**:
- **Reset warning flag**: `updateWarningTimeForActiveTimers` now sets `warningShown = false`
- **Enhanced debugging**: Added logging to track when warning alarms are updated vs skipped

### 3. Missing Warning Shown Flag Management
**Root Cause**: The `warningShown` flag wasn't being properly initialized or checked, leading to potential duplicate or missing warnings.

**Fixes Applied**:
- **Initialize flag**: All timer creation (initial and iteration) now sets `warningShown: false`
- **Check flag in alarm listener**: Warning notifications now only show if `warningShown` is false
- **Set flag on notification**: Warning alarm listener now sets `warningShown = true` after showing notification

### 4. Broken Notification Button Handler (CRITICAL)
**Root Cause**: The notification button click handler was using `.split('-').pop()` to extract tabId, but warning notifications use the format `fade-that-notification-warning-{tabId}-{timestamp}`, so it was extracting the timestamp instead of the tabId.

**Fixes Applied**:
- **Fixed tabId extraction**: Now properly handles both warning and regular notification ID formats
- **Added debugging**: Enhanced logging to track notification button clicks and tabId extraction
- **Enhanced error handling**: Better error reporting for failed extend/cancel operations

## Technical Details

### Enhanced Extend Timer Logic
```javascript
// Reset warning flag when extending
activeTimers[tabId].warningShown = false;

// Add debug logging
console.log(
  `Rescheduled warning alarm for tab ${tabId}: ${(newDuration - warningTime) / 60} minutes`
);
```

### Enhanced Fast-Forward Logic
```javascript
// Reset warning flag when fast-forwarding
activeTimers[tabId].warningShown = false;

// Add debug logging
console.log(
  `Rescheduled warning alarm for tab ${tabId}: ${(remainingSeconds - warningTime) / 60} minutes`
);
```

### Enhanced Warning Time Update Logic
```javascript
// Reset warning flag when warning time changes
timer.warningShown = false;

// Schedule new warning alarm
if (remainingTime > newWarningTime && (remainingTime - newWarningTime) / 60 >= 0.1) {
  // ... create alarm
  console.log(`Updated warning alarm for tab ${tabId}: ${warnDelayMin} minutes`);
}
```

### Enhanced Alarm Listener Logic
```javascript
// Check warning flag to prevent duplicates
if (
  secondsLeft > 5 &&
  activeTimers[tabId] &&
  activeTimers[tabId].enableNotifications &&
  !activeTimers[tabId].warningShown
) {
  // Mark warning as shown
  activeTimers[tabId].warningShown = true;
  notificationManager.createTimerWarningNotification(tabId, secondsLeft);
}
```

### Enhanced Notification Button Handler
```javascript
// Fixed tabId extraction for different notification formats
if (notificationId.includes('warning')) {
  // Format: fade-that-notification-warning-{tabId}-{timestamp}
  const parts = notificationId.split('-');
  tabId = parseInt(parts[4]); // tabId is the 5th part (index 4)
} else {
  // Format: fade-that-notification-{tabId}-{timestamp}
  const parts = notificationId.split('-');
  tabId = parseInt(parts[3]); // tabId is the 4th part (index 3)
}

console.log(`Notification button clicked: ID=${notificationId}, tabId=${tabId}, buttonIndex=${buttonIndex}`);
```

### Timer Initialization Updates
```javascript
// Initialize warning flag for all timers
activeTimers[tabId] = {
  // ...other properties
  warningShown: false, // Track if warning has been shown
};
```

## Testing Instructions

### Test Case 1: Timer Extension Warning
1. Start a timer with duration 120 seconds, warning time 60 seconds
2. Wait 30 seconds (90 seconds remaining)
3. Extend timer by 60 seconds (150 seconds remaining)
4. **Expected**: New warning should appear when 60 seconds remain (90 seconds from now)
5. **Debug**: Check console for "Rescheduled warning alarm" message

### Test Case 2: Timer Fast-Forward Warning
1. Start a timer with duration 120 seconds, warning time 30 seconds
2. Wait 30 seconds (90 seconds remaining)
3. Fast-forward by 45 seconds (45 seconds remaining)
4. **Expected**: Warning should appear immediately (45 > 30)
5. **Debug**: Check console for warning alarm messages

### Test Case 3: Live Warning Time Update
1. Start a timer with duration 120 seconds, warning time 60 seconds
2. Wait 30 seconds (90 seconds remaining)
3. Change warning time to 45 seconds in settings
4. **Expected**: Warning should appear when 45 seconds remain (45 seconds from now)
5. **Debug**: Check console for "Updated warning alarm" message

### Test Case 4: Multiple Warning Time Changes
1. Start a timer with duration 180 seconds, warning time 90 seconds
2. Wait 30 seconds (150 seconds remaining)
3. Change warning time to 60 seconds
4. Wait 30 seconds (120 seconds remaining)
5. Change warning time to 30 seconds
6. **Expected**: Warning should appear when 30 seconds remain (90 seconds from now)

## Debugging Commands

### Check Timer and Alarm State
```javascript
chrome.runtime.sendMessage({action: 'debugNotifications'}, console.log);
chrome.runtime.sendMessage({action: 'debugAlarms'}, console.log);
```

### Expected Console Output
```
Background: Starting timer with params: {tabId: 123, duration: 120, warningTime: 60, ...}
Rescheduled warning alarm for tab 123: 1.0 minutes
Timer extended for tab 123 by 60 seconds
Updating warning time for all active timers to 45 seconds
Updated warning alarm for tab 123: 0.75 minutes
Warning alarm triggered for tab 123
Tab 123 warning: 45 seconds left, warningTime was: 45, notifications enabled: true, warningShown: false
Showing warning notification for tab 123 with 45 seconds left
```

## Files Modified

1. **background.js**:
   - Enhanced extend timer logic with debug logging and warning flag reset
   - Enhanced fast-forward logic with debug logging and warning flag reset
   - Enhanced warning time update logic with warning flag reset
   - Enhanced alarm listener with warning flag checking and setting
   - Added `warningShown: false` to all timer initialization

2. **notification-manager.js**:
   - **CRITICAL FIX**: Fixed notification button click handler to properly extract tabId from warning notification IDs
   - Added debugging to extend and cancel timer handlers
   - Enhanced notification ID parsing to handle both warning and regular notification formats

The fixes ensure that warning notifications work reliably for all timer operations and setting changes, with comprehensive debugging to track the warning alarm lifecycle.
