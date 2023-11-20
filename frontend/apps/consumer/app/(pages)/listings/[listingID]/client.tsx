"use client";

import { Button } from "@coaster/components/button/Button";
import { correctToUTC } from "@coaster/components/dates/utils";
import { GuestNumberInput } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { useAuthContext, useAvailability, useCreateCheckoutLink, useNotificationContext } from "@coaster/rpc/client";
import {
  Availability,
  AvailabilityDisplay,
  AvailabilityType,
  Image as ListingImage,
  Listing as ListingType,
} from "@coaster/types";
import {
  ToTimeOnly,
  compareDates,
  getDuration,
  getGcsImageUrl,
  mergeClasses,
  toTitleCase,
} from "@coaster/utils/common";
import { Dialog, Disclosure, RadioGroup, Transition } from "@headlessui/react";
import {
  ArrowUpOnSquareIcon,
  CalendarIcon,
  ChevronUpIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getDateToTimeSlotMap } from "consumer/app/(pages)/listings/[listingID]/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Fragment, useState } from "react";

const DatePickerPopper = dynamic(
  () => import("@coaster/components/dates/DatePicker").then((mod) => mod.DatePickerPopper),
  {
    loading: () => (
      <div className="tw-flex tw-w-3/4 tw-py-2.5 tw-mr-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-justify-start tw-items-center tw-cursor-pointer tw-whitespace-nowrap">
        <CalendarIcon className="tw-w-5 tw-ml-4 tw-mr-3 -tw-mt-[1.5px]" />
        Select a date
      </div>
    ),
  },
);
const DateRangePicker = dynamic(() =>
  import("@coaster/components/dates/DatePicker").then((mod) => mod.DateRangePicker),
);
const AvailabilityListPopper = dynamic(
  () => import("@coaster/components/dates/AvailabilityList").then((mod) => mod.AvailabilityListPopper),
  {
    loading: () => (
      <div className="tw-flex tw-w-3/4 tw-py-2.5 tw-mr-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-justify-start tw-items-center tw-cursor-pointer tw-whitespace-nowrap">
        <CalendarIcon className="tw-w-5 tw-ml-5 tw-mr-3 -tw-mt-[1.5px]" />
        Select a date
      </div>
    ),
  },
);

export const ListingHeader: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const { showNotification } = useNotificationContext();

  return (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between">
      <div>
        <div className="tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl tw-hyphens-auto">
          {listing.name}
        </div>
        <div className="tw-flex tw-items-center tw-mt-3 tw-mb-4 tw-font-medium">
          {listing.location} • {toTitleCase(listing.category ? listing.category : "")}
        </div>
      </div>
      <div
        className="tw-cursor-pointer hover:tw-bg-gray-100 tw-rounded-lg tw-p-0.5 sm:tw-p-2"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          showNotification("success", "Copied link to clipboard", 2000);
        }}
      >
        <ArrowUpOnSquareIcon className="tw-h-6 sm:tw-h-7" />
      </div>
    </div>
  );
};

export const ReserveSlider: React.FC<{
  listing: ListingType;
  className?: string;
  buttonClass?: string;
}> = ({ listing, className }) => {
  const [open, setOpen] = useState(false);
  const {
    month,
    setMonth,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    numGuests,
    setNumGuests,
    availabilityLoading,
    createCheckoutLink,
    tryToReserve,
    availableDates,
    timeSlots,
    bookingSlot,
    maxGuests,
  } = useBookingState(listing);

  const durationDays = Math.floor((listing.duration_minutes || 0) / 1440);
  const multiDayDuration = durationDays > 0;

  const getDisplayValue = (value: Date | undefined): string => {
    if (!value) {
      return "";
    }

    if (multiDayDuration) {
      const endDate = new Date(value.getFullYear(), value.getMonth(), value.getDate() + durationDays);
      return (
        value.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) +
        " - " +
        endDate.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    } else {
      return value.toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className={className}>
      <Button className="tw-font-medium tw-tracking-[0.5px] tw-h-10" onClick={() => setOpen(true)}>
        View availability
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog onClose={setOpen} className="tw-relative tw-z-40">
          <Transition.Child
            as={Fragment}
            enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
            enterFrom="tw-opacity-0"
            enterTo="tw-opacity-100"
            leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
            leaveFrom="tw-opacity-100"
            leaveTo="tw-opacity-0"
          >
            <div className="tw-fixed tw-inset-0 tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-10" />
          </Transition.Child>
          <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-h-[80vh]">
            <Transition.Child
              as={Fragment}
              enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
              enterFrom="tw-translate-y-full"
              enterTo="tw-translate-y-0"
              leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
              leaveFrom="tw-translate-y-0"
              leaveTo="tw-translate-y-full"
            >
              <Dialog.Panel className="tw-flex tw-flex-col tw-bg-white tw-rounded-xl tw-h-full tw-w-full tw-items-center tw-justify-start tw-p-6">
                <div className="tw-flex tw-w-full tw-mb-4">
                  <span className="tw-font-semibold tw-text-lg">Select options</span>
                  <button
                    className="tw-inline tw-ml-auto tw-mb-2 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <XMarkIcon className="tw-h-5 tw-stroke-black" />
                  </button>
                </div>
                <div className="tw-flex tw-flex-col tw-overflow-scroll tw-w-full tw-h-full tw-pb-10 tw-gap-3">
                  <Disclosure>
                    {({ open, close }) => (
                      <div className="tw-w-full tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                        <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                          <span>
                            {startDate
                              ? startDate.toLocaleDateString()
                              : multiDayDuration
                              ? "Choose dates"
                              : "Choose start date"}
                          </span>
                          <ChevronUpIcon
                            className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="tw-flex tw-flex-col tw-w-full tw-items-center tw-pb-4 sm:tw-pb-0">
                          {listing.availability_display === AvailabilityDisplay.Enum.calendar ? (
                            <DateRangePicker
                              mode="single"
                              disabled={(day: Date) => {
                                // TODO: this should account for the capacity and number of guests selected
                                const today = new Date();
                                if (day < today) {
                                  return true;
                                }

                                for (const date of availableDates) {
                                  if (date.toDateString() === day.toDateString()) {
                                    return false;
                                  }
                                }
                                return true;
                              }}
                              numberOfMonths={1}
                              month={month}
                              onMonthChange={setMonth}
                              className="tw-mt-3 sm:tw-mt-0"
                              classNames={{
                                month: "sm:tw-border-0",
                              }}
                              selected={startDate}
                              onSelect={(e) => {
                                setStartDate(e);
                                close();
                              }}
                              components={
                                availabilityLoading ? { Day: () => <Loading className="tw-opacity-30" /> } : {}
                              }
                            />
                          ) : (
                            <RadioGroup
                              className="tw-grid tw-grid-cols-1 tw-w-full tw-gap-4 tw-mt-4"
                              value={startDate}
                              by={compareDates}
                              onChange={(e) => {
                                setStartDate(e);
                                close();
                              }}
                            >
                              {availableDates.map((availableDate: Date) => (
                                <RadioGroup.Option
                                  key={availableDate.toLocaleDateString()}
                                  value={availableDate}
                                  className={({ checked }) =>
                                    mergeClasses(
                                      "tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-select-none tw-text-center tw-py-2 tw-w-full tw-border tw-border-solid tw-border-slate-300 tw-rounded-lg tw-text-base tw-text-slate-900 tw-mx-auto",
                                      checked && "tw-bg-blue-100",
                                    )
                                  }
                                >
                                  {getDisplayValue(availableDate)}
                                </RadioGroup.Option>
                              ))}
                            </RadioGroup>
                          )}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                  {listing.availability_type === AvailabilityType.Enum.datetime && (
                    <Disclosure>
                      {({ open, close }) => (
                        <div className="tw-w-full tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                          <Disclosure.Button
                            className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none"
                            disabled={timeSlots === undefined}
                          >
                            {timeSlots === undefined ? (
                              <span className="tw-cursor-disabled tw-text-gray-500">Pick a date first</span>
                            ) : (
                              <span>
                                {startTime
                                  ? startTime.datetime.toLocaleTimeString("en-us", {
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                      timeZoneName: "short",
                                    })
                                  : "Choose start time"}
                              </span>
                            )}
                            <ChevronUpIcon
                              className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="tw-flex tw-flex-col tw-w-full tw-items-center tw-pb-4 sm:tw-pb-0">
                            {timeSlots != undefined && (
                              <RadioGroup
                                value={startTime ? startTime : null}
                                onChange={(e) => {
                                  setStartTime(e);
                                  close();
                                }}
                                className="tw-grid tw-grid-cols-2 tw-justify-center tw-w-full tw-gap-2 tw-mt-4"
                              >
                                {timeSlots.map((timeSlot) => (
                                  <RadioGroup.Option
                                    key={timeSlot.datetime.toLocaleTimeString()}
                                    value={timeSlot}
                                    className={({ checked }) =>
                                      mergeClasses(
                                        "tw-cursor-pointer tw-select-none tw-text-center tw-py-2 tw-w-32 tw-border tw-border-solid tw-border-slate-300 tw-rounded-lg tw-text-base tw-text-slate-900 tw-mx-auto",
                                        checked && "tw-bg-blue-100",
                                      )
                                    }
                                  >
                                    {timeSlot.datetime.toLocaleTimeString("en-us", {
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                      timeZoneName: "short",
                                    })}
                                  </RadioGroup.Option>
                                ))}
                              </RadioGroup>
                            )}
                          </Disclosure.Panel>
                        </div>
                      )}
                    </Disclosure>
                  )}
                  <Disclosure>
                    {({ open }) => (
                      <div className="tw-w-full tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                        <Disclosure.Button
                          className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none"
                          disabled={bookingSlot === null}
                        >
                          {bookingSlot === null ? (
                            listing.availability_type === AvailabilityType.Enum.datetime ? (
                              <span className="tw-cursor-disabled tw-text-gray-500">Pick a time first</span>
                            ) : (
                              <span className="tw-cursor-disabled tw-text-gray-500">Pick a date first</span>
                            )
                          ) : (
                            <span>{numGuests ? numGuests + " travelers" : "Add travelers"}</span>
                          )}
                          <ChevronUpIcon
                            className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel>
                          <div className="tw-flex tw-justify-between tw-py-5">
                            <span className="tw-text-base tw-whitespace-nowrap tw-select-none">Adults</span>
                            <div className="tw-flex tw-gap-3">
                              <button
                                onClick={() => {
                                  setNumGuests(Math.max(1, numGuests - 1));
                                }}
                              >
                                <MinusCircleIcon
                                  className={mergeClasses(
                                    "tw-w-6 tw-cursor-pointer tw-stroke-gray-700 hover:tw-stroke-black",
                                    numGuests === 1 && "!tw-stroke-gray-300 tw-cursor-not-allowed",
                                  )}
                                />
                              </button>
                              <span className="tw-flex tw-w-3 tw-justify-center tw-select-none">{numGuests}</span>
                              <button
                                onClick={() => {
                                  setNumGuests(Math.min(maxGuests, numGuests + 1));
                                }}
                              >
                                <PlusCircleIcon
                                  className={mergeClasses(
                                    "tw-w-6 tw-cursor-pointer tw-stroke-gray-700 hover:tw-stroke-black",
                                    numGuests === maxGuests && "!tw-stroke-gray-300 tw-cursor-not-allowed",
                                  )}
                                />
                              </button>
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                </div>
                <div className="tw-flex tw-mt-auto tw-w-full tw-justify-end">
                  <Button
                    className="tw-h-10 tw-w-28"
                    onClick={() => {
                      tryToReserve();
                    }}
                    disabled={
                      !startDate ||
                      (listing.availability_type === AvailabilityType.Enum.datetime && !startTime) ||
                      numGuests === 0
                    }
                  >
                    {createCheckoutLink.isLoading ? <Loading light /> : "Reserve"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export const ReserveFooter: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-fixed lg:tw-hidden tw-z-20 tw-bottom-0 tw-left-0 tw-flex tw-items-center tw-justify-between tw-bg-white tw-border-t tw-border-solid tw-border-gray-300 tw-h-20 tw-w-full tw-px-4">
      <div className="tw-flex tw-flex-col">
        <div>
          <span className="tw-font-semibold">${listing.price}</span> per person
        </div>
        <div>/ {getDuration(listing.duration_minutes)}</div>
      </div>
      <ReserveSlider listing={listing} />
    </div>
  );
};

export const BookingPanel: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const {
    month,
    setMonth,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    numGuests,
    setNumGuests,
    availabilityLoading,
    createCheckoutLink,
    tryToReserve,
    availableDates,
    timeSlots,
    maxGuests,
  } = useBookingState(listing);

  return (
    <div className="tw-hidden lg:tw-flex tw-w-[400px] tw-min-w-[400px] tw-max-w-[400px]">
      <div className="tw-sticky tw-top-32 tw-flex tw-flex-col tw-px-8 tw-py-6 tw-w-full tw-h-fit tw-border tw-border-solid tw-border-gray-300 tw-rounded-xl tw-shadow-centered-sm">
        <div>
          <span className="tw-text-2xl tw-font-semibold tw-mb-3">${listing.price}</span> per person
        </div>
        <div className="tw-flex tw-w-full tw-mt-3">
          {listing.availability_display === AvailabilityDisplay.Enum.calendar ? (
            <DatePickerPopper
              className="tw-w-3/4 tw-mr-2"
              selected={startDate}
              onSelect={setStartDate}
              month={month}
              onMonthChange={setMonth}
              loading={availabilityLoading}
              disabled={(day: Date) => {
                // TODO: this should account for the capacity and number of guests selected
                const today = new Date();
                if (day < today) {
                  return true;
                }
                for (const date of availableDates) {
                  if (date.toDateString() === day.toDateString()) {
                    return false;
                  }
                }
                return true;
              }}
              buttonClass="tw-w-full tw-h-12"
            />
          ) : (
            <AvailabilityListPopper
              wrapperClass="tw-w-3/4 tw-mr-2"
              className="tw-w-full tw-py-3 tw-border-gray-300 tw-rounded-lg"
              selected={startDate}
              onSelect={setStartDate}
              availability={availableDates}
              loading={availabilityLoading}
              durationMinutes={listing.duration_minutes}
            />
          )}
          <GuestNumberInput
            value={numGuests}
            setValue={setNumGuests}
            maxGuests={maxGuests}
            className="tw-w-1/4 tw-min-w-[80px]"
          />
        </div>
        {listing.availability_type === AvailabilityType.Enum.datetime && timeSlots != undefined && (
          <RadioGroup
            value={startTime ? startTime : null}
            onChange={setStartTime}
            className="tw-flex tw-columns-3 tw-justify-start tw-gap-3 tw-mt-5"
          >
            {timeSlots.map((timeSlot) => (
              <RadioGroup.Option
                key={timeSlot.datetime.toLocaleTimeString("en-us", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  timeZoneName: "short",
                })}
                value={timeSlot}
                className={({ checked }) =>
                  mergeClasses(
                    "tw-px-2 tw-py-1 tw-cursor-pointer tw-rounded-lg tw-border tw-border-solid tw-border-gray-300",
                    checked && "tw-bg-blue-100",
                  )
                }
              >
                {timeSlot.datetime.toLocaleTimeString("en-us", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  timeZoneName: "short",
                })}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )}
        <Button
          className="tw-font-medium tw-mt-5 tw-mb-4 tw-tracking-[0.5px] tw-h-10"
          disabled={!startDate || (listing.availability_type === AvailabilityType.Enum.datetime && !startTime)}
          onClick={tryToReserve}
        >
          {createCheckoutLink.isLoading ? <Loading light /> : "Reserve"}
        </Button>
        <div className="tw-w-full tw-text-center tw-text-sm tw-mb-4 tw-pb-3 tw-border-b tw-border-solid tw-border-gray-300">
          You won't be charged yet
        </div>
        <span className="tw-text-sm">
          *Likely to sell out: Based on Coaster's booking data and information from the provider, it seems likely this
          experience will sell out soon.
        </span>
      </div>
    </div>
  );
};

export const ListingImages: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const [showImages, setShowImages] = useState(false);
  const ImagesModal = dynamic(() =>
    import("consumer/app/(pages)/listings/[listingID]/ImagesModal").then((mod) => mod.ImagesModal),
  );

  return (
    <div className="tw-flex tw-aspect-square tw-h-full sm:tw-h-[560px] tw-max-h-[560px] tw-rounded-xl tw-overflow-clip">
      <ImagesModal
        show={showImages}
        close={() => {
          setShowImages(false);
        }}
        listing={listing}
      />
      <div className="tw-relative tw-flex tw-w-full lg:tw-w-2/3 tw-h-full lg:tw-mr-2">
        <NullableImage
          alt="Main listing image"
          priority
          sizes="(max-width: 1023px) 100vw, 66vw"
          className="tw-w-full tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          image={listing.images[0]}
          onClick={() => {
            setShowImages(true);
          }}
        />
        <div
          className="tw-absolute tw-bottom-4 tw-left-1/2 -tw-translate-x-1/2 tw-flex sm:tw-hidden tw-bg-white hover:tw-bg-slate-200 tw-cursor-pointer tw-rounded-3xl tw-border tw-border-black tw-border-solid tw-px-3 tw-text-sm tw-font-medium tw-py-1 tw-w-fit tw-mt-4 tw-whitespace-nowrap"
          onClick={() => setShowImages(true)}
        >
          See all images →
        </div>
      </div>
      <div className="tw-relative tw-flex-col tw-w-1/3 tw-gap-2 tw-hidden lg:tw-flex">
        <div className="tw-relative tw-block tw-h-1/2 tw-w-full tw-bg-gray-100">
          <NullableImage
            alt="Listing image 2"
            sizes="33vw"
            className="tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
            image={listing.images[1]}
            onClick={() => {
              setShowImages(true);
            }}
          />
        </div>
        <div className="tw-relative tw-block tw-h-1/2 tw-w-full tw-bg-gray-100">
          <NullableImage
            alt="Listing image 3"
            sizes="33vw"
            className="tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
            image={listing.images[2]}
            onClick={() => {
              setShowImages(true);
            }}
          />
        </div>
        <div
          className="tw-absolute tw-bottom-3 tw-right-3 tw-bg-white hover:tw-bg-slate-200 tw-cursor-pointer tw-rounded-3xl tw-border tw-border-black tw-border-solid tw-px-3 tw-text-sm tw-font-medium tw-py-1"
          onClick={() => setShowImages(true)}
        >
          See all images →
        </div>
      </div>
    </div>
  );
};

const NullableImage: React.FC<{
  alt: string;
  image: ListingImage | undefined;
  sizes?: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}> = ({ image, ...props }) => {
  if (image) {
    return <Image {...props} src={getGcsImageUrl(image.storage_id)} fill />;
  } else {
    return <div></div>;
  }
};

function useBookingState(listing: ListingType) {
  const { user, openLoginModal } = useAuthContext();
  const [month, setMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Availability | null>(null);
  const [numGuests, setNumGuests] = useState<number>(1);

  var fetchStartDate: string, fetchEndDate: string;
  if (listing.availability_display === AvailabilityDisplay.Enum.calendar) {
    fetchStartDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split("T")[0];
    fetchEndDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split("T")[0];
  } else {
    fetchStartDate = new Date(month.getFullYear(), month.getMonth(), month.getDate()).toISOString().split("T")[0];
    fetchEndDate = new Date(month.getFullYear() + 1, month.getMonth(), month.getDate()).toISOString().split("T")[0];
  }
  const { availability, loading } = useAvailability(listing.id, fetchStartDate, fetchEndDate);

  const createCheckoutLink = useCreateCheckoutLink({
    onSuccess: (link) => {
      window.location.href = link;
    },
  });

  const tryToReserve = () => {
    if (user) {
      const utcDate = correctToUTC(startDate);
      if (utcDate == undefined) {
        // TODO: show error
        return;
      }

      var timeOnly: Date | undefined = undefined;
      if (listing.availability_type === AvailabilityType.Enum.datetime) {
        if (startTime == undefined) {
          // TODO: show error
          return;
        }
        timeOnly = ToTimeOnly(startTime.datetime);
      }

      if (!bookingSlot) {
        // TODO: this should not happen
        return;
      }

      if (numGuests > bookingSlot.capacity) {
        // TODO: show error
        return;
      }

      const payload = {
        listing_id: listing.id,
        start_date: utcDate,
        start_time: timeOnly,
        number_of_guests: numGuests,
      };

      createCheckoutLink.mutate(payload);
    } else {
      openLoginModal();
    }
  };

  const dateToTimeSlotMap = getDateToTimeSlotMap(availability);
  const timeSlots = startDate ? dateToTimeSlotMap.get(startDate.toLocaleDateString()) : undefined;
  const availableDates: Date[] = Array.from(dateToTimeSlotMap.keys()).map((dateString) => new Date(dateString));

  var bookingSlot: Availability | null = null;
  if (listing.availability_type === AvailabilityType.Enum.datetime) {
    bookingSlot = startTime;
  } else if (startDate !== undefined) {
    const slots = dateToTimeSlotMap.get(startDate.toLocaleDateString());

    if (slots === undefined || slots.length === 0) {
      // TODO: this should not happen
    } else {
      // Date-only listings should only have a single time slot per day
      bookingSlot = slots[0];
    }
  }

  const maxGuests = bookingSlot ? bookingSlot.capacity : listing.max_guests ? listing.max_guests : 99;

  return {
    month,
    setMonth,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    numGuests,
    setNumGuests,
    availabilityLoading: loading,
    createCheckoutLink,
    tryToReserve,
    availableDates,
    timeSlots,
    bookingSlot,
    maxGuests,
  };
}
