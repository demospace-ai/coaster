interface DateRange {
  from: Date;
  to: Date;
}

// These functions are needed because the date picker displays/selects dates in the local timezone, but we store them in UTC.
// This causes the date to be off since 2024-01-01T00:00:00Z is actually 2023-12-31T19:00:00-05:00 (Eastern Time).
// Therefore, we need to adjust the date to be whatever date it was in UTC by adding the timezone offset.
export function correctFromUTCRange(dateRange: DateRange | undefined) {
  if (!dateRange) {
    return {};
  }

  return {
    from: tryCorrectFromUTC(dateRange.from),
    to: tryCorrectFromUTC(dateRange.to),
  };
}

export function tryCorrectFromUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return correctFromUTC(date);
}

export function correctFromUTC(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function correctToUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

export function correctTime(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return new Date(1970, 0, 0, date.getHours(), date.getMinutes(), date.getSeconds(), 0);
}
