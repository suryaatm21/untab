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

  document.getElementById('timer-display').textContent = formatTime(timeLeft);
}

// Show active timer UI
function showActiveTimer(remainingTime) {
  document.getElementById('startTimer').style.display = 'none';
  document.getElementById('duration-input').style.display = 'none';
  document.getElementById('tab-select-container').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'flex';
  document.getElementById('timer-display').style.display = 'block';
  document.getElementById('pauseTimer').textContent = 'Pause';
  document.getElementById('status').textContent = 'Timer active';

  // Show back button if we're managing a timer for a tab other than the current one
  if (targetTabId !== currentTabId) {
    document.getElementById('backButton').style.display = 'block';
  } else {
    document.getElementById('backButton').style.display = 'none';
  }

  // Reset pause state
  timerPaused = false;

  endTime = new Date().getTime() + remainingTime * 1000;
  updateTimerDisplay();
  countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// Show a paused timer UI
function showPausedTimer(remainingTime) {
  clearInterval(countdownInterval);
  document.getElementById('startTimer').style.display = 'none';
  document.getElementById('duration-input').style.display = 'none';
  document.getElementById('tab-select-container').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'flex';
  document.getElementById('timer-display').style.display = 'block';
  document.getElementById('pauseTimer').textContent = 'Resume';
  document.getElementById('status').textContent = 'Timer paused';

  // Show back button if we're managing a timer for a tab other than the current one
  if (targetTabId !== currentTabId) {
    document.getElementById('backButton').style.display = 'block';
  } else {
    document.getElementById('backButton').style.display = 'none';
  }

  timerPaused = true;
  pausedTimeRemaining = remainingTime;
  document.getElementById('timer-display').textContent =
    formatTime(remainingTime);
}

// Hide active timer UI
function hideTimerUI() {
  clearInterval(countdownInterval);
  document.getElementById('timer-display').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';
  document.getElementById('startTimer').style.display = 'block';
  document.getElementById('duration-input').style.display = 'flex';
  document.getElementById('tab-select-container').style.display = 'flex';
  document.getElementById('status').textContent = '';
}

// Toggle timer pause state
function togglePauseTimer() {
  if (timerPaused) {
    // Resume timer
    timerPaused = false;
    endTime = new Date().getTime() + pausedTimeRemaining * 1000;
    updateTimerDisplay();
    countdownInterval = setInterval(updateTimerDisplay, 1000);
    document.getElementById('pauseTimer').textContent = 'Pause';
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
    document.getElementById('pauseTimer').textContent = 'Resume';
    document.getElementById('status').textContent = 'Timer paused';

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

// Update active timers list
function updateActiveTimersList() {
  const timersList = document.getElementById('active-timers-list');

  // Clear existing list
  while (timersList.firstChild) {
    timersList.removeChild(timersList.firstChild);
  }

  // Get all active timers
  chrome.runtime.sendMessage({ action: 'getTimerStatus' }, function (response) {
    if (response && response.success && response.tabsWithTimers) {
      const timers = response.tabsWithTimers;

      if (timers.length === 0) {
        const listItem = document.createElement('li');
        listItem.className = 'timer-item';
        listItem.innerHTML = `
          <div class="timer-info">
            <div class="timer-title">No active timers</div>
          </div>
        `;
        timersList.appendChild(listItem);
        return;
      }

      timers.forEach((timer) => {
        const listItem = document.createElement('li');
        listItem.className = 'timer-item';
        if (timer.tabId === targetTabId) {
          listItem.className += ' timer-active';
        }
        if (timer.tabId === currentTabId) {
          listItem.className += ' timer-current-tab';
        }

        const formattedTime = formatTime(timer.remainingTime);
        const statusText = timer.paused ? 'Paused' : 'Active';
        const isCurrentTab =
          timer.tabId === currentTabId ? ' (Current Tab)' : '';

        listItem.innerHTML = `
          <div class="timer-info">
            <div class="timer-title" title="${timer.tabTitle}">${timer.tabTitle}${isCurrentTab}</div>
            <div class="timer-time">${formattedTime} (${statusText})</div>
          </div>
          <div class="timer-action">
            <button class="switch-to-timer" data-tab-id="${timer.tabId}">Manage</button>
          </div>
        `;
        timersList.appendChild(listItem);
      });

      // Add click event for the switch buttons
      document.querySelectorAll('.switch-to-timer').forEach((button) => {
        button.addEventListener('click', function () {
          const tabId = parseInt(this.getAttribute('data-tab-id'));
          switchToTimer(tabId);
        });
      });
    } else {
      const listItem = document.createElement('li');
      listItem.className = 'timer-item';
      listItem.innerHTML = `
        <div class="timer-info">
          <div class="timer-title">Error loading timers</div>
        </div>
      `;
      timersList.appendChild(listItem);
    }
  });
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
        timerPaused = true;
        pausedTimeRemaining = timer.remainingTime;
        document.getElementById('timer-display').textContent =
          formatTime(pausedTimeRemaining);
        document.getElementById('timer-display').style.display = 'block';
        document.getElementById('timer-controls').style.display = 'flex';
        document.getElementById('startTimer').style.display = 'none';
        document.getElementById('duration-input').style.display = 'none';
        document.getElementById('tab-select-container').style.display = 'none';
        document.getElementById('pauseTimer').textContent = 'Resume';
        document.getElementById('status').textContent = 'Timer paused';

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

  // Hide timer management UI
  document.getElementById('timer-display').style.display = 'none';
  document.getElementById('timer-controls').style.display = 'none';
  document.getElementById('backButton').style.display = 'none';
  document.getElementById('extension-container').style.display = 'none';
  document.getElementById('fast-forward-container').style.display = 'none';

  // Check if current tab has timer and show appropriate UI
  checkCurrentTabTimer();

  // Show status
  document.getElementById('status').textContent = 'Returned to all timers view';
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
    ['defaultCurrentTab', 'warningTime', 'enableNotifications'],
    function (result) {
      document.getElementById('default-current-tab').checked =
        result.defaultCurrentTab || false;
      document.getElementById('warning-time').value = result.warningTime || 60;
      document.getElementById('enable-notifications').checked =
        result.enableNotifications !== false; // Default to true
    },
  );
}

// Save settings
function saveSettings() {
  const defaultCurrentTab = document.getElementById(
    'default-current-tab',
  ).checked;
  const warningTime = parseInt(
    document.getElementById('warning-time').value,
    10,
  );
  const enableNotifications = document.getElementById(
    'enable-notifications',
  ).checked;

  chrome.storage.sync.set({
    defaultCurrentTab: defaultCurrentTab,
    warningTime: warningTime,
    enableNotifications: enableNotifications,
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
      } else {
        // Current tab has no timer, show the timer creation UI
        hideTimerUI();
        document.getElementById('startTimer').style.display = 'block';
        document.getElementById('duration-input').style.display = 'flex';
        document.getElementById('tab-select-container').style.display = 'flex';
        document.getElementById('status').textContent =
          'Set a timer for this tab';
      }

      // Always update the list of all active timers
      updateActiveTimersList();
    },
  );
}

// Set up all event listeners
function setupEventListeners() {
  // Settings toggle and changes
  document
    .getElementById('toggle-settings')
    .addEventListener('click', toggleSettings);
  document
    .getElementById('default-current-tab')
    .addEventListener('change', saveSettings);
  document
    .getElementById('warning-time')
    .addEventListener('change', saveSettings);
  document
    .getElementById('enable-notifications')
    .addEventListener('change', saveSettings);

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
    .getElementById('stopTimer')
    .addEventListener('click', stopTimerHandler);
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

  // Get warning time from settings
  chrome.storage.sync.get(
    ['warningTime', 'enableNotifications'],
    function (result) {
      const warningTime = result.warningTime || 60;
      const enableNotifications = result.enableNotifications !== false;

      // Get selected tab option (now always for the current tab)
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
          );
        });
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

// Check for active timer when popup opens
document.addEventListener('DOMContentLoaded', () => {
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

// Start timer for a specific tab
function startTimerForTab(
  tabId,
  duration,
  warningTime,
  enableNotifications,
  tabTitle,
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
    },
    function (response) {
      if (response && response.success) {
        console.log(
          `Timer started for tab ${tabId} with duration ${duration} seconds`,
        );

        // Setup visual countdown
        clearInterval(countdownInterval);
        showActiveTimer(duration);

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

// Update active timers list periodically
setInterval(updateActiveTimersList, 5000);
