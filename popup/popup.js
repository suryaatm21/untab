let countdownInterval;
let endTime;
let targetTabId = null;
let timerPaused = false;
let pausedTimeRemaining = 0;
let currentTabId = null;

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
      { ...timer, remainingTime, title: timer.tabTitle || "Unknown Tab" },
    ];
  });

  switch (sortBy) {
    case "alpha":
      return processedEntries.sort((a, b) =>
        a[1].title.localeCompare(b[1].title)
      );
    case "most-time":
      return processedEntries.sort(
        (a, b) => b[1].remainingTime - a[1].remainingTime
      );
    case "least-time":
      return processedEntries.sort(
        (a, b) => a[1].remainingTime - b[1].remainingTime
      );
    default:
      return processedEntries;
  }
}

// Update the active timers list
function updateActiveTimersList() {
  chrome.runtime.sendMessage({ action: "getAllTimers" }, function (response) {
    const activeTimersList = document.getElementById("active-timers-list");
    const activeTimersContainer = document.getElementById(
      "active-timers-container"
    );
    const sortSelect = document.getElementById("timer-sort");

    // Use a document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    activeTimersList.innerHTML = '';

    const timers = response && response.timers ? response.timers : {};
    const sortType = sortSelect ? sortSelect.value : 'alpha';
    
    if (Object.keys(timers).length > 0) {
      // Use the sortTimers function to get sorted entries
      const timerEntries = sortTimers(timers, sortType);

      activeTimersContainer.style.display = "block";
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
          document.getElementById('active-timers-container').style.display = 'none';
          document.getElementById('backButton').style.display = 'block';
        });
        timerAction.appendChild(viewButton);
        timerItem.appendChild(timerAction);
        fragment.appendChild(timerItem);
      });
      
      // Append the fragment to the DOM
      activeTimersList.appendChild(fragment);
    } else {
      activeTimersContainer.style.display = "none";
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
      document.getElementById('warning-time').value = result.warningTime || 60;
      document.getElementById('enable-notifications').checked =
        result.enableNotifications !== false; // Default to true
      document.getElementById('iterate-timer').checked =
        result.iterateTimer || false;
    },
  );
}

// Save settings
function saveSettings() {
  const warningTime = parseInt(
    document.getElementById('warning-time').value,
    10,
  );
  const enableNotifications = document.getElementById(
    'enable-notifications',
  ).checked;
  const iterateTimer = document.getElementById('iterate-timer').checked;

  chrome.storage.sync.set({
    warningTime: warningTime,
    enableNotifications: enableNotifications,
    iterateTimer: iterateTimer,
  });
}

// Toggle settings visibility
function toggleSettings() {
  const settingsContainer = document.getElementById('settings-container');
  if (settingsContainer.style.display === 'block') {
    settingsContainer.style.display = 'none';
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
  let duration = parseInt(document.getElementById('duration').value, 10);
  if (isNaN(duration) || duration <= 0) {
    document.getElementById('status').textContent =
      'Please enter a valid number of seconds.';
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
      const additionalTime = parseInt(
        document.getElementById('extension-time').value,
        10,
      );
      if (!isNaN(additionalTime) && additionalTime > 0) {
        extendTimer(additionalTime);
      } else {
        document.getElementById('status').textContent =
          'Please enter a valid extension time';
      }
    });
  document
    .getElementById('cancel-extend')
    .addEventListener('click', hideExtensionUI);

  // Fast forward UI
  document.getElementById('confirm-ff').addEventListener('click', function () {
    const ffTime = parseInt(document.getElementById('ff-time').value, 10);
    if (!isNaN(ffTime) && ffTime > 0) {
      fastForwardTimer(ffTime);
    } else {
      document.getElementById('status').textContent =
        'Please enter a valid fast-forward time';
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
    .getElementById("stopTimer")
    .addEventListener("click", stopTimerHandler);

  // Add event listener for sort change
  const sortSelect = document.getElementById("timer-sort");
  sortSelect.addEventListener("change", updateActiveTimersList);
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
      loadSettings();

      // Check if current tab has a timer
      checkCurrentTabTimer();

      // Set up event listeners for UI elements
      setupEventListeners();
    } else {
      document.getElementById('status').textContent = 'No active tab found';
    }
  });
});

// Update active timers list periodically
setInterval(updateActiveTimersList, 5000);
