/**
 * Settings panel component - manages settings UI
 */

import * as SettingsService from "../services/settings-service.js";
import * as TimerService from "../services/timer-service.js";
import { ensureActiveTimersVisibility } from "./active-timers-list.js";

/**
 * Load settings and populate UI
 */
export function loadSettings() {
  SettingsService.loadSettings().then((settings) => {
    const warningTimeInput = document.getElementById("warning-time");
    warningTimeInput.value = settings.warningTime;

    console.log(`Set warning time input to: ${settings.warningTime}`);

    const enableNotificationsElement = document.getElementById(
      "enable-notifications",
    );
    if (enableNotificationsElement) {
      enableNotificationsElement.checked = settings.enableNotifications;
    } else {
      console.warn(
        "enable-notifications element not found during loadSettings",
      );
    }

    console.log("Settings loaded successfully");
  });
}

/**
 * Save settings from UI
 */
export function saveSettings() {
  const warningTime = parseInt(
    document.getElementById("warning-time").value,
    10,
  );
  const enableNotificationsElement = document.getElementById(
    "enable-notifications",
  );
  const enableNotifications = enableNotificationsElement
    ? enableNotificationsElement.checked
    : true;

  // Set iterateTimer to false since the checkbox doesn't exist in UI
  const iterateTimer = false;

  SettingsService.saveSettings(warningTime, enableNotifications, iterateTimer)
    .then(() => {
      // Update warning time for all active timers
      return SettingsService.updateWarningTimeForActiveTimers(warningTime);
    })
    .then((response) => {
      if (response && response.success) {
        const message =
          response.updatedCount > 0
            ? `Settings saved! Warning time: ${warningTime}s (${response.updatedCount} active timers updated)`
            : `Settings saved! Warning time: ${warningTime}s`;
        document.getElementById("status").textContent = message;
        console.log(
          `Updated warning time for ${response.updatedCount} active timers`,
        );
      } else {
        document.getElementById(
          "status",
        ).textContent = `Settings saved! Warning time: ${warningTime}s`;
      }

      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, 3000);
    })
    .catch((error) => {
      console.error("Error saving settings:", error);
      document.getElementById("status").textContent =
        error.message || "Error saving settings.";
      // Reset to saved value
      loadSettings();
    });
}

/**
 * Toggle settings visibility
 */
export function toggleSettings() {
  const settingsContainer = document.getElementById("settings-container");
  if (settingsContainer.style.display === "block") {
    settingsContainer.style.display = "none";
    // Ensure active timers are visible after closing settings
    setTimeout(ensureActiveTimersVisibility, 50);
  } else {
    settingsContainer.style.display = "block";
  }
}

/**
 * Test notification
 */
export function testNotification() {
  document.getElementById("status").textContent = "Testing notifications...";

  TimerService.testNotification()
    .then(() => {
      document.getElementById("status").textContent =
        "Test notification sent! Check your notifications.";
      console.log("Test notification sent");
    })
    .catch((error) => {
      document.getElementById("status").textContent =
        "Failed to send test notification";
      console.error("Failed to send test notification:", error);
    });
}

/**
 * Force test notification
 */
export function forceTestNotification() {
  document.getElementById("status").textContent =
    "Testing standard notification...";

  TimerService.forceTestNotification()
    .then(() => {
      document.getElementById("status").textContent =
        "Standard test notification sent! Check your notifications.";
      console.log("Standard test notification sent to Chrome");
    })
    .catch((error) => {
      document.getElementById("status").textContent =
        "Failed to send standard test notification";
      console.error("Failed to send standard test notification:", error);
    });
}


