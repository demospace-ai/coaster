export type DateRange = {
  minDate: Date;
  maxDate: Date;
};

export const getDateStringInUTC = (d: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[d.getUTCMonth()] + " " + d.getUTCDate() + " " + d.getUTCFullYear();
};
