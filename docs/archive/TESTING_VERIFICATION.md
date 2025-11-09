# Testing Verification Checklist

## Purpose
This document provides a comprehensive testing checklist to verify that the refactored code maintains 100% functional equivalence with the original monolithic implementation.

---

## Pre-Testing Setup

### 1. Load Extension in Chrome
```bash
1. Open Chrome/Edge
2. Navigate to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory
6. Verify no errors in the console
```

### 2. Check Console for Initialization Errors
- Open DevTools (F12)
- Check Console tab for errors
- Expected: "NotificationManager initialized"
- Expected: "Popup opened for tab..."

---

## Core Timer Functionality

### Start Timer Tests

#### Test 1.1: Start Timer on Current Tab
- [ ] Open extension popup
- [ ] Set duration to 1 minute
- [ ] Ensure "Current Tab" is selected
- [ ] Click "Start Timer"
- [ ] **Verify**: Timer display shows 00:01:00
- [ ] **Verify**: Countdown begins (seconds decrement)
- [ ] **Verify**: Clock hands show current time
- [ ] **Verify**: Stopwatch bar visible at top
- [ ] **Verify**: "Back to All Timers" button visible
- [ ] **Verify**: Status shows "Timer active"

#### Test 1.2: Start Timer on Different Tab
- [ ] Open extension popup
- [ ] Set duration to 2 minutes
- [ ] Select a different tab from dropdown
- [ ] Click "Start Timer"
- [ ] **Verify**: Timer starts for selected tab
- [ ] **Verify**: Popup shows timer creation UI
- [ ] **Verify**: Timer appears in "All Active Timers" list

#### Test 1.3: Start Multiple Timers
- [ ] Start timer on Tab A (5 minutes)
- [ ] Start timer on Tab B (3 minutes)
- [ ] Start timer on Tab C (10 minutes)
- [ ] **Verify**: All three timers appear in "All Active Timers" list
- [ ] **Verify**: Current tab timer (if any) is highlighted
- [ ] **Verify**: Each timer shows correct remaining time

### Pause/Resume Tests

#### Test 2.1: Pause Active Timer
- [ ] Start a timer (5 minutes)
- [ ] Wait 30 seconds
- [ ] Click "Pause" button
- [ ] **Verify**: Button changes to "Resume"
- [ ] **Verify**: Button styling changes (different color)
- [ ] **Verify**: Timer display freezes
- [ ] **Verify**: Stopwatch display freezes
- [ ] **Verify**: Clock hands continue to update (real time)
- [ ] **Verify**: Status shows "Timer paused"

#### Test 2.2: Resume Paused Timer
- [ ] Pause a timer (per Test 2.1)
- [ ] Wait 10 seconds
- [ ] Click "Resume" button
- [ ] **Verify**: Button changes back to "Pause"
- [ ] **Verify**: Button styling returns to original
- [ ] **Verify**: Timer countdown resumes from paused time
- [ ] **Verify**: Status shows "Timer resumed"

#### Test 2.3: Pause/Resume Accuracy
- [ ] Start timer with 3 minutes
- [ ] Pause after 1 minute (should show ~2:00)
- [ ] Wait 30 seconds (real time)
- [ ] Resume timer
- [ ] **Verify**: Timer resumes at ~2:00 (not 1:30)
- [ ] **Verify**: No time lost during pause

### Extend Timer Tests

#### Test 3.1: Extend Active Timer
- [ ] Start timer (2 minutes)
- [ ] Click "Extend" button
- [ ] **Verify**: Extension UI appears
- [ ] **Verify**: Timer controls hide
- [ ] Set extension to 1 minute
- [ ] Click "Extend" button (in extension UI)
- [ ] **Verify**: Timer now shows ~3 minutes
- [ ] **Verify**: Extension UI hides
- [ ] **Verify**: Timer controls reappear
- [ ] **Verify**: Status shows "Timer extended by 60 seconds"

#### Test 3.2: Extend Paused Timer
- [ ] Start timer (5 minutes)
- [ ] Pause timer
- [ ] Click "Extend" button
- [ ] Set extension to 2 minutes
- [ ] Confirm extension
- [ ] **Verify**: Paused time increases by 2 minutes
- [ ] **Verify**: Status shows "Timer extended by 120 seconds (paused)"
- [ ] Resume timer
- [ ] **Verify**: Timer shows extended time

#### Test 3.3: Extension Presets
- [ ] Click "Extend" button
- [ ] Click "+30s" preset
- [ ] **Verify**: Extension inputs show 0h 0m 30s
- [ ] Click "+1m" preset
- [ ] **Verify**: Extension inputs show 0h 1m 0s
- [ ] Click "+5m" preset
- [ ] **Verify**: Extension inputs show 0h 5m 0s

#### Test 3.4: Cancel Extension
- [ ] Click "Extend" button
- [ ] Click "Cancel"
- [ ] **Verify**: Extension UI hides
- [ ] **Verify**: Timer controls reappear
- [ ] **Verify**: No change to timer

### Fast Forward Tests

#### Test 4.1: Fast Forward Active Timer
- [ ] Start timer (10 minutes)
- [ ] Click "Fast Forward" button
- [ ] **Verify**: Fast forward UI appears
- [ ] Set fast forward to 5 minutes
- [ ] Click "Fast Forward" button (in FF UI)
- [ ] **Verify**: Timer now shows ~5 minutes remaining
- [ ] **Verify**: Timer continues counting down
- [ ] **Verify**: Status shows "Timer fast-forwarded by 300 seconds"

#### Test 4.2: Fast Forward Paused Timer
- [ ] Start timer (10 minutes)
- [ ] Pause timer
- [ ] Click "Fast Forward" button
- [ ] Set fast forward to 3 minutes
- [ ] Confirm fast forward
- [ ] **Verify**: Paused time decreases by 3 minutes
- [ ] **Verify**: Timer remains paused
- [ ] **Verify**: Display updates correctly

#### Test 4.3: Fast Forward Presets
- [ ] Click "Fast Forward" button
- [ ] Click "30s" preset
- [ ] **Verify**: FF inputs show 0h 0m 30s
- [ ] Click "1m" preset
- [ ] **Verify**: FF inputs show 0h 1m 0s
- [ ] Click "5m" preset
- [ ] **Verify**: FF inputs show 0h 5m 0s

#### Test 4.4: Fast Forward Past Timer End
- [ ] Start timer (2 minutes)
- [ ] Fast forward by 3 minutes
- [ ] **Verify**: Timer completes immediately
- [ ] **Verify**: Tab closes (or timer completion behavior)

### Stop Timer Tests

#### Test 5.1: Stop Active Timer
- [ ] Start timer (5 minutes)
- [ ] Click "Stop" button
- [ ] **Verify**: Timer UI hides
- [ ] **Verify**: Timer creation UI appears
- [ ] **Verify**: Status shows "Timer stopped"
- [ ] **Verify**: Timer removed from "All Active Timers"

#### Test 5.2: Stop Paused Timer
- [ ] Start and pause a timer
- [ ] Click "Stop" button
- [ ] **Verify**: Same behavior as Test 5.1

#### Test 5.3: Stop Different Tab Timer
- [ ] Start timer on current tab
- [ ] View a different tab's timer (from list)
- [ ] Click "Stop" button
- [ ] **Verify**: Other tab's timer stops
- [ ] **Verify**: Current tab timer check runs
- [ ] **Verify**: Appropriate UI shown

---

## Active Timers List Functionality

### Display Tests

#### Test 6.1: List Visibility
- [ ] Start 0 timers
- [ ] **Verify**: "All Active Timers" container hidden
- [ ] Start 1 timer
- [ ] **Verify**: "All Active Timers" container visible
- [ ] **Verify**: Single timer item displayed

#### Test 6.2: Timer Information Display
- [ ] Start timer for tab with title "Example - Google Chrome"
- [ ] **Verify**: Timer shows truncated/full title
- [ ] **Verify**: Timer shows "Remaining: HH:MM:SS"
- [ ] **Verify**: Time updates every second (when list refreshes)

#### Test 6.3: Current Tab Highlighting
- [ ] Start timer on current tab
- [ ] Open popup
- [ ] **Verify**: Current tab timer has special styling/highlight
- [ ] Switch to different tab
- [ ] Open popup
- [ ] **Verify**: Previous tab no longer highlighted
- [ ] **Verify**: New current tab highlighted (if has timer)

#### Test 6.4: Active Timer Highlighting
- [ ] Start multiple timers
- [ ] View one timer (so it becomes "active" in UI)
- [ ] **Verify**: Active timer has special styling
- [ ] Click "Back to All Timers"
- [ ] **Verify**: No timer marked as active

### Sorting Tests

#### Test 7.1: Alphabetical Sort
- [ ] Start timers on tabs: "Zebra", "Apple", "Mango"
- [ ] Select "Alphabetical" sort
- [ ] **Verify**: Timers appear as: Apple, Mango, Zebra

#### Test 7.2: Most Time Left Sort
- [ ] Start timer A: 10 minutes
- [ ] Start timer B: 5 minutes  
- [ ] Start timer C: 15 minutes
- [ ] Select "Most Time Left" sort
- [ ] **Verify**: Order is C (15m), A (10m), B (5m)

#### Test 7.3: Least Time Left Sort
- [ ] Start timer A: 10 minutes
- [ ] Start timer B: 5 minutes
- [ ] Start timer C: 15 minutes
- [ ] Select "Least Time Left" sort
- [ ] **Verify**: Order is B (5m), A (10m), C (15m)

### Navigation Tests

#### Test 8.1: View Different Timer
- [ ] Start multiple timers
- [ ] Click "View" on a timer (not current tab)
- [ ] **Verify**: Timer display shows selected timer
- [ ] **Verify**: Timer controls appear
- [ ] **Verify**: "All Active Timers" list hides
- [ ] **Verify**: "Back to All Timers" button appears

#### Test 8.2: Back to All Timers
- [ ] View a specific timer (per Test 8.1)
- [ ] Click "Back to All Timers"
- [ ] **Verify**: Timer-specific UI hides
- [ ] **Verify**: Timer creation UI appears
- [ ] **Verify**: "All Active Timers" list appears
- [ ] **Verify**: All timers listed correctly
- [ ] **Verify**: Real-time clock displays

---

## Settings Functionality

### Settings UI Tests

#### Test 9.1: Toggle Settings
- [ ] Click "Settings" button
- [ ] **Verify**: Settings panel expands
- [ ] Click "Settings" button again
- [ ] **Verify**: Settings panel collapses
- [ ] **Verify**: Active timers list visible (if timers exist)

#### Test 9.2: Load Settings
- [ ] Open popup
- [ ] Click "Settings"
- [ ] **Verify**: Warning time input shows saved value (default 60)
- [ ] **Verify**: Enable notifications checkbox matches saved state

### Warning Time Tests

#### Test 10.1: Change Warning Time
- [ ] Open settings
- [ ] Change warning time to 120 seconds
- [ ] **Verify**: Status shows "Settings saved! Warning time: 120s"
- [ ] Close and reopen popup
- [ ] Open settings
- [ ] **Verify**: Warning time still shows 120

#### Test 10.2: Invalid Warning Time
- [ ] Open settings
- [ ] Enter warning time: 5 (below minimum)
- [ ] **Verify**: Error message appears
- [ ] **Verify**: Value resets to previous valid value

#### Test 10.3: Warning Time for Active Timers
- [ ] Start 3 timers
- [ ] Change warning time to 90 seconds
- [ ] **Verify**: Status shows "(3 active timers updated)"
- [ ] **Verify**: All active timers use new warning time

### Notifications Tests

#### Test 11.1: Toggle Notifications
- [ ] Open settings
- [ ] Uncheck "Enable notifications"
- [ ] **Verify**: Settings save
- [ ] Check "Enable notifications"
- [ ] **Verify**: Settings save

#### Test 11.2: Test Notifications Button
- [ ] Open settings
- [ ] Click "Test Notifications"
- [ ] **Verify**: Status shows "Testing notifications..."
- [ ] **Verify**: Chrome notification appears
- [ ] **Verify**: Status updates to "Test notification sent!"

---

## Tab Selection Tests

### Dropdown Population

#### Test 12.1: Tab List Population
- [ ] Open multiple tabs across 2 windows
- [ ] Open popup
- [ ] Click tab dropdown
- [ ] **Verify**: Tabs grouped by window
- [ ] **Verify**: Window labels present (e.g., "Window 12345")
- [ ] **Verify**: Tab titles shown (truncated if long)

#### Test 12.2: Current Tab Option
- [ ] Open popup
- [ ] **Verify**: "Current Tab" is first option
- [ ] **Verify**: Default selection is "Current Tab" (or user preference)

---

## Preset Buttons Tests

### Duration Presets

#### Test 13.1: Duration Presets
- [ ] Click "1m" preset
- [ ] **Verify**: Inputs show 0h 1m 0s
- [ ] Click "5m" preset
- [ ] **Verify**: Inputs show 0h 5m 0s
- [ ] Click "25m" preset
- [ ] **Verify**: Inputs show 0h 25m 0s
- [ ] Click "1hr" preset
- [ ] **Verify**: Inputs show 1h 0m 0s

---

## Input Validation Tests

### Time Input Constraints

#### Test 14.1: Seconds Validation
- [ ] Enter 70 in seconds field
- [ ] **Verify**: Value auto-corrects to 59
- [ ] Enter -5 in seconds field
- [ ] **Verify**: Value auto-corrects to 0

#### Test 14.2: Minutes Validation
- [ ] Enter 99 in minutes field
- [ ] **Verify**: Value auto-corrects to 59

#### Test 14.3: Hours Validation
- [ ] Enter 30 in hours field
- [ ] **Verify**: Value auto-corrects to 23

#### Test 14.4: Blur Validation
- [ ] Clear seconds field (empty)
- [ ] Click elsewhere (blur)
- [ ] **Verify**: Value auto-fills to 0

---

## UI Visual Tests

### Clock Display

#### Test 15.1: Real-Time Clock
- [ ] Open popup with no timer
- [ ] **Verify**: Clock shows current time
- [ ] **Verify**: Hour hand moves correctly
- [ ] **Verify**: Minute hand moves correctly
- [ ] **Verify**: Second hand moves correctly (ticks every second)

#### Test 15.2: Clock During Active Timer
- [ ] Start a timer
- [ ] **Verify**: Clock continues showing real time
- [ ] **Verify**: Clock hands update while timer runs

#### Test 15.3: Clock During Paused Timer
- [ ] Pause a timer
- [ ] **Verify**: Clock hands still update (real time)
- [ ] **Verify**: Timer display frozen
- [ ] **Verify**: Stopwatch display frozen

### Stopwatch Display

#### Test 16.1: Stopwatch Visibility
- [ ] No active timer
- [ ] **Verify**: Stopwatch bar hidden
- [ ] Start timer
- [ ] **Verify**: Stopwatch bar visible at top

#### Test 16.2: Stopwatch Format
- [ ] Start 5 minute timer
- [ ] **Verify**: Stopwatch shows MM:SS format (e.g., 05:00)
- [ ] Wait 30 seconds
- [ ] **Verify**: Stopwatch shows 04:30

---

## Notification Integration Tests

### Warning Notifications

#### Test 17.1: Warning Notification Appears
- [ ] Set warning time to 30 seconds
- [ ] Start timer for 1 minute
- [ ] Wait ~30 seconds
- [ ] **Verify**: Warning notification appears
- [ ] **Verify**: Notification title: "Tab Closing Soon"
- [ ] **Verify**: Message shows time remaining
- [ ] **Verify**: Two buttons: "Extend by 5 minutes" and "Cancel Timer"

#### Test 17.2: Extend from Notification
- [ ] Trigger warning notification (per Test 17.1)
- [ ] Click "Extend by 5 minutes" button
- [ ] **Verify**: Timer extends by 5 minutes
- [ ] **Verify**: Notification closes

#### Test 17.3: Cancel from Notification
- [ ] Trigger warning notification
- [ ] Click "Cancel Timer" button
- [ ] **Verify**: Timer stops
- [ ] **Verify**: Notification closes
- [ ] **Verify**: Tab stays open

### Timer Created Notifications

#### Test 18.1: Timer Created Notification
- [ ] Ensure notifications enabled
- [ ] Start a new timer
- [ ] **Verify**: "Timer Started" notification appears
- [ ] **Verify**: Message shows duration
- [ ] **Verify**: "Ok" button present

---

## Edge Cases and Error Handling

### Edge Case Tests

#### Test 19.1: Zero Duration
- [ ] Try to start timer with 0:00:00
- [ ] **Verify**: Error message appears
- [ ] **Verify**: Timer doesn't start

#### Test 19.2: Very Long Duration
- [ ] Set timer to 23h 59m 59s
- [ ] Start timer
- [ ] **Verify**: Timer starts correctly
- [ ] **Verify**: Display shows full time

#### Test 19.3: Rapid Actions
- [ ] Start timer
- [ ] Immediately pause
- [ ] Immediately resume
- [ ] Immediately extend
- [ ] Immediately fast forward
- [ ] **Verify**: All actions work correctly
- [ ] **Verify**: No console errors

#### Test 19.4: Multiple Popup Windows
- [ ] Start timer
- [ ] Open popup in 2+ windows simultaneously
- [ ] **Verify**: Both show same timer state
- [ ] Perform action in one popup
- [ ] **Verify**: Other popup reflects change (on next refresh)

### Error Recovery Tests

#### Test 20.1: Tab Closed While Timer Active
- [ ] Start timer on a tab
- [ ] Close that tab
- [ ] Open popup
- [ ] **Verify**: Timer removed from list (eventually)
- [ ] **Verify**: No errors in console

#### Test 20.2: Extension Reload
- [ ] Start multiple timers
- [ ] Reload extension (chrome://extensions/)
- [ ] **Verify**: Timers resume from storage (if applicable)
- [ ] **Verify**: UI initializes correctly

---

## Performance Tests

### Performance Metrics

#### Test 21.1: Popup Load Time
- [ ] Time popup opening
- [ ] **Verify**: Opens in < 100ms
- [ ] **Verify**: No visible lag or flash

#### Test 21.2: List Update Performance
- [ ] Start 20+ timers
- [ ] Open popup
- [ ] **Verify**: List renders quickly (< 200ms)
- [ ] Sort list
- [ ] **Verify**: Re-sort is instant (< 50ms)

#### Test 21.3: Memory Usage
- [ ] Start 50+ timers
- [ ] Open DevTools > Memory
- [ ] Take heap snapshot
- [ ] **Verify**: Reasonable memory usage (< 50MB)
- [ ] **Verify**: No obvious memory leaks

---

## Browser Compatibility Tests

### Chrome/Edge Tests

#### Test 22.1: Chrome
- [ ] Run all tests on latest Chrome
- [ ] **Verify**: All tests pass

#### Test 22.2: Edge
- [ ] Run all tests on latest Edge
- [ ] **Verify**: All tests pass

---

## Regression Testing

### Compare with Original

#### Test 23.1: Side-by-Side Comparison
- [ ] Install original version (popup.old.js)
- [ ] Install refactored version (popup-main.js)
- [ ] Run identical test scenarios on both
- [ ] **Verify**: Behavior is identical
- [ ] **Verify**: UI is identical
- [ ] **Verify**: Timing is identical

---

## Test Results Summary

### Test Execution
- **Total Tests**: 100+
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___
- **Notes**: ___

### Issues Found
1. ___
2. ___
3. ___

### Conclusion
- [ ] All critical functionality verified
- [ ] No regressions detected
- [ ] Refactored code is production-ready

---

## Notes

### Testing Environment
- **Browser**: Chrome/Edge version ___
- **OS**: ___
- **Date**: ___
- **Tester**: ___

### Additional Comments
___

---

**Recommendation**: ✅ Ready for production / ⚠️ Needs fixes / ❌ Not ready


