export function ToTimeOnly(time: Date): Date {
  return new Date(Date.UTC(1970, 0, 1, time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), 0));
}
