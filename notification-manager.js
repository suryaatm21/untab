/**
 * NotificationManager class handles all notification-related functionality
 * for the Fade That extension.
 */
class NotificationManager {
  /**
   * Create a new NotificationManager instance
   */
  constructor() {
    this.setupNotificationListeners();
  }

  /**
   * Create a notification with the given parameters
   * @param {number} tabId - ID of the tab the notification is related to
   * @param {string} title - Title of the notification
   * @param {string} message - Content message of the notification
   * @param {Array} buttons - Array of button objects for the notification
   * @returns {Promise} - Promise that resolves with the notification ID
   */
  createNotification(tabId, title, message, buttons = []) {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            console.error("Tab error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }

          // The error occurs because iconUrl is required but was commented out
          // Let's create a default icon URL using the extension ID
          const iconUrl = chrome.runtime.getURL("icons/Icon 3.png");

          let notificationOptions = {
            type: "basic",
            iconUrl: iconUrl, // This is required
            title: title || "Fade That", // Provide default title if missing
            message: message || "Timer notification", // Provide default message if missing
            requireInteraction: true,
          };

          if (buttons && buttons.length > 0) {
            notificationOptions.buttons = buttons;
          }

          // Create a unique notification ID for this tab
          const notificationId = "fade-that-notification-" + tabId;

          chrome.notifications.create(
            notificationId,
            notificationOptions,
            (createdId) => {
              if (chrome.runtime.lastError) {
                console.error("Notification creation error:", chrome.runtime.lastError);
                
                // Fallback without buttons if there was an error
                // Some Chrome versions/platforms don't support notification buttons
                const fallbackOptions = {
                  type: "basic",
                  iconUrl: iconUrl,
                  title: title || "Fade That",
                  message: message + " (Use extension popup for timer control)",
                  requireInteraction: true
                };
                
                chrome.notifications.create(
                  notificationId + "-fallback",
                  fallbackOptions,
                  (createdId) => {
                    if (chrome.runtime.lastError) {
                      console.error("Fallback notification error:", chrome.runtime.lastError);
                      reject(chrome.runtime.lastError);
                    } else {
                      console.log(`Created fallback notification ${createdId} for tab ${tabId}`);
                      resolve(createdId);
                    }
                  }
                );
              } else {
                console.log(`Created notification ${createdId} for tab ${tabId}`);
                resolve(createdId);
              }
            }
          );
        });
      } catch (error) {
        console.error("Notification creation error:", error);
        reject(error);
      }
    });
  }

  /**
   * Create a warning notification for timer about to expire
   * @param {number} tabId - ID of the tab the timer is for
   * @param {number} secondsLeft - Seconds left before tab closes
   * @returns {Promise} - Promise that resolves when notification is created
   */
  createTimerWarningNotification(tabId, secondsLeft) {
    // Format the time text
    let timeText = "";
    if (secondsLeft > 60) {
      timeText = `${Math.floor(secondsLeft / 60)} minutes and ${
        secondsLeft % 60
      } seconds`;
    } else {
      timeText = `${secondsLeft} seconds`;
    }

    return this.createNotification(
      tabId,
      "Tab Closing Soon",
      `The tab will close in ${timeText}.`,
      [{ title: "Extend by 5 minutes" }, { title: "Cancel Timer" }]
    );
  }

  /**
   * Show a notification that a timer was successfully created
   * @param {number} tabId - ID of the tab the timer is for
   * @param {number} duration - Duration of the timer in seconds
   * @returns {Promise} - Promise that resolves when notification is created
   */
  notifyTimerCreated(tabId, duration) {
    let timeText = "";
    if (duration > 60) {
      timeText = `${Math.floor(duration / 60)} minutes and ${
        duration % 60
      } seconds`;
    } else {
      timeText = `${duration} seconds`;
    }

    return this.createNotification(
      tabId,
      "Timer Started",
      `Tab will close in ${timeText}.`,
      [{ title: "Ok" }]
    );
  }

  /**
   * Set up listeners for notification events
   */
  setupNotificationListeners() {
    chrome.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        // Extract the tabId from the notification ID
        if (notificationId.startsWith("fade-that-notification-")) {
          const tabId = parseInt(notificationId.split("-").pop());

          // Dispatch to appropriate handlers
          if (buttonIndex === 0) {
            // First button (Extend / Ok)
            if (notificationId.includes("warning")) {
              // Only extend if it's a warning notification
              this.handleExtendTimerFromNotification(tabId);
            }
          } else if (buttonIndex === 1) {
            // Second button (always Cancel)
            this.handleCancelTimerFromNotification(tabId);
          }

          // Clear the notification
          chrome.notifications.clear(notificationId);
        }
      }
    );

    chrome.notifications.onClosed.addListener((notificationId, byUser) => {
      console.log(
        `Notification ${notificationId} closed ${
          byUser ? "by user" : "automatically"
        }`
      );
    });
  }

  /**
   * Handle extending a timer from a notification
   * @param {number} tabId - ID of the tab to extend timer for
   */
  handleExtendTimerFromNotification(tabId) {
    chrome.runtime.sendMessage(
      {
        action: "extendTimer",
        tabId: tabId,
        additionalTime: 5 * 60, // 5 minutes
      },
      (response) => {
        if (response && response.success) {
          console.log(
            `Timer for tab ${tabId} extended by 5 minutes from notification`
          );
        } else {
          console.error(
            `Failed to extend timer for tab ${tabId}:`,
            response ? response.error : "Unknown error"
          );
        }
      }
    );
  }

  /**
   * Handle canceling a timer from a notification
   * @param {number} tabId - ID of the tab to cancel timer for
   */
  handleCancelTimerFromNotification(tabId) {
    chrome.runtime.sendMessage(
      {
        action: "stopTimer",
        tabId: tabId,
      },
      (response) => {
        if (response && response.success) {
          console.log(`Timer for tab ${tabId} cancelled from notification`);
        } else {
          console.error(
            `Failed to cancel timer for tab ${tabId}:`,
            response ? response.error : "Unknown error"
          );
        }
      }
    );
  }
}

// Export the NotificationManager class
export default NotificationManager;
