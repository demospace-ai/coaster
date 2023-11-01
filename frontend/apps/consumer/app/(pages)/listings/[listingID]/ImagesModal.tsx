"use client";

import { Listing as ListingType } from "@coaster/types";
import { useDebounce, useWindowDimensions } from "@coaster/utils/client";
import { getGcsImageUrl, mergeClasses } from "@coaster/utils/common";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export const ImagesModal: React.FC<{
  show: boolean;
  close: () => void;
  listing: ListingType;
}> = ({ show, close, listing }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const { width } = useWindowDimensions();
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = useDebounce(
    useCallback(() => {
      if (carouselRef.current) {
        const newIndex = Math.round(carouselRef.current.scrollLeft / width);
        setImageIndex(newIndex);
      }
    }, [width]),
    500,
  );

  const scrollForward = () => {
    const newIndex = (imageIndex + 1) % listing.images.length;
    setImageIndex(newIndex);
    carouselRef.current?.scrollTo({ left: width * newIndex, behavior: "smooth" });
  };

  const scrollBack = () => {
    const newIndex = (imageIndex - 1) % listing.images.length;
    setImageIndex(newIndex);
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
    document.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      carouselRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [carouselRef, handleScroll]);

  return (
    <>
      <Transition
        show={show}
        as={Fragment}
        enter="tw-ease-in tw-duration-150"
        enterFrom="tw-opacity-0"
        enterTo="tw-opacity-100"
        leave="tw-ease-in tw-duration-200"
        leaveFrom="tw-opacity-100"
        leaveTo="tw-opacity-0"
      >
        <Dialog
          className={mergeClasses(
            "tw-fixed tw-z-50 tw-overscroll-contain tw-top-0 tw-left-0 tw-h-full tw-w-full tw-backdrop-blur-sm tw-bg-black tw-bg-opacity-50", // z-index is tied to NotificationProvider z-index (toast should be bigger)
          )}
          onClose={close}
        >
          <button
            className="tw-flex tw-absolute tw-z-20 tw-top-4 sm:tw-top-8 tw-right-4 sm:tw-right-8 tw-bg-transparent tw-border-none tw-cursor-pointer tw-p-0 tw-justify-center tw-items-center"
            onClick={(e) => {
              e.preventDefault();
              close();
            }}
          >
            <XMarkIcon className="tw-h-10 tw-stroke-white" />
          </button>
          <Transition.Child
            as={Fragment}
            enter="tw-ease-in tw-duration-100"
            enterFrom="tw-scale-95"
            enterTo="tw-scale-100"
            leave="tw-ease-in tw-duration-200"
            leaveFrom="tw-scale-100"
            leaveTo="tw-scale-95"
          >
            <Dialog.Panel>
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
                    <div className="tw-relative tw-block tw-w-screen sm:tw-w-[90vw] tw-px-10 sm:tw-px-0 tw-h-full">
                      <Image
                        fill
                        sizes="100vw"
                        alt="Listing image"
                        className="!tw-w-fit !tw-left-1/2 -tw-translate-x-1/2 tw-object-contain tw-cursor-pointer tw-rounded-xl tw-overflow-hidden"
                        src={getGcsImageUrl(image.storage_id)}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};
