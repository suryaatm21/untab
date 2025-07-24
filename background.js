import NotificationManager from './notification-manager.js';

// Store active timers
const activeTimers = {};

// Create notification manager instance
const notificationManager = new NotificationManager();

// Test notification function that now shows useful timer info
function testNotification() {
  console.log('Creating timer active notification');
  const options = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/fade-tab-monogram.png'),
    title: 'Fade That Timer Active',
    message: 'A tab timer is now active and counting down.',
    requireInteraction: false,
  };
  const notificationId = `timer-notification-${Date.now()}`;
  chrome.notifications.create(notificationId, options, (id) => {
    console.log('Created timer notification:', id);
    if (chrome.runtime.lastError) {
      console.error(
        'Error creating timer notification:',
        chrome.runtime.lastError,
      );
    }
  });
}

// Test notification function - more direct approach that might work better on macOS
function forceTestNotification() {
  console.log('Creating forced test notification with maximum priority');

  // Create a notification with maximum priority and different options
  const options = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/fade-tab-monogram.png'),
    title: 'Fade That - URGENT TEST',
    message:
      'This is a high-priority test notification. Please check if this appears on your screen.',
    priority: 2, // Maximum priority
    requireInteraction: true,
    silent: false,
  };

  chrome.notifications.create(
    'forced-test-notification-' + Date.now(), // Unique ID every time
    options,
    (notificationId) => {
      console.log('Created forced test notification:', notificationId);
      if (chrome.runtime.lastError) {
        console.error(
          'Error creating forced test notification:',
          chrome.runtime.lastError,
        );
      }
    },
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    const {
      tabId,
      duration,
      warningTime,
      enableNotifications,
      tabTitle,
      iterateTimer,
    } = request;

    console.log('Background: Starting timer with params:', {
      tabId,
      duration,
      warningTime,
      enableNotifications,
      tabTitle,
      iterateTimer,
    });

    // Store timer info
    activeTimers[tabId] = {
      endTime: Date.now() + duration * 1000,
      warningTime,
      enableNotifications,
      tabTitle,
      duration, // Store original duration for iteration
      iterateTimer, // Store the iteration setting
    };

    // Clear existing alarms
    chrome.alarms.clear('warnTab_' + tabId);
    chrome.alarms.clear('closeTab_' + tabId);

    // Schedule warning alarm only if there's enough time for a meaningful warning
    if (duration > warningTime) {
      const warnDelayMin = (duration - warningTime) / 60;
      // Only schedule if delay is at least 0.1 minutes (6 seconds) to avoid timing issues
      if (warnDelayMin >= 0.1) {
        chrome.alarms.create('warnTab_' + tabId, {
          delayInMinutes: warnDelayMin,
        });
      }
    }

    // Schedule close alarm (delayInMinutes)
    chrome.alarms.create('closeTab_' + tabId, {
      delayInMinutes: duration / 60,
    });

    console.log(
      `Scheduled alarms for tab ${tabId}: ${
        duration > warningTime && (duration - warningTime) / 60 >= 0.1
          ? `warnTab in ${(duration - warningTime) / 60} minutes, `
          : 'no warning alarm, '
      }closeTab in ${duration / 60} minutes`,
    );

    // Only show notification if explicitly requested
    if (enableNotifications) {
      notificationManager.notifyTimerCreated(
        tabId,
        duration,
        false,
        iterateTimer,
      );
    }
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'testNotification') {
    testNotification();
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'forceTestNotification') {
    // Try the higher priority notification approach
    forceTestNotification();
    sendResponse({ success: true });
    return true;
  } else if (request.action === 'checkTimer') {
    const { tabId } = request;
    if (activeTimers[tabId]) {
      const now = Date.now();
      const remainingTime = Math.max(
        0,
        Math.ceil((activeTimers[tabId].endTime - now) / 1000),
      );
      // Return the entire timer object along with remaining time
      sendResponse({
        active: true,
        remainingTime: remainingTime,
        timer: activeTimers[tabId],
      });
    } else {
      sendResponse({ active: false });
    }
    return true;
  } else if (request.action === 'pauseTimer') {
    const { tabId } = request;
    try {
      if (activeTimers[tabId]) {
        // Clear existing alarms
        chrome.alarms.clear('warnTab_' + tabId);
        chrome.alarms.clear('closeTab_' + tabId);

        // Calculate remaining time
        const now = Date.now();
        const remainingTime = Math.max(
          0,
          Math.ceil((activeTimers[tabId].endTime - now) / 1000),
        );

        // Update timer state
        activeTimers[tabId].paused = true;
        activeTimers[tabId].remainingTime = remainingTime;

        console.log(
          `Timer paused for tab ${tabId}, ${remainingTime} seconds remaining`,
        );
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: 'No active timer found' });
      }
    } catch (error) {
      console.error('Error pausing timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'updateTimer') {
    const { tabId, newDuration } = request;
    try {
      if (activeTimers[tabId]) {
        // Clear existing alarms
        chrome.alarms.clear('warnTab_' + tabId);
        chrome.alarms.clear('closeTab_' + tabId);

        // Create new alarm
        chrome.alarms.create('closeTab_' + tabId, {
          delayInMinutes: newDuration / 60,
        });

        // Reschedule warning if applicable
        const warningTime = activeTimers[tabId].warningTime || 60;
        if (
          newDuration > warningTime &&
          (newDuration - warningTime) / 60 >= 0.1
        ) {
          chrome.alarms.create('warnTab_' + tabId, {
            delayInMinutes: (newDuration - warningTime) / 60,
          });
        }

        // Update timer state
        activeTimers[tabId].paused = false;
        activeTimers[tabId].endTime = Date.now() + newDuration * 1000;
        activeTimers[tabId].warningShown = false;

        console.log(
          `Timer resumed for tab ${tabId}, ${newDuration} seconds remaining`,
        );
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: 'No active timer found' });
      }
    } catch (error) {
      console.error('Error updating timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'extendTimer') {
    const { tabId, additionalTime } = request;
    try {
      if (activeTimers[tabId]) {
        if (activeTimers[tabId].paused) {
          // If paused, just update the remaining time
          activeTimers[tabId].remainingTime += additionalTime;
          console.log(
            `Paused timer extended for tab ${tabId} by ${additionalTime} seconds`,
          );
          sendResponse({ success: true });
        } else {
          // Clear existing alarms
          chrome.alarms.clear('warnTab_' + tabId);
          chrome.alarms.clear('closeTab_' + tabId);

          // Calculate new end time
          const newEndTime =
            activeTimers[tabId].endTime + additionalTime * 1000;
          const newDuration = (newEndTime - Date.now()) / 1000;

          // Create new close alarm
          chrome.alarms.create('closeTab_' + tabId, {
            delayInMinutes: newDuration / 60,
          });

          // Reschedule warning if applicable
          const warningTime = activeTimers[tabId].warningTime || 60;
          if (
            newDuration > warningTime &&
            (newDuration - warningTime) / 60 >= 0.1
          ) {
            chrome.alarms.create('warnTab_' + tabId, {
              delayInMinutes: (newDuration - warningTime) / 60,
            });
          }

          // Update timer state
          activeTimers[tabId].endTime = newEndTime;
          activeTimers[tabId].warningShown = false;

          console.log(
            `Timer extended for tab ${tabId} by ${additionalTime} seconds`,
          );
          sendResponse({ success: true });
        }
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: 'No active timer found' });
      }
    } catch (error) {
      console.error('Error extending timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'fastForwardTimer') {
    const { tabId, secondsToSkip } = request;
    try {
      if (activeTimers[tabId] && !activeTimers[tabId].paused) {
        // Clear existing alarms
        chrome.alarms.clear('warnTab_' + tabId);
        chrome.alarms.clear('closeTab_' + tabId);

        // Update endTime by subtracting seconds from it
        const newEndTime = activeTimers[tabId].endTime - secondsToSkip * 1000;
        const remainingSeconds = Math.max(1, (newEndTime - Date.now()) / 1000);

        // Create new close alarm with updated time
        chrome.alarms.create('closeTab_' + tabId, {
          delayInMinutes: remainingSeconds / 60,
        });

        // Reschedule warning if applicable
        const warningTime = activeTimers[tabId].warningTime || 60;
        if (
          remainingSeconds > warningTime &&
          (remainingSeconds - warningTime) / 60 >= 0.1
        ) {
          chrome.alarms.create('warnTab_' + tabId, {
            delayInMinutes: (remainingSeconds - warningTime) / 60,
          });
        }

        // Update timer state
        activeTimers[tabId].endTime = newEndTime;

        console.log(
          `Timer fast-forwarded for tab ${tabId} by ${secondsToSkip} seconds`,
        );
        sendResponse({
          success: true,
          remainingTime: Math.ceil(remainingSeconds),
        });
      } else {
        const errorMsg = activeTimers[tabId]
          ? 'Cannot fast-forward a paused timer'
          : 'No active timer found';
        console.log(errorMsg);
        sendResponse({ success: false, error: errorMsg });
      }
    } catch (error) {
      console.error('Error fast-forwarding timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'stopTimer') {
    const { tabId } = request;
    try {
      // Clear the alarms
      chrome.alarms.clear('warnTab_' + tabId);
      chrome.alarms.clear('closeTab_' + tabId);

      // Remove from active timers
      if (activeTimers[tabId]) {
        delete activeTimers[tabId];
        console.log(`Timer stopped for tab ${tabId}`);
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${tabId}`);
        sendResponse({ success: false, error: 'No active timer found' });
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'getTimerStatus') {
    // Get the list of tab IDs with active timers
    const tabsWithTimers = Object.keys(activeTimers).map((tabId) => {
      const timer = activeTimers[tabId];
      let remainingTime = 0;

      if (timer.paused) {
        remainingTime = timer.remainingTime;
      } else {
        const now = Date.now();
        remainingTime = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
      }

      return {
        tabId: parseInt(tabId),
        remainingTime,
        paused: timer.paused,
        tabTitle: timer.tabTitle || 'Unknown Tab',
      };
    });

    sendResponse({ success: true, tabsWithTimers });
    return true;
  } else if (request.action === 'getAllTimers') {
    sendResponse({ success: true, timers: activeTimers });
    return true;
  } else if (request.action === 'updateWarningTimeForActiveTimers') {
    const { newWarningTime } = request;
    console.log(
      `Updating warning time for all active timers to ${newWarningTime} seconds`,
    );

    let updatedCount = 0;

    // Update warning alarms for all active timers
    Object.keys(activeTimers).forEach((tabId) => {
      const timer = activeTimers[tabId];
      if (!timer.paused) {
        const remainingTime = Math.max(
          0,
          Math.ceil((timer.endTime - Date.now()) / 1000),
        );

        // Clear existing warning alarm
        chrome.alarms.clear('warnTab_' + tabId);

        // Update stored warning time
        timer.warningTime = newWarningTime;

        // Schedule new warning alarm if there's enough time
        if (
          remainingTime > newWarningTime &&
          (remainingTime - newWarningTime) / 60 >= 0.1
        ) {
          const warnDelayMin = (remainingTime - newWarningTime) / 60;
          chrome.alarms.create('warnTab_' + tabId, {
            delayInMinutes: warnDelayMin,
          });
          console.log(
            `Updated warning alarm for tab ${tabId}: ${warnDelayMin} minutes`,
          );
          updatedCount++;
        } else {
          console.log(
            `Skipped warning alarm for tab ${tabId}: ${remainingTime}s remaining, ${newWarningTime}s warning time`,
          );
        }
      }
    });

    sendResponse({ success: true, updatedCount });
    return true;
  } else if (request.action === 'debugAlarms') {
    // Debug action to check all active alarms
    chrome.alarms.getAll((alarms) => {
      console.log('All active alarms:', alarms);
      const timerAlarms = alarms.filter(
        (alarm) =>
          alarm.name.startsWith('warnTab_') ||
          alarm.name.startsWith('closeTab_'),
      );
      sendResponse({ success: true, alarms: timerAlarms });
    });
    return true;
  }
});

// Add tab removed listener to clean up timers for closed tabs
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (activeTimers[tabId]) {
    chrome.alarms.clear('closeTab_' + tabId);
    delete activeTimers[tabId];
    console.log(`Tab ${tabId} was closed manually, timer cleared`);
  }
});

// Add alarm listener to handle warnings and closing tabs
chrome.alarms.onAlarm.addListener((alarm) => {
  const name = alarm.name;
  if (name.startsWith('warnTab_')) {
    const tabId = parseInt(name.split('_')[1]);
    console.log(`Warning alarm triggered for tab ${tabId}`);

    // Calculate seconds left and only show notification if there's meaningful time remaining
    const secondsLeft = activeTimers[tabId]
      ? Math.max(
          0,
          Math.ceil((activeTimers[tabId].endTime - Date.now()) / 1000),
        )
      : 0;

    console.log(
      `Tab ${tabId} warning: ${secondsLeft} seconds left, warningTime was: ${activeTimers[tabId]?.warningTime}, notifications enabled: ${activeTimers[tabId]?.enableNotifications}`,
    );

    // Only show warning if there's more than 5 seconds left (avoid confusing "0 seconds" notifications)
    if (
      secondsLeft > 5 &&
      activeTimers[tabId] &&
      activeTimers[tabId].enableNotifications
    ) {
      console.log(
        `Showing warning notification for tab ${tabId} with ${secondsLeft} seconds left`,
      );
      // Use the notification manager for consistent handling
      notificationManager.createTimerWarningNotification(tabId, secondsLeft);
    } else {
      console.log(
        `Skipping warning notification for tab ${tabId}: ${secondsLeft} seconds remaining, timer exists: ${!!activeTimers[
          tabId
        ]}, notifications enabled: ${activeTimers[tabId]?.enableNotifications}`,
      );
    }
  } else if (name.startsWith('closeTab_')) {
    const tabId = parseInt(name.split('_')[1]);
    console.log(`Alarm triggered for tab ${tabId}, attempting to close...`);

    // Store the timer data before removing from active timers
    const timerData = activeTimers[tabId] ? { ...activeTimers[tabId] } : null;

    // Remove from active timers
    if (activeTimers[tabId]) {
      delete activeTimers[tabId];
    }

    // Attempt to close the tab
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Tab ${tabId} not found:`,
          chrome.runtime.lastError.message,
        );
        return;
      }

      try {
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Failed to close tab ${tabId}:`,
              chrome.runtime.lastError.message,
            );
          } else {
            console.log(`Tab ${tabId} (${tab.url}) closed successfully.`);

            // If iteration is enabled, restart the timer for the same tab URL
            if (timerData && timerData.iterateTimer) {
              console.log(
                `Iteration enabled for tab ${tabId}, creating new tab and restarting timer...`,
              );

              // Create a new tab with the same URL
              chrome.tabs.create({ url: tab.url }, (newTab) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Failed to create new tab for iteration:`,
                    chrome.runtime.lastError.message,
                  );
                  return;
                }

                // Start a new timer for the new tab
                activeTimers[newTab.id] = {
                  endTime: Date.now() + timerData.duration * 1000,
                  warningTime: timerData.warningTime,
                  enableNotifications: timerData.enableNotifications,
                  tabTitle: tab.title || 'Iterated Tab',
                  duration: timerData.duration,
                  iterateTimer: true, // Keep iteration enabled
                };

                // Schedule new warning and close alarms
                const warnDelayMin = Math.max(
                  0,
                  (timerData.duration - timerData.warningTime) / 60,
                );
                chrome.alarms.create('warnTab_' + newTab.id, {
                  delayInMinutes: warnDelayMin,
                });
                chrome.alarms.create('closeTab_' + newTab.id, {
                  delayInMinutes: timerData.duration / 60,
                });

                console.log(
                  `Iteration timer started for new tab ${newTab.id} with duration ${timerData.duration} seconds`,
                );

                // Show notification for the new iterated timer if notifications were enabled
                if (timerData.enableNotifications) {
                  notificationManager.notifyTimerCreated(
                    newTab.id,
                    timerData.duration,
                    true,
                    timerData.iterateTimer,
                  );
                }
              });
            }
          }
        });
      } catch (error) {
        console.error(`Error closing tab ${tabId}:`, error);
      }
    });
  }
});
