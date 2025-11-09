/**
 * Notification utility functions for creating and managing notifications
 */

/**
 * Validate notification inputs
 * @param {number} tabId - Tab ID
 * @returns {Object} Validation result with isValid and error properties
 */
export function validateNotificationInputs(tabId) {
  if (typeof tabId !== "number" || isNaN(tabId) || tabId < 0) {
    return {
      isValid: false,
      error: `Invalid tabId: ${tabId}`,
    };
  }
  return { isValid: true };
}

/**
 * Create notification options object
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Array} buttons - Array of button objects
 * @returns {Object} Chrome notification options
 */
export function createNotificationOptions(title, message, buttons = []) {
  const iconUrl = chrome.runtime.getURL("icons/untab-48.png");

  const notificationOptions = {
    type: "basic",
    iconUrl: iconUrl,
    title: title || "Fade That",
    message: message || "",
    requireInteraction: false,
  };

  if (buttons && buttons.length > 0) {
    notificationOptions.buttons = buttons;
  }

  return notificationOptions;
}

/**
 * Generate a unique notification ID
 * @param {number} tabId - Tab ID
 * @param {string} type - Notification type (e.g., "warning", "created")
 * @returns {string} Unique notification ID
 */
export function generateNotificationId(tabId, type = "") {
  const typePrefix = type ? `-${type}` : "";
  return `fade-that-notification${typePrefix}-${tabId}-${Date.now()}`;
}

/**
 * Format time text for notifications
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time text
 */
export function formatNotificationTimeText(seconds) {
  if (seconds > 60) {
    return `${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds`;
  } else {
    return `${seconds} seconds`;
  }
}

/**
 * Create a Chrome notification
 * @param {string} notificationId - Notification ID
 * @param {Object} notificationOptions - Notification options
 * @returns {Promise<string>} Promise that resolves with notification ID
 */
export function createChromeNotification(notificationId, notificationOptions) {
  return new Promise((resolve, reject) => {
    chrome.notifications.create(
      notificationId,
      notificationOptions,
      (createdId) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Notification creation error:",
            chrome.runtime.lastError,
          );
          reject(chrome.runtime.lastError);
        } else {
          resolve(createdId);
        }
      },
    );
  });
}


