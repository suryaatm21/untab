// Simple test script to debug fast-forward issue
// This can be run in the browser console when the popup is open

console.log('=== Debug Fast-Forward for Paused Timer ===');

// Check current timer state
console.log('Current state:');
console.log('- targetTabId:', typeof targetTabId !== 'undefined' ? targetTabId : 'undefined');
console.log('- timerPaused:', typeof timerPaused !== 'undefined' ? timerPaused : 'undefined');
console.log('- pausedTimeRemaining:', typeof pausedTimeRemaining !== 'undefined' ? pausedTimeRemaining : 'undefined');

// Check if Fast Forward button exists and is visible
const ffButton = document.getElementById('fastForwardTimer');
if (ffButton) {
    console.log('Fast Forward button:');
    console.log('- exists: true');
    console.log('- style.display:', ffButton.style.display);
    console.log('- offsetParent:', ffButton.offsetParent !== null ? 'visible' : 'hidden');
    console.log('- disabled:', ffButton.disabled);
} else {
    console.log('Fast Forward button: NOT FOUND');
}

// Check timer controls container
const timerControls = document.getElementById('timer-controls');
if (timerControls) {
    console.log('Timer controls container:');
    console.log('- style.display:', timerControls.style.display);
    console.log('- offsetParent:', timerControls.offsetParent !== null ? 'visible' : 'hidden');
} else {
    console.log('Timer controls container: NOT FOUND');
}

// Check fast-forward container
const ffContainer = document.getElementById('fast-forward-container');
if (ffContainer) {
    console.log('Fast-forward container:');
    console.log('- style.display:', ffContainer.style.display);
    console.log('- offsetParent:', ffContainer.offsetParent !== null ? 'visible' : 'hidden');
} else {
    console.log('Fast-forward container: NOT FOUND');
}

console.log('=== End Debug ===');
