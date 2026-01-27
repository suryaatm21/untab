/**
 * Tab History Component
 * Manages the history page UI with search, list, pagination, and actions
 */

import * as HistoryService from "../services/history-service.js";

// State
let currentPage = 1;
let currentQuery = "";
let currentSort = "recent";
let totalItems = 0;
let isLoading = false;

// Debounce helper
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Format relative time for display
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Relative time string
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 30) {
    return `${days}d ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) {
    return "Unknown";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} Display domain
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: "success", "error", "info"
 */
function showToast(message, type = "info") {
  const existingToast = document.getElementById("history-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "history-toast";
  toast.className = `history-toast history-toast-${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("history-toast-show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("history-toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Render history list
 * @param {Array} items - History items to render
 */
function renderHistoryList(items) {
  const listContainer = document.getElementById("history-list");

  if (!items || items.length === 0) {
    listContainer.innerHTML = `
      <div class="history-empty">
        <p>No history found</p>
        <p class="history-empty-subtitle">Tabs closed by Untab timers will appear here</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = items
    .map(
      (item) => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-item-icon">
        ${
          item.favIconUrl
            ? `<img src="${item.favIconUrl}" alt="" class="history-favicon" onerror="this.style.display='none'" />`
            : '<span class="history-favicon-placeholder">🌐</span>'
        }
      </div>
      <div class="history-item-content">
        <div class="history-item-title" title="${item.title || "Untitled"}">${
        item.title || "Untitled"
      }</div>
        <div class="history-item-meta">
          <span class="history-item-domain">${extractDomain(item.url)}</span>
          <span class="history-item-separator">•</span>
          <span class="history-item-time">${formatRelativeTime(
            item.closedAt
          )}</span>
          ${
            item.duration
              ? `<span class="history-item-separator">•</span><span class="history-item-duration">Timer: ${formatDuration(
                  item.duration
                )}</span>`
              : ""
          }
        </div>
      </div>
      <div class="history-item-actions">
        <button class="history-action-btn history-restore-btn" data-id="${
          item.id
        }" title="Restore this tab" aria-label="Restore ${item.title || "tab"}">
          ↻
        </button>
        <button class="history-action-btn history-delete-btn" data-id="${
          item.id
        }" title="Delete from history" aria-label="Delete ${
        item.title || "tab"
      } from history">
          ✕
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Attach event listeners to action buttons
  attachActionListeners();
}

/**
 * Attach event listeners to restore and delete buttons
 */
function attachActionListeners() {
  // Restore buttons
  document.querySelectorAll(".history-restore-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      await handleRestore(id);
    });
  });

  // Delete buttons
  document.querySelectorAll(".history-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      await handleDelete(id);
    });
  });
}

/**
 * Handle restore action
 * @param {string} id - Record ID to restore
 */
async function handleRestore(id) {
  try {
    const tabId = await HistoryService.restoreHistoryItem(id);
    showToast("Tab restored successfully", "success");
    console.log(`Restored tab with ID: ${tabId}`);
  } catch (error) {
    console.error("Error restoring tab:", error);
    showToast("Failed to restore tab", "error");
  }
}

/**
 * Handle delete action
 * @param {string} id - Record ID to delete
 */
async function handleDelete(id) {
  try {
    await HistoryService.deleteHistoryItem(id);
    showToast("Removed from history", "success");
    // Reload current page
    await loadHistory();
  } catch (error) {
    console.error("Error deleting item:", error);
    showToast("Failed to delete item", "error");
  }
}

/**
 * Handle clear all action
 */
async function handleClearAll() {
  if (
    !confirm(
      "Are you sure you want to clear all history? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    await HistoryService.clearHistory();
    showToast("History cleared", "success");
    currentPage = 1;
    await loadHistory();
  } catch (error) {
    console.error("Error clearing history:", error);
    showToast("Failed to clear history", "error");
  }
}

/**
 * Update pagination UI
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 */
function updatePagination(total, page, pageSize) {
  const paginationContainer = document.getElementById("history-pagination");
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  const prevDisabled = page <= 1 ? "disabled" : "";
  const nextDisabled = page >= totalPages ? "disabled" : "";

  paginationContainer.innerHTML = `
    <button id="history-prev-page" class="history-page-btn" ${prevDisabled}>
      Previous
    </button>
    <span class="history-page-info">
      Page ${page} of ${totalPages} (${total} items)
    </span>
    <button id="history-next-page" class="history-page-btn" ${nextDisabled}>
      Next
    </button>
  `;

  // Attach pagination listeners
  const prevBtn = document.getElementById("history-prev-page");
  const nextBtn = document.getElementById("history-next-page");

  if (prevBtn && !prevBtn.disabled) {
    prevBtn.addEventListener("click", () => {
      currentPage = Math.max(1, currentPage - 1);
      loadHistory();
    });
  }

  if (nextBtn && !nextBtn.disabled) {
    nextBtn.addEventListener("click", () => {
      currentPage = Math.min(totalPages, currentPage + 1);
      loadHistory();
    });
  }
}

/**
 * Load history from background
 */
export async function loadHistory() {
  if (isLoading) {
    return;
  }

  isLoading = true;

  const loadingIndicator = document.getElementById("history-loading");
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  try {
    const result = await HistoryService.getHistory({
      query: currentQuery,
      page: currentPage,
      pageSize: 30,
      sort: currentSort,
    });

    totalItems = result.total;
    renderHistoryList(result.items);
    updatePagination(result.total, result.page, result.pageSize);
  } catch (error) {
    console.error("Error loading history:", error);
    showToast("Failed to load history", "error");
  } finally {
    isLoading = false;
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }
}

/**
 * Handle search input
 */
const handleSearch = debounce(async () => {
  const searchInput = document.getElementById("history-search");
  currentQuery = searchInput ? searchInput.value.trim() : "";
  currentPage = 1; // Reset to first page on new search
  await loadHistory();
}, 250);

/**
 * Handle sort change
 */
async function handleSortChange() {
  const sortSelect = document.getElementById("history-sort");
  if (sortSelect) {
    currentSort = sortSelect.value;
    currentPage = 1; // Reset to first page on sort change
    await loadHistory();
  }
}

/**
 * Initialize history page
 */
export function initializeHistoryPage() {
  console.log("Initializing history page");

  // Reset state
  currentPage = 1;
  currentQuery = "";
  currentSort = "recent";

  // Attach search listener
  const searchInput = document.getElementById("history-search");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  // Attach sort listener
  const sortSelect = document.getElementById("history-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", handleSortChange);
  }

  // Attach clear all listener
  const clearAllBtn = document.getElementById("history-clear-all");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", handleClearAll);
  }

  // Initial load
  loadHistory();
}

/**
 * Cleanup history page
 */
export function cleanupHistoryPage() {
  const searchInput = document.getElementById("history-search");
  if (searchInput) {
    searchInput.removeEventListener("input", handleSearch);
  }

  const sortSelect = document.getElementById("history-sort");
  if (sortSelect) {
    sortSelect.removeEventListener("change", handleSortChange);
  }

  const clearAllBtn = document.getElementById("history-clear-all");
  if (clearAllBtn) {
    clearAllBtn.removeEventListener("click", handleClearAll);
  }
}
