/**
 * Timer state management
 */

/**
 * @typedef {Object} TimerState
 * @property {number|null} endTime - Timer end timestamp
 * @property {number|null} targetTabId - ID of tab with active timer
 * @property {boolean} timerPaused - Whether timer is paused
 * @property {number} pausedTimeRemaining - Time remaining when paused
 * @property {number|null} currentTabId - ID of current active tab
 * @property {number|null} countdownInterval - Interval ID for countdown
 */

const state = {
  endTime: null,
  targetTabId: null,
  timerPaused: false,
  pausedTimeRemaining: 0,
  currentTabId: null,
  countdownInterval: null,
};

/**
 * Get current timer state
 * @returns {TimerState} Current state
 */
export function getState() {
  return { ...state };
}

/**
 * Set end time for timer
 * @param {number} time - End timestamp
 */
export function setEndTime(time) {
  state.endTime = time;
}

/**
 * Get end time
 * @returns {number|null} End timestamp
 */
export function getEndTime() {
  return state.endTime;
}

/**
 * Set target tab ID
 * @param {number|null} tabId - Tab ID
 */
export function setTargetTabId(tabId) {
  state.targetTabId = tabId;
}

/**
 * Get target tab ID
 * @returns {number|null} Tab ID
 */
export function getTargetTabId() {
  return state.targetTabId;
}

/**
 * Set timer paused state
 * @param {boolean} paused - Whether timer is paused
 */
export function setTimerPaused(paused) {
  state.timerPaused = paused;
}

/**
 * Check if timer is paused
 * @returns {boolean} Paused state
 */
export function isTimerPaused() {
  return state.timerPaused;
}

/**
 * Set paused time remaining
 * @param {number} time - Time remaining in seconds
 */
export function setPausedTimeRemaining(time) {
  state.pausedTimeRemaining = time;
}

/**
 * Get paused time remaining
 * @returns {number} Time remaining in seconds
 */
export function getPausedTimeRemaining() {
  return state.pausedTimeRemaining;
}

/**
 * Set current tab ID
 * @param {number|null} tabId - Tab ID
 */
export function setCurrentTabId(tabId) {
  state.currentTabId = tabId;
}

/**
 * Get current tab ID
 * @returns {number|null} Tab ID
 */
export function getCurrentTabId() {
  return state.currentTabId;
}

/**
 * Set countdown interval
 * @param {number|null} intervalId - Interval ID
 */
export function setCountdownInterval(intervalId) {
  state.countdownInterval = intervalId;
}

/**
 * Get countdown interval
 * @returns {number|null} Interval ID
 */
export function getCountdownInterval() {
  return state.countdownInterval;
}

/**
 * Clear countdown interval
 */
export function clearCountdownInterval() {
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
    state.countdownInterval = null;
  }
}

/**
 * Reset all state
 */
export function resetState() {
  clearCountdownInterval();
  state.endTime = null;
  state.targetTabId = null;
  state.timerPaused = false;
  state.pausedTimeRemaining = 0;
}


