/**
 * Timer display component - handles countdown, stopwatch, and clock display
 */

import { formatTime, formatStopwatchTime } from "../utils/time-utils.js";
import * as TimerState from "../state/timer-state.js";
import { updateActiveTimersList } from "./active-timers-list.js";

/**
 * Update the timer display with remaining time
 */
export function updateTimerDisplay() {
  if (TimerState.isTimerPaused()) {
    return;
  }

  const now = new Date().getTime();
  const timeLeft = Math.ceil((TimerState.getEndTime() - now) / 1000);

  if (timeLeft <= 0) {
    TimerState.clearCountdownInterval();
    hideTimerUI();
    document.getElementById("status").textContent =
      "Timer completed. Tab will close soon.";
    return;
  }

  // Update digital time display
  document.getElementById("timer-display").textContent = formatTime(timeLeft);

  // Update stopwatch display at top of clock
  document.getElementById("stopwatch-display").textContent =
    formatStopwatchTime(timeLeft);

  // Update the clock hands to show real time
  updateRealTimeClock();
}

/**
 * Update the clock hands to show current real time
 */
export function updateRealTimeClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate rotation angles for hour, minute, and second hands
  const hourDeg = 30 * (hours % 12) + minutes / 2;
  const minuteDeg = 6 * minutes;
  const secondDeg = 6 * seconds;

  // Apply rotations using translate and rotate transformations
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  const secondHand = document.getElementById("second-hand");

  if (hourHand)
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  if (minuteHand)
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  if (secondHand)
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
}

/**
 * Show active timer UI
 * @param {number} remainingTime - Remaining time in seconds
 */
export function showActiveTimer(remainingTime) {
  // Show timer elements
  document.getElementById("timer-container").style.display = "block";
  document.getElementById("timer-display").style.display = "block";
  document.getElementById("timer-controls").style.display = "flex";

  // Hide input elements
  document.getElementById("startTimer").style.display = "none";
  document.getElementById("duration-input").style.display = "none";
  document.getElementById("tab-select-container").style.display = "none";

  // Hide extension containers
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";

  // Set pause button text and styling
  const pauseButton = document.getElementById("pauseTimer");
  pauseButton.textContent = "Pause";
  pauseButton.classList.remove("resume-button");
  pauseButton.blur();
  document.getElementById("status").textContent = "Timer active";

  // Reset pause state
  TimerState.setTimerPaused(false);

  // Calculate end time and start updating the display
  TimerState.setEndTime(new Date().getTime() + remainingTime * 1000);
  updateTimerDisplay();
  const intervalId = setInterval(updateTimerDisplay, 1000);
  TimerState.setCountdownInterval(intervalId);

  // Show stopwatch
  document.querySelector(".stopwatch-bar").style.display = "flex";
}

/**
 * Show paused timer UI
 * @param {number} remainingTime - Remaining time in seconds
 */
export function showPausedTimer(remainingTime) {
  TimerState.clearCountdownInterval();

  // Show timer elements
  document.getElementById("timer-container").style.display = "block";
  document.getElementById("timer-display").style.display = "block";
  document.getElementById("timer-controls").style.display = "flex";

  // Hide input elements
  document.getElementById("startTimer").style.display = "none";
  document.getElementById("duration-input").style.display = "none";
  document.getElementById("tab-select-container").style.display = "none";

  // Hide extension containers
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";

  // Set UI for paused state
  const pauseButton = document.getElementById("pauseTimer");
  pauseButton.textContent = "Resume";
  pauseButton.classList.add("resume-button");
  pauseButton.blur();
  document.getElementById("status").textContent = "Timer paused";

  TimerState.setTimerPaused(true);
  TimerState.setPausedTimeRemaining(remainingTime);

  // Update displays
  document.getElementById("timer-display").textContent =
    formatTime(remainingTime);
  document.getElementById("stopwatch-display").textContent =
    formatStopwatchTime(remainingTime);

  // Update the clock hands to show current time
  updateRealTimeClock();

  // Start interval to keep updating the clock hands for current time
  const intervalId = setInterval(updateRealTimeClock, 1000);
  TimerState.setCountdownInterval(intervalId);

  // Show stopwatch with paused time
  document.querySelector(".stopwatch-bar").style.display = "flex";
}

/**
 * Hide active timer UI
 */
export function hideTimerUI() {
  TimerState.clearCountdownInterval();

  // Keep timer-container visible to show clock
  document.getElementById("timer-container").style.display = "block";
  document.getElementById("timer-display").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";
  document.getElementById("startTimer").style.display = "block";
  document.getElementById("duration-input").style.display = "flex";
  document.getElementById("tab-select-container").style.display = "flex";
  document.getElementById("status").textContent = "";

  // Start clock updating to show current time
  const intervalId = setInterval(updateRealTimeClock, 1000);
  TimerState.setCountdownInterval(intervalId);
  updateRealTimeClock();

  // Hide stopwatch
  document.querySelector(".stopwatch-bar").style.display = "none";

  // Update active timers list to reflect timer completion/hiding
  updateActiveTimersList();
}

/**
 * Show menu UI (default state for timer creation)
 */
export function showMenuUI() {
  TimerState.clearCountdownInterval();

  // Show timer container and menu elements
  document.getElementById("timer-container").style.display = "block";
  document.getElementById("timer-display").style.display = "none";
  document.getElementById("timer-controls").style.display = "none";
  document.getElementById("extension-container").style.display = "none";
  document.getElementById("fast-forward-container").style.display = "none";
  document.getElementById("startTimer").style.display = "block";
  document.getElementById("duration-input").style.display = "flex";
  document.getElementById("tab-select-container").style.display = "flex";
  document.getElementById("status").textContent = "";

  // Start clock updating to show current time
  const intervalId = setInterval(updateRealTimeClock, 1000);
  TimerState.setCountdownInterval(intervalId);
  updateRealTimeClock();

  // Hide stopwatch
  document.querySelector(".stopwatch-bar").style.display = "none";

  console.log("Showing menu UI (timer creation interface)");
}
