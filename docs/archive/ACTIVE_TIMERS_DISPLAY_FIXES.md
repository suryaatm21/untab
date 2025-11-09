# Active Timers Display Inconsistency Fixes

## Problem Description

Users reported that when navigating to the next chapter while reading manga online (likely involving URL changes or page navigation), the popup no longer showed the active timer. However, the timer continued to function correctly in the background and closed the tab when the time elapsed.

## Root Causes Identified

### 1. Missing Tab Update Listener

- The extension didn't listen for `chrome.tabs.onUpdated` events
- When a tab's URL changed (like going to the next chapter), the tab title wouldn't update in the timer data
- This could cause confusion about which tab the timer was tracking

### 2. Popup Initialization Race Condition

- When the popup opened, there was a complex sequence of events that didn't properly coordinate:
  1. Get current tab
  2. Check current tab timer
  3. Update active timers list
  4. Ensure visibility
- The timing could cause the active timers list to not display properly

### 3. Insufficient Visibility Refresh Events

- The popup only updated the active timers list every 5 seconds
- No immediate refresh when the popup became visible again
- No refresh when the user navigated between popup views

### 4. Lack of Debugging Information

- Limited console logging made it difficult to diagnose display issues
- No visibility into the timing of various update operations

## Implemented Fixes

### 1. Added Tab Update Listener (background.js)

```javascript
// Add tab updated listener to update tab titles when URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when the page has finished loading and we have a timer for this tab
  if (changeInfo.status === 'complete' && activeTimers[tabId] && tab.title) {
    console.log(
      `Tab ${tabId} updated, updating title from "${activeTimers[tabId].tabTitle}" to "${tab.title}"`,
    );
    activeTimers[tabId].tabTitle = tab.title;
  }
});
```

### 2. Improved Popup Initialization Sequence (popup.js)

- **Reordered operations**: Update active timers list FIRST to ensure fresh data
- **Added delays**: Staggered timing to prevent race conditions
- **Enhanced logging**: Added current tab ID and title logging

```javascript
// Update active timers list FIRST to ensure fresh data
updateActiveTimersList();

// Check if current tab has a timer after we have fresh timer data
setTimeout(() => {
  checkCurrentTabTimer();
}, 150);
```

### 3. Added Visibility Change Listeners (popup.js)

```javascript
// Add visibility change listener to refresh when popup becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('Popup became visible, refreshing active timers');
    setTimeout(() => {
      updateActiveTimersList();
      ensureActiveTimersVisibility();
    }, 100);
  }
});

// Also listen for focus events as additional safety
window.addEventListener('focus', () => {
  console.log('Popup gained focus, refreshing active timers');
  setTimeout(() => {
    updateActiveTimersList();
    ensureActiveTimersVisibility();
  }, 100);
});
```

### 4. Enhanced Active Timers List Function

- **Added comprehensive logging**: Track when timers are marked as current or active
- **Improved error handling**: Better validation of required elements
- **Enhanced debugging**: Log timer data structure for troubleshooting

### 5. Improved checkCurrentTabTimer Function

- **Added null checks**: Prevent operations when no current tab ID available
- **Better sequencing**: Ensure active timers list updates after current tab check
- **Enhanced logging**: Track the entire flow of timer checking

### 6. Enhanced Back Button Functionality

- **Fresh data retrieval**: Always get latest timer data when returning to list view
- **Better visibility management**: Ensure proper show/hide of active timers container
- **Improved logging**: Track the back button operation flow

## Expected Behavior After Fixes

### Normal Operation

1. **Opening popup**: Always shows current active timers, regardless of current tab state
2. **Navigation**: Tab title updates are captured and reflected in timer list
3. **Visibility**: Active timers remain visible when popup is reopened
4. **Current tab indication**: Properly highlights which timer belongs to current tab

### Edge Cases Handled

1. **Rapid navigation**: Multiple URL changes in quick succession
2. **Popup reopening**: Immediate refresh of timer data when popup becomes visible
3. **Focus changes**: Timer list updates when popup regains focus
4. **Back navigation**: Fresh data when returning from timer detail view

## Testing Recommendations

### Manual Testing

1. **Set a timer** on a manga reading site or any site with pagination
2. **Navigate to next page/chapter** (URL change)
3. **Open popup immediately** - should show active timer
4. **Close and reopen popup** multiple times - should consistently show timer
5. **Click "View" on timer** then **click "Back"** - should show refreshed list

### Debug Console Monitoring

- Open browser dev tools console
- Filter for messages containing "active timers", "timer check", or "popup"
- Look for proper sequencing of operations and no error messages

### Specific Scenarios

1. **Manga reading**: Navigate through multiple chapters with timer active
2. **Video streaming**: Navigate between episodes with timer active
3. **Multiple tabs**: Have timers on multiple tabs, verify all show correctly
4. **Tab title changes**: Ensure timer list reflects updated page titles

## Additional Safeguards Added

### Timing Controls

- Staggered initialization delays (100ms, 150ms, 200ms, 300ms)
- Separate delays for different operations to prevent conflicts
- Timeout-based visibility checks as fallback

### Error Prevention

- Null checks before DOM operations
- Validation of required elements before proceeding
- Graceful degradation when elements are missing

### Performance Optimization

- Document fragments for batch DOM updates
- Reduced redundant DOM queries
- Efficient event listener management

## Future Monitoring

- Monitor console logs for any remaining timing issues
- Watch for user reports of missing active timers
- Consider adding even more robust visibility management if needed
