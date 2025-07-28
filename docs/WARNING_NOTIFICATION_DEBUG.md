# Warning Notification Debug Fix

## Issue
Warning notifications for timers are not appearing when they should, even when the timer meets the criteria for triggering a warning.

## Root Cause Analysis

### 1. Previous Issues Identified
- **Empty Buttons Array**: The warning notification was using an empty buttons array `[]` instead of proper action buttons
- **Inconsistent Notification ID**: Not using warning-specific notification IDs for proper button handling
- **Missing Debug Information**: No easy way to check notification settings for active timers

### 2. Code Issues Fixed

#### Notification Manager (`notification-manager.js`):
- **Restored action buttons** for warning notifications: "Extend by 5 minutes" and "Cancel Timer"
- **Added warning-specific notification ID** format: `fade-that-notification-warning-{tabId}-{timestamp}`
- **Fixed createNotification call** to pass buttons and custom ID properly

#### Background Script (`background.js`):
- **Added `debugNotifications` action** to inspect notification settings for all active timers
- **Enhanced logging** to track notification enabling/disabling logic

## Technical Details

### Warning Notification Flow
1. Timer alarm fires (`warnTab_{tabId}`)
2. Background script calculates `secondsLeft`
3. Checks conditions:
   - `secondsLeft > 5`
   - `activeTimers[tabId]` exists
   - `activeTimers[tabId].enableNotifications` is true
4. Calls `notificationManager.createTimerWarningNotification(tabId, secondsLeft)`
5. Notification manager validates inputs and creates notification with buttons

### Fixed Notification Creation
```javascript
// Before: No buttons, generic ID
return this.createNotification(
  tabId,
  'Tab Closing Soon',
  `The tab will close in ${timeText}.`,
  [],
);

// After: Action buttons, warning-specific ID
const warningNotificationId = `fade-that-notification-warning-${tabId}-${Date.now()}`;
return this.createNotification(
  tabId,
  'Tab Closing Soon',
  `The tab will close in ${timeText}.`,
  [{ title: "Extend by 5 minutes" }, { title: "Cancel Timer" }],
  warningNotificationId
);
```

### New Debug Action
```javascript
// Check notification settings for active timers
chrome.runtime.sendMessage({action: 'debugNotifications'}, console.log);
```

## Testing Instructions

### Test Case 1: Basic Warning Notification
1. **Setup**: Set warning time to 30 seconds, start a 60-second timer
2. **Wait**: 30 seconds until warning should trigger
3. **Expected**: Notification appears with "Tab will close in 30 seconds" and two buttons
4. **Verify**: Console shows "Showing warning notification for tab X with Y seconds left"

### Test Case 2: Notifications Disabled
1. **Setup**: Disable notifications in settings, start timer with warning
2. **Expected**: No warning notification appears
3. **Verify**: Console shows "notifications enabled: false"

### Test Case 3: Short Timer (No Warning)
1. **Setup**: Set warning time to 60 seconds, start a 30-second timer
2. **Expected**: No warning notification (timer too short)
3. **Verify**: Console shows alarm not scheduled due to insufficient time

### Test Case 4: Debug Information
1. **Run**: `chrome.runtime.sendMessage({action: 'debugNotifications'}, console.log);`
2. **Expected**: See array of active timers with notification settings
3. **Check**: Each timer shows `enableNotifications: true/false`

## Debug Commands

### Browser Console Commands:
```javascript
// Check notification settings for all active timers
chrome.runtime.sendMessage({action: 'debugNotifications'}, console.log);

// Check active alarms
chrome.runtime.sendMessage({action: 'debugAlarms'}, console.log);

// Force test notification
chrome.runtime.sendMessage({action: 'testNotification'});
```

### Expected Console Output:
```
Starting timer with params: {tabId: 123, duration: 60, warningTime: 30, enableNotifications: true, ...}
Scheduled alarms for tab 123: warnTab in 0.5 minutes, closeTab in 1 minutes
Warning alarm triggered for tab 123
Tab 123 warning: 30 seconds left, warningTime was: 30, notifications enabled: true
Showing warning notification for tab 123 with 30 seconds left
[NotificationManager] Creating warning notification for tab 123 with 30s remaining
[NotificationManager] Creating notification for tab 123: "Tab Closing Soon"
[NotificationManager] Successfully created notification fade-that-notification-warning-123-1234567890
```

## Files Modified

1. **notification-manager.js**:
   - Restored action buttons for warning notifications
   - Added warning-specific notification ID format
   - Fixed createNotification parameters

2. **background.js**:
   - Added `debugNotifications` action for troubleshooting

## Potential Remaining Issues

If notifications still don't appear after this fix, check:

1. **System Notifications**: Ensure Chrome has permission to show notifications in system settings
2. **Chrome Notification Settings**: Check chrome://settings/content/notifications
3. **Do Not Disturb**: Check if system Do Not Disturb mode is blocking notifications
4. **Extension Permissions**: Verify the extension has "notifications" permission in manifest.json

## Next Steps

1. **Test the fix**: Follow the testing instructions above
2. **Verify in console**: Check that logs show notification creation attempts
3. **System check**: If notifications still don't appear, verify system-level notification permissions
4. **Report results**: Document whether warning notifications now appear as expected
