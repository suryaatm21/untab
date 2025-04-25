import NotificationManager from "./notification-manager.js";

// Store active timers
const activeTimers = {};

// Create notification manager instance
const notificationManager = new NotificationManager();

// Test notification function that now shows useful timer info
function testNotification() {
  console.log("Creating timer active notification");
  const options = {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/fade-that-monogram.png"),
    title: "Fade That Timer Active",
    message: "A tab timer is now active and counting down.",
    requireInteraction: false
  };
  const notificationId = `timer-notification-${Date.now()}`;
  chrome.notifications.create(notificationId, options, (id) => {
    console.log("Created timer notification:", id);
    if (chrome.runtime.lastError) {
      console.error("Error creating timer notification:", chrome.runtime.lastError);
    }
  });
}

// Test notification function - more direct approach that might work better on macOS
function forceTestNotification() {
  console.log("Creating forced test notification with maximum priority");
  
  // Create a notification with maximum priority and different options
  const options = {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/fade-that-monogram.png"),
    title: "Fade That - URGENT TEST",
    message: "This is a high-priority test notification. Please check if this appears on your screen.",
    priority: 2, // Maximum priority
    requireInteraction: true,
    silent: false
  };
  
  chrome.notifications.create(
    "forced-test-notification-" + Date.now(), // Unique ID every time
    options,
    (notificationId) => {
      console.log("Created forced test notification:", notificationId);
      if (chrome.runtime.lastError) {
        console.error("Error creating forced test notification:", chrome.runtime.lastError);
      }
    }
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    const { tabId, duration, warningTime, enableNotifications, tabTitle } = request;
    // Store timer info
    activeTimers[tabId] = { endTime: Date.now() + duration * 1000, warningTime, enableNotifications, tabTitle };

    // Clear existing alarms
    chrome.alarms.clear('warnTab_' + tabId);
    chrome.alarms.clear('closeTab_' + tabId);

    // Schedule warning alarm (delayInMinutes)
    const warnDelayMin = Math.max(0, (duration - warningTime) / 60);
    chrome.alarms.create('warnTab_' + tabId, { delayInMinutes: warnDelayMin });

    // Schedule close alarm (delayInMinutes)
    chrome.alarms.create('closeTab_' + tabId, { delayInMinutes: duration / 60 });

    console.log(`Scheduled warnTab alarm for tab ${tabId} in ${warnDelayMin} minutes, closeTab in ${duration/60} minutes`);

    // Fire a test notification on start
    testNotification();
    if (enableNotifications) {
      notificationManager.notifyTimerCreated(tabId, duration);
    }
    sendResponse({ success: true });
    return true;
  } else if (request.action === "testNotification") {
    testNotification();
    sendResponse({ success: true });
    return true;
  } else if (request.action === "forceTestNotification") {
    // Try the higher priority notification approach
    forceTestNotification();
    sendResponse({ success: true });
    return true;
  } else if (request.action === "checkTimer") {
    const { tabId } = request;
    if (activeTimers[tabId]) {
      const now = Date.now();
      const remainingTime = Math.max(
        0,
        Math.ceil((activeTimers[tabId].endTime - now) / 1000)
      );
      // Return the entire timer object along with remaining time
      sendResponse({
        active: true,
        remainingTime: remainingTime,
        timer: activeTimers[tabId],
      });
    } else {
      sendResponse({ active: false });
    }
    return true;
  } else if (request.action === "pauseTimer") {
    const { tabId } = request;
    try {
      if (activeTimers[tabId]) {
        // Clear existing alarm
        chrome.alarms.clear("closeTab_" + tabId);

        // Calculate remaining time
        const now = Date.now();
        const remainingTime = Math.max(
          0,
          Math.ceil((activeTimers[tabId].endTime - now) / 1000)
        );

        // Update timer state
        activeTimers[tabId].paused = true;
        activeTimers[tabId].remainingTime = remainingTime;

        console.log(
          `Timer paused for tab ${tabId}, ${remainingTime} seconds remaining`
        );
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: "No active timer found" });
      }
    } catch (error) {
      console.error("Error pausing timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true;
  } else if (request.action === "updateTimer") {
    const { tabId, newDuration } = request;
    try {
      if (activeTimers[tabId]) {
        // Create new alarm
        chrome.alarms.create("closeTab_" + tabId, {
          delayInMinutes: newDuration / 60,
        });

        // Update timer state
        activeTimers[tabId].paused = false;
        activeTimers[tabId].endTime = Date.now() + newDuration * 1000;
        activeTimers[tabId].warningShown = false;

        console.log(
          `Timer resumed for tab ${tabId}, ${newDuration} seconds remaining`
        );
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: "No active timer found" });
      }
    } catch (error) {
      console.error("Error updating timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true;
  } else if (request.action === "extendTimer") {
    const { tabId, additionalTime } = request;
    try {
      if (activeTimers[tabId]) {
        if (activeTimers[tabId].paused) {
          // If paused, just update the remaining time
          activeTimers[tabId].remainingTime += additionalTime;
          console.log(
            `Paused timer extended for tab ${tabId} by ${additionalTime} seconds`
          );
          sendResponse({ success: true });
        } else {
          // Clear existing alarm
          chrome.alarms.clear("closeTab_" + tabId);

          // Calculate new end time
          const newEndTime =
            activeTimers[tabId].endTime + additionalTime * 1000;
          const newDuration = (newEndTime - Date.now()) / 1000;

          // Create new alarm
          chrome.alarms.create("closeTab_" + tabId, {
            delayInMinutes: newDuration / 60,
          });

          // Update timer state
          activeTimers[tabId].endTime = newEndTime;
          activeTimers[tabId].warningShown = false;

          console.log(
            `Timer extended for tab ${tabId} by ${additionalTime} seconds`
          );
          sendResponse({ success: true });
        }
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: "No active timer found" });
      }
    } catch (error) {
      console.error("Error extending timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true;
  } else if (request.action === "fastForwardTimer") {
    const { tabId, secondsToSkip } = request;
    try {
      if (activeTimers[tabId] && !activeTimers[tabId].paused) {
        // Clear existing alarm
        chrome.alarms.clear("closeTab_" + tabId);

        // Update endTime by subtracting seconds from it
        const newEndTime = activeTimers[tabId].endTime - secondsToSkip * 1000;
        const remainingSeconds = Math.max(1, (newEndTime - Date.now()) / 1000);

        // Create new alarm with updated time
        chrome.alarms.create("closeTab_" + tabId, {
          delayInMinutes: remainingSeconds / 60,
        });

        // Update timer state
        activeTimers[tabId].endTime = newEndTime;

        console.log(
          `Timer fast-forwarded for tab ${tabId} by ${secondsToSkip} seconds`
        );
        sendResponse({
          success: true,
          remainingTime: Math.ceil(remainingSeconds),
        });
      } else {
        const errorMsg = activeTimers[tabId]
          ? "Cannot fast-forward a paused timer"
          : "No active timer found";
        console.log(errorMsg);
        sendResponse({ success: false, error: errorMsg });
      }
    } catch (error) {
      console.error("Error fast-forwarding timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true;
  } else if (request.action === "stopTimer") {
    const { tabId } = request;
    try {
      // Clear the alarm
      chrome.alarms.clear("closeTab_" + tabId);

      // Remove from active timers
      if (activeTimers[tabId]) {
        delete activeTimers[tabId];
        console.log(`Timer stopped for tab ${tabId}`);
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: "No active timer found" });
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true;
  } else if (request.action === "getTimerStatus") {
    // Get the list of tab IDs with active timers
    const tabsWithTimers = Object.keys(activeTimers).map((tabId) => {
      const timer = activeTimers[tabId];
      let remainingTime = 0;

      if (timer.paused) {
        remainingTime = timer.remainingTime;
      } else {
        const now = Date.now();
        remainingTime = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
      }

      return {
        tabId: parseInt(tabId),
        remainingTime,
        paused: timer.paused,
        tabTitle: timer.tabTitle || "Unknown Tab",
      };
    });

    sendResponse({ success: true, tabsWithTimers });
    return true;
  } else if (request.action === "getAllTimers") {
    sendResponse({ success: true, timers: activeTimers });
    return true;
  }
});

// Add tab removed listener to clean up timers for closed tabs
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (activeTimers[tabId]) {
    chrome.alarms.clear("closeTab_" + tabId);
    delete activeTimers[tabId];
    console.log(`Tab ${tabId} was closed manually, timer cleared`);
  }
});

// Add alarm listener to handle warnings and closing tabs
chrome.alarms.onAlarm.addListener((alarm) => {
  const name = alarm.name;
  if (name.startsWith('warnTab_')) {
    const tabId = parseInt(name.split('_')[1]);
    console.log(`Warning alarm triggered for tab ${tabId}`);

    // Simple generic warning notification matching testNotification format
    const secondsLeft = activeTimers[tabId]
      ? Math.max(0, Math.ceil((activeTimers[tabId].endTime - Date.now()) / 1000))
      : 0;
    const warningOptions = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/fade-that-monogram.png'),
      title: 'Tab Closing Soon',
      message: `Your tab will close in ${secondsLeft} seconds.`,
      requireInteraction: false
    };
    const warningId = `warn-notification-${tabId}-${Date.now()}`;
    chrome.notifications.create(warningId, warningOptions, (id) => {
      if (chrome.runtime.lastError) {
        console.error('Warning notification create error:', chrome.runtime.lastError);
      } else {
        console.log('Warning notification created:', id);
      }
    });

    // No memory state required; one-off notification
  } else if (name.startsWith('closeTab_')) {
    const tabId = parseInt(name.split('_')[1]);
    console.log(`Alarm triggered for tab ${tabId}, attempting to close...`);

    // Remove from active timers
    if (activeTimers[tabId]) {
      delete activeTimers[tabId];
    }

    // Attempt to close the tab
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Tab ${tabId} not found:`,
          chrome.runtime.lastError.message
        );
        return;
      }

      try {
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Failed to close tab ${tabId}:`,
              chrome.runtime.lastError.message
            );
          } else {
            console.log(`Tab ${tabId} (${tab.url}) closed successfully.`);
          }
        });
      } catch (error) {
        console.error(`Error closing tab ${tabId}:`, error);
      }
    });
  }
});


