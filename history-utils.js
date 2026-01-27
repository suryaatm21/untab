/**
 * History utility module for managing tab close history
 * Provides ring buffer management and domain extraction utilities
 */

const MAX_HISTORY_SIZE = 300;
const MAX_STRING_LENGTH = 500;

/**
 * Extract display domain from a URL
 * @param {string} url - Full URL
 * @returns {string} Display domain (e.g., "example.com")
 */
export function extractDomain(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    console.warn("Failed to extract domain from URL:", url, error);
    return "";
  }
}

/**
 * Sanitize a string to prevent storage issues
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(str, maxLength = MAX_STRING_LENGTH) {
  if (!str || typeof str !== "string") {
    return "";
  }

  // Truncate and trim
  return str.slice(0, maxLength).trim();
}

/**
 * Validate and sanitize a history record
 * @param {object} record - History record to validate
 * @returns {object|null} Sanitized record or null if invalid
 */
export function sanitizeHistoryRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  // URL is required and must be valid
  if (!record.url || typeof record.url !== "string" || !record.url.trim()) {
    return null;
  }

  // Create sanitized record
  const sanitized = {
    id: record.id || generateHistoryId(),
    url: sanitizeString(record.url, 2000), // URLs can be longer
    title: sanitizeString(record.title || "Untitled", MAX_STRING_LENGTH),
    closedAt:
      typeof record.closedAt === "number" ? record.closedAt : Date.now(),
    duration: typeof record.duration === "number" ? record.duration : 0,
  };

  // Optional fields
  if (record.favIconUrl && typeof record.favIconUrl === "string") {
    sanitized.favIconUrl = sanitizeString(record.favIconUrl, 2000);
  }

  if (record.warningTime !== undefined) {
    sanitized.warningTime = record.warningTime;
  }

  if (record.iterate !== undefined) {
    sanitized.iterate = Boolean(record.iterate);
  }

  if (record.originalTabId !== undefined) {
    sanitized.originalTabId = record.originalTabId;
  }

  return sanitized;
}

/**
 * Generate a unique history ID
 * @returns {string} Unique ID
 */
export function generateHistoryId() {
  return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a record to history with ring buffer logic
 * @param {Array} history - Existing history array
 * @param {object} record - New record to add
 * @returns {Array} Updated history array
 */
export function addToHistory(history, record) {
  if (!Array.isArray(history)) {
    history = [];
  }

  // Sanitize the record
  const sanitized = sanitizeHistoryRecord(record);
  if (!sanitized) {
    console.warn("Invalid history record, skipping:", record);
    return history;
  }

  // Add to the beginning (most recent first)
  const updated = [sanitized, ...history];

  // Maintain max size (ring buffer)
  if (updated.length > MAX_HISTORY_SIZE) {
    return updated.slice(0, MAX_HISTORY_SIZE);
  }

  return updated;
}

/**
 * Remove a record from history by ID
 * @param {Array} history - Existing history array
 * @param {string} recordId - ID of record to remove
 * @returns {Array} Updated history array
 */
export function removeFromHistory(history, recordId) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter((record) => record.id !== recordId);
}

/**
 * Filter history by search query
 * @param {Array} history - History array
 * @param {string} query - Search query (matches title or domain)
 * @returns {Array} Filtered history
 */
export function filterHistory(history, query) {
  if (!Array.isArray(history)) {
    return [];
  }

  if (!query || typeof query !== "string" || !query.trim()) {
    return history;
  }

  const lowerQuery = query.toLowerCase().trim();

  return history.filter((record) => {
    const title = (record.title || "").toLowerCase();
    const domain = extractDomain(record.url).toLowerCase();
    return title.includes(lowerQuery) || domain.includes(lowerQuery);
  });
}

/**
 * Sort history by specified criteria
 * @param {Array} history - History array
 * @param {string} sortBy - Sort criteria: "recent", "alpha", "timeLeft"
 * @returns {Array} Sorted history
 */
export function sortHistory(history, sortBy = "recent") {
  if (!Array.isArray(history)) {
    return [];
  }

  const sorted = [...history];

  switch (sortBy) {
    case "alpha":
      sorted.sort((a, b) => {
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();
        return titleA.localeCompare(titleB);
      });
      break;

    case "timeLeft":
      // Sort by duration (longest first)
      sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
      break;

    case "recent":
    default:
      // Sort by closedAt (most recent first)
      sorted.sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
      break;
  }

  return sorted;
}

/**
 * Paginate history
 * @param {Array} history - History array
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {object} Paginated result with items, total, page, pageSize
 */
export function paginateHistory(history, page = 1, pageSize = 30) {
  if (!Array.isArray(history)) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize,
    };
  }

  const total = history.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = history.slice(startIndex, endIndex);

  return {
    items,
    total,
    page,
    pageSize,
  };
}

