import NotificationManager from "./notification-manager.js";

// Store active timers
const activeTimers = {};

// Create notification manager instance
const notificationManager = new NotificationManager();

// Initialize active timers on service worker startup
function initializeTimers() {
  chrome.alarms.getAll((alarms) => {
    alarms.forEach((alarm) => {
      if (alarm.name.startsWith("closeTab_")) {
        const tabId = parseInt(alarm.name.split("_")[1]);
        // Calculate remaining time based on alarm's scheduled time
        const endTime = alarm.scheduledTime;
        const duration = (endTime - Date.now()) / 1000; // in seconds

        // Store timer info
        activeTimers[tabId] = {
          startTime: Date.now() - duration * 1000,
          duration: duration,
          endTime: endTime,
          paused: false,
          remainingTime: duration,
          warningTime: 60, // Default warning time
          enableNotifications: true,
          warningShown: false,
        };

        console.log(
          `Restored timer for tab ${tabId}, remaining time: ${Math.floor(
            duration
          )} seconds`
        );
      }
    });
  });
}

// Check all active timers for warnings
function checkTimersForWarnings() {
  const now = Date.now();

  for (const tabId in activeTimers) {
    const timer = activeTimers[tabId];

    // Skip paused timers
    if (timer.paused) continue;

    // If warning hasn't been shown and we're within warning threshold
    if (
      !timer.warningShown &&
      timer.enableNotifications &&
      timer.endTime - now <= timer.warningTime * 1000
    ) {
      // Calculate seconds left
      const secondsLeft = Math.ceil((timer.endTime - now) / 1000);

      // Create warning notification
      notificationManager.createTimerWarningNotification(
        parseInt(tabId),
        secondsLeft
      );

      // Mark warning as shown
      timer.warningShown = true;
      console.log(
        `Showed warning for tab ${tabId}, ${secondsLeft} seconds remaining`
      );
    }
  }
}

// Call initialization
initializeTimers();

// Start timer warning check interval
setInterval(checkTimersForWarnings, 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const { tabId, duration, warningTime, enableNotifications } = request;
    try {
      // Store timer info
      activeTimers[tabId] = {
        startTime: Date.now(),
        duration: duration,
        endTime: Date.now() + duration * 1000,
        paused: false,
        remainingTime: duration,
        warningTime: warningTime || 60,
        enableNotifications: enableNotifications !== false,
        warningShown: false,
        tabTitle: request.tabTitle || "Unknown Tab",
      };

      // Create alarm
      chrome.alarms.create("closeTab_" + tabId, {
        delayInMinutes: duration / 60,
      });

      // Show confirmation notification if enabled
      if (enableNotifications) {
        notificationManager.notifyTimerCreated(tabId, duration);
      }

      console.log(
        `Timer created for tab ${tabId}, duration: ${duration} seconds (${
          duration / 60
        } minutes)`
      );
      sendResponse({ success: true });
    } catch (error) {
      console.error("Error creating alarm:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Required for async response
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

// Add alarm listener to close tabs when timers complete
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab_")) {
    const tabId = parseInt(alarm.name.split("_")[1]);
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
