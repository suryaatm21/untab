# Debug Commands for Fade That Extension

Copy and paste these commands directly into the Chrome DevTools Console:

## 🔍 Debug Timer States (Enhanced)
```javascript
(function debugTimers() {
  chrome.runtime.sendMessage({action: 'debugNotifications'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Extension connection error:', chrome.runtime.lastError.message);
      console.log('💡 Try reloading the extension or refreshing the page');
      return;
    }
    if (response && response.debugInfo) {
      console.log('=== TIMER DEBUG INFO ===');
      response.debugInfo.forEach((timer, index) => {
        console.log(`Timer ${index + 1}:`, {
          tabId: timer.tabId,
          remainingTime: `${timer.remainingTime}s`,
          warningTime: `${timer.warningTime}s`,
          enableNotifications: timer.enableNotifications,
          warningShown: timer.warningShown,
          paused: timer.paused || false
        });
      });
      if (response.debugInfo.length === 0) {
        console.log('No active timers found');
      }
    } else {
      console.error('❌ Invalid response:', response);
    }
  });
})();
```

## ⏰ Debug Active Alarms (Enhanced)  
```javascript
(function debugAlarms() {
  chrome.runtime.sendMessage({action: 'debugAlarms'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Extension connection error:', chrome.runtime.lastError.message);
      console.log('💡 Try reloading the extension or refreshing the page');
      return;
    }
    if (response && response.alarms) {
      console.log('=== ACTIVE ALARMS ===');
      response.alarms.forEach((alarm, index) => {
        const scheduledTime = new Date(alarm.scheduledTime);
        const now = new Date();
        const timeToFire = Math.max(0, (scheduledTime - now) / 1000);
        console.log(`Alarm ${index + 1}:`, {
          name: alarm.name,
          timeToFire: `${timeToFire.toFixed(1)}s`,
          scheduledTime: scheduledTime.toLocaleTimeString()
        });
      });
      if (response.alarms.length === 0) {
        console.log('No active timer alarms found');
      }
    } else {
      console.error('❌ Invalid response:', response);
    }
  });
})();
```

## 🔄 Quick Timer Status Check
```javascript
(function quickStatus() {
  const currentTab = chrome.tabs ? chrome.tabs.getCurrent() : null;
  if (currentTab) {
    currentTab.then(tab => {
      chrome.runtime.sendMessage({action: 'checkTimer', tabId: tab.id}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Extension connection error:', chrome.runtime.lastError.message);
          return;
        }
        console.log('=== CURRENT TAB TIMER ===');
        console.log(response.active ? 
          `Timer active: ${response.remainingTime}s remaining` : 
          'No timer active for this tab'
        );
      });
    });
  } else {
    console.log('💡 Run this from a regular web page tab, not the extension popup');
  }
})();
```

## 🚀 Test Notification
```javascript
(function testNotification() {
  chrome.runtime.sendMessage({action: 'forceTestNotification'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Extension connection error:', chrome.runtime.lastError.message);
      return;
    }
    console.log('✅ Test notification sent - check your system notifications!');
  });
})();
```

## 📋 Usage Instructions

1. **Open Chrome DevTools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Copy and paste any command above**
4. **Press Enter**

If you get "Could not establish connection" errors:
- Reload the extension in chrome://extensions/
- Try running the command from a different tab
- Make sure the extension is enabled
