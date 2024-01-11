"use client";

import { Loading } from "@coaster/components/loading/Loading";
import { Image as ImageType, Listing as ListingType } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";

export const ImagesModal: React.FC<{
  show: boolean;
  close: () => void;
  listing: ListingType;
  initialIndex: number;
}> = ({ show, close, listing, initialIndex }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (emblaApi) emblaApi.scrollTo(initialIndex, true);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        scrollNext();
      } else if (event.key === "ArrowLeft") {
        scrollPrev();
      }
    },
    [scrollNext, scrollPrev],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
            "tw-fixed tw-left-0 tw-top-0 tw-z-50 tw-h-full tw-w-full tw-overscroll-contain tw-bg-black tw-bg-opacity-50 tw-backdrop-blur-sm", // z-index is tied to NotificationProvider z-index (toast should be bigger)
          )}
          onClose={close}
        >
          <button
            className="tw-absolute tw-right-4 tw-top-4 tw-z-20 tw-flex tw-cursor-pointer tw-items-center tw-justify-center tw-border-none tw-bg-transparent tw-p-0 sm:tw-right-8 sm:tw-top-8"
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
              <div ref={emblaRef} className="tw-overflow-hidden">
                <div className="tw-flex">
                  {listing.images.map((image) => (
                    <div
                      key={image.id}
                      className="tw-flex tw-h-[90vh] tw-w-screen tw-shrink-0 tw-items-center tw-justify-center tw-pt-[10vh]"
                    >
                      <LoadingImage image={image} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="tw-pointer-events-none tw-absolute tw-top-0 tw-z-10 tw-flex tw-h-[90vh] tw-w-full tw-items-center tw-pt-[10vh]">
                <button
                  className="tw-pointer-events-auto tw-fixed tw-right-1 tw-rounded-full tw-transition-colors hover:tw-bg-black hover:tw-bg-opacity-20 sm:tw-right-[5vw] sm:tw-p-10"
                  onClick={scrollNext}
                >
                  <ChevronRightIcon className="tw-h-8 tw-cursor-pointer tw-stroke-slate-300 sm:tw-h-10" />
                </button>
                <button
                  className="tw-pointer-events-auto tw-fixed tw-left-1 tw-rounded-full tw-transition-colors hover:tw-bg-black hover:tw-bg-opacity-20 sm:tw-left-[5vw] sm:tw-p-10"
                  onClick={scrollPrev}
                >
                  <ChevronLeftIcon className="tw-h-8 tw-cursor-pointer tw-stroke-slate-300 sm:tw-h-10" />
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

const LoadingImage: React.FC<{ image: ImageType }> = ({ image }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="tw-absolute tw-h-full tw-w-full">
          <Loading light className="tw-absolute tw-left-1/2 tw-top-1/2 tw-z-10 -tw-ml-6 -tw-mt-6 tw-h-12 tw-w-12" />
        </div>
      )}
      <Image
        width={image.width}
        height={image.height}
        onLoad={() => setLoaded(true)}
        sizes="50vw"
        alt="Listing image"
        className="tw-h-full tw-max-h-[70vh] tw-w-screen tw-object-contain sm:tw-max-h-full sm:tw-w-[90vw]"
        src={image.url}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </>
  );
};
