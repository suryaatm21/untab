/**
 * History service for communicating with background script
 * Handles all history-related operations
 */

/**
 * Get history with optional filtering, sorting, and pagination
 * @param {object} options - Query options
 * @param {string} options.query - Search query (optional)
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Items per page (default: 30)
 * @param {string} options.sort - Sort order: "recent", "alpha", "timeLeft" (default: "recent")
 * @returns {Promise<object>} Paginated history result
 */
export async function getHistory(options = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "getUntabHistory",
        query: options.query || "",
        page: options.page || 1,
        pageSize: options.pageSize || 30,
        sort: options.sort || "recent",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting history:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve({
            items: response.items || [],
            total: response.total || 0,
            page: response.page || 1,
            pageSize: response.pageSize || 30,
          });
        } else {
          reject(new Error(response?.error || "Failed to get history"));
        }
      }
    );
  });
}

/**
 * Restore a tab from history
 * @param {string} id - Record ID to restore
 * @returns {Promise<number>} New tab ID
 */
export async function restoreHistoryItem(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("Record ID is required"));
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: "restoreUntabHistoryItem",
        id,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error restoring history item:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response.tabId);
        } else {
          reject(new Error(response?.error || "Failed to restore item"));
        }
      }
    );
  });
}

/**
 * Delete a single history record
 * @param {string} id - Record ID to delete
 * @returns {Promise<void>}
 */
export async function deleteHistoryItem(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error("Record ID is required"));
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: "deleteUntabHistoryItem",
        id,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error deleting history item:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve();
        } else {
          reject(new Error(response?.error || "Failed to delete item"));
        }
      }
    );
  });
}

/**
 * Clear all history
 * @returns {Promise<void>}
 */
export async function clearHistory() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "clearUntabHistory",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error clearing history:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve();
        } else {
          reject(new Error(response?.error || "Failed to clear history"));
        }
      }
    );
  });
}
