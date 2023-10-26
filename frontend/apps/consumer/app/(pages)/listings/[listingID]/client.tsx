"use client";

import {
  Button,
  DatePickerPopper,
  DateRangePicker,
  GuestNumberInput,
  Loading,
  Modal,
  correctFromUTC,
  correctToUTC,
  useShowToast,
} from "@coaster/components/client";
import { useAvailability, useCreateCheckoutLink } from "@coaster/rpc/client";
import { Availability, AvailabilityType, Listing as ListingType, User } from "@coaster/rpc/common";
import { useDispatch } from "@coaster/state";
import { ToTimeOnly, getGcsImageUrl, mergeClasses, toTitleCase, useWindowDimensions } from "@coaster/utils";
import { Dialog, Disclosure, RadioGroup, Transition } from "@headlessui/react";
import {
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getDateToTimeSlotMap } from "consumer/app/(pages)/listings/[listingID]/utils";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export const ListingHeader: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const showToast = useShowToast();

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
          showToast("success", "Copied link to clipboard", 2000);
        }}
      >
        <ArrowUpOnSquareIcon className="tw-h-6 sm:tw-h-7" />
      </div>
    </div>
  );
};

export const ReserveSlider: React.FC<{
  user: User | undefined;
  listing: ListingType;
  className?: string;
  buttonClass?: string;
}> = ({ listing, className, user }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date()); // TODO: this should be the current month
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Availability | null>(null);
  const [numGuests, setNumGuests] = useState<number>(0);
  const { availability, loading } = useAvailability(listing.id, month);
  const dispatch = useDispatch();
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
      dispatch({ type: "login.openLogin" });
    }
  };

  const dateToTimeSlotMap = getDateToTimeSlotMap(availability);
  const timeSlots = startDate ? dateToTimeSlotMap.get(startDate.toLocaleDateString()) : undefined;
  const correctedAvailability: Date[] = availability ? availability.map((slot) => correctFromUTC(slot.datetime)) : [];

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
                    onClick={(e) => {
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
                          <span>{startDate ? startDate.toLocaleDateString() : "Choose start date"}</span>
                          <ChevronUpIcon
                            className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="tw-flex tw-flex-col tw-w-full tw-items-center tw-pb-4 sm:tw-pb-0">
                          <DateRangePicker
                            mode="single"
                            disabled={(day: Date) => {
                              // TODO: this should account for the capacity and number of guests selected
                              const today = new Date();
                              if (day < today) {
                                return false;
                              }

                              for (const date of correctedAvailability) {
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
                            components={loading ? { Day: () => <Loading className="tw-opacity-30" /> } : {}}
                          />
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
                              <span>{startTime ? startTime.datetime.toLocaleTimeString() : "Choose start time"}</span>
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
                                className="tw-flex tw-columns-3 tw-justify-start tw-gap-3 tw-mt-4"
                              >
                                {timeSlots.map((timeSlot) => (
                                  <RadioGroup.Option
                                    key={timeSlot.datetime.toLocaleTimeString()}
                                    value={timeSlot}
                                    className={({ checked }) =>
                                      mergeClasses(
                                        "tw-px-3 tw-py-2 tw-cursor-pointer tw-rounded-lg tw-border tw-border-solid tw-border-gray-300",
                                        checked && "tw-bg-blue-100",
                                      )
                                    }
                                  >
                                    {timeSlot.datetime.toLocaleTimeString()}
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
                                  setNumGuests(Math.max(0, numGuests - 1));
                                }}
                              >
                                <MinusCircleIcon
                                  className={mergeClasses(
                                    "tw-w-6 tw-cursor-pointer tw-stroke-gray-700 hover:tw-stroke-black",
                                    numGuests === 0 && "!tw-stroke-gray-300 tw-cursor-not-allowed",
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

export const BookingPanel: React.FC<{ user: User | undefined; listing: ListingType }> = ({ user, listing }) => {
  const [month, setMonth] = useState<Date>(new Date()); // TODO: this should be the current month
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Availability | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const { availability, loading } = useAvailability(listing.id, month);
  const dispatch = useDispatch();
  const createCheckoutLink = useCreateCheckoutLink({
    onSuccess: (link) => {
      window.location.href = link;
    },
  });

  const dateToTimeSlotMap = getDateToTimeSlotMap(availability);
  const timeSlots = startDate ? dateToTimeSlotMap.get(startDate.toLocaleDateString()) : undefined;
  const correctedAvailability: Date[] = availability ? availability.map((slot) => correctFromUTC(slot.datetime)) : [];

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

      if (guests > bookingSlot.capacity) {
        // TODO: show error
        return;
      }

      const payload = {
        listing_id: listing.id,
        start_date: utcDate,
        start_time: timeOnly,
        number_of_guests: guests,
      };

      createCheckoutLink.mutate(payload);
    } else {
      dispatch({ type: "login.openLogin" });
    }
  };

  return (
    <div className="tw-hidden lg:tw-flex tw-w-[400px] tw-min-w-[400px] tw-max-w-[400px]">
      <div className="tw-sticky tw-top-32 tw-flex tw-flex-col tw-px-8 tw-py-6 tw-w-full tw-h-fit tw-border tw-border-solid tw-border-gray-300 tw-rounded-xl tw-shadow-centered-sm">
        <div>
          <span className="tw-text-2xl tw-font-semibold tw-mb-3">${listing.price}</span> per person
        </div>
        <div className="tw-flex tw-w-full tw-mt-3 tw-mb-5">
          <DatePickerPopper
            className="tw-w-3/4 tw-mr-2"
            selected={startDate}
            onSelect={setStartDate}
            month={month}
            onMonthChange={setMonth}
            loading={loading}
            disabled={(day: Date) => {
              // TODO: this should account for the capacity and number of guests selected
              const today = new Date();
              if (day < today) {
                return false;
              }
              for (const date of correctedAvailability) {
                if (date.toDateString() === day.toDateString()) {
                  return false;
                }
              }
              return true;
            }}
            buttonClass="tw-w-full tw-h-12"
          />
          <GuestNumberInput
            value={guests}
            setValue={setGuests}
            maxGuests={bookingSlot ? bookingSlot.capacity : listing.max_guests}
            className="tw-w-1/4 tw-min-w-[80px]"
          />
        </div>
        {listing.availability_type === AvailabilityType.Enum.datetime && timeSlots != undefined && (
          <RadioGroup
            value={startTime ? startTime : null}
            onChange={setStartTime}
            className="tw-flex tw-columns-3 tw-justify-start tw-gap-3 tw-mb-5"
          >
            {timeSlots.map((timeSlot) => (
              <RadioGroup.Option
                key={timeSlot.datetime.toLocaleTimeString()}
                value={timeSlot}
                className={({ checked }) =>
                  mergeClasses(
                    "tw-px-2 tw-py-1 tw-cursor-pointer tw-rounded-lg tw-border tw-border-solid tw-border-gray-300",
                    checked && "tw-bg-blue-100",
                  )
                }
              >
                {timeSlot.datetime.toLocaleTimeString()}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )}
        <Button
          className="tw-font-medium tw-mb-4 tw-tracking-[0.5px] tw-h-10"
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

export const ImagesModal: React.FC<{
  listing: ListingType;
  imageIndex: number;
  setImageIndex: (index: number) => void;
}> = ({ listing, imageIndex, setImageIndex }) => {
  const [scrolledToIndex, setScrolledToIndex] = useState(0);
  const { width } = useWindowDimensions();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrolledToIndex !== imageIndex) {
      setScrolledToIndex(imageIndex);
      carouselRef.current?.scrollTo({ left: width * imageIndex, behavior: "smooth" });
    }
  }, [imageIndex]);

  const handleScroll = useCallback(() => {
    if (carouselRef.current) {
      const newIndex = Math.round(carouselRef.current.scrollLeft / width);
      setImageIndex(newIndex);
      setScrolledToIndex(newIndex);
    }
  }, []);

  const scrollForward = () => {
    const newIndex = (imageIndex + 1) % listing.images.length;
    setImageIndex(newIndex);
    setScrolledToIndex(newIndex);
    carouselRef.current?.scrollTo({ left: width * newIndex, behavior: "smooth" });
  };

  const scrollBack = () => {
    const newIndex = (imageIndex - 1) % listing.images.length;
    setImageIndex(newIndex);
    setScrolledToIndex(newIndex);
    carouselRef.current?.scrollTo({ left: width * newIndex, behavior: "smooth" });
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        scrollForward();
      } else if (event.key === "ArrowLeft") {
        scrollBack();
      }
    },
    [imageIndex],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Use effect to attach to the scrollend event rather than just every scroll
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scrollend", handleScroll);
      carouselRef.current.addEventListener("touchend", handleScroll);
    }
    return () => {
      carouselRef.current?.removeEventListener("scrollend", handleScroll);
      carouselRef.current?.removeEventListener("touchend", handleScroll);
    };
  }, [carouselRef, handleScroll]);

  return (
    <div>
      <div className="tw-absolute tw-w-full tw-h-screen tw-z-10 tw-flex tw-items-center tw-pointer-events-none">
        <button
          className="tw-fixed tw-right-1 sm:tw-right-[5vw] sm:tw-p-10 tw-rounded-full hover:tw-bg-black hover:tw-bg-opacity-20 tw-transition-colors tw-pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            scrollForward();
          }}
        >
          <ChevronRightIcon className="tw-h-8 sm:tw-h-10 tw-cursor-pointer tw-stroke-slate-300" />
        </button>
        <button
          className="tw-fixed tw-left-1 sm:tw-left-[5vw] sm:tw-p-10 tw-rounded-full hover:tw-bg-black hover:tw-bg-opacity-20 tw-transition-colors tw-pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            scrollBack();
          }}
        >
          <ChevronLeftIcon className="tw-h-8 sm:tw-h-10 tw-cursor-pointer tw-stroke-slate-300" />
        </button>
      </div>
      <div
        ref={carouselRef}
        className="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-flex tw-pt-[10vh] tw-h-[90vh] tw-w-screen sm:tw-w-[90vw] tw-overflow-x-auto tw-snap-mandatory tw-snap-x tw-items-center tw-hide-scrollbar"
      >
        {listing.images.map((image) => (
          <div key={image.id} className="tw-flex tw-basis-full tw-snap-center tw-h-full">
            <div className="tw-flex tw-w-screen sm:tw-w-[90vw] tw-px-10 sm:tw-px-0 tw-h-full tw-justify-center tw-items-center">
              <img
                className="tw-flex tw-max-h-full tw-object-contain tw-cursor-pointer tw-rounded-xl tw-overflow-hidden"
                src={getGcsImageUrl(image.storage_id)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListingImages: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showImages, setShowImages] = useState(false);

  return (
    <div className="tw-flex tw-max-h-[560px] tw-rounded-xl tw-overflow-clip">
      <Modal
        show={showImages}
        close={() => {
          setShowImages(false);
        }}
        noContainer
      >
        <ImagesModal listing={listing} imageIndex={imageIndex} setImageIndex={setImageIndex} />
      </Modal>
      <div className="tw-relative tw-flex tw-w-full sm:tw-w-2/3 sm:tw-mr-2">
        <img
          className="tw-w-full tw-aspect-square tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 0 ? getGcsImageUrl(listing.images[0].storage_id) : "TODO"}
          onClick={() => {
            setImageIndex(0);
            setShowImages(true);
          }}
        />
        <div
          className="tw-absolute tw-bottom-4 tw-left-1/2 -tw-translate-x-1/2 tw-flex sm:tw-hidden tw-bg-white hover:tw-bg-slate-200 tw-cursor-pointer tw-rounded-3xl tw-border tw-border-black tw-border-solid tw-px-3 tw-text-sm tw-font-medium tw-py-1 tw-w-fit tw-mt-4"
          onClick={() => setShowImages(true)}
        >
          See all images →
        </div>
      </div>
      <div className="tw-relative tw-flex-col tw-w-1/3 tw-gap-2 tw-hidden sm:tw-flex">
        <img
          className="tw-h-1/2 tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 1 ? getGcsImageUrl(listing.images[1].storage_id) : "TODO"}
          onClick={() => {
            setImageIndex(1);
            setShowImages(true);
          }}
        />
        <img
          className="tw-h-1/2 tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 2 ? getGcsImageUrl(listing.images[2].storage_id) : "TODO"}
          onClick={() => {
            setImageIndex(2);
            setShowImages(true);
          }}
        />
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
