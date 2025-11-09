/**
 * Service for managing extension settings
 */

/**
 * Load settings from Chrome storage
 * @returns {Promise<Object>} Settings object
 */
export function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["warningTime", "enableNotifications", "iterateTimer"],
      function (result) {
        console.log("Loading settings:", result);

        let warningTime = result.warningTime;

        // Validate and set default if invalid
        if (
          typeof warningTime !== "number" ||
          isNaN(warningTime) ||
          warningTime < 10 ||
          warningTime > 300
        ) {
          warningTime = 60;
          console.log("Invalid stored warning time, using default:", warningTime);
        }

        const settings = {
          warningTime: warningTime,
          enableNotifications: result.enableNotifications !== false,
          iterateTimer: result.iterateTimer || false,
        };

        resolve(settings);
      },
    );
  });
}

/**
 * Save settings to Chrome storage
 * @param {number} warningTime - Warning time in seconds
 * @param {boolean} enableNotifications - Whether notifications are enabled
 * @param {boolean} iterateTimer - Whether to iterate timer after completion
 * @returns {Promise<Object>} Save result with success status
 */
export function saveSettings(warningTime, enableNotifications, iterateTimer) {
  return new Promise((resolve, reject) => {
    // Validate warning time
    if (isNaN(warningTime) || warningTime < 10 || warningTime > 300) {
      reject(new Error("Invalid warning time. Must be between 10-300 seconds."));
      return;
    }

    console.log("Saving settings:", {
      warningTime,
      enableNotifications,
      iterateTimer,
    });

    chrome.storage.sync.set(
      {
        warningTime: warningTime,
        enableNotifications: enableNotifications,
        iterateTimer: iterateTimer,
      },
      function () {
        if (chrome.runtime.lastError) {
          console.error("Error saving settings:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log("Settings saved successfully");
          resolve({ success: true });
        }
      },
    );
  });
}

/**
 * Update warning time for all active timers
 * @param {number} newWarningTime - New warning time in seconds
 * @returns {Promise<Object>} Response with update count
 */
export function updateWarningTimeForActiveTimers(newWarningTime) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "updateWarningTimeForActiveTimers",
        newWarningTime: newWarningTime,
      },
      function (response) {
        resolve(response);
      },
    );
  });
}

/**
 * Load default current tab preference
 * @returns {Promise<boolean>} Whether to default to current tab
 */
export function loadDefaultCurrentTab() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["defaultCurrentTab"], function (result) {
      resolve(result.defaultCurrentTab || false);
    });
  });
}


