/**
 * Main popup orchestrator - coordinates all components and handles initialization
 */

import { getTotalSecondsFromInputs } from "./utils/time-utils.js";
import { setupTimeInputValidation, debounce } from "./utils/validation-utils.js";
import * as TimerService from "./services/timer-service.js";
import * as SettingsService from "./services/settings-service.js";
import * as TimerState from "./state/timer-state.js";
import {
  showActiveTimer,
  showPausedTimer,
  hideTimerUI,
  showMenuUI,
} from "./components/timer-display.js";
import {
  togglePauseTimer,
  showExtensionUI,
  showFastForwardUI,
  hideExtensionUI,
  extendTimer,
  fastForwardTimer,
} from "./components/timer-controls.js";
import {
  updateActiveTimersList,
  backToTimersList,
  ensureActiveTimersVisibility,
} from "./components/active-timers-list.js";
import {
  loadSettings,
  saveSettings,
  toggleSettings,
  testNotification,
  forceTestNotification,
} from "./components/settings-panel.js";
import { populateTabSelection } from "./components/tab-selector.js";

/**
 * Start timer button click handler
 */
function startTimerHandler() {
  let duration = getTotalSecondsFromInputs(
    "duration-hours",
    "duration-minutes",
    "duration-seconds",
  );
  if (isNaN(duration) || duration <= 0) {
    document.getElementById("status").textContent =
      "Please enter a valid duration (at least 1 second).";
    console.log("Invalid duration entered");
    return;
  }

  // Get settings and start timer
  SettingsService.loadSettings().then((settings) => {
    console.log("Starting timer with settings:", {
      ...settings,
      duration,
    });

    // Get selected tab option
    const tabSelect = document.getElementById("tab-select");
    const selectedValue = tabSelect.value;

    if (
      selectedValue === "current" ||
      selectedValue == TimerState.getCurrentTabId()
    ) {
      // Use current tab
      chrome.tabs.get(TimerState.getCurrentTabId(), function (tab) {
        if (chrome.runtime.lastError) {
          document.getElementById("status").textContent = "Tab not found.";
          console.log("Tab not found:", chrome.runtime.lastError);
          return;
        }

        startTimerForTab(
          TimerState.getCurrentTabId(),
          duration,
          settings.warningTime,
          settings.enableNotifications,
          tab.title,
          settings.iterateTimer,
        );
      });
    } else {
      // Use selected tab
      const tabId = parseInt(selectedValue);
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          document.getElementById("status").textContent = "Tab not found.";
          console.log("Tab not found:", chrome.runtime.lastError);
          return;
        }
        startTimerForTab(
          tabId,
          duration,
          settings.warningTime,
          settings.enableNotifications,
          tab.title,
          settings.iterateTimer,
        );
      });
    }
  });
}

/**
 * Start timer for a specific tab
 * @param {number} tabId - Tab ID
 * @param {number} duration - Duration in seconds
 * @param {number} warningTime - Warning time in seconds
 * @param {boolean} enableNotifications - Enable notifications
 * @param {string} tabTitle - Tab title
 * @param {boolean} iterateTimer - Iterate timer
 */
function startTimerForTab(
  tabId,
  duration,
  warningTime,
  enableNotifications,
  tabTitle,
  iterateTimer,
) {
  TimerState.setTargetTabId(tabId);

  // Send message to background to start the timer for this tab
  TimerService.startTimer(
    tabId,
    duration,
    warningTime,
    enableNotifications,
    tabTitle,
    iterateTimer,
  )
    .then(() => {
      console.log(
        `Timer started for tab ${tabId} with duration ${duration} seconds`,
      );

      // Setup visual countdown
      TimerState.clearCountdownInterval();
      showActiveTimer(duration);

      // Show back button when timer is started
      document.getElementById("backButton").style.display = "block";

      // Store the tab ID of the timer for the popup
      chrome.storage.local.set({ currentTimerTabId: tabId });

      // Update active timers list
      updateActiveTimersList();
    })
    .catch((error) => {
      document.getElementById("status").textContent = "Error setting timer.";
      console.error("Failed to start timer:", error);
    });
}

/**
 * Stop timer handler
 */
function stopTimerHandler() {
  const targetTabId = TimerState.getTargetTabId();

  if (targetTabId) {
    TimerService.stopTimer(targetTabId)
      .then(() => {
        console.log(`Timer stopped for tab ${targetTabId}`);

        // If we stopped the timer for the current tab, show the timer creation UI
        if (targetTabId === TimerState.getCurrentTabId()) {
          hideTimerUI();
          document.getElementById("status").textContent = "Timer stopped";
        } else {
          // If we stopped a timer for another tab, reset UI and check current tab timer
          document.getElementById(
            "status",
          ).textContent = `Timer stopped for tab ${targetTabId}`;
          checkCurrentTabTimer();
        }

        TimerState.setTargetTabId(null);
        TimerState.setTimerPaused(false);

        // Clear stored timer tab ID
        chrome.storage.local.remove("currentTimerTabId");

        // Update active timers list
        updateActiveTimersList();
      })
      .catch((error) => {
        document.getElementById("status").textContent =
          "Error stopping timer: " + error;
        console.error("Failed to stop timer:", error);
      });
  } else {
    document.getElementById("status").textContent = "No active timer found.";
  }
}

/**
 * Check if the current tab has an active timer
 */
function checkCurrentTabTimer() {
  const currentTabId = TimerState.getCurrentTabId();

  if (!currentTabId) {
    console.warn("No current tab ID available for timer check");
    return;
  }

  console.log(`Checking timer for current tab ${currentTabId}`);

  TimerService.checkTimer(currentTabId).then((response) => {
    console.log(`Timer check response for tab ${currentTabId}:`, response);

    if (response && response.active) {
      // Current tab has an active timer
      const timer = response.timer;
      TimerState.setTargetTabId(currentTabId);

      console.log(
        `Found active timer for current tab ${currentTabId}:`,
        timer,
      );

      if (timer.paused) {
        showPausedTimer(timer.remainingTime);
      } else {
        const remainingTime = Math.max(
          0,
          Math.ceil((timer.endTime - Date.now()) / 1000),
        );
        showActiveTimer(remainingTime);
      }

      document.getElementById("status").textContent =
        "Timer active for current tab";
      document.getElementById("backButton").style.display = "block";
    } else {
      // Current tab has no timer, show the timer creation UI
      console.log(`No active timer found for current tab ${currentTabId}`);
      hideTimerUI();
      // Hide back button when no timer is active
      document.getElementById("backButton").style.display = "none";
    }

    // Always update the list of all active timers after checking current tab
    setTimeout(() => {
      updateActiveTimersList();
    }, 50);

    // Ensure container visibility is correct
    setTimeout(ensureActiveTimersVisibility, 150);
  });
}

/**
 * Set up preset button handlers
 */
function setupPresetButtons() {
  document.querySelectorAll(".preset-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const hours = parseInt(this.dataset.hours, 10) || 0;
      const minutes = parseInt(this.dataset.minutes, 10) || 0;
      const seconds = parseInt(this.dataset.seconds, 10) || 0;
      const target = this.dataset.target;

      if (target === "extension") {
        document.getElementById("extension-hours").value = hours;
        document.getElementById("extension-minutes").value = minutes;
        document.getElementById("extension-seconds").value = seconds;
      } else if (target === "ff") {
        document.getElementById("ff-hours").value = hours;
        document.getElementById("ff-minutes").value = minutes;
        document.getElementById("ff-seconds").value = seconds;
      } else {
        // Default duration inputs
        document.getElementById("duration-hours").value = hours;
        document.getElementById("duration-minutes").value = minutes;
        document.getElementById("duration-seconds").value = seconds;
      }
    });
  });
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Settings toggle and changes
  document
    .getElementById("toggle-settings")
    .addEventListener("click", toggleSettings);
  document
    .getElementById("warning-time")
    .addEventListener("change", saveSettings);
  document
    .getElementById("enable-notifications")
    .addEventListener("change", saveSettings);

  // Test notification button
  document
    .getElementById("test-notification-button")
    .addEventListener("click", testNotification);

  // Timer control buttons
  document
    .getElementById("pauseTimer")
    .addEventListener("click", togglePauseTimer);
  document
    .getElementById("extendTimer")
    .addEventListener("click", showExtensionUI);
  document.getElementById("fastForwardTimer").addEventListener("click", () => {
    console.log(
      `[Popup] Fast Forward button clicked. timerPaused: ${TimerState.isTimerPaused()}, targetTabId: ${TimerState.getTargetTabId()}`,
    );
    showFastForwardUI();
  });
  document
    .getElementById("backButton")
    .addEventListener("click", backToTimersList);

  // Extension UI
  document.getElementById("confirm-extend").addEventListener("click", () => {
    const additionalTime = getTotalSecondsFromInputs(
      "extension-hours",
      "extension-minutes",
      "extension-seconds",
    );
    if (!isNaN(additionalTime) && additionalTime > 0) {
      extendTimer(additionalTime);
    } else {
      document.getElementById("status").textContent =
        "Please enter a valid extension time (at least 1 second)";
    }
  });
  document
    .getElementById("cancel-extend")
    .addEventListener("click", hideExtensionUI);

  // Fast forward UI
  document.getElementById("confirm-ff").addEventListener("click", () => {
    const ffTime = getTotalSecondsFromInputs(
      "ff-hours",
      "ff-minutes",
      "ff-seconds",
    );
    console.log(
      `[Popup] Fast-forward confirm clicked. ffTime: ${ffTime}, timerPaused: ${TimerState.isTimerPaused()}`,
    );
    if (!isNaN(ffTime) && ffTime > 0) {
      fastForwardTimer(ffTime, updateActiveTimersList);
    } else {
      document.getElementById("status").textContent =
        "Please enter a valid fast-forward time (at least 1 second)";
    }
  });
  document
    .getElementById("cancel-ff")
    .addEventListener("click", hideExtensionUI);

  // Start timer button
  document
    .getElementById("startTimer")
    .addEventListener("click", startTimerHandler);

  // Stop timer button
  document
    .getElementById("stopTimer")
    .addEventListener("click", stopTimerHandler);

  // Sort change event
  const sortSelect = document.getElementById("timer-sort");
  sortSelect.addEventListener("change", debounce(updateActiveTimersList, 100));
}

/**
 * Initialize the popup
 */
function initialize() {
  // Initialize UI state - hide back button by default
  document.getElementById("backButton").style.display = "none";

  // Hide all UI elements initially to prevent flash
  document.getElementById("timer-container").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
  document.getElementById("startTimer").style.display = "none";
  document.getElementById("duration-input").style.display = "none";
  document.getElementById("tab-select-container").style.display = "none";
  document.getElementById("active-timers-container").style.display = "none";

  // Get the current tab first
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      TimerState.setCurrentTabId(tabs[0].id);
      console.log(
        `Popup opened for tab ${tabs[0].id}: ${tabs[0].title}`,
      );

      // Check if current tab has a timer FIRST before showing any UI
      TimerService.checkTimer(tabs[0].id).then((response) => {
        console.log(
          `Initial timer check response for tab ${tabs[0].id}:`,
          response,
        );

        if (response && response.active) {
          // Current tab has an active timer - show timer UI directly
          const timer = response.timer;
          TimerState.setTargetTabId(tabs[0].id);

          console.log(
            `Found active timer for current tab ${tabs[0].id}, showing timer UI directly`,
          );

          if (timer.paused) {
            showPausedTimer(timer.remainingTime);
          } else {
            const remainingTime = Math.max(
              0,
              Math.ceil((timer.endTime - Date.now()) / 1000),
            );
            showActiveTimer(remainingTime);
          }

          document.getElementById("status").textContent =
            "Timer active for current tab";
          document.getElementById("backButton").style.display = "block";
        } else {
          // No timer for current tab - show menu UI
          console.log(
            `No active timer for current tab ${tabs[0].id}, showing menu UI`,
          );
          showMenuUI();
        }

        // Initialize other components after UI is set
        populateTabSelection();

        // Load settings
        setTimeout(() => {
          loadSettings();
        }, 50);

        // Update active timers list
        updateActiveTimersList();

        // Set up event listeners for UI elements
        setupEventListeners();

        // Add input validation for time fields
        setupTimeInputValidation();

        // Set up preset button handlers
        setupPresetButtons();

        // Final visibility check
        setTimeout(ensureActiveTimersVisibility, 100);
      });
    } else {
      document.getElementById("status").textContent = "No active tab found";
      showMenuUI();
    }
  });
}

/**
 * Debug function for fast-forward testing
 * @param {number} seconds - Seconds to fast forward
 */
window.debugFastForward = function (seconds) {
  console.log(`[Debug] Manual fast-forward test with ${seconds} seconds`);
  console.log(
    `[Debug] Current state: targetTabId=${TimerState.getTargetTabId()}, timerPaused=${TimerState.isTimerPaused()}, pausedTimeRemaining=${TimerState.getPausedTimeRemaining()}`,
  );

  if (!TimerState.getTargetTabId()) {
    console.error("[Debug] No targetTabId - cannot test fast-forward");
    return;
  }

  fastForwardTimer(seconds || 30, updateActiveTimersList);
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initialize);

// Update active timers list periodically
setInterval(updateActiveTimersList, 5000);

// Refresh when popup becomes visible
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    console.log("Popup became visible, refreshing active timers");
    setTimeout(() => {
      updateActiveTimersList();
      ensureActiveTimersVisibility();
    }, 100);
  }
});

// Also listen for focus events
window.addEventListener("focus", () => {
  console.log("Popup gained focus, refreshing active timers");
  setTimeout(() => {
    updateActiveTimersList();
    ensureActiveTimersVisibility();
  }, 100);
});


