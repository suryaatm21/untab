# Testing Checklist

Use this guide for quick regression passes after changes to the popup timers or background notifications. All steps assume the unpacked extension is loaded in Chrome with Developer Mode enabled.

## 1. Environment Setup

- Load the extension from the project root (`chrome://extensions` → Load unpacked → project folder)
- Open DevTools for the popup and background pages; confirm no errors on load
- Pre-create two extra tabs so multi-tab scenarios are easy to test

## 2. Core Timer Flows

- **Start current tab**: 1 minute duration, verify countdown, stopwatch bar, and active status text
- **Start other tab**: pick a different tab and confirm it appears in the Active Timers list
- **Pause / Resume**: pause a running timer, wait ~5 seconds, resume and ensure remaining time is preserved
- **Extend**: extend any timer by 1 minute using the extend UI and confirm new duration
- **Fast forward**: fast forward by 30 seconds and ensure the timer shortens appropriately
- **Stop**: stop a timer from both the main view and from the Active Timers list

## 3. Active Timers List

- Start three timers with different durations, confirm the list renders all of them
- Change sort options (Alphabetical, Most Time Left, Least Time Left) and verify ordering
- View an individual timer from the list and navigate back using “Back to All Timers”

## 4. Settings Panel

- Toggle the settings drawer; ensure state persists between popup opens
- Change warning time and confirm success message plus persistence after reopening the popup
- Toggle notification preference and verify the checkbox state persists

## 5. Notifications

- Set warning time to 30 seconds, start a 1 minute timer, and wait for the warning notification
- From the notification, test “Extend by 5 minutes” and “Cancel Timer” buttons
- Trigger the “Test Notification” button in settings and confirm a basic notification appears

## 6. Edge & Recovery Cases

- Attempt to start a timer with 0 duration and confirm validation blocks it
- Close a tab with an active timer and ensure it disappears from the list after a refresh
- Reload the extension while timers are running and verify timers recover correctly from storage

## 7. Final Sanity Pass

- Check popup layout for clock rendering, button alignment, and responsive behavior
- Confirm console logs show expected initialization messages without errors
- Note any anomalies in a scratch log for follow-up

> Keep the `docs/archive/TESTING_VERIFICATION.md` file for the exhaustive 100+ scenario matrix when deep validation is required.
