export function ToTimeOnly(time: Date): Date {
  return new Date(Date.UTC(1970, 0, 1, time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds(), 0));
}

export function ToDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

export function ToLocaleTimeOnly(time: Date): Date {
  return new Date(
    "1970-01-01T" +
      time.toLocaleTimeString("en-us", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }),
  );
}
