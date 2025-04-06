// Store active timers
const activeTimers = {};

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

// Call initialization
initializeTimers();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const { tabId, duration } = request;
    try {
      // Store timer info
      activeTimers[tabId] = {
        startTime: Date.now(),
        duration: duration,
        endTime: Date.now() + duration * 1000,
      };

      // Create alarm
      chrome.alarms.create("closeTab_" + tabId, {
        delayInMinutes: duration / 60,
      });
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
      sendResponse({ active: true, remainingTime: remainingTime });
    } else {
      sendResponse({ active: false });
    }
    return true;
  } else if (request.action === "stopTimer") {
    const { tabId } = request;
    try {
      // Clear the alarm
      chrome.alarms.clear("closeTab_" + tabId, (wasCleared) => {
        // Check if alarm was found and cleared
        if (chrome.runtime.lastError) {
          console.error("Error clearing alarm:", chrome.runtime.lastError);
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }

        // Remove from active timers
        if (activeTimers[tabId]) {
          delete activeTimers[tabId];
          console.log(`Timer stopped for tab ${tabId}`);
          sendResponse({ success: true });
        } else {
          console.log(`No active timer found for tab ${tabId}`);
          sendResponse({ success: false, error: "No active timer found" });
        }
      });
    } catch (error) {
      console.error("Error stopping timer:", error);
      sendResponse({ success: false, error: error.message || "Unknown error" });
    }
    return true; // Required for async response
  } else if (request.action === "getAllTimers") {
    // Return all active timers
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

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab_")) {
    const tabId = parseInt(alarm.name.split("_")[1]);
    console.log(`Alarm triggered for tab ${tabId}, attempting to close...`);

    // Remove from active timers
    if (activeTimers[tabId]) {
      delete activeTimers[tabId];
    }

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Tab ${tabId} not found:`,
          chrome.runtime.lastError.message
        );
        return;
      }

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
    });
  }
});
