/**
 * Active timers list component - displays and manages list of all active timers
 */

import { formatTime } from "../utils/time-utils.js";
import * as TimerState from "../state/timer-state.js";
import * as TimerService from "../services/timer-service.js";
import { showPausedTimer, showActiveTimer } from "./timer-display.js";

/**
 * Sort timers based on selected criteria
 * @param {Object} timers - Timers object
 * @param {string} sortBy - Sort criteria (alpha, most-time, least-time)
 * @returns {Array} Sorted timer entries
 */
function sortTimers(timers, sortBy) {
  const timerEntries = Object.entries(timers);

  // Process timer data to include remaining time
  const processedEntries = timerEntries.map(([tabId, timer]) => {
    let remainingTime = 0;
    if (timer.paused) {
      remainingTime = timer.remainingTime;
    } else {
      const now = Date.now();
      remainingTime = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
    }
    return [
      tabId,
      { ...timer, remainingTime, title: timer.tabTitle || "Unknown Tab" },
    ];
  });

  switch (sortBy) {
    case "alpha":
      return processedEntries.sort((a, b) =>
        a[1].title.localeCompare(b[1].title),
      );
    case "most-time":
      return processedEntries.sort(
        (a, b) => b[1].remainingTime - a[1].remainingTime,
      );
    case "least-time":
      return processedEntries.sort(
        (a, b) => a[1].remainingTime - b[1].remainingTime,
      );
    default:
      return processedEntries;
  }
}

/**
 * Update the active timers list display
 */
export function updateActiveTimersList() {
  console.log("Updating active timers list...");

  TimerService.getAllTimers().then((response) => {
    const activeTimersList = document.getElementById("active-timers-list");
    const activeTimersContainer = document.getElementById(
      "active-timers-container",
    );
    const sortSelect = document.getElementById("timer-sort");

    // Ensure elements exist before proceeding
    if (!activeTimersList || !activeTimersContainer) {
      console.warn("Active timers elements not found");
      return;
    }

    // Use a document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    activeTimersList.innerHTML = "";

    const timers = response && response.timers ? response.timers : {};
    const sortType = sortSelect ? sortSelect.value : "alpha";

    console.log(
      `Updating active timers list with ${Object.keys(timers).length} timers`,
      timers,
    );

    if (Object.keys(timers).length > 0) {
      // Use the sortTimers function to get sorted entries
      const timerEntries = sortTimers(timers, sortType);

      // Always show the container when there are timers
      activeTimersContainer.style.display = "block";
      console.log("Showing active timers container");

      timerEntries.forEach(([tabId, timer]) => {
        const timerItem = document.createElement("li");
        timerItem.className = "timer-item";
        if (parseInt(tabId) === TimerState.getCurrentTabId()) {
          timerItem.classList.add("timer-current-tab");
          console.log(`Marking timer for tab ${tabId} as current tab`);
        }
        if (parseInt(tabId) === TimerState.getTargetTabId()) {
          timerItem.classList.add("timer-active");
          console.log(`Marking timer for tab ${tabId} as active timer`);
        }
        const timerInfo = document.createElement("div");
        timerInfo.className = "timer-info";
        const timerTitle = document.createElement("div");
        timerTitle.className = "timer-title";
        timerTitle.textContent = timer.tabTitle || `Tab ID: ${tabId}`;
        timerInfo.appendChild(timerTitle);
        const timerTime = document.createElement("div");
        timerTime.className = "timer-time";
        let remainingTime = 0;
        if (timer.paused) {
          remainingTime = timer.remainingTime;
        } else {
          const now = Date.now();
          remainingTime = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
        }
        timerTime.textContent = `Remaining: ${formatTime(remainingTime)}`;
        timerInfo.appendChild(timerTime);
        timerItem.appendChild(timerInfo);

        // Add a view/select button
        const timerAction = document.createElement("div");
        timerAction.className = "timer-action";
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => {
          TimerState.setTargetTabId(parseInt(tabId));
          if (timer.paused) {
            showPausedTimer(remainingTime);
          } else {
            showActiveTimer(remainingTime);
          }
          document.getElementById("active-timers-container").style.display =
            "none";
          document.getElementById("backButton").style.display = "block";
        });
        timerAction.appendChild(viewButton);
        timerItem.appendChild(timerAction);
        fragment.appendChild(timerItem);
      });

      // Append the fragment to the DOM
      activeTimersList.appendChild(fragment);
    } else {
      // Hide container when no timers
      activeTimersContainer.style.display = "none";
      console.log("Hiding active timers container (no timers)");
    }
  });
}

/**
 * Ensure active timers container visibility is correct
 */
export function ensureActiveTimersVisibility() {
  TimerService.getAllTimers().then((response) => {
    const timers = response && response.timers ? response.timers : {};
    const activeTimersContainer = document.getElementById(
      "active-timers-container",
    );

    if (activeTimersContainer) {
      if (Object.keys(timers).length > 0) {
        activeTimersContainer.style.display = "block";
        console.log("Ensured active timers container is visible");
      } else {
        activeTimersContainer.style.display = "none";
        console.log("Ensured active timers container is hidden (no timers)");
      }
    }
  });
}

/**
 * Switch to viewing a different timer
 * @param {number} tabId - ID of tab to switch to
 */
export function switchToTimer(tabId) {
  if (tabId === TimerState.getTargetTabId()) return;

  // Clear current timer display
  TimerState.clearCountdownInterval();

  // Get the timer details
  TimerService.getAllTimers().then((response) => {
    if (response && response.timers && response.timers[tabId]) {
      const timer = response.timers[tabId];
      TimerState.setTargetTabId(tabId);

      if (timer.paused) {
        showPausedTimer(timer.remainingTime);
        // Show back button since we switched to a different timer
        document.getElementById("backButton").style.display = "block";
      } else {
        const now = Date.now();
        const remainingTime = Math.max(
          0,
          Math.ceil((timer.endTime - now) / 1000),
        );
        showActiveTimer(remainingTime);
      }

      // Focus on that tab if applicable
      chrome.tabs.get(tabId, (tab) => {
        if (!chrome.runtime.lastError) {
          document.getElementById(
            "status",
          ).textContent = `Switched to timer for: ${tab.title}`;
        }
      });

      // Update the list to mark the new active timer
      updateActiveTimersList();
    }
  });
}

/**
 * Back to timers list view
 */
export function backToTimersList() {
  // Clear current timer view
  TimerState.clearCountdownInterval();
  TimerState.setTargetTabId(null);
  TimerState.setTimerPaused(false);

  // Keep timer-container visible but hide timer-specific elements
  document.getElementById("timer-container").style.display = "block";
  document.getElementById("timer-display").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";

  // Show timer creation UI
  document.getElementById("startTimer").style.display = "block";
  document.getElementById("duration-input").style.display = "flex";
  document.getElementById("tab-select-container").style.display = "flex";

  // Show status
  document.getElementById("status").textContent =
    "Returned to all timers view. You can start a new timer.";

  // Start clock updating to show current time
  const intervalId = setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourDeg = 30 * (hours % 12) + minutes / 2;
    const minuteDeg = 6 * minutes;
    const secondDeg = 6 * seconds;

    const hourHand = document.getElementById("hour-hand");
    const minuteHand = document.getElementById("minute-hand");
    const secondHand = document.getElementById("second-hand");

    if (hourHand)
      hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    if (minuteHand)
      minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    if (secondHand)
      secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
  }, 1000);
  TimerState.setCountdownInterval(intervalId);

  // Update immediately
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourDeg = 30 * (hours % 12) + minutes / 2;
  const minuteDeg = 6 * minutes;
  const secondDeg = 6 * seconds;
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  const secondHand = document.getElementById("second-hand");
  if (hourHand)
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  if (minuteHand)
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  if (secondHand)
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

  // Update the list of all active timers with fresh data
  console.log("Back button clicked - refreshing active timers list");
  updateActiveTimersList();

  // Ensure active timers container is visible if there are timers
  setTimeout(() => {
    TimerService.getAllTimers().then((response) => {
      const timers = response && response.timers ? response.timers : {};
      const activeTimersContainer = document.getElementById(
        "active-timers-container",
      );
      console.log(
        `Back to timers list: found ${Object.keys(timers).length} timers`,
      );
      if (Object.keys(timers).length > 0 && activeTimersContainer) {
        activeTimersContainer.style.display = "block";
        console.log(
          "Ensured active timers container is visible from back button",
        );
      } else if (activeTimersContainer) {
        activeTimersContainer.style.display = "none";
        console.log(
          "Hidden active timers container (no timers) from back button",
        );
      }
    });
  }, 200);

  // Hide stopwatch
  document.querySelector(".stopwatch-bar").style.display = "none";
}
