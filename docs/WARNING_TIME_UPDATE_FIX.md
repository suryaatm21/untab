# Warning Time Update for Active Timers - Fix

## Issue
When changing the warning time setting while timers are already running, the active timers continue to use their original warning time instead of the updated setting.

## Root Cause
Warning alarms are only set when timers are first created. There was no mechanism to update existing warning alarms when the user changes the warning time setting.

## Solution Implemented

### 1. New Background Script Action
Added `updateWarningTimeForActiveTimers` action that:
- Iterates through all active (non-paused) timers
- Clears existing warning alarms
- Updates the stored warning time for each timer
- Reschedules warning alarms with the new timing (if sufficient time remains)
- Returns count of timers that were updated

### 2. Enhanced Settings Save
Modified `saveSettings()` in popup.js to:
- Call the new background action after saving settings
- Provide user feedback showing how many active timers were updated
- Handle cases where no timers need updating

### 3. Enhanced Debugging
Added more detailed logging to:
- Track warning alarm updates
- Show notification decisions with more context
- Added `debugAlarms` action to inspect current alarms

## Technical Details

### New Background Action Logic:
```javascript
// For each active timer
const remainingTime = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));

// Clear old warning alarm
chrome.alarms.clear('warnTab_' + tabId);

// Update stored warning time
timer.warningTime = newWarningTime;

// Schedule new warning if enough time remains
if (remainingTime > newWarningTime && (remainingTime - newWarningTime) / 60 >= 0.1) {
  const warnDelayMin = (remainingTime - newWarningTime) / 60;
  chrome.alarms.create('warnTab_' + tabId, { delayInMinutes: warnDelayMin });
}
```

### Enhanced User Feedback:
- "Settings saved! Warning time: 30s (2 active timers updated)" - when timers were updated
- "Settings saved! Warning time: 30s" - when no active timers needed updating

## Testing Instructions

### Test Case 1: Basic Functionality
1. Start a timer with duration 120 seconds
2. Set warning time to 60 seconds initially
3. Wait 30 seconds (90 seconds remaining)
4. Change warning time to 30 seconds
5. **Expected**: Warning notification should appear in 60 seconds (when 30s remain)
6. **Verify**: Console shows "Updated warning alarm for tab X"

### Test Case 2: No Update Needed
1. Start a timer with duration 60 seconds
2. Set warning time to 30 seconds initially
3. Wait 40 seconds (20 seconds remaining)
4. Change warning time to 15 seconds
5. **Expected**: No new warning alarm (not enough time left)
6. **Verify**: Console shows "Skipped warning alarm"

### Test Case 3: Multiple Timers
1. Start timers on 3 different tabs (120s each)
2. Wait 30 seconds
3. Change warning time from 60s to 45s
4. **Expected**: All 3 timers get updated warning alarms
5. **Verify**: User sees "(3 active timers updated)" message

### Test Case 4: Paused Timers
1. Start a timer and pause it
2. Change warning time setting
3. **Expected**: Paused timer is not updated (only active timers)
4. Resume timer and verify it uses old warning time until next operation

## Debugging Commands

### Check Current Alarms (Browser Console):
```javascript
chrome.runtime.sendMessage({action: 'debugAlarms'}, console.log);
```

### Expected Console Output:
```
Background: Starting timer with params: {tabId: 123, duration: 120, warningTime: 60, ...}
Updating warning time for all active timers to 30 seconds
Updated warning alarm for tab 123: 1.5 minutes
Warning alarm triggered for tab 123
Tab 123 warning: 30 seconds left, warningTime was: 30, notifications enabled: true
Showing warning notification for tab 123 with 30 seconds left
```

## Files Modified

1. **background.js**:
   - Added `updateWarningTimeForActiveTimers` action
   - Added `debugAlarms` action
   - Enhanced warning alarm logging

2. **popup/popup.js**:
   - Modified `saveSettings()` to update active timers
   - Enhanced user feedback messages

The fix ensures that warning time changes immediately affect all running timers, providing consistent behavior regardless of when the setting is changed.
