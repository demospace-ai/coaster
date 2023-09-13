import { useState } from "react";

type Timer = ReturnType<typeof setTimeout>;

export function useDebounce<F extends (...args: any[]) => void>(func: F, delayMs: number) {
  const [timer, setTimer] = useState<Timer>(); // Create timer state

  const debouncedFunction = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delayMs);
    clearTimeout(timer);
    setTimer(newTimer);
  }) as F;

  return debouncedFunction;
}

export const throttle = (fn: Function, wait: number) => {
  let inThrottle: boolean, lastFn: ReturnType<typeof setTimeout>, lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
