/**
 * History list component - displays and manages list of closed tabs
 */

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
 * @param {string} id - History record ID
 */
function restoreTab(url, id) {
  return new Promise((resolve, reject) => {
    if (!id || !url) {
      reject(new Error("URL and history id are required"));
      return;
    }

    chrome.runtime.sendMessage(
      { action: "restoreTabFromHistory", id, url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.tabId);
        } else {
          reject(new Error(response?.error || "Failed to restore tab"));
        }
      },
    );
  });
}

/**
 * Update the history list display
 */
export function updateHistoryList() {
  console.log("Updating history list...");

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getHistory" }, (response) => {
      const historyList = document.getElementById("history-list");

      if (!historyList) {
        console.warn("History list element not found");
        resolve();
        return;
      }

      if (chrome.runtime.lastError) {
        console.error(
          "Failed to fetch history:",
          chrome.runtime.lastError.message,
        );
        historyList.innerHTML =
          "<li class='timer-item'><div class='timer-info'><div class='timer-title'>Failed to load history</div></div></li>";
        resolve();
        return;
      }

      const history = response && response.history ? response.history : [];

      // Clear and rebuild
      historyList.innerHTML = "";

      if (history.length > 0) {
        const fragment = document.createDocumentFragment();

        // Limit to last 20 items to keep popup updates fast
        const recentHistory = history.slice(0, 20);

        recentHistory.forEach((record) => {
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
          btn.addEventListener("click", async () => {
            btn.disabled = true;
            const listItem = btn.closest("li");
            if (listItem) {
              listItem.remove();
              if (historyList.children.length === 0) {
                const emptyMsg = document.createElement("li");
                emptyMsg.className = "timer-item";
                emptyMsg.innerHTML =
                  "<div class='timer-info'><div class='timer-title'>No closed tabs yet</div></div>";
                historyList.appendChild(emptyMsg);
              }
            }
            try {
              await restoreTab(record.url, record.id);
            } catch (error) {
              console.error("Failed to restore tab from history:", error);
            } finally {
              await updateHistoryList();
            }
          });

          action.appendChild(btn);

          item.appendChild(info);
          item.appendChild(action);

          fragment.appendChild(item);
        });

        historyList.appendChild(fragment);
      } else {
        const emptyMsg = document.createElement("li");
        emptyMsg.className = "timer-item";
        emptyMsg.innerHTML =
          "<div class='timer-info'><div class='timer-title'>No closed tabs yet</div></div>";
        historyList.appendChild(emptyMsg);
      }

      resolve();
    });
  });
}

/**
 * Toggle history view visibility
 */
export async function toggleHistoryView() {
  const historyContainer = document.getElementById("history-container");
  const viewButton = document.getElementById("view-history-btn");

  if (!historyContainer || !viewButton) {
    console.warn("History toggle elements not found");
    return;
  }

  const isVisible = getComputedStyle(historyContainer).display !== "none";
  
  if (isVisible) {
    historyContainer.style.display = "none";
    viewButton.textContent = "View History";
  } else {
    historyContainer.style.display = "flex";
    viewButton.textContent = "Collapse History";

    const historyList = document.getElementById("history-list");
    if (historyList && historyList.children.length === 0) {
      historyList.innerHTML =
        "<li class='timer-item'><div class='timer-info'><div class='timer-title'>Loading history...</div></div></li>";
    }

    // Let the UI paint the new view before doing any async work.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    void updateHistoryList();
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
