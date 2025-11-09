/**
 * Time utility functions for formatting and converting time values
 */

/**
 * Get total seconds from hour, minute, and second input elements
 * @param {string} hoursId - ID of hours input element
 * @param {string} minutesId - ID of minutes input element
 * @param {string} secondsId - ID of seconds input element
 * @returns {number} Total seconds
 */
export function getTotalSecondsFromInputs(hoursId, minutesId, secondsId) {
  const hours = parseInt(document.getElementById(hoursId).value, 10) || 0;
  const minutes = parseInt(document.getElementById(minutesId).value, 10) || 0;
  const seconds = parseInt(document.getElementById(secondsId).value, 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Set time input elements from total seconds
 * @param {number} totalSeconds - Total seconds to convert
 * @param {string} hoursId - ID of hours input element
 * @param {string} minutesId - ID of minutes input element
 * @param {string} secondsId - ID of seconds input element
 */
export function setTimeInputsFromSeconds(
  totalSeconds,
  hoursId,
  minutesId,
  secondsId,
) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById(hoursId).value = hours;
  document.getElementById(minutesId).value = minutes;
  document.getElementById(secondsId).value = seconds;
}

/**
 * Format seconds as HH:MM:SS
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((v) => (v < 10 ? "0" + v : v)).join(":");
}

/**
 * Format seconds as MM:SS for stopwatch display
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted stopwatch time string
 */
export function formatStopwatchTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return [minutes, secs].map((v) => (v < 10 ? "0" + v : v)).join(":");
}


