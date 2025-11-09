/**
 * Input validation utilities
 */

/**
 * Debounce function to limit execution rate
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Set up validation for time input fields
 */
export function setupTimeInputValidation() {
  const secondsInputs = ["duration-seconds", "extension-seconds", "ff-seconds"];

  secondsInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", function () {
        let value = parseInt(this.value, 10);
        if (value > 59) {
          this.value = 59;
        } else if (value < 0) {
          this.value = 0;
        }
      });

      input.addEventListener("blur", function () {
        if (this.value === "" || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });

  const minutesInputs = ["duration-minutes", "extension-minutes", "ff-minutes"];

  minutesInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", function () {
        let value = parseInt(this.value, 10);
        if (value > 59) {
          this.value = 59;
        } else if (value < 0) {
          this.value = 0;
        }
      });

      input.addEventListener("blur", function () {
        if (this.value === "" || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });

  const hoursInputs = ["duration-hours", "extension-hours", "ff-hours"];

  hoursInputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("input", function () {
        let value = parseInt(this.value, 10);
        if (value > 23) {
          this.value = 23;
        } else if (value < 0) {
          this.value = 0;
        }
      });

      input.addEventListener("blur", function () {
        if (this.value === "" || isNaN(parseInt(this.value, 10))) {
          this.value = 0;
        }
      });
    }
  });
}


