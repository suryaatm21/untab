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
    console.log('NotificationManager initialized');
  }

  /**
   * Debug logging helper
   * @param {string} message - Message to log
   */
  debug(message) {
    console.log(`[NotificationManager] ${message}`);
  }

  /**
   * Create a notification with the given parameters
   * @param {number} tabId - ID of the tab the notification is related to
   * @param {string} title - Title of the notification
   * @param {string} message - Content message of the notification
   * @param {Array} buttons - Array of button objects for the notification
   * @param {string} [customNotificationId] - Optional custom notification ID
   * @returns {Promise} - Promise that resolves with the notification ID
   */
  createNotification(
    tabId,
    title,
    message,
    buttons = [],
    customNotificationId = null,
  ) {
    // Validate inputs
    if (typeof tabId !== 'number' || isNaN(tabId) || tabId < 0) {
      const error = new Error(`Invalid tabId: ${tabId}`);
      this.debug(`Input validation failed: ${error.message}`);
      return Promise.reject(error);
    }

    if (typeof title !== 'string') {
      title = String(title || 'Fade That');
    }

    if (typeof message !== 'string') {
      message = String(message || '');
    }

    this.debug(`Creating notification for tab ${tabId}: "${title}"`);

    return new Promise((resolve, reject) => {
      try {
        // Directly build and show the notification without checking tab existence
        const iconUrl = chrome.runtime.getURL('icons/fade-tab-monogram.png');
        this.debug(`Using icon: ${iconUrl}`);

        let notificationOptions = {
          type: 'basic',
          iconUrl: iconUrl,
          title: title || 'Fade That',
          message: message || '',
          requireInteraction: false,
        };
        if (buttons && buttons.length > 0) {
          notificationOptions.buttons = buttons;
          this.debug(`Added ${buttons.length} buttons to notification`);
        }

        const notificationId =
          customNotificationId ||
          `fade-that-notification-${tabId}-${Date.now()}`;
        this.debug(
          `Attempting to create notification with ID: ${notificationId}`,
        );
        // Create notification using unique ID
        chrome.notifications.create(
          notificationId,
          notificationOptions,
          (createdId) => {
            if (chrome.runtime.lastError) {
              console.error(
                'Notification creation error:',
                chrome.runtime.lastError,
              );
              reject(chrome.runtime.lastError);
            } else {
              this.debug(`Successfully created notification ${createdId}`);
              resolve(createdId);
            }
          },
        );
      } catch (error) {
        console.error('Notification creation error:', error);
        reject(error);
      }
    });
  }

  /**
   * Create a warning notification for timer about to expire
   * @param {number} tabId - ID of the tab the timer is for
   * @param {number} secondsLeft - Seconds left before tab closes
   * @returns {Promise|void} - Promise that resolves when notification is created, or void if invalid
   */
  createTimerWarningNotification(tabId, secondsLeft) {
    // Validate tabId and secondsLeft
    if (typeof tabId !== 'number' || isNaN(tabId) || tabId < 0) {
      this.debug(`Invalid tabId for warning notification: ${tabId}`);
      return;
    }
    if (
      typeof secondsLeft !== 'number' ||
      isNaN(secondsLeft) ||
      secondsLeft <= 0
    ) {
      this.debug(
        `Not showing warning notification: secondsLeft is ${secondsLeft}`,
      );
      return;
    }

    this.debug(
      `Creating warning notification for tab ${tabId} with ${secondsLeft}s remaining`,
    );

    // Format the time text
    let timeText = '';
    if (secondsLeft > 60) {
      timeText = `${Math.floor(secondsLeft / 60)} minutes and ${
        secondsLeft % 60
      } seconds`;
    } else {
      timeText = `${secondsLeft} seconds`;
    }

    // Temporarily remove buttons to test if they are causing issues on macOS
    const buttons = [];
    // const buttons = [{ title: "Extend by 5 minutes" }, { title: "Cancel Timer" }];

    // Call createNotification without a custom ID to allow unique IDs for each warning
    return this.createNotification(
      tabId,
      'Tab Closing Soon',
      `The tab will close in ${timeText}.`,
      [],
    );
  }

  /**
   * Show a notification that a timer was successfully created
   * @param {number} tabId - ID of the tab the timer is for
   * @param {number} duration - Duration of the timer in seconds
   * @param {boolean} isIteration - Whether this is an iterated timer
   * @param {boolean} iterateTimer - Whether the timer will iterate after completion
   * @returns {Promise|void} - Promise that resolves when notification is created, or void if invalid
   */
  notifyTimerCreated(tabId, duration, isIteration, iterateTimer) {
    // Validate inputs
    if (typeof tabId !== 'number' || isNaN(tabId) || tabId < 0) {
      this.debug(`Invalid tabId for timer created notification: ${tabId}`);
      return;
    }
    if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
      this.debug(
        `Invalid duration for timer created notification: ${duration}`,
      );
      return;
    }

    let timeText = '';
    if (duration > 60) {
      timeText = `${Math.floor(duration / 60)} minutes and ${
        duration % 60
      } seconds`;
    } else {
      timeText = `${duration} seconds`;
    }

    const message = isIteration
      ? `Tab recreated and will close again in ${timeText} (iteration mode).`
      : `Tab will close in ${timeText}.${
          iterateTimer ? ' Timer will iterate after completion.' : ''
        }`;

    return this.createNotification(
      tabId,
      isIteration ? 'Timer Iterated' : 'Timer Started',
      message,
      [{ title: 'Ok' }],
    );
  }

  /**
   * Set up listeners for notification events
   */
  setupNotificationListeners() {
    chrome.notifications.onButtonClicked.addListener(
      (notificationId, buttonIndex) => {
        // Extract the tabId from the notification ID
        if (notificationId.startsWith('fade-that-notification-')) {
          const tabId = parseInt(notificationId.split('-').pop());

          // Dispatch to appropriate handlers
          if (buttonIndex === 0) {
            // First button (Extend / Ok)
            if (notificationId.includes('warning')) {
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
      },
    );

    chrome.notifications.onClosed.addListener((notificationId, byUser) => {
      console.log(
        `Notification ${notificationId} closed ${
          byUser ? 'by user' : 'automatically'
        }`,
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
        action: 'extendTimer',
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
            response ? response.error : 'Unknown error',
          );
        }
      },
    );
  }

  /**
   * Handle canceling a timer from a notification
   * @param {number} tabId - ID of the tab to cancel timer for
   */
  handleCancelTimerFromNotification(tabId) {
    chrome.runtime.sendMessage(
      {
        action: 'stopTimer',
        tabId: tabId,
      },
      (response) => {
        if (response && response.success) {
          console.log(`Timer for tab ${tabId} cancelled from notification`);
        } else {
          console.error(
            `Failed to cancel timer for tab ${tabId}:`,
            response ? response.error : 'Unknown error',
          );
        }
      },
    );
  }
}

// Export the NotificationManager class
export default NotificationManager;
