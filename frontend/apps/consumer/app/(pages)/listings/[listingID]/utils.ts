import { correctFromUTC } from "@coaster/components/dates/utils";
import { Availability, Host, Listing as ListingType } from "@coaster/types";
import { ToLocaleTimeOnly } from "@coaster/utils/common";

export const getMaxGuests = (listing: ListingType) => {
  if (listing.max_guests) {
    return listing.max_guests;
  } else {
    return "not specified";
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
        existing.sort(
          (a, b) => new Date(ToLocaleTimeOnly(a.datetime)).getTime() - ToLocaleTimeOnly(b.datetime).getTime(),
        );
      } else {
        timeSlotMap.set(dateString, [slot]);
      }
    }
  }
  return timeSlotMap;
};
