/**
 * Notification event handlers for button clicks and notification lifecycle
 */

/**
 * Parse tab ID from notification ID
 * @param {string} notificationId - Notification ID
 * @returns {number|null} Tab ID or null if invalid
 */
function parseTabIdFromNotificationId(notificationId) {
  if (!notificationId.startsWith("fade-that-notification-")) {
    return null;
  }

  let tabId;

  // Handle different notification ID formats
  if (notificationId.includes("warning")) {
    // Format: fade-that-notification-warning-{tabId}-{timestamp}
    const parts = notificationId.split("-");
    tabId = parseInt(parts[4]); // tabId is the 5th part (index 4)
  } else {
    // Format: fade-that-notification-{tabId}-{timestamp}
    const parts = notificationId.split("-");
    tabId = parseInt(parts[3]); // tabId is the 4th part (index 3)
  }

  return isNaN(tabId) ? null : tabId;
}

/**
 * Handle extending a timer from a notification
 * @param {number} tabId - Tab ID to extend timer for
 */
function handleExtendTimer(tabId) {
  console.log(
    `[NotificationManager] Extending timer for tab ${tabId} from notification`,
  );

  chrome.runtime.sendMessage(
    {
      action: "extendTimer",
      tabId: tabId,
      additionalTime: 5 * 60, // 5 minutes
    },
    (response) => {
      if (response && response.success) {
        console.log(
          `Timer for tab ${tabId} extended by 5 minutes from notification`,
        );
      } else {
        console.error(
          `Failed to extend timer for tab ${tabId}:`,
          response ? response.error : "Unknown error",
        );
      }
    },
  );
}

/**
 * Handle canceling a timer from a notification
 * @param {number} tabId - Tab ID to cancel timer for
 */
function handleCancelTimer(tabId) {
  console.log(
    `[NotificationManager] Canceling timer for tab ${tabId} from notification`,
  );

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
          response ? response.error : "Unknown error",
        );
      }
    },
  );
}

/**
 * Set up notification button click listener
 */
export function setupButtonClickListener() {
  chrome.notifications.onButtonClicked.addListener(
    (notificationId, buttonIndex) => {
      const tabId = parseTabIdFromNotificationId(notificationId);

      if (tabId === null) {
        console.warn(`Invalid notification ID: ${notificationId}`);
        return;
      }

      console.log(
        `Notification button clicked: ID=${notificationId}, tabId=${tabId}, buttonIndex=${buttonIndex}`,
      );

      // Dispatch to appropriate handlers
      if (buttonIndex === 0) {
        // First button (Extend / Ok)
        if (notificationId.includes("warning")) {
          // Only extend if it's a warning notification
          handleExtendTimer(tabId);
        }
      } else if (buttonIndex === 1) {
        // Second button (always Cancel)
        handleCancelTimer(tabId);
      }

      // Clear the notification
      chrome.notifications.clear(notificationId);
    },
  );
}

/**
 * Set up notification closed listener
 */
export function setupClosedListener() {
  chrome.notifications.onClosed.addListener((notificationId, byUser) => {
    console.log(
      `Notification ${notificationId} closed ${
        byUser ? "by user" : "automatically"
      }`,
    );
  });
}


