/**
 * History list component - displays and manages list of closed tabs
 */

import { formatTime } from "../utils/time-utils.js";

/**
 * Format timestamp to readable date/time
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted string
 */
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
         ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Restore a closed tab
 * @param {string} url - URL to restore
 */
function restoreTab(url) {
  if (url) {
    chrome.tabs.create({ url, active: false });
  }
}

/**
 * Update the history list display
 */
export function updateHistoryList() {
  console.log("Updating history list...");

  chrome.runtime.sendMessage({ action: 'getHistory' }, (response) => {
    const historyList = document.getElementById("history-list");
    const historyContainer = document.getElementById("history-container");
    
    if (!historyList || !historyContainer) {
      console.warn("History elements not found");
      return;
    }

    const history = response && response.history ? response.history : [];
    
    // Clear and rebuild
    historyList.innerHTML = "";
    
    if (history.length > 0) {
      const fragment = document.createDocumentFragment();
      
      // Limit to last 20 items to prevent lag in popup
      const recentHistory = history.slice(0, 20);

      recentHistory.forEach(record => {
        const item = document.createElement("li");
        item.className = "timer-item"; // Reuse timer-item class for consistency
        
        const info = document.createElement("div");
        info.className = "timer-info"; // Reusing timer-info class for consistency
        
        const title = document.createElement("div");
        title.className = "timer-title";
        title.textContent = record.title || "Untitled Tab";
        title.title = record.url; // Tooltip
        
        const meta = document.createElement("div");
        meta.className = "timer-time";
        meta.textContent = `Closed: ${formatDateTime(record.closedAt)}`;
        
        info.appendChild(title);
        info.appendChild(meta);
        
        const action = document.createElement("div");
        action.className = "timer-action";
        
        const btn = document.createElement("button");
        btn.textContent = "Reopen";
        btn.addEventListener("click", () => restoreTab(record.url));
        
        action.appendChild(btn);
        
        item.appendChild(info);
        item.appendChild(action);
        
        fragment.appendChild(item);
      });
      
      historyList.appendChild(fragment);
      historyContainer.style.display = "block";
    } else {
      const emptyMsg = document.createElement("li");
      emptyMsg.className = "timer-item";
      emptyMsg.innerHTML = "<div class='timer-info'><div class='timer-title'>No closed tabs yet</div></div>";
      historyList.appendChild(emptyMsg);
    }
  });
}

/**
 * Toggle history view visibility
 */
export function toggleHistoryView() {
  const historyContainer = document.getElementById("history-container");
  const mainView = document.getElementById("active-timers-container");
  const isVisible = historyContainer.style.display !== "none";
  
  if (isVisible) {
    historyContainer.style.display = "none";
    mainView.style.display = "block";
    document.getElementById("view-history-btn").textContent = "View History";
  } else {
    historyContainer.style.display = "block";
    mainView.style.display = "none";
    document.getElementById("view-history-btn").textContent = "Back to Timers";
    updateHistoryList();
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  if (confirm("Are you sure you want to clear all history?")) {
    chrome.runtime.sendMessage({ action: 'clearHistory' }, () => {
      updateHistoryList();
    });
  }
}
