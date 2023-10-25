import { correctFromUTC } from "@coaster/components/client";
import { Availability, Host, Listing as ListingType } from "@coaster/rpc/common";

export const getMaxGuests = (listing: ListingType) => {
  if (listing.max_guests) {
    return listing.max_guests;
  } else {
    return "not specified";
  }
};

export const getDuration = (listing: ListingType) => {
  if (listing.duration_minutes) {
    const daysFloor = Math.floor(listing.duration_minutes / 1440); // 1440 minutes in a day
    if (daysFloor > 0) {
      const roundedDays = Math.round(listing.duration_minutes / 1440);
      return `${roundedDays} day${roundedDays > 1 ? "s" : ""}`;
    }

    const hoursFloor = Math.floor(listing.duration_minutes / 60);
    if (hoursFloor > 0) {
      const roundedHours = Math.round(listing.duration_minutes / 60);
      return `${roundedHours} hour${roundedHours > 1 ? "s" : ""}`;
    }

    return `${listing.duration_minutes} minute${listing.duration_minutes > 1 ? "s" : ""}`;
  } else {
    return "TBD";
  }
};

export const getHostName = (host: Host) => {
  if (host.first_name && host.last_name) {
    return `${host.first_name} ${host.last_name}`;
  } else if (host.first_name) {
    return host.first_name;
  } else if (host.last_name) {
    return host.last_name;
  } else {
    return "Unknown";
  }
};

export const getDateToTimeSlotMap = (availability: Availability[] | undefined) => {
  const timeSlotMap = new Map<string, Availability[]>();
  if (availability) {
    for (const slot of availability) {
      const dateString = correctFromUTC(slot.datetime).toLocaleDateString();
      const existing = timeSlotMap.get(dateString);
      if (existing) {
        existing.push(slot);
      } else {
        timeSlotMap.set(dateString, [slot]);
      }
    }
  }
  return timeSlotMap;
};
