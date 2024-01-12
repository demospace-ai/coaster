import { AvailabilityType, AvailabilityTypeType, BookingStatus } from "@coaster/types";
import { ReactNode } from "react";

export function getStartTimeString(
  startDate: Date,
  startTime: Date | undefined,
  availabilityType: AvailabilityTypeType,
): string {
  if (availabilityType === AvailabilityType.Enum.date) {
    return startDate.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else {
    const dateString = startDate.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeString = startTime!.toLocaleTimeString("en-us", {
      hour: "numeric",
      minute: "numeric",
    });

    return `${dateString} at ${timeString}`;
  }
}

export function getBookingStatusPill(status: BookingStatus): ReactNode {
  switch (status) {
    case BookingStatus.Confirmed:
      return (
        <div className="tw-flex tw-w-fit tw-rounded-lg tw-border tw-border-solid tw-border-green-600 tw-bg-green-100 tw-px-4 tw-py-0.5 tw-mt-2 tw-text-sm tw-font-medium tw-text-green-900">
          Confirmed
        </div>
      );
    case BookingStatus.Pending:
      return (
        <div className="tw-flex tw-items-center tw-w-fit tw-rounded-lg tw-border tw-border-solid tw-border-yellow-600 tw-bg-yellow-100 tw-px-4 tw-py-0.5 tw-mt-2 tw-text-sm tw-font-medium tw-text-yellow-900">
          Pending
        </div>
      );
    case BookingStatus.Cancelled:
      return (
        <div className="tw-flex tw-w-fit tw-rounded-lg tw-border tw-border-solid tw-border-red-600 tw-bg-red-100 tw-px-4 tw-py-0.5 tw-mt-2 tw-text-sm tw-font-medium tw-text-red-900">
          Cancelled
        </div>
      );
  }
}
