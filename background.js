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
      warningShown: false, // Track if warning has been shown
    };

    // Clear existing alarms
    chrome.alarms.clear('warnTab_' + tabId);
    chrome.alarms.clear('closeTab_' + tabId);

    // Schedule warning alarm only if there's enough time for a meaningful warning
    console.log(`Timer creation debug: duration=${duration}, warningTime=${warningTime}, duration>warningTime=${duration > warningTime}`);
    
    if (duration > warningTime) {
      const warnDelayMin = (duration - warningTime) / 60;
      console.log(`Warning delay calculation: (${duration}-${warningTime})/60 = ${warnDelayMin} minutes`);
      console.log(`Checking threshold: ${warnDelayMin} >= 0.033 = ${warnDelayMin >= 0.033}`);
      
      // Use a more lenient threshold (2 seconds minimum instead of 6)
      if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
        chrome.alarms.create('warnTab_' + tabId, {
          delayInMinutes: warnDelayMin,
        });
        console.log(
          `✅ Scheduled warning alarm for tab ${tabId}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`
        );
      } else {
        console.log(
          `❌ Skipped warning alarm for tab ${tabId}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`
        );
      }
    } else {
      console.log(
        `❌ Skipped warning alarm for tab ${tabId}: ${duration}s duration ≤ ${warningTime}s warning time`
      );
    }

    // Schedule close alarm (delayInMinutes)
    chrome.alarms.create('closeTab_' + tabId, {
      delayInMinutes: duration / 60,
    });

    console.log(
      `Scheduled alarms for tab ${tabId}: ${
        duration > warningTime && (duration - warningTime) / 60 >= 0.033
          ? `warnTab in ${((duration - warningTime) / 60).toFixed(3)} minutes (${(duration - warningTime).toFixed(1)}s), `
          : 'no warning alarm, '
      }closeTab in ${(duration / 60).toFixed(2)} minutes`,
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
    console.log(`Background: Received updateTimer request for tab ${tabId}, newDuration: ${newDuration}`);
    console.log(`tabId type: ${typeof tabId}, tabId value: ${tabId}`);
    
    try {
      if (activeTimers[tabId]) {
        console.log(`Found active timer for tab ${tabId}:`, activeTimers[tabId]);
        
        // Use the stored paused time if available, otherwise use provided duration
        const resumeDuration = activeTimers[tabId].paused && activeTimers[tabId].remainingTime 
          ? activeTimers[tabId].remainingTime 
          : newDuration;
          
        console.log(`Using resume duration: ${resumeDuration}s (stored: ${activeTimers[tabId].remainingTime}, provided: ${newDuration})`);
        
        // Clear existing alarms
        chrome.alarms.clear('warnTab_' + tabId);
        chrome.alarms.clear('closeTab_' + tabId);

        // Create new alarm
        chrome.alarms.create('closeTab_' + tabId, {
          delayInMinutes: resumeDuration / 60,
        });

        // Reschedule warning if applicable
        const warningTime = activeTimers[tabId].warningTime || 60;
        console.log(`Resume operation using warningTime: ${warningTime}s for tab ${tabId}`);
        if (resumeDuration > warningTime) {
          const warnDelayMin = (resumeDuration - warningTime) / 60;
          // Use a more lenient threshold for resume operations (2 seconds minimum)
          if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
            chrome.alarms.create('warnTab_' + tabId, {
              delayInMinutes: warnDelayMin,
            });
            console.log(
              `Rescheduled warning alarm for resumed tab ${tabId}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`
            );
          } else {
            console.log(
              `Skipped warning alarm for resumed tab ${tabId}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`
            );
          }
        } else {
          console.log(
            `Skipped warning alarm for resumed tab ${tabId}: ${resumeDuration}s duration ≤ ${warningTime}s warning time`
          );
        }

        // Update timer state and reset warning flag
        activeTimers[tabId].paused = false;
        activeTimers[tabId].endTime = Date.now() + resumeDuration * 1000;
        activeTimers[tabId].warningShown = false;
        // Clear the stored remaining time since we're no longer paused
        delete activeTimers[tabId].remainingTime;

        console.log(
          `Timer resumed for tab ${tabId}, ${resumeDuration} seconds remaining`,
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
    console.log(`Background: Received extendTimer request for tab ${tabId}, additionalTime: ${additionalTime}`);
    console.log(`tabId type: ${typeof tabId}, tabId value: ${tabId}`);
    console.log(`Active timers:`, Object.keys(activeTimers));
    
    // Ensure tabId is a number for consistency
    const numericTabId = parseInt(tabId);
    console.log(`Converted tabId to: ${numericTabId} (type: ${typeof numericTabId})`);
    
    try {
      if (activeTimers[numericTabId]) {
        console.log(`Found active timer for tab ${numericTabId}:`, activeTimers[numericTabId]);
        
        if (activeTimers[numericTabId].paused) {
          // If paused, just update the remaining time
          activeTimers[numericTabId].remainingTime += additionalTime;
          console.log(
            `Paused timer extended for tab ${numericTabId} by ${additionalTime} seconds`,
          );
          sendResponse({ success: true });
        } else {
          // Clear existing alarms aggressively
          console.log(`Clearing all alarms for tab ${numericTabId} before extending`);
          chrome.alarms.clear('warnTab_' + numericTabId);
          chrome.alarms.clear('closeTab_' + numericTabId);
          
          // Additional safety: clear any stale alarms
          chrome.alarms.getAll((alarms) => {
            const staleAlarms = alarms.filter(alarm => 
              alarm.name.includes('_' + numericTabId)
            );
            staleAlarms.forEach(alarm => {
              console.log(`Clearing stale alarm during extend: ${alarm.name}`);
              chrome.alarms.clear(alarm.name);
            });
          });

          // Calculate new end time
          const newEndTime =
            activeTimers[numericTabId].endTime + additionalTime * 1000;
          const newDuration = (newEndTime - Date.now()) / 1000;

          // Create new close alarm
          chrome.alarms.create('closeTab_' + numericTabId, {
            delayInMinutes: newDuration / 60,
          });

          // Reschedule warning if applicable with a small delay to ensure old alarms are cleared
          const warningTime = activeTimers[numericTabId].warningTime || 60;
          if (newDuration > warningTime) {
            const warnDelayMin = (newDuration - warningTime) / 60;
            // Use a more lenient threshold for extensions (2 seconds minimum instead of 6)
            if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
              setTimeout(() => {
                chrome.alarms.create('warnTab_' + numericTabId, {
                  delayInMinutes: warnDelayMin,
                });
                console.log(
                  `Created new warning alarm for extended tab ${numericTabId}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`
                );
              }, 100);
            } else {
              console.log(
                `Skipped warning alarm for tab ${numericTabId}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`
              );
            }
          } else {
            console.log(
              `Skipped warning alarm for tab ${numericTabId}: ${newDuration}s duration ≤ ${warningTime}s warning time`
            );
          }

          // Update timer state and reset warning flag
          activeTimers[numericTabId].endTime = newEndTime;
          activeTimers[numericTabId].warningShown = false;

          console.log(
            `Timer extended for tab ${numericTabId} by ${additionalTime} seconds`,
          );
          sendResponse({ success: true });
        }
      } else {
        console.log(`No active timer found for tab ${numericTabId}. Active timers:`, Object.keys(activeTimers));
        sendResponse({ success: false, error: 'No active timer found' });
      }
    } catch (error) {
      console.error('Error extending timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'fastForwardTimer') {
    const { tabId, secondsToSkip } = request;
    console.log(`Background: Received fastForwardTimer request for tab ${tabId}, secondsToSkip: ${secondsToSkip}`);
    console.log(`tabId type: ${typeof tabId}, tabId value: ${tabId}`);
    console.log(`Active timers:`, Object.keys(activeTimers));
    
    // Ensure tabId is a number for consistency
    const numericTabId = parseInt(tabId);
    console.log(`Converted tabId to: ${numericTabId} (type: ${typeof numericTabId})`);
    
    try {
      if (activeTimers[numericTabId] && !activeTimers[numericTabId].paused) {
        console.log(`Found active timer for tab ${numericTabId}:`, activeTimers[numericTabId]);
        
        // Clear existing alarms
        chrome.alarms.clear('warnTab_' + numericTabId);
        chrome.alarms.clear('closeTab_' + numericTabId);

        // Update endTime by subtracting seconds from it
        const newEndTime = activeTimers[numericTabId].endTime - secondsToSkip * 1000;
        const remainingSeconds = Math.max(1, (newEndTime - Date.now()) / 1000);

        // Create new close alarm with updated time
        chrome.alarms.create('closeTab_' + numericTabId, {
          delayInMinutes: remainingSeconds / 60,
        });

        // Reschedule warning if applicable
        const warningTime = activeTimers[numericTabId].warningTime || 60;
        if (remainingSeconds > warningTime) {
          const warnDelayMin = (remainingSeconds - warningTime) / 60;
          // Use a more lenient threshold (2 seconds minimum)
          if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
            chrome.alarms.create('warnTab_' + numericTabId, {
              delayInMinutes: warnDelayMin,
            });
            console.log(
              `Rescheduled warning alarm for tab ${numericTabId}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`
            );
          } else {
            console.log(
              `Skipped warning alarm for tab ${numericTabId}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`
            );
          }
        } else {
          console.log(
            `Skipped warning alarm for tab ${numericTabId}: ${remainingSeconds}s remaining ≤ ${warningTime}s warning time`
          );
        }

        // Update timer state and reset warning flag
        activeTimers[numericTabId].endTime = newEndTime;
        activeTimers[numericTabId].warningShown = false;

        console.log(
          `Timer fast-forwarded for tab ${numericTabId} by ${secondsToSkip} seconds`,
        );
        sendResponse({
          success: true,
          remainingTime: Math.ceil(remainingSeconds),
        });
      } else {
        const errorMsg = activeTimers[numericTabId]
          ? 'Cannot fast-forward a paused timer'
          : 'No active timer found';
        console.log(`${errorMsg} for tab ${numericTabId}. Active timers:`, Object.keys(activeTimers));
        sendResponse({ success: false, error: errorMsg });
      }
    } catch (error) {
      console.error('Error fast-forwarding timer:', error);
      sendResponse({ success: false, error: error.message || 'Unknown error' });
    }
    return true;
  } else if (request.action === 'stopTimer') {
    const { tabId } = request;
    console.log(`Background: Received stopTimer request for tab ${tabId}`);
    console.log(`tabId type: ${typeof tabId}, tabId value: ${tabId}`);
    
    // Ensure tabId is a number for consistency
    const numericTabId = parseInt(tabId);
    console.log(`Converted tabId to: ${numericTabId} (type: ${typeof numericTabId})`);
    
    try {
      // Clear the alarms
      chrome.alarms.clear('warnTab_' + numericTabId);
      chrome.alarms.clear('closeTab_' + numericTabId);

      // Remove from active timers
      if (activeTimers[numericTabId]) {
        delete activeTimers[numericTabId];
        console.log(`Timer stopped for tab ${numericTabId}`);
        sendResponse({ success: true });
      } else {
        console.log(`No active timer found for tab ${numericTabId}. Active timers:`, Object.keys(activeTimers));
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

    // Update warning alarms for ALL timers (both paused and active)
    Object.keys(activeTimers).forEach((tabId) => {
      const timer = activeTimers[tabId];
      
      console.log(`Updating warning time for tab ${tabId} from ${timer.warningTime}s to ${newWarningTime}s (paused: ${timer.paused || false})`);
      
      // Always update the stored warning time, regardless of paused state
      timer.warningTime = newWarningTime;
      timer.warningShown = false;
      
      console.log(`✅ Updated timer object for tab ${tabId}:`, timer);
      
      // Only reschedule alarms for non-paused timers
      if (!timer.paused) {
        const remainingTime = Math.max(
          0,
          Math.ceil((timer.endTime - Date.now()) / 1000),
        );

        // Aggressively clear ALL warning alarms for this tab to prevent stale alarms
        console.log(`Clearing all warning alarms for tab ${tabId}`);
        chrome.alarms.clear('warnTab_' + tabId);
        
        // Additional safety: get all alarms and clear any that match this tab
        chrome.alarms.getAll((alarms) => {
          const staleAlarms = alarms.filter(alarm => 
            alarm.name.startsWith('warnTab_' + tabId)
          );
          staleAlarms.forEach(alarm => {
            console.log(`Clearing stale alarm: ${alarm.name}`);
            chrome.alarms.clear(alarm.name);
          });
        });

        // Schedule new warning alarm if there's enough time
        if (remainingTime > newWarningTime) {
          const warnDelayMin = (remainingTime - newWarningTime) / 60;
          // Use a more lenient threshold for warning time updates (2 seconds minimum)
          if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
            // Add a small delay to ensure old alarms are cleared first
            setTimeout(() => {
              chrome.alarms.create('warnTab_' + tabId, {
                delayInMinutes: warnDelayMin,
              });
              console.log(
                `Created new warning alarm for tab ${tabId}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`,
              );
            }, 100);
            updatedCount++;
          } else {
            console.log(
              `Skipped warning alarm for tab ${tabId}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`,
            );
          }
        } else {
          console.log(
            `Skipped warning alarm for tab ${tabId}: ${remainingTime}s remaining ≤ ${newWarningTime}s warning time`,
          );
        }
      } else {
        console.log(`Skipped alarm scheduling for paused tab ${tabId} - will be handled on resume`);
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
  } else if (request.action === 'debugNotifications') {
    // Debug helper to check notification settings for active timers
    const debugInfo = Object.keys(activeTimers).map(tabId => {
      const timer = activeTimers[tabId];
      const remainingTime = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
      return {
        tabId: parseInt(tabId),
        remainingTime,
        warningTime: timer.warningTime,
        enableNotifications: timer.enableNotifications,
        warningShown: timer.warningShown,
        paused: timer.paused
      };
    });
    console.log('Debug notifications info:', debugInfo);
    sendResponse({ success: true, debugInfo });
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
    console.log(`Warning alarm triggered for tab ${tabId}, alarm name: ${name}`);

    // Verify this timer still exists and is not paused
    if (!activeTimers[tabId] || activeTimers[tabId].paused) {
      console.log(`Ignoring alarm for tab ${tabId}: timer ${!activeTimers[tabId] ? 'does not exist' : 'is paused'}`);
      return;
    }

    // Calculate seconds left and only show notification if there's meaningful time remaining
    const secondsLeft = Math.max(
      0,
      Math.ceil((activeTimers[tabId].endTime - Date.now()) / 1000),
    );

    // Calculate expected warning time for validation
    const expectedWarningThreshold = activeTimers[tabId].warningTime || 60;
    const withinWarningWindow = secondsLeft <= expectedWarningThreshold + 5; // 5 second tolerance

    console.log(
      `Tab ${tabId} warning alarm: ${secondsLeft}s left, warningTime: ${expectedWarningThreshold}s, withinWindow: ${withinWarningWindow}, notifications: ${activeTimers[tabId]?.enableNotifications}, warningShown: ${activeTimers[tabId]?.warningShown}`,
    );

    // Enhanced validation: only show warning if we're actually within the warning window
    if (
      secondsLeft > 5 &&
      withinWarningWindow &&
      activeTimers[tabId].enableNotifications &&
      !activeTimers[tabId].warningShown
    ) {
      console.log(
        `✅ Showing warning notification for tab ${tabId} with ${secondsLeft} seconds left`,
      );
      // Mark warning as shown to prevent duplicates
      activeTimers[tabId].warningShown = true;
      // Use the notification manager for consistent handling
      notificationManager.createTimerWarningNotification(tabId, secondsLeft);
    } else {
      const reasons = [];
      if (secondsLeft <= 5) reasons.push(`only ${secondsLeft}s remaining`);
      if (!withinWarningWindow) reasons.push(`outside warning window (${secondsLeft}s > ${expectedWarningThreshold + 5}s)`);
      if (!activeTimers[tabId].enableNotifications) reasons.push('notifications disabled');
      if (activeTimers[tabId].warningShown) reasons.push('warning already shown');
      
      console.log(
        `❌ Skipping warning notification for tab ${tabId}: ${reasons.join(', ')}`,
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
                  warningShown: false, // Track if warning has been shown
                };

                // Schedule new warning and close alarms
                if (timerData.duration > timerData.warningTime) {
                  const warnDelayMin = (timerData.duration - timerData.warningTime) / 60;
                  // Use consistent 2-second minimum threshold
                  if (warnDelayMin >= 0.033) { // 2 seconds = 0.033 minutes
                    chrome.alarms.create('warnTab_' + newTab.id, {
                      delayInMinutes: warnDelayMin,
                    });
                    console.log(
                      `Scheduled warning alarm for iterated tab ${newTab.id}: ${warnDelayMin} minutes (${(warnDelayMin * 60).toFixed(1)}s)`
                    );
                  } else {
                    console.log(
                      `Skipped warning alarm for iterated tab ${newTab.id}: warning delay too short (${(warnDelayMin * 60).toFixed(1)}s < 2s minimum)`
                    );
                  }
                } else {
                  console.log(
                    `Skipped warning alarm for iterated tab ${newTab.id}: ${timerData.duration}s duration ≤ ${timerData.warningTime}s warning time`
                  );
                }
                
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
