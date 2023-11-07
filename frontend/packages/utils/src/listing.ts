export function getDuration(durationMinutes: number | undefined): string {
  if (durationMinutes) {
    const daysFloor = Math.floor(durationMinutes / 1440); // 1440 minutes in a day
    if (daysFloor > 0) {
      const roundedDays = Math.round(durationMinutes / 1440);
      return `${roundedDays} day${roundedDays > 1 ? "s" : ""}`;
    }

    const hoursFloor = Math.floor(durationMinutes / 60);
    if (hoursFloor > 0) {
      const roundedHours = Math.round(durationMinutes / 60);
      return `${roundedHours} hour${roundedHours > 1 ? "s" : ""}`;
    }

    return `${durationMinutes} minute${durationMinutes > 1 ? "s" : ""}`;
  } else {
    return "TBD";
  }
}
