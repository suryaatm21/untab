/**
 * Timer controls component - handles timer control actions (pause, extend, fast-forward)
 */

import { formatTime, formatStopwatchTime } from "../utils/time-utils.js";
import * as TimerState from "../state/timer-state.js";
import * as TimerService from "../services/timer-service.js";
import { updateTimerDisplay } from "./timer-display.js";

/**
 * Toggle timer pause state
 */
export function togglePauseTimer() {
  const pauseButton = document.getElementById("pauseTimer");

  if (TimerState.isTimerPaused()) {
    // Resume timer
    TimerState.setTimerPaused(false);
    const newEndTime =
      new Date().getTime() + TimerState.getPausedTimeRemaining() * 1000;
    TimerState.setEndTime(newEndTime);
    updateTimerDisplay();
    const intervalId = setInterval(updateTimerDisplay, 1000);
    TimerState.setCountdownInterval(intervalId);

    // Update button text and styling
    pauseButton.textContent = "Pause";
    pauseButton.classList.remove("resume-button");
    pauseButton.blur();
    document.getElementById("status").textContent = "Timer resumed";

    // Send message to background to update timer
    TimerService.updateTimer(
      TimerState.getTargetTabId(),
      TimerState.getPausedTimeRemaining(),
    );
  } else {
    // Pause timer
    TimerState.setTimerPaused(true);
    TimerState.clearCountdownInterval();
    const now = new Date().getTime();
    const pausedTime = Math.ceil((TimerState.getEndTime() - now) / 1000);
    TimerState.setPausedTimeRemaining(pausedTime);

    // Update displays to show paused time
    document.getElementById("timer-display").textContent =
      formatTime(pausedTime);
    document.getElementById("stopwatch-display").textContent =
      formatStopwatchTime(pausedTime);

    // Update button text and styling
    pauseButton.textContent = "Resume";
    pauseButton.classList.add("resume-button");
    pauseButton.blur();
    document.getElementById("status").textContent = "Timer paused";

    // Start interval to keep updating the clock hands for current time
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

    // Send message to background to pause timer
    TimerService.pauseTimer(TimerState.getTargetTabId());
  }
}

/**
 * Show extension UI
 */
export function showExtensionUI() {
  document.getElementById("extension-container").style.display = "block";
  document.getElementById("fast-forward-container").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
}

/**
 * Show fast forward UI
 */
export function showFastForwardUI() {
  document.getElementById("fast-forward-container").style.display = "block";
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
}

/**
 * Hide extension UI
 */
export function hideExtensionUI() {
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";
  document.getElementById("timer-controls").style.display = "flex";
}

/**
 * Extend timer by additional seconds
 * @param {number} additionalSeconds - Seconds to extend by
 */
export function extendTimer(additionalSeconds) {
  const targetTabId = TimerState.getTargetTabId();
  if (!targetTabId) return;

  const now = new Date().getTime();

  if (TimerState.isTimerPaused()) {
    const newPausedTime =
      TimerState.getPausedTimeRemaining() + additionalSeconds;
    TimerState.setPausedTimeRemaining(newPausedTime);

    // Update displays to show new paused time
    document.getElementById("timer-display").textContent =
      formatTime(newPausedTime);
    document.getElementById("stopwatch-display").textContent =
      formatStopwatchTime(newPausedTime);

    document.getElementById(
      "status",
    ).textContent = `Timer extended by ${additionalSeconds} seconds (paused)`;
  } else {
    const newEndTime = TimerState.getEndTime() + additionalSeconds * 1000;
    TimerState.setEndTime(newEndTime);
    document.getElementById(
      "status",
    ).textContent = `Timer extended by ${additionalSeconds} seconds`;
  }

  // Update background timer
  TimerService.extendTimer(targetTabId, additionalSeconds);

  hideExtensionUI();
}

/**
 * Fast forward timer by seconds
 * @param {number} secondsToSkip - Seconds to skip
 * @param {Function} updateActiveTimersListCallback - Callback to update active timers list
 */
export function fastForwardTimer(secondsToSkip, updateActiveTimersListCallback) {
  const targetTabId = TimerState.getTargetTabId();

  console.log(
    `[Popup] fastForwardTimer called with secondsToSkip: ${secondsToSkip}, targetTabId: ${targetTabId}, timerPaused: ${TimerState.isTimerPaused()}`,
  );

  if (!targetTabId) {
    console.error("[Popup] No targetTabId available for fast-forward");
    return;
  }

  // Send message to background to fast forward timer
  TimerService.fastForwardTimer(targetTabId, secondsToSkip)
    .then((response) => {
      console.log("[Popup] Received fast-forward response:", response);
      console.log(`Timer fast-forwarded by ${secondsToSkip} seconds`);
      document.getElementById(
        "status",
      ).textContent = `Timer fast-forwarded by ${secondsToSkip} seconds`;

      // Update the UI with new time
      const remainingTime = response.remainingTime;

      if (response.paused) {
        // Update paused timer display
        TimerState.setPausedTimeRemaining(remainingTime);
        document.getElementById("timer-display").textContent =
          formatTime(remainingTime);
        document.getElementById("stopwatch-display").textContent =
          formatStopwatchTime(remainingTime);

        // Ensure we're still in paused state
        TimerState.setTimerPaused(true);
      } else {
        // Update active timer display
        TimerState.setEndTime(new Date().getTime() + remainingTime * 1000);
        updateTimerDisplay();
      }

      // Also update the active timers list
      if (updateActiveTimersListCallback) {
        updateActiveTimersListCallback();
      }
    })
    .catch((error) => {
      document.getElementById(
        "status",
      ).textContent = `Error fast-forwarding timer: ${error}`;
      console.error("Failed to fast-forward timer:", error);
    });

  hideExtensionUI();
}


