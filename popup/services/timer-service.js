/**
 * Service for communicating with background script for timer operations
 */

/**
 * Start a timer for a specific tab
 * @param {number} tabId - ID of tab to start timer for
 * @param {number} duration - Timer duration in seconds
 * @param {number} warningTime - Warning time in seconds
 * @param {boolean} enableNotifications - Whether notifications are enabled
 * @param {string} tabTitle - Title of the tab
 * @param {boolean} iterateTimer - Whether to iterate timer after completion
 * @returns {Promise<Object>} Response from background script
 */
export function startTimer(
  tabId,
  duration,
  warningTime,
  enableNotifications,
  tabTitle,
  iterateTimer,
) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "startTimer",
        tabId: tabId,
        duration: duration,
        warningTime: warningTime,
        enableNotifications: enableNotifications,
        tabTitle: tabTitle,
        iterateTimer: iterateTimer,
      },
      function (response) {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response ? response.error : "Unknown error");
        }
      },
    );
  });
}

/**
 * Stop a timer for a specific tab
 * @param {number} tabId - ID of tab to stop timer for
 * @returns {Promise<Object>} Response from background script
 */
export function stopTimer(tabId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "stopTimer", tabId: tabId },
      function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response);
        } else {
          reject(response ? response.error : "Unknown error");
        }
      },
    );
  });
}

/**
 * Pause a timer for a specific tab
 * @param {number} tabId - ID of tab to pause timer for
 * @returns {Promise<void>}
 */
export function pauseTimer(tabId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "pauseTimer",
        tabId: tabId,
      },
      () => resolve(),
    );
  });
}

/**
 * Update a timer with new duration
 * @param {number} tabId - ID of tab to update timer for
 * @param {number} newDuration - New duration in seconds
 * @returns {Promise<void>}
 */
export function updateTimer(tabId, newDuration) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "updateTimer",
        tabId: tabId,
        newDuration: newDuration,
      },
      () => resolve(),
    );
  });
}

/**
 * Extend a timer by additional seconds
 * @param {number} tabId - ID of tab to extend timer for
 * @param {number} additionalTime - Additional time in seconds
 * @returns {Promise<void>}
 */
export function extendTimer(tabId, additionalTime) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "extendTimer",
        tabId: tabId,
        additionalTime: additionalTime,
      },
      () => resolve(),
    );
  });
}

/**
 * Fast forward a timer by skipping seconds
 * @param {number} tabId - ID of tab to fast forward timer for
 * @param {number} secondsToSkip - Seconds to skip
 * @returns {Promise<Object>} Response with new remaining time and paused state
 */
export function fastForwardTimer(tabId, secondsToSkip) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "fastForwardTimer",
        tabId: tabId,
        secondsToSkip: secondsToSkip,
      },
      function (response) {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response ? response.error : "Unknown error");
        }
      },
    );
  });
}

/**
 * Check if a tab has an active timer
 * @param {number} tabId - ID of tab to check
 * @returns {Promise<Object>} Timer information if active
 */
export function checkTimer(tabId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "checkTimer", tabId: tabId },
      function (response) {
        resolve(response);
      },
    );
  });
}

/**
 * Get all active timers
 * @returns {Promise<Object>} Object containing all timers
 */
export function getAllTimers() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getAllTimers" }, function (response) {
      resolve(response);
    });
  });
}

/**
 * Test notification
 * @returns {Promise<Object>} Response from background script
 */
export function testNotification() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "testNotification" },
      function (response) {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response ? response.error : "Unknown error");
        }
      },
    );
  });
}

/**
 * Force test notification
 * @returns {Promise<Object>} Response from background script
 */
export function forceTestNotification() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "forceTestNotification" },
      function (response) {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response ? response.error : "Unknown error");
        }
      },
    );
  });
}


