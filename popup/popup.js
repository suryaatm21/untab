let countdownInterval;
let endTime;
let targetTabId = null;
let timerPaused = false;
let pausedTimeRemaining = 0;
let currentTabId = null;

// Utility functions for time conversion
function getTotalSecondsFromInputs(hoursId, minutesId, secondsId) {
  const hours = parseInt(document.getElementById(hoursId).value, 10) || 0;
  const minutes = parseInt(document.getElementById(minutesId).value, 10) || 0;
  const seconds = parseInt(document.getElementById(secondsId).value, 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

function setTimeInputsFromSeconds(totalSeconds, hoursId, minutesId, secondsId) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById(hoursId).value = hours;
  document.getElementById(minutesId).value = minutes;
  document.getElementById(secondsId).value = seconds;
}

// Format time as HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((v) => (v < 10 ? '0' + v : v)).join(':');
}

// Format time as MM:SS for stopwatch display
function formatStopwatchTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return [minutes, secs].map((v) => (v < 10 ? '0' + v : v)).join(':');
}

// Update the timer display
function updateTimerDisplay() {
  if (timerPaused) {
    return;
  }

  const now = new Date().getTime();
  const timeLeft = Math.ceil((endTime - now) / 1000);

  if (timeLeft <= 0) {
    clearInterval(countdownInterval);
    hideTimerUI();
    document.getElementById('status').textContent =
      'Timer completed. Tab will close soon.';
    return;
  }

  // Update digital time display
  document.getElementById('timer-display').textContent = formatTime(timeLeft);

  // Update stopwatch display at top of clock
  document.getElementById('stopwatch-display').textContent =
    formatStopwatchTime(timeLeft);

  // Update the clock hands to show real time
  updateRealTimeClock();
}

// Initialize and update the clock hands for the real time clock
function updateRealTimeClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate rotation angles for hour, minute, and second hands
  const hourDeg = 30 * (hours % 12) + minutes / 2; // 30 degrees per hour + small shift for minutes
  const minuteDeg = 6 * minutes; // 6 degrees per minute
  const secondDeg = 6 * seconds; // 6 degrees per second

  // Apply rotations using translate and rotate transformations
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  if (hourHand)
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  if (minuteHand)
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  if (secondHand)
    secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
}

// Show active timer UI
function showActiveTimer(remainingTime) {
  // Show timer elements
  document.getElementById('timer-container').style.display = 'block';
  document.getElementById('timer-controls').style.display = 'flex';

  // Hide input elements
  document.getElementById('startTimer').style.display = 'none';
  document.getElementById('duration-input').style.display = 'none';
  document.getElementById('tab-select-container').style.display = 'none';

  // Hide extension containers - only show them when Extend/Fast Forward buttons are clicked
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';

  // Set pause button text and styling
  const pauseButton = document.getElementById('pauseTimer');
  pauseButton.textContent = 'Pause';
  pauseButton.classList.remove('resume-button');
  pauseButton.blur(); // Remove focus to prevent persistent fill
  document.getElementById('status').textContent = 'Timer active';

  // Reset pause state
  timerPaused = false;

  // Calculate end time and start updating the display
  endTime = new Date().getTime() + remainingTime * 1000;
  updateTimerDisplay();
  countdownInterval = setInterval(updateTimerDisplay, 1000);

  // Show stopwatch
  document.querySelector('.stopwatch-bar').style.display = 'flex';
}

// Show a paused timer UI
function showPausedTimer(remainingTime) {
  clearInterval(countdownInterval);

  // Show timer elements
  document.getElementById('timer-container').style.display = 'block';
  document.getElementById('timer-controls').style.display = 'flex';

  // Hide input elements
  document.getElementById('startTimer').style.display = 'none';
  document.getElementById('duration-input').style.display = 'none';
  document.getElementById('tab-select-container').style.display = 'none';

  // Hide extension containers - only show them when Extend/Fast Forward buttons are clicked
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';

  // Set UI for paused state
  const pauseButton = document.getElementById('pauseTimer');
  pauseButton.textContent = 'Resume';
  pauseButton.classList.add('resume-button');
  pauseButton.blur(); // Remove focus to prevent persistent fill
  document.getElementById('status').textContent = 'Timer paused';

  timerPaused = true;
  pausedTimeRemaining = remainingTime;

  // Update displays
  document.getElementById('timer-display').textContent =
    formatTime(remainingTime);

  // Update stopwatch display at top of clock to show paused time
  document.getElementById('stopwatch-display').textContent =
    formatStopwatchTime(remainingTime);

  // Update the clock hands to show current time (even when paused)
  updateRealTimeClock();

  // Start interval to keep updating the clock hands for current time
  countdownInterval = setInterval(updateRealTimeClock, 1000);

  // Show stopwatch with paused time
  document.querySelector('.stopwatch-bar').style.display = 'flex';
}

// Hide active timer UI
function hideTimerUI() {
  clearInterval(countdownInterval);

  // Keep timer-container visible to show clock, but hide timer-specific elements
  document.getElementById('timer-container').style.display = 'block';
  document.getElementById('timer-display').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';
  document.getElementById('startTimer').style.display = 'block';
  document.getElementById('duration-input').style.display = 'flex';
  document.getElementById('tab-select-container').style.display = 'flex';
  document.getElementById('status').textContent = '';

  // Start clock updating to show current time
  countdownInterval = setInterval(updateRealTimeClock, 1000);
  updateRealTimeClock(); // Update immediately

  // Update active timers list to ensure it's shown if there are timers
  updateActiveTimersList();

  // Hide stopwatch
  document.querySelector('.stopwatch-bar').style.display = 'none';
}

// Toggle timer pause state
function togglePauseTimer() {
  const pauseButton = document.getElementById('pauseTimer');

  if (timerPaused) {
    // Resume timer
    timerPaused = false;
    endTime = new Date().getTime() + pausedTimeRemaining * 1000;
    updateTimerDisplay();
    countdownInterval = setInterval(updateTimerDisplay, 1000);

    // Update button text and styling - return to original pause styling
    pauseButton.textContent = 'Pause';
    pauseButton.classList.remove('resume-button');
    pauseButton.blur(); // Remove focus to prevent persistent fill
    document.getElementById('status').textContent = 'Timer resumed';

    // Send message to background to update timer
    chrome.runtime.sendMessage({
      action: 'updateTimer',
      tabId: targetTabId,
      newDuration: pausedTimeRemaining,
    });
  } else {
    // Pause timer
    timerPaused = true;
    clearInterval(countdownInterval);
    const now = new Date().getTime();
    pausedTimeRemaining = Math.ceil((endTime - now) / 1000);

    // Update displays to show paused time
    document.getElementById('timer-display').textContent =
      formatTime(pausedTimeRemaining);
    document.getElementById('stopwatch-display').textContent =
      formatStopwatchTime(pausedTimeRemaining);

    // Update button text and styling
    pauseButton.textContent = 'Resume';
    pauseButton.classList.add('resume-button');
    pauseButton.blur(); // Remove focus to prevent persistent fill
    document.getElementById('status').textContent = 'Timer paused';

    // Start interval to keep updating the clock hands for current time (even when paused)
    countdownInterval = setInterval(updateRealTimeClock, 1000);

    // Send message to background to pause timer
    chrome.runtime.sendMessage({
      action: 'pauseTimer',
      tabId: targetTabId,
    });
  }
}

// Show extension UI
function showExtensionUI() {
  document.getElementById('extension-container').style.display = 'block';
  document.getElementById('fast-forward-container').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
}

// Show fast forward UI
function showFastForwardUI() {
  document.getElementById('fast-forward-container').style.display = 'block';
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
}

// Hide extension UI
function hideExtensionUI() {
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'flex';
}

// Extend timer
function extendTimer(additionalSeconds) {
  if (!targetTabId) return;

  // Calculate new endTime
  const now = new Date().getTime();
  let newEndTime;

  if (timerPaused) {
    pausedTimeRemaining += additionalSeconds;

    // Update displays to show new paused time
    document.getElementById('timer-display').textContent =
      formatTime(pausedTimeRemaining);
    document.getElementById('stopwatch-display').textContent =
      formatStopwatchTime(pausedTimeRemaining);

    document.getElementById(
      'status',
    ).textContent = `Timer extended by ${additionalSeconds} seconds (paused)`;
  } else {
    newEndTime = endTime + additionalSeconds * 1000;
    endTime = newEndTime;
    document.getElementById(
      'status',
    ).textContent = `Timer extended by ${additionalSeconds} seconds`;
  }

  // Update background timer
  chrome.runtime.sendMessage({
    action: 'extendTimer',
    tabId: targetTabId,
    additionalTime: additionalSeconds,
  });

  hideExtensionUI();
}

// Fast forward timer
function fastForwardTimer(secondsToSkip) {
  if (!targetTabId) return;

  // Send message to background to fast forward timer
  chrome.runtime.sendMessage(
    {
      action: 'fastForwardTimer',
      tabId: targetTabId,
      secondsToSkip: secondsToSkip,
    },
    function (response) {
      if (response && response.success) {
        console.log(`Timer fast-forwarded by ${secondsToSkip} seconds`);
        document.getElementById(
          'status',
        ).textContent = `Timer fast-forwarded by ${secondsToSkip} seconds`;

        // Update the UI with new time
        const remainingTime = response.remainingTime;
        endTime = new Date().getTime() + remainingTime * 1000;
        updateTimerDisplay();

        // Also update the active timers list
        updateActiveTimersList();
      } else {
        const errorMsg = response ? response.error : 'Unknown error';
        document.getElementById(
          'status',
        ).textContent = `Error fast-forwarding timer: ${errorMsg}`;
        console.error('Failed to fast-forward timer:', errorMsg);
      }
    },
  );

  hideExtensionUI();
}

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Sort timers based on selected criteria
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
      { ...timer, remainingTime, title: timer.tabTitle || 'Unknown Tab' },
    ];
  });

  switch (sortBy) {
    case 'alpha':
      return processedEntries.sort((a, b) =>
        a[1].title.localeCompare(b[1].title),
      );
    case 'most-time':
      return processedEntries.sort(
        (a, b) => b[1].remainingTime - a[1].remainingTime,
      );
    case 'least-time':
      return processedEntries.sort(
        (a, b) => a[1].remainingTime - b[1].remainingTime,
      );
    default:
      return processedEntries;
  }
}

// Update the active timers list
function updateActiveTimersList() {
  chrome.runtime.sendMessage({ action: 'getAllTimers' }, function (response) {
    const activeTimersList = document.getElementById('active-timers-list');
    const activeTimersContainer = document.getElementById(
      'active-timers-container',
    );
    const sortSelect = document.getElementById('timer-sort');

    // Ensure elements exist before proceeding
    if (!activeTimersList || !activeTimersContainer) {
      console.warn('Active timers elements not found');
      return;
    }

    // Use a document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    activeTimersList.innerHTML = '';

    const timers = response && response.timers ? response.timers : {};
    const sortType = sortSelect ? sortSelect.value : 'alpha';

    console.log(
      `Updating active timers list with ${Object.keys(timers).length} timers`,
    );

    if (Object.keys(timers).length > 0) {
      // Use the sortTimers function to get sorted entries
      const timerEntries = sortTimers(timers, sortType);

      // Always show the container when there are timers
      activeTimersContainer.style.display = 'block';
      console.log('Showing active timers container');

      timerEntries.forEach(([tabId, timer]) => {
        const timerItem = document.createElement('li');
        timerItem.className = 'timer-item';
        if (parseInt(tabId) === currentTabId) {
          timerItem.classList.add('timer-current-tab');
        }
        if (parseInt(tabId) === targetTabId) {
          timerItem.classList.add('timer-active');
        }
        const timerInfo = document.createElement('div');
        timerInfo.className = 'timer-info';
        const timerTitle = document.createElement('div');
        timerTitle.className = 'timer-title';
        timerTitle.textContent = timer.tabTitle || `Tab ID: ${tabId}`;
        timerInfo.appendChild(timerTitle);
        const timerTime = document.createElement('div');
        timerTime.className = 'timer-time';
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
        const timerAction = document.createElement('div');
        timerAction.className = 'timer-action';
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.addEventListener('click', () => {
          targetTabId = parseInt(tabId);
          if (timer.paused) {
            showPausedTimer(remainingTime);
          } else {
            showActiveTimer(remainingTime);
          }
          document.getElementById('active-timers-container').style.display =
            'none';
          document.getElementById('backButton').style.display = 'block';
        });
        timerAction.appendChild(viewButton);
        timerItem.appendChild(timerAction);
        fragment.appendChild(timerItem);
      });

      // Append the fragment to the DOM
      activeTimersList.appendChild(fragment);
    } else {
      // Hide container when no timers
      activeTimersContainer.style.display = 'none';
      console.log('Hiding active timers container (no timers)');
    }
  });
}

// Debounced sort change event
const sortSelect = document.getElementById('timer-sort');
if (sortSelect) {
  sortSelect.addEventListener('change', debounce(updateActiveTimersList, 100));
}

// Switch to a different timer
function switchToTimer(tabId) {
  if (tabId === targetTabId) return; // Already viewing this timer

  // Clear current timer display
  clearInterval(countdownInterval);

  // Get the timer details
  chrome.runtime.sendMessage({ action: 'getAllTimers' }, function (response) {
    if (response && response.timers && response.timers[tabId]) {
      const timer = response.timers[tabId];
      targetTabId = tabId;

      if (timer.paused) {
        showPausedTimer(timer.remainingTime);
        // Show back button since we switched to a different timer
        document.getElementById('backButton').style.display = 'block';
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
            'status',
          ).textContent = `Switched to timer for: ${tab.title}`;
        }
      });

      // Update the list to mark the new active timer
      updateActiveTimersList();
    }
  });
}

// Back to timers list view
function backToTimersList() {
  // Clear current timer view
  clearInterval(countdownInterval);
  targetTabId = null;
  timerPaused = false;

  // Keep timer-container visible but hide timer-specific elements
  document.getElementById('timer-container').style.display = 'block';
  document.getElementById('timer-display').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';

  // Show timer creation UI
  document.getElementById('startTimer').style.display = 'block';
  document.getElementById('duration-input').style.display = 'flex';
  document.getElementById('tab-select-container').style.display = 'flex';

  // Show status
  document.getElementById('status').textContent =
    'Returned to all timers view. You can start a new timer.';

  // Start clock updating to show current time
  countdownInterval = setInterval(updateRealTimeClock, 1000);
  updateRealTimeClock(); // Update immediately

  // Update the list of all active timers
  updateActiveTimersList();

  // Ensure active timers container is visible if there are timers
  // Add a small delay to ensure the update completes
  setTimeout(() => {
    chrome.runtime.sendMessage({ action: 'getAllTimers' }, function (response) {
      const timers = response && response.timers ? response.timers : {};
      const activeTimersContainer = document.getElementById(
        'active-timers-container',
      );
      if (Object.keys(timers).length > 0 && activeTimersContainer) {
        activeTimersContainer.style.display = 'block';
        console.log('Ensured active timers container is visible');
      }
    });
  }, 100);

  // Hide stopwatch
  document.querySelector('.stopwatch-bar').style.display = 'none';
}

// Populate tab selection dropdown
function populateTabSelection() {
  const tabSelect = document.getElementById('tab-select');
  // Clear existing options except the first one (current tab)
  while (tabSelect.options.length > 1) {
    tabSelect.remove(1);
  }

  // Get all tabs
  chrome.tabs.query({}, function (tabs) {
    // Sort tabs by window ID and position
    tabs.sort((a, b) => {
      if (a.windowId !== b.windowId) {
        return a.windowId - b.windowId;
      }
      return a.index - b.index;
    });

    // Group tabs by window
    let currentWindowId = null;
    let windowGroup = null;

    tabs.forEach((tab) => {
      if (tab.windowId !== currentWindowId) {
        currentWindowId = tab.windowId;
        windowGroup = document.createElement('optgroup');
        windowGroup.label = `Window ${currentWindowId}`;
        tabSelect.appendChild(windowGroup);
      }

      // Create option for each tab with truncated title
      const option = document.createElement('option');
      option.value = tab.id;
      const title =
        tab.title.length > 40 ? tab.title.substring(0, 40) + '...' : tab.title;
      option.textContent = title;
      windowGroup.appendChild(option);
    });

    // Set default selection based on user preference or current tab
    chrome.storage.sync.get(['defaultCurrentTab'], function (result) {
      if (result.defaultCurrentTab) {
        tabSelect.value = 'current';
      }
    });
  });
}

// Load settings
function loadSettings() {
  chrome.storage.sync.get(
    ['warningTime', 'enableNotifications', 'iterateTimer'],
    function (result) {
      console.log('Loading settings:', result);

      const warningTimeInput = document.getElementById('warning-time');
      let warningTime = result.warningTime;

      // Validate and set default if invalid
      if (
        typeof warningTime !== 'number' ||
        isNaN(warningTime) ||
        warningTime < 10 ||
        warningTime > 300
      ) {
        warningTime = 60;
        console.log('Invalid stored warning time, using default:', warningTime);
      }

      warningTimeInput.value = warningTime;

      console.log(`Set warning time input to: ${warningTime}`);

      const enableNotificationsElement = document.getElementById('enable-notifications');
      if (enableNotificationsElement) {
        enableNotificationsElement.checked = result.enableNotifications !== false; // Default to true
      } else {
        console.warn('enable-notifications element not found during loadSettings');
      }

      // Note: iterate-timer checkbox doesn't exist in HTML, skip it
      console.log('Settings loaded successfully');
    },
  );
}

// Save settings
function saveSettings() {
  const warningTime = parseInt(
    document.getElementById('warning-time').value,
    10,
  );
  const enableNotificationsElement = document.getElementById('enable-notifications');
  const enableNotifications = enableNotificationsElement ? enableNotificationsElement.checked : true;

  // Set iterateTimer to false since the checkbox doesn't exist in UI
  const iterateTimer = false;

  // Validate warning time
  if (isNaN(warningTime) || warningTime < 10 || warningTime > 300) {
    console.error('Invalid warning time:', warningTime);
    document.getElementById('status').textContent =
      'Invalid warning time. Must be between 10-300 seconds.';
    // Reset to saved value or default
    loadSettings();
    return;
  }

  console.log('Saving settings:', {
    warningTime,
    enableNotifications,
    iterateTimer,
  });

  chrome.storage.sync.set(
    {
      warningTime: warningTime,
      enableNotifications: enableNotifications,
      iterateTimer: iterateTimer,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
        document.getElementById('status').textContent =
          'Error saving settings.';
      } else {
        console.log('Settings saved successfully');

        // Update warning time for all active timers
        chrome.runtime.sendMessage(
          {
            action: 'updateWarningTimeForActiveTimers',
            newWarningTime: warningTime,
          },
          function (response) {
            if (response && response.success) {
              const message =
                response.updatedCount > 0
                  ? `Settings saved! Warning time: ${warningTime}s (${response.updatedCount} active timers updated)`
                  : `Settings saved! Warning time: ${warningTime}s`;
              document.getElementById('status').textContent = message;
              console.log(
                `Updated warning time for ${response.updatedCount} active timers`,
              );
            } else {
              document.getElementById(
                'status',
              ).textContent = `Settings saved! Warning time: ${warningTime}s`;
            }

            setTimeout(() => {
              document.getElementById('status').textContent = '';
            }, 3000);
          },
        );
      }
    },
  );
}

// Ensure active timers container visibility is correct
function ensureActiveTimersVisibility() {
  chrome.runtime.sendMessage({ action: 'getAllTimers' }, function (response) {
    const timers = response && response.timers ? response.timers : {};
    const activeTimersContainer = document.getElementById(
      'active-timers-container',
    );

    if (activeTimersContainer) {
      if (Object.keys(timers).length > 0) {
        activeTimersContainer.style.display = 'block';
        console.log('Ensured active timers container is visible');
      } else {
        activeTimersContainer.style.display = 'none';
        console.log('Ensured active timers container is hidden (no timers)');
      }
    }
  });
}

// Toggle settings visibility
function toggleSettings() {
  const settingsContainer = document.getElementById('settings-container');
  if (settingsContainer.style.display === 'block') {
    settingsContainer.style.display = 'none';
    // Ensure active timers are visible after closing settings
    setTimeout(ensureActiveTimersVisibility, 50);
  } else {
    settingsContainer.style.display = 'block';
  }
}

// Check if the current tab has an active timer
function checkCurrentTabTimer() {
  if (!currentTabId) return;

  chrome.runtime.sendMessage(
    { action: 'checkTimer', tabId: currentTabId },
    function (response) {
      if (response && response.active) {
        // Current tab has an active timer
        const timer = response.timer;
        targetTabId = currentTabId;

        if (timer.paused) {
          showPausedTimer(timer.remainingTime);
        } else {
          const remainingTime = Math.max(
            0,
            Math.ceil((timer.endTime - Date.now()) / 1000),
          );
          showActiveTimer(remainingTime);
        }

        document.getElementById('status').textContent =
          'Timer active for current tab';
        document.getElementById('backButton').style.display = 'block';
      } else {
        // Current tab has no timer, show the timer creation UI
        hideTimerUI();
        // Hide back button when no timer is active
        document.getElementById('backButton').style.display = 'none';
      }

      // Always update the list of all active timers
      updateActiveTimersList();

      // Ensure container visibility
      setTimeout(ensureActiveTimersVisibility, 100);
    },
  );
}

// Test notification function
function testNotification() {
  document.getElementById('status').textContent = 'Testing notifications...';

  chrome.runtime.sendMessage(
    { action: 'testNotification' },
    function (response) {
      if (response && response.success) {
        document.getElementById('status').textContent =
          'Test notification sent! Check your notifications.';
        console.log('Test notification sent');
      } else {
        document.getElementById('status').textContent =
          'Failed to send test notification';
        console.error(
          'Failed to send test notification:',
          response ? response.error : 'Unknown error',
        );
      }
    },
  );
}

// Test notification function with high priority - modified to remove high priority and in-app fallback
function forceTestNotification() {
  document.getElementById('status').textContent =
    'Testing standard notification...';

  // Try Chrome notification
  chrome.runtime.sendMessage(
    { action: 'forceTestNotification' },
    function (response) {
      if (response && response.success) {
        document.getElementById('status').textContent =
          'Standard test notification sent! Check your notifications.';
        console.log('Standard test notification sent to Chrome');
      } else {
        document.getElementById('status').textContent =
          'Failed to send standard test notification';
        console.error(
          'Failed to send standard test notification:',
          response ? response.error : 'Unknown error',
        );
      }
    },
  );
}

// Start timer button click handler
function startTimerHandler() {
  let duration = getTotalSecondsFromInputs('duration-hours', 'duration-minutes', 'duration-seconds');
  if (isNaN(duration) || duration <= 0) {
    document.getElementById('status').textContent =
      'Please enter a valid duration (at least 1 second).';
    console.log('Invalid duration entered');
    return;
  }

  // Get warning time and iterate timer setting from settings
  chrome.storage.sync.get(
    ['warningTime', 'enableNotifications', 'iterateTimer'],
    function (result) {
      const warningTime = result.warningTime || 60;
      const enableNotifications = result.enableNotifications !== false;
      const iterateTimer = result.iterateTimer || false;

      console.log('Starting timer with settings:', {
        warningTime,
        enableNotifications,
        iterateTimer,
        duration,
      });

      // Get selected tab option
      const tabSelect = document.getElementById('tab-select');
      const selectedValue = tabSelect.value;

      if (selectedValue === 'current' || selectedValue == currentTabId) {
        // Use current tab
        chrome.tabs.get(currentTabId, function (tab) {
          if (chrome.runtime.lastError) {
            document.getElementById('status').textContent = 'Tab not found.';
            console.log('Tab not found:', chrome.runtime.lastError);
            return;
          }

          startTimerForTab(
            currentTabId,
            duration,
            warningTime,
            enableNotifications,
            tab.title,
            iterateTimer,
          );
        });
      } else {
        // Use selected tab
        const tabId = parseInt(selectedValue);
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            document.getElementById('status').textContent = 'Tab not found.';
            console.log('Tab not found:', chrome.runtime.lastError);
            return;
          }
          startTimerForTab(
            tabId,
            duration,
            warningTime,
            enableNotifications,
            tab.title,
            iterateTimer,
          );
        });
      }
    },
  );
}

// Start timer for a specific tab
function startTimerForTab(
  tabId,
  duration,
  warningTime,
  enableNotifications,
  tabTitle,
  iterateTimer,
) {
  targetTabId = tabId;

  // Send message to background to start the timer for this tab
  chrome.runtime.sendMessage(
    {
      action: 'startTimer',
      tabId: tabId,
      duration: duration,
      warningTime: warningTime,
      enableNotifications: enableNotifications,
      tabTitle: tabTitle,
      iterateTimer: iterateTimer,
    },
    function (response) {
      if (response && response.success) {
        console.log(
          `Timer started for tab ${tabId} with duration ${duration} seconds`,
        );

        // Setup visual countdown
        clearInterval(countdownInterval);
        showActiveTimer(duration);

        // Show back button when timer is started
        document.getElementById('backButton').style.display = 'block';

        // Store the tab ID of the timer for the popup
        chrome.storage.local.set({ currentTimerTabId: tabId });

        // Update active timers list
        updateActiveTimersList();
      } else {
        document.getElementById('status').textContent = 'Error setting timer.';
        console.error(
          'Failed to start timer:',
          response ? response.error : 'Unknown error',
        );
      }
    },
  );
}

// Stop timer handler
function stopTimerHandler() {
  if (targetTabId) {
    chrome.runtime.sendMessage(
      { action: 'stopTimer', tabId: targetTabId },
      function (response) {
        // Check if response exists first
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          document.getElementById('status').textContent =
            'Error stopping timer: ' + chrome.runtime.lastError.message;
          return;
        }

        if (response && response.success) {
          console.log(`Timer stopped for tab ${targetTabId}`);

          // If we stopped the timer for the current tab, show the timer creation UI
          if (targetTabId === currentTabId) {
            hideTimerUI();
            document.getElementById('status').textContent = 'Timer stopped';
          } else {
            // If we stopped a timer for another tab, reset UI and check current tab timer
            document.getElementById(
              'status',
            ).textContent = `Timer stopped for tab ${targetTabId}`;
            checkCurrentTabTimer();
          }

          targetTabId = null;
          timerPaused = false;

          // Clear stored timer tab ID
          chrome.storage.local.remove('currentTimerTabId');

          // Update active timers list
          updateActiveTimersList();
        } else {
          const errorMsg = response ? response.error : 'Unknown error';
          document.getElementById('status').textContent =
            'Error stopping timer: ' + errorMsg;
          console.error('Failed to stop timer:', errorMsg);
        }
      },
    );
  } else {
    document.getElementById('status').textContent = 'No active timer found.';
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Settings toggle and changes
  document
    .getElementById('toggle-settings')
    .addEventListener('click', toggleSettings);
  // Removed default-current-tab event listener (element no longer exists)
  document
    .getElementById('warning-time')
    .addEventListener('change', saveSettings);
  document
    .getElementById('enable-notifications')
    .addEventListener('change', saveSettings);

  // Add test notification button handler
  document
    .getElementById('test-notification-button')
    .addEventListener('click', testNotification);

  // Timer control buttons
  document
    .getElementById('pauseTimer')
    .addEventListener('click', togglePauseTimer);
  document
    .getElementById('extendTimer')
    .addEventListener('click', showExtensionUI);
  document
    .getElementById('fastForwardTimer')
    .addEventListener('click', showFastForwardUI);
  document
    .getElementById('backButton')
    .addEventListener('click', backToTimersList);

  // Extension UI
  document
    .getElementById('confirm-extend')
    .addEventListener('click', function () {
      const additionalTime = getTotalSecondsFromInputs('extension-hours', 'extension-minutes', 'extension-seconds');
      if (!isNaN(additionalTime) && additionalTime > 0) {
        extendTimer(additionalTime);
      } else {
        document.getElementById('status').textContent =
          'Please enter a valid extension time (at least 1 second)';
      }
    });
  document
    .getElementById('cancel-extend')
    .addEventListener('click', hideExtensionUI);

  // Fast forward UI
  document.getElementById('confirm-ff').addEventListener('click', function () {
    const ffTime = getTotalSecondsFromInputs('ff-hours', 'ff-minutes', 'ff-seconds');
    if (!isNaN(ffTime) && ffTime > 0) {
      fastForwardTimer(ffTime);
    } else {
      document.getElementById('status').textContent =
        'Please enter a valid fast-forward time (at least 1 second)';
    }
  });
  document
    .getElementById('cancel-ff')
    .addEventListener('click', hideExtensionUI);

  // Start timer button
  document
    .getElementById('startTimer')
    .addEventListener('click', startTimerHandler);

  // Stop timer button
  document
    .getElementById('stopTimer')
    .addEventListener('click', stopTimerHandler);

  // Add event listener for sort change
  const sortSelect = document.getElementById('timer-sort');
  sortSelect.addEventListener('change', updateActiveTimersList);
}

// Check for active timer when popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI state - hide back button by default
  document.getElementById('backButton').style.display = 'none';

  // Get the current tab first
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      currentTabId = tabs[0].id;

      // Initialize the UI
      populateTabSelection();

      // Load settings with a slight delay to ensure DOM is fully ready
      setTimeout(() => {
        loadSettings();
      }, 100);

      // Check if current tab has a timer
      checkCurrentTabTimer();

      // Set up event listeners for UI elements
      setupEventListeners();

      // Add input validation for seconds fields (max 59)
      setupTimeInputValidation();

      // Set up preset button handlers
      setupPresetButtons();

      // Ensure active timers container is properly displayed
      setTimeout(ensureActiveTimersVisibility, 200);
    } else {
      document.getElementById('status').textContent = 'No active tab found';
    }
  });
});

// Update active timers list periodically
setInterval(updateActiveTimersList, 5000);

// Set up time input validation
function setupTimeInputValidation() {
  const secondsInputs = ['duration-seconds', 'extension-seconds', 'ff-seconds'];
  
  secondsInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', function() {
        let value = parseInt(this.value, 10);
        if (value > 59) {
          this.value = 59;
        } else if (value < 0) {
          this.value = 0;
        }
      });
      
      input.addEventListener('blur', function() {
        if (this.value === '' || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });
  
  // Validation for minutes inputs (prevent > 59 or negative values)
  const minutesInputs = ['duration-minutes', 'extension-minutes', 'ff-minutes'];
  
  minutesInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', function() {
        let value = parseInt(this.value, 10);
        if (value > 59) {
          this.value = 59;
        } else if (value < 0) {
          this.value = 0;
        }
      });
      
      input.addEventListener('blur', function() {
        if (this.value === '' || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });
  
  // Validation for hours inputs (prevent > 23 or negative values)
  const hoursInputs = ['duration-hours', 'extension-hours', 'ff-hours'];
  
  hoursInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', function() {
        let value = parseInt(this.value, 10);
        if (value > 23) {
          this.value = 23;
        } else if (value < 0) {
          this.value = 0;
        }
      });
      
      input.addEventListener('blur', function() {
        if (this.value === '' || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });
}

// Set up preset button handlers
function setupPresetButtons() {
  document.querySelectorAll('.preset-btn').forEach(button => {
    button.addEventListener('click', function() {
      const hours = parseInt(this.dataset.hours, 10) || 0;
      const minutes = parseInt(this.dataset.minutes, 10) || 0;
      const seconds = parseInt(this.dataset.seconds, 10) || 0;
      const target = this.dataset.target;
      
      if (target === 'extension') {
        document.getElementById('extension-hours').value = hours;
        document.getElementById('extension-minutes').value = minutes;
        document.getElementById('extension-seconds').value = seconds;
      } else if (target === 'ff') {
        document.getElementById('ff-hours').value = hours;
        document.getElementById('ff-minutes').value = minutes;
        document.getElementById('ff-seconds').value = seconds;
      } else {
        // Default duration inputs
        document.getElementById('duration-hours').value = hours;
        document.getElementById('duration-minutes').value = minutes;
        document.getElementById('duration-seconds').value = seconds;
      }
    });
  });
}
