# Module Reference Guide

## Quick Lookup: Old Code → New Location

This guide helps you quickly find where functionality from the original monolithic files has moved.

---

## Popup.js Function Migration

### Time Utilities
| Original Function | New Location | Module |
|---|---|---|
| `getTotalSecondsFromInputs()` | `popup/utils/time-utils.js` | time-utils |
| `setTimeInputsFromSeconds()` | `popup/utils/time-utils.js` | time-utils |
| `formatTime()` | `popup/utils/time-utils.js` | time-utils |
| `formatStopwatchTime()` | `popup/utils/time-utils.js` | time-utils |

### Validation Utilities
| Original Function | New Location | Module |
|---|---|---|
| `debounce()` | `popup/utils/validation-utils.js` | validation-utils |
| `setupTimeInputValidation()` | `popup/utils/validation-utils.js` | validation-utils |

### Timer Service (Background Communication)
| Original Function/Logic | New Location | Module |
|---|---|---|
| `startTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `stopTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `pauseTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `updateTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `extendTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `fastForwardTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `checkTimer()` background message | `popup/services/timer-service.js` | timer-service |
| `getAllTimers()` background message | `popup/services/timer-service.js` | timer-service |
| `testNotification()` background message | `popup/services/timer-service.js` | timer-service |
| `forceTestNotification()` background message | `popup/services/timer-service.js` | timer-service |

### Settings Service
| Original Function/Logic | New Location | Module |
|---|---|---|
| `loadSettings()` | `popup/services/settings-service.js` | settings-service |
| `saveSettings()` | `popup/services/settings-service.js` | settings-service |
| `updateWarningTimeForActiveTimers()` message | `popup/services/settings-service.js` | settings-service |
| Default current tab preference loading | `popup/services/settings-service.js` | settings-service |

### State Management
| Original Variable | New Location | Module |
|---|---|---|
| `endTime` | `popup/state/timer-state.js` | timer-state |
| `targetTabId` | `popup/state/timer-state.js` | timer-state |
| `timerPaused` | `popup/state/timer-state.js` | timer-state |
| `pausedTimeRemaining` | `popup/state/timer-state.js` | timer-state |
| `currentTabId` | `popup/state/timer-state.js` | timer-state |
| `countdownInterval` | `popup/state/timer-state.js` | timer-state |

### Timer Display Component
| Original Function | New Location | Module |
|---|---|---|
| `updateTimerDisplay()` | `popup/components/timer-display.js` | timer-display |
| `updateRealTimeClock()` | `popup/components/timer-display.js` | timer-display |
| `showActiveTimer()` | `popup/components/timer-display.js` | timer-display |
| `showPausedTimer()` | `popup/components/timer-display.js` | timer-display |
| `hideTimerUI()` | `popup/components/timer-display.js` | timer-display |
| `showMenuUI()` | `popup/components/timer-display.js` | timer-display |

### Timer Controls Component
| Original Function | New Location | Module |
|---|---|---|
| `togglePauseTimer()` | `popup/components/timer-controls.js` | timer-controls |
| `showExtensionUI()` | `popup/components/timer-controls.js` | timer-controls |
| `showFastForwardUI()` | `popup/components/timer-controls.js` | timer-controls |
| `hideExtensionUI()` | `popup/components/timer-controls.js` | timer-controls |
| `extendTimer()` | `popup/components/timer-controls.js` | timer-controls |
| `fastForwardTimer()` | `popup/components/timer-controls.js` | timer-controls |

### Active Timers List Component
| Original Function | New Location | Module |
|---|---|---|
| `sortTimers()` | `popup/components/active-timers-list.js` | active-timers-list |
| `updateActiveTimersList()` | `popup/components/active-timers-list.js` | active-timers-list |
| `ensureActiveTimersVisibility()` | `popup/components/active-timers-list.js` | active-timers-list |
| `switchToTimer()` | `popup/components/active-timers-list.js` | active-timers-list |
| `backToTimersList()` | `popup/components/active-timers-list.js` | active-timers-list |

### Settings Panel Component
| Original Function | New Location | Module |
|---|---|---|
| `loadSettings()` (UI version) | `popup/components/settings-panel.js` | settings-panel |
| `saveSettings()` (UI version) | `popup/components/settings-panel.js` | settings-panel |
| `toggleSettings()` | `popup/components/settings-panel.js` | settings-panel |
| `testNotification()` (UI version) | `popup/components/settings-panel.js` | settings-panel |
| `forceTestNotification()` (UI version) | `popup/components/settings-panel.js` | settings-panel |

### Tab Selector Component
| Original Function | New Location | Module |
|---|---|---|
| `populateTabSelection()` | `popup/components/tab-selector.js` | tab-selector |

### Main Orchestrator
| Original Function | New Location | Module |
|---|---|---|
| `startTimerHandler()` | `popup/popup-main.js` | popup-main |
| `startTimerForTab()` | `popup/popup-main.js` | popup-main |
| `stopTimerHandler()` | `popup/popup-main.js` | popup-main |
| `checkCurrentTabTimer()` | `popup/popup-main.js` | popup-main |
| `setupPresetButtons()` | `popup/popup-main.js` | popup-main |
| `setupEventListeners()` | `popup/popup-main.js` | popup-main |
| `initialize()` (DOMContentLoaded handler) | `popup/popup-main.js` | popup-main |
| `window.debugFastForward()` | `popup/popup-main.js` | popup-main |
| Periodic updates (setInterval) | `popup/popup-main.js` | popup-main |
| Visibility change handlers | `popup/popup-main.js` | popup-main |

---

## Notification-Manager.js Function Migration

### Notification Utilities
| Original Function/Logic | New Location | Module |
|---|---|---|
| Tab ID validation | `notification-utils.js` | notification-utils |
| Notification options creation | `notification-utils.js` | notification-utils |
| Notification ID generation | `notification-utils.js` | notification-utils |
| Time text formatting | `notification-utils.js` | notification-utils |
| Chrome notification creation (Promise wrapper) | `notification-utils.js` | notification-utils |

### Notification Handlers
| Original Function | New Location | Module |
|---|---|---|
| Tab ID parsing from notification ID | `notification-handlers.js` | notification-handlers |
| Extend timer handler | `notification-handlers.js` | notification-handlers |
| Cancel timer handler | `notification-handlers.js` | notification-handlers |
| Button click listener setup | `notification-handlers.js` | notification-handlers |
| Notification closed listener setup | `notification-handlers.js` | notification-handlers |

### NotificationManager Class
| Original Method | New Location | Module |
|---|---|---|
| `constructor()` | `notification-manager.js` | notification-manager |
| `debug()` | `notification-manager.js` | notification-manager |
| `createNotification()` | `notification-manager.js` | notification-manager |
| `createTimerWarningNotification()` | `notification-manager.js` | notification-manager |
| `notifyTimerCreated()` | `notification-manager.js` | notification-manager |
| `setupNotificationListeners()` | `notification-manager.js` | notification-manager |

---

## Import Examples

### Using Time Utilities
```javascript
import { formatTime, getTotalSecondsFromInputs } from "./utils/time-utils.js";

const seconds = getTotalSecondsFromInputs("hours-id", "minutes-id", "seconds-id");
const formatted = formatTime(seconds);
```

### Using Timer Service
```javascript
import * as TimerService from "./services/timer-service.js";

TimerService.startTimer(tabId, duration, warningTime, enableNotifications, tabTitle, iterateTimer)
  .then((response) => console.log("Timer started:", response))
  .catch((error) => console.error("Error:", error));
```

### Using State Management
```javascript
import * as TimerState from "./state/timer-state.js";

TimerState.setTargetTabId(12345);
const tabId = TimerState.getTargetTabId();
```

### Using Components
```javascript
import { showActiveTimer } from "./components/timer-display.js";
import { updateActiveTimersList } from "./components/active-timers-list.js";

showActiveTimer(300); // Show timer with 5 minutes remaining
updateActiveTimersList(); // Refresh the timers list
```

---

## Module Dependency Graph

```
popup-main.js (Orchestrator)
├── utils/
│   ├── time-utils.js (no dependencies)
│   └── validation-utils.js (no dependencies)
├── services/
│   ├── timer-service.js (no dependencies, uses Chrome API)
│   └── settings-service.js (no dependencies, uses Chrome API)
├── state/
│   └── timer-state.js (no dependencies)
├── components/
│   ├── timer-display.js
│   │   ├── utils/time-utils.js
│   │   └── state/timer-state.js
│   ├── timer-controls.js
│   │   ├── utils/time-utils.js
│   │   ├── state/timer-state.js
│   │   ├── services/timer-service.js
│   │   └── components/timer-display.js
│   ├── active-timers-list.js
│   │   ├── utils/time-utils.js
│   │   ├── state/timer-state.js
│   │   ├── services/timer-service.js
│   │   └── components/timer-display.js
│   ├── settings-panel.js
│   │   ├── services/settings-service.js
│   │   ├── services/timer-service.js
│   │   └── components/active-timers-list.js
│   └── tab-selector.js
│       └── services/settings-service.js
```

```
notification-manager.js (NotificationManager Class)
├── notification-utils.js (no dependencies, uses Chrome API)
└── notification-handlers.js (no dependencies, uses Chrome API)
```

---

## Architecture Benefits

### 1. **No Circular Dependencies**
All imports flow in one direction: from high-level (main/components) to low-level (utils/services/state).

### 2. **Clear Ownership**
Each module has a single owner/maintainer and clear responsibilities.

### 3. **Easy Testing**
- **Utils**: Pure functions, easy to unit test
- **Services**: Mock Chrome API for isolated testing
- **State**: Test getters/setters independently
- **Components**: Mock dependencies for UI testing

### 4. **Scalability**
New features can be added by:
1. Adding new utility functions (utils/)
2. Adding new service methods (services/)
3. Creating new components (components/)
4. Wiring them in the main orchestrator

### 5. **Performance**
ES6 modules enable:
- Tree-shaking (unused code removal)
- Code splitting
- Lazy loading (if needed in future)

---

## Naming Conventions

### Files
- **kebab-case**: `timer-service.js`, `active-timers-list.js`
- **Descriptive**: Name clearly indicates purpose

### Functions
- **camelCase**: `getTotalSecondsFromInputs()`, `updateActiveTimersList()`
- **Verb-based**: Action-oriented naming

### Classes
- **PascalCase**: `NotificationManager`
- **Noun-based**: Entity naming

### Constants
- **UPPER_SNAKE_CASE**: (Not used in current refactoring, but recommended for future constants)

---

## Troubleshooting

### Module Not Found Error
**Problem**: `Uncaught TypeError: Failed to resolve module specifier`  
**Solution**: Ensure all imports use relative paths with file extensions:
```javascript
// ✅ Correct
import { formatTime } from "./utils/time-utils.js";

// ❌ Incorrect
import { formatTime } from "./utils/time-utils";
```

### Undefined Import Error
**Problem**: `Uncaught ReferenceError: X is not defined`  
**Solution**: Check that the function is exported in the source module:
```javascript
// In source module
export function myFunction() { ... }

// In consuming module
import { myFunction } from "./source.js";
```

### Chrome API Not Available
**Problem**: `chrome is undefined` in modules  
**Solution**: Chrome API is available globally, no import needed:
```javascript
// ✅ Correct - use chrome directly
chrome.runtime.sendMessage(...);

// ❌ No need to import chrome
```

---

## Future Enhancements

### Recommended Next Steps
1. **Add Unit Tests**: Use Jest or Vitest to test utility functions
2. **TypeScript Migration**: Add type safety with `.ts` files
3. **Constants Module**: Extract magic numbers and strings to `constants.js`
4. **Error Service**: Centralize error handling in `services/error-service.js`
5. **Logger Service**: Create `services/logger-service.js` for consistent logging

### Potential New Modules
- `popup/services/storage-service.js` - Wrap Chrome storage API
- `popup/services/analytics-service.js` - Track usage metrics
- `popup/utils/dom-utils.js` - Common DOM manipulation helpers
- `popup/components/modal-component.js` - Reusable modal dialogs

---

This guide should help you quickly navigate the refactored codebase and understand where functionality has moved!


