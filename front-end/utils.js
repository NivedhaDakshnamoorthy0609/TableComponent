export function throttle(callback, delay) {
    let last = 0;
    return function () {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        callback();
      }
    };
  }
  
  export function debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  

  