#!/bin/bash

# Extension Testing Helper Script

echo "=== Extension Testing Helper ==="
echo "This script helps test the paused timer fast-forward functionality"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this from the extension root directory."
    exit 1
fi

echo "✅ Found manifest.json - we're in the extension directory"
echo ""

# Check key files exist
echo "📋 Checking key files..."
if [ -f "background.js" ]; then
    echo "✅ background.js found"
else
    echo "❌ background.js missing"
fi

if [ -f "popup/popup.js" ]; then
    echo "✅ popup/popup.js found"
else
    echo "❌ popup/popup.js missing"
fi

if [ -f "popup/popup.html" ]; then
    echo "✅ popup/popup.html found"
else
    echo "❌ popup/popup.html missing"
fi

echo ""
echo "🔍 Testing Instructions:"
echo ""
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select this directory: $(pwd)"
echo "4. Open a new tab and click the extension icon"
echo "5. Start a timer (e.g., 1 minute)"
echo "6. Click 'Pause' to pause the timer"
echo "7. Click 'Fast Forward' button"
echo "8. Enter a time (e.g., 30 seconds) and click 'Confirm'"
echo "9. Check if the remaining time decreases"
echo ""
echo "🐛 Debug Instructions:"
echo ""
echo "1. Right-click the extension icon and select 'Inspect popup'"
echo "2. Go to chrome://extensions/ and click 'Inspect views: background page'"
echo "3. Watch console logs in both windows while testing"
echo "4. Look for these key log messages:"
echo "   - '[Popup] Fast Forward button clicked'"
echo "   - '[Popup] Fast-forward confirm clicked'"
echo "   - '[Popup] fastForwardTimer called'"
echo "   - '[Popup] Received fast-forward response'"
echo "   - 'Paused timer fast-forwarded for tab X by Y seconds'"
echo ""
echo "📊 Extension package size:"
du -sh . | sed 's/\t.*//' | xargs echo "Current size:"

echo ""
echo "🎯 Focus Areas:"
echo "- Verify Fast Forward button is visible when timer is paused"
echo "- Check targetTabId is set correctly"
echo "- Ensure background script receives and processes the request"
echo "- Verify popup UI updates with new remaining time"
