let countdownInterval;
let endTime;
let targetTabId = null;

// Format time as HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((v) => (v < 10 ? "0" + v : v)).join(":");
}

// Update the timer display
function updateTimerDisplay() {
  const now = new Date().getTime();
  const timeLeft = Math.ceil((endTime - now) / 1000);

  if (timeLeft <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("timer-display").style.display = "none";
    document.getElementById("stopTimer").style.display = "none";
    document.getElementById("startTimer").style.display = "block";
    document.getElementById("status").textContent =
      "Timer completed. Tab will close soon.";
    return;
  }

  document.getElementById("timer-display").textContent = formatTime(timeLeft);
}

// Show active timer UI
function showActiveTimer(remainingTime) {
  document.getElementById("startTimer").style.display = "none";
  document.getElementById("stopTimer").style.display = "block";
  document.getElementById("timer-display").style.display = "block";
  document.getElementById("status").textContent = "Timer active";

  endTime = new Date().getTime() + remainingTime * 1000;
  updateTimerDisplay();
  countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// Hide active timer UI
function hideTimerUI() {
  clearInterval(countdownInterval);
  document.getElementById("timer-display").style.display = "none";
  document.getElementById("stopTimer").style.display = "none";
  document.getElementById("startTimer").style.display = "block";
  document.getElementById("status").textContent = "";
}

// Populate tab selection dropdown
function populateTabSelection() {
  const tabSelect = document.getElementById("tab-select");
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
        windowGroup = document.createElement("optgroup");
        windowGroup.label = `Window ${currentWindowId}`;
        tabSelect.appendChild(windowGroup);
      }

      // Create option for each tab with truncated title
      const option = document.createElement("option");
      option.value = tab.id;
      const title =
        tab.title.length > 40 ? tab.title.substring(0, 40) + "..." : tab.title;
      option.textContent = title;
      windowGroup.appendChild(option);
    });

    // Set default selection based on user preference or current tab
    chrome.storage.sync.get(["defaultCurrentTab"], function (result) {
      if (result.defaultCurrentTab) {
        tabSelect.value = "current";
      }
    });
  });
}

// Load settings
function loadSettings() {
  chrome.storage.sync.get(["defaultCurrentTab"], function (result) {
    document.getElementById("default-current-tab").checked =
      result.defaultCurrentTab || false;
  });
}

// Save settings
function saveSettings() {
  const defaultCurrentTab = document.getElementById("default-current-tab")
    .checked;
  chrome.storage.sync.set({ defaultCurrentTab: defaultCurrentTab });
}

// Toggle settings visibility
function toggleSettings() {
  const settingsContainer = document.getElementById("settings-container");
  if (settingsContainer.style.display === "block") {
    settingsContainer.style.display = "none";
  } else {
    settingsContainer.style.display = "block";
  }
}

// Check for active timer when popup opens
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI
  populateTabSelection();
  loadSettings();

  // Set up settings toggle
  document
    .getElementById("toggle-settings")
    .addEventListener("click", toggleSettings);
  document
    .getElementById("default-current-tab")
    .addEventListener("change", saveSettings);

  // Check for active timers
  chrome.runtime.sendMessage({ action: "getAllTimers" }, function (response) {
    if (response && response.timers) {
      // Find any active timer and display it
      const activeTimers = response.timers;
      if (Object.keys(activeTimers).length > 0) {
        // Just display the first active timer found (can be enhanced later)
        const tabId = Object.keys(activeTimers)[0];
        const timer = activeTimers[tabId];
        targetTabId = parseInt(tabId);

        const now = Date.now();
        const remainingTime = Math.max(
          0,
          Math.ceil((timer.endTime - now) / 1000)
        );
        showActiveTimer(remainingTime);
      }
    }
  });
});

document.getElementById("startTimer").addEventListener("click", () => {
  let duration = parseInt(document.getElementById("duration").value, 10);
  if (isNaN(duration) || duration <= 0) {
    document.getElementById("status").textContent =
      "Please enter a valid number of seconds.";
    console.log("Invalid duration entered");
    return;
  }

  // Get selected tab option
  const tabSelect = document.getElementById("tab-select");
  const selectedValue = tabSelect.value;

  if (selectedValue === "current") {
    // Use current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0) {
        document.getElementById("status").textContent = "No active tab found.";
        console.log("No active tab found");
        return;
      }

      startTimerForTab(tabs[0].id, duration);
    });
  } else {
    // Use selected tab
    const tabId = parseInt(selectedValue);
    startTimerForTab(tabId, duration);
  }
});

function startTimerForTab(tabId, duration) {
  targetTabId = tabId;

  // Send message to background to start the timer for this tab
  chrome.runtime.sendMessage(
    { action: "startTimer", tabId: tabId, duration: duration },
    function (response) {
      if (response && response.success) {
        console.log(
          `Timer started for tab ${tabId} with duration ${duration} seconds`
        );

        // Setup visual countdown
        clearInterval(countdownInterval);
        showActiveTimer(duration);
      } else {
        document.getElementById("status").textContent = "Error setting timer.";
        console.error(
          "Failed to start timer:",
          response ? response.error : "Unknown error"
        );
      }
    }
  );
}

document.getElementById("stopTimer").addEventListener("click", () => {
  if (targetTabId) {
    chrome.runtime.sendMessage(
      { action: "stopTimer", tabId: targetTabId },
      function (response) {
        // Check if response exists first
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          document.getElementById("status").textContent =
            "Error stopping timer: " + chrome.runtime.lastError.message;
          return;
        }

        if (response && response.success) {
          console.log(`Timer stopped for tab ${targetTabId}`);
          hideTimerUI();
          document.getElementById("status").textContent = "Timer stopped";
          targetTabId = null;
        } else {
          const errorMsg = response ? response.error : "Unknown error";
          document.getElementById("status").textContent =
            "Error stopping timer: " + errorMsg;
          console.error("Failed to stop timer:", errorMsg);
        }
      }
    );
  } else {
    document.getElementById("status").textContent = "No active timer found.";
  }
});
