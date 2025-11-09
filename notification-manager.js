/**
 * NotificationManager class handles all notification-related functionality
 * for the Fade That extension.
 */

import {
  validateNotificationInputs,
  createNotificationOptions,
  generateNotificationId,
  formatNotificationTimeText,
  createChromeNotification,
} from "./notification-utils.js";
import {
  setupButtonClickListener,
  setupClosedListener,
} from "./notification-handlers.js";

class NotificationManager {
  /**
   * Create a new NotificationManager instance
   */
  constructor() {
    this.setupNotificationListeners();
    console.log("NotificationManager initialized");
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
    const validation = validateNotificationInputs(tabId);
    if (!validation.isValid) {
      this.debug(`Input validation failed: ${validation.error}`);
      return Promise.reject(new Error(validation.error));
    }

    if (typeof title !== "string") {
      title = String(title || "Fade That");
    }

    if (typeof message !== "string") {
      message = String(message || "");
    }

    this.debug(`Creating notification for tab ${tabId}: "${title}"`);

    try {
      const notificationOptions = createNotificationOptions(
        title,
        message,
        buttons,
      );
      this.debug(`Using icon: ${notificationOptions.iconUrl}`);

      if (buttons && buttons.length > 0) {
        this.debug(`Added ${buttons.length} buttons to notification`);
      }

      const notificationId =
        customNotificationId || generateNotificationId(tabId);
      this.debug(
        `Attempting to create notification with ID: ${notificationId}`,
      );

      // Create notification
      return createChromeNotification(notificationId, notificationOptions).then(
        (createdId) => {
          this.debug(`Successfully created notification ${createdId}`);
          return createdId;
        },
      );
    } catch (error) {
      console.error("Notification creation error:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Create a warning notification for timer about to expire
   * @param {number} tabId - ID of the tab the timer is for
   * @param {number} secondsLeft - Seconds left before tab closes
   * @returns {Promise|void} - Promise that resolves when notification is created, or void if invalid
   */
  createTimerWarningNotification(tabId, secondsLeft) {
    // Validate inputs
    const validation = validateNotificationInputs(tabId);
    if (!validation.isValid) {
      this.debug(`Invalid tabId for warning notification: ${tabId}`);
      return;
    }

    if (
      typeof secondsLeft !== "number" ||
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
    const timeText = formatNotificationTimeText(secondsLeft);

    // Add buttons for warning notifications
    const buttons = [
      { title: "Extend by 5 minutes" },
      { title: "Cancel Timer" },
    ];

    // Call createNotification with a warning-specific ID
    const warningNotificationId = generateNotificationId(tabId, "warning");
    return this.createNotification(
      tabId,
      "Tab Closing Soon",
      `The tab will close in ${timeText}.`,
      buttons,
      warningNotificationId,
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
    const validation = validateNotificationInputs(tabId);
    if (!validation.isValid) {
      this.debug(`Invalid tabId for timer created notification: ${tabId}`);
      return;
    }

    if (typeof duration !== "number" || isNaN(duration) || duration <= 0) {
      this.debug(
        `Invalid duration for timer created notification: ${duration}`,
      );
      return;
    }

    const timeText = formatNotificationTimeText(duration);

    const message = isIteration
      ? `Tab recreated and will close again in ${timeText} (iteration mode).`
      : `Tab will close in ${timeText}.${
          iterateTimer ? " Timer will iterate after completion." : ""
        }`;

    return this.createNotification(
      tabId,
      isIteration ? "Timer Iterated" : "Timer Started",
      message,
      [{ title: "Ok" }],
    );
  }

  /**
   * Set up listeners for notification events
   */
  setupNotificationListeners() {
    setupButtonClickListener();
    setupClosedListener();
  }
}

// Export the NotificationManager class
export default NotificationManager;

