export const debounce = <T = void, K = void>(callback: (arg: T) => K, delayMillis: number) => {
  let timeout: number | undefined;
  return (arg: T) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => callback(arg), delayMillis);
  }
}
