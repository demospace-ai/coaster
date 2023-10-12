import { RadioGroup } from "@headlessui/react";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import {
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeAltIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton, Button, LinkButton } from "src/components/button/Button";
import { DatePickerPopper, DatePickerSlider, correctToUTC } from "src/components/calendar/DatePicker";
import { Callout } from "src/components/callouts/Callout";
import { GuestNumberInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { useShowToast } from "src/components/notifications/Notifications";
import { ProfilePicture } from "src/components/profile/ProfilePicture";
import { useSelector } from "src/root/model";
import { useAvailability, useCreateCheckoutLink, useListing } from "src/rpc/data";
import { AvailabilityType, Host, ListingStatus, Listing as ListingType } from "src/rpc/types";
import { ToTimeOnly } from "src/utils/date";
import { getGcsImageUrl } from "src/utils/images";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";
import useWindowDimensions from "src/utils/window";

export const Listing: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing, error } = useListing(Number(listingID));

  if (!listing) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-px-5 tw-pt-5 sm:tw-pt-12 tw-pb-32 sm:tw-px-[5rem] lg:tw-px-[10rem] lg:tw-max-w-[90rem] lg:tw-mx-auto tw-text-base">
      <BackButton className="tw-mr-auto tw-mb-4" />
      {listing.status !== ListingStatus.Published && (
        <Callout content={"Not published - under review"} className="tw-border tw-border-yellow-400 tw-mb-4" />
      )}
      <ListingHeader listing={listing} />
      <ListingImages listing={listing} />
      <div className="tw-flex tw-mt-8 sm:tw-mt-12">
        <ListingDetails listing={listing} />
        <BookingPanel listing={listing} />
      </div>
      <ReserveFooter listing={listing} />
    </div>
  );
};

const ListingHeader: React.FC<{ listing: ListingType }> = ({ listing }) => {
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

const ReserveFooter: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const [month, setMonth] = useState<Date>(new Date()); // TODO: this should be the current month
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const { availability, loading } = useAvailability(listing.id, month);
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const navigate = useNavigate();
  const createCheckoutLink = useCreateCheckoutLink({
    onSuccess: (link) => {
      window.location.href = link;
    },
  });

  // TODO: where do you pick number of guests and start time on mobile??

  const timeSlotMap = getTimeSlotMap(availability);
  const timeSlots = startDate ? timeSlotMap.get(startDate.toLocaleDateString()) : undefined;

  const tryToReserve = () => {
    if (isAuthenticated) {
      const utcDate = correctToUTC(startDate);
      if (utcDate == undefined) {
        // TODO: show error
        return;
      }

      var timeOnly = undefined;
      if (listing.availability_type === AvailabilityType.Enum.datetime) {
        if (startTime == undefined) {
          // TODO: show error
          return;
        }
        timeOnly = ToTimeOnly(startTime);
      }

      const payload = {
        listing_id: listing.id,
        start_date: utcDate,
        start_time: timeOnly,
        number_of_guests: guests,
      };

      createCheckoutLink.mutate(payload);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="tw-fixed lg:tw-hidden tw-z-20 tw-bottom-0 tw-left-0 tw-flex tw-items-center tw-justify-between tw-bg-white tw-border-t tw-border-solid tw-border-gray-300 tw-h-20 tw-w-full tw-px-4">
      <div>
        <span className="tw-font-semibold">${listing.price}</span> per person
        <DatePickerSlider
          selected={startDate}
          onSelect={setStartDate}
          month={month}
          onMonthChange={setMonth}
          loading={loading}
          disabled={(day: Date) => {
            if (!availability) {
              return true;
            }

            for (const date of availability) {
              if (date.toDateString() === day.toDateString()) {
                return false;
              }
            }
            return true;
          }}
        />
      </div>
      <Button
        className="tw-font-medium tw-tracking-[0.5px] tw-py-2"
        disabled={!startDate || (listing.availability_type === AvailabilityType.Enum.datetime && !startTime)}
      >
        {createCheckoutLink.isLoading ? <Loading /> : "Reserve"}
      </Button>
    </div>
  );
};

const BookingPanel: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const [month, setMonth] = useState<Date>(new Date()); // TODO: this should be the current month
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const { availability, loading } = useAvailability(listing.id, month);
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const navigate = useNavigate();
  const createCheckoutLink = useCreateCheckoutLink({
    onSuccess: (link) => {
      window.location.href = link;
    },
  });

  const timeSlotMap = getTimeSlotMap(availability);
  const timeSlots = startDate ? timeSlotMap.get(startDate.toLocaleDateString()) : undefined;

  const tryToReserve = () => {
    if (isAuthenticated) {
      const utcDate = correctToUTC(startDate);
      if (utcDate == undefined) {
        // TODO: show error
        return;
      }

      var timeOnly = undefined;
      if (listing.availability_type === AvailabilityType.Enum.datetime) {
        if (startTime == undefined) {
          // TODO: show error
          return;
        }
        timeOnly = ToTimeOnly(startTime);
      }

      const payload = {
        listing_id: listing.id,
        start_date: utcDate,
        start_time: timeOnly,
        number_of_guests: guests,
      };

      createCheckoutLink.mutate(payload);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="tw-hidden lg:tw-flex tw-w-[40%] tw-min-w-[340px] tw-max-w-[400px]">
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
              if (!availability) {
                return true;
              }

              for (const date of availability) {
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
            maxGuests={listing.max_guests}
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
                key={timeSlot.toLocaleTimeString()}
                value={timeSlot}
                className={({ checked }) =>
                  mergeClasses(
                    "tw-px-2 tw-py-1 tw-cursor-pointer tw-rounded-lg tw-border tw-border-solid tw-border-gray-300",
                    checked && "tw-bg-blue-100",
                  )
                }
              >
                {timeSlot.toLocaleTimeString()}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )}
        <Button
          className="tw-font-medium tw-py-2 tw-mb-4 tw-tracking-[0.5px]"
          disabled={!startDate || (listing.availability_type === AvailabilityType.Enum.datetime && !startTime)}
          onClick={tryToReserve}
        >
          {createCheckoutLink.isLoading ? <Loading /> : "Reserve"}
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

const ListingDetails: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-flex tw-flex-col tw-w-full md:tw-w-[60%] md:tw-mr-16">
      <HostOverview listing={listing} />
      <QuickInfo listing={listing} />
      <Description listing={listing} />
      {listing.includes && listing.includes.length > 0 && <Included listing={listing} />}
      <HostDetails listing={listing} />
    </div>
  );
};

const HostDetails: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div>
      <div className="tw-mt-5 tw-flex tw-flex-row tw-items-center">
        <ProfilePicture
          url={listing.host.profile_picture_url}
          name={getHostName(listing.host)}
          className="tw-w-10 tw-h-10 tw-mr-4"
        />
        <div>
          <div className="tw-text-xl tw-font-medium">Meet your trip provider: {getHostName(listing.host)}</div>
          <div className="tw-flex tw-flex-row tw-items-center">
            <CheckBadgeIcon className="tw-h-4 tw-mr-1 tw-fill-green-600" />
            Identity Verified
          </div>
        </div>
      </div>
      <div className="tw-mt-4 tw-whitespace-pre-wrap">{listing.host.about}</div>
      <LinkButton
        className="tw-mt-6 tw-bg-white hover:tw-bg-gray-100 tw-text-black tw-border tw-border-solid tw-border-black tw-w-fit tw-px-8"
        href={`mailto:${listing.host.email}?subject=Question about your trip`}
      >
        Contact
      </LinkButton>
    </div>
  );
};

const Description: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">About</div>
      <div className="tw-mt-2 tw-whitespace-pre-wrap">{listing.description}</div>
    </div>
  );
};

const Included: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">What's included</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-1">
        {listing.includes?.map((included) => (
          <li key={included}>{included}</li>
        ))}
      </ul>
    </div>
  );
};

const Highlights: React.FC<{ listing: ListingType }> = ({ listing }) => {
  return (
    <div className="tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300">
      <div className="tw-mt-5 tw-font-semibold">Highlights</div>
      <ul className="tw-list-disc tw-list-inside tw-mt-1">
        {listing.highlights?.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </div>
  );
};

const QuickInfo: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const duration = getDuration(listing);
  const maxGuests = getMaxGuests(listing);

  return (
    <div className="tw-border-b tw-border-solid tw-border-gray-300 tw-mt-6 tw-pb-2">
      <div className="tw-flex tw-items-center tw-mb-6">
        <StarIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex tw-flex-col">
          <span className="tw-font-medium">Professional guide</span>
          <span className="tw-text-sm">Our guides are committed to providing a great experience.</span>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <ClockIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex tw-flex-col">
          <div className="tw-flex">
            <span className="tw-font-medium tw-mr-1.5">Duration:</span>
            {duration}
          </div>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-my-6">
        <UserGroupIcon className="tw-h-6 tw-mr-4" />
        <div className="tw-flex">
          <span className="tw-font-medium tw-mr-1.5">Max guests: </span>
          {maxGuests}
        </div>
      </div>
    </div>
  );
};

const HostOverview: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const languages = listing.languages ? listing.languages.join(", ") : "English";
  return (
    <div className="tw-flex tw-items-center tw-pb-6 tw-border-b tw-border-solid tw-border-gray-300 tw-justify-between">
      <div>
        <div className="tw-text-xl sm:tw-text-2xl tw-font-medium">Provided by {getHostName(listing.host)}</div>
        <div className="tw-flex tw-items-center tw-mt-1">
          <GlobeAltIcon className="tw-h-5 tw-mr-1.5" />
          {languages}
        </div>
      </div>
      <ProfilePicture
        url={listing.host.profile_picture_url}
        name={getHostName(listing.host)}
        className="tw-w-12 tw-h-12"
      />
    </div>
  );
};

const ImagesModal: React.FC<{ listing: ListingType; imageIndex: number; setImageIndex: (index: number) => void }> = ({
  listing,
  imageIndex,
  setImageIndex,
}) => {
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
      <div className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 tw-w-full tw-z-10 tw-flex tw-items-center">
        <button
          className="tw-fixed tw-right-0 sm:tw-right-[5vw] sm:tw-p-10"
          onClick={(e) => {
            e.stopPropagation();
            scrollForward();
          }}
        >
          <ChevronRightIcon className="tw-h-10 tw-cursor-pointer tw-stroke-slate-300" />
        </button>
        <button
          className="tw-fixed tw-left-0 sm:tw-left-[5vw] sm:tw-p-10"
          onClick={(e) => {
            e.stopPropagation();
            scrollBack();
          }}
        >
          <ChevronLeftIcon className="tw-h-10 tw-cursor-pointer tw-stroke-slate-300" />
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
                src={getGcsImageUrl(image)}
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

const ListingImages: React.FC<{ listing: ListingType }> = ({ listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showImages, setShowImages] = useState(false);

  return (
    <div className="tw-flex tw-max-h-[50vh] tw-min-h-[50vh] tw-rounded-xl tw-overflow-clip">
      <Modal
        show={showImages}
        close={() => {
          setShowImages(false);
        }}
        noContainer
      >
        <ImagesModal listing={listing} imageIndex={imageIndex} setImageIndex={setImageIndex} />
      </Modal>
      <div className="tw-relative tw-flex tw-w-full sm:tw-w-3/4 sm:tw-mr-2">
        <img
          className="tw-w-full tw-max-h-full tw-aspect-square tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 0 ? getGcsImageUrl(listing.images[0]) : "TODO"}
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
      <div className="tw-relative tw-flex-col tw-w-1/4 tw-gap-2 tw-hidden sm:tw-flex">
        <img
          className="tw-h-1/2 tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 1 ? getGcsImageUrl(listing.images[1]) : "TODO"}
          onClick={() => {
            setImageIndex(1);
            setShowImages(true);
          }}
        />
        <img
          className="tw-h-1/2 tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-cursor-pointer tw-transition-all tw-duration-100"
          src={listing.images.length > 2 ? getGcsImageUrl(listing.images[2]) : "TODO"}
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

const getMaxGuests = (listing: ListingType) => {
  if (listing.max_guests) {
    return listing.max_guests;
  } else {
    return "not specified";
  }
};

const getDuration = (listing: ListingType) => {
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

const getShortDescription = (listing: ListingType) => {
  let shortDescription = "An unforgettable experience"; // TODO: this should never happen
  if (listing.short_description) {
    shortDescription = listing.short_description;
  } else {
    if (listing.description) {
      const shortened = listing.description.substring(0, 200);
      if (shortened && shortened.length >= 200) {
        shortDescription = shortened.concat("...");
      } else {
        shortDescription = shortened;
      }
    }
  }
  return shortDescription;
};

const getHostName = (host: Host) => {
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

const getTimeSlotMap = (availability: Date[] | undefined) => {
  const timeSlotMap = new Map<string, Date[]>();
  if (availability) {
    for (const date of availability) {
      const dateString = date.toLocaleDateString();
      const existing = timeSlotMap.get(dateString);
      if (existing) {
        existing.push(date);
      } else {
        timeSlotMap.set(dateString, [date]);
      }
    }
  }
  return timeSlotMap;
};
