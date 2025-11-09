# Extension Reload Instructions

## The Problem

The console error shows old code is still running:

```
Cannot fast-forward a paused timer for tab 1610980647
```

This error message doesn't exist in our current code, which means the browser is still running the old version.

## Solution: Reload the Extension

### Method 1: Via Chrome Extensions Page

1. Go to `chrome://extensions/`
2. Find the "untab" extension
3. Click the **refresh/reload button** (circular arrow icon)
4. Try the fast-forward functionality again

### Method 2: Complete Reinstall

1. Go to `chrome://extensions/`
2. Click **"Remove"** on the untab extension
3. Click **"Load unpacked"**
4. Select this directory: `/Users/Surya/Projects/untab/untab-pomodoro`
5. Test the functionality

### Method 3: Check for Multiple Instances

1. Go to `chrome://extensions/`
2. Look for multiple versions of the extension
3. Remove any duplicates
4. Keep only one instance

## Verification Steps

After reloading:

1. **Start a timer** (e.g., 1 minute)
2. **Pause the timer**
3. **Click "Fast Forward"**
4. **Enter time** (e.g., 30 seconds)
5. **Click "Confirm"**

### Expected Console Output (NEW CODE):

```
[Popup] Fast Forward button clicked
[Popup] Fast-forward confirm clicked
[Popup] fastForwardTimer called
[Background] Paused timer fast-forward details:
  - Current remaining time: 51s
  - Seconds to skip: 30s
  - New remaining time: 21s
Paused timer fast-forwarded for tab X by 30 seconds. Remaining: 21s
[Popup] Received fast-forward response
```

### What You Were Seeing (OLD CODE):

```
Cannot fast-forward a paused timer for tab 1610980647
```

## Additional Fixes Applied

1. **Fixed notification icon path**:

   - Changed from `fade-tab-monogram.png` (missing)
   - To `untab-48.png` (exists)

2. **Enhanced debugging**:
   - Added detailed logging for paused timer fast-forward
   - Added manual test function: `debugFastForward(30)`

## If Still Not Working

After reloading, if fast-forward still doesn't work:

1. **Check both console tabs**:

   - Right-click extension → "Inspect popup"
   - Go to `chrome://extensions/` → Click "Inspect views: background page"

2. **Run manual test**:

   - In popup console: `debugFastForward(30)`

3. **Check for errors** in both console windows

The notification errors should also be fixed after reload since we corrected the icon path.
