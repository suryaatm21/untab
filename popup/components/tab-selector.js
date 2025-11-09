/**
 * Tab selector component - manages tab selection dropdown
 */

import * as SettingsService from "../services/settings-service.js";

/**
 * Populate tab selection dropdown with available tabs
 */
export function populateTabSelection() {
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
    SettingsService.loadDefaultCurrentTab().then((defaultCurrentTab) => {
      if (defaultCurrentTab) {
        tabSelect.value = "current";
      }
    });
  });
}


