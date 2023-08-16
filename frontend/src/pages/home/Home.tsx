import { zodResolver } from "@hookform/resolvers/zod";
import isValidPhoneNumber from "libphonenumber-js";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button/Button";
import {
  CampingIcon,
  ClimbingIcon,
  CyclingIcon,
  DivingIcon,
  FishingIcon,
  HikingIcon,
  KayakIcon,
  SkiingIcon,
  SnowmobileIcon,
  SurfingIcon,
  YogaIcon,
} from "src/components/icons/Icons";
import { Image } from "src/components/images/Image";
import Hero from "src/components/images/hero.webp";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { SearchResult } from "src/pages/search/Search";
import { sendRequest } from "src/rpc/ajax";
import { JoinWaitlist } from "src/rpc/api";
import { useFeatured } from "src/rpc/data";
import { Listing } from "src/rpc/types";
import { mergeClasses } from "src/utils/twmerge";
import { z } from "zod";

export const Home: React.FC = () => {
  const { featured } = useFeatured();

  if (!featured) {
    return <Loading />;
  }

  if (featured.length >= 0) {
    return <ComingSoon />;
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 sm:tw-pt-5 tw-pb-24 tw-px-5 sm:tw-px-20">
      <CategorySelector />
      <div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 2xl:tw-grid-cols-5 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10">
          {featured.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategorySelector: React.FC = () => {
  const categoryIcon =
    "tw-flex tw-flex-col tw-items-center tw-cursor-pointer tw-select-none hover:tw-border-b-2 hover:-tw-mb-2 tw-pb-1 tw-border-solid tw-border-slate-700 tw-mx-1";

  return (
    <div className="tw-mx-[-4px] tw-flex tw-w-full tw-overflow-scroll tw-pt-4 tw-pb-6">
      <div className="tw-flex tw-h-full tw-flex-1 tw-gap-8 tw-justify-between">
        <div className={categoryIcon}>
          <SkiingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Skiing</span>
        </div>
        <div className={categoryIcon}>
          <SurfingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Surfing</span>
        </div>
        <div className={categoryIcon}>
          <FishingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Fishing</span>
        </div>
        <div className={categoryIcon}>
          <HikingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Hiking</span>
        </div>
        <div className={categoryIcon}>
          <CampingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Camping</span>
        </div>
        <div className={categoryIcon}>
          <CyclingIcon className="tw-w-10 tw-h-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Cycling</span>
        </div>
        <div className={categoryIcon}>
          <DivingIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Diving</span>
        </div>
        <div className={categoryIcon}>
          <ClimbingIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Climbing</span>
        </div>
        <div className={categoryIcon}>
          <YogaIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Yoga</span>
        </div>
        <div className={categoryIcon}>
          <KayakIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Kayak</span>
        </div>
        <div className={categoryIcon}>
          <SnowmobileIcon className="tw-h-10 tw-w-10" />
          <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">Snowmobile</span>
        </div>
      </div>
    </div>
  );
};

export const ComingSoon: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const waitlistSchema = z.object({
    phone: z.string().refine((value) => isValidPhoneNumber(value, "US") !== undefined),
  });
  type WaitlistSchemaType = z.infer<typeof waitlistSchema>;
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<WaitlistSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(waitlistSchema),
  });

  const joinWaitlist = async (data: { phone: string }) => {
    await sendRequest(JoinWaitlist, { payload: { phone: data.phone } });
    setJoined(true);
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-h-full">
      <Modal show={showWaitlist} close={() => setShowWaitlist(false)} clickToEscape={true}>
        <div className="tw-w-[320px] sm:tw-w-[400px] tw-h-[200px] tw-px-10 sm:tw-px-20 tw-pb-20">
          {joined ? (
            <div className="tw-mt-5 tw-flex tw-flex-col tw-items-center tw-justify-center">
              <div className="tw-text-center tw-w-full tw-text-2xl tw-font-bold">You're on the list!</div>
              <div className="tw-text-center tw-mt-2">We'll let you know when you can get started.</div>
            </div>
          ) : (
            <>
              <div className="tw-text-center tw-w-full tw-text-2xl tw-font-bold tw-mb-3">Join waitlist</div>
              <Input
                label="Phone number"
                type="tel"
                className={mergeClasses("tw-mb-2", errors.phone && "tw-border-red-600 hover:tw-border-red-600")}
                {...register("phone")}
              />
              <Button
                className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-bg-[#a6701d] hover:tw-bg-[#824f00] tw-w-full"
                onClick={handleSubmit(joinWaitlist)}
              >
                Join waitlist
              </Button>
            </>
          )}
        </div>
      </Modal>
      <div className="tw-top-0 tw-w-[100vw] tw-h-[100vh] tw-absolute tw-object-cover tw-bg-[linear-gradient(0deg,_#fdfcfb_0%,_#f9e7d9_100%)]" />
      <div className="tw-z-10 tw-flex tw-flex-col tw-w-full tw-h-full tw-justify-center tw-items-center tw-mt-10">
        <div className="tw-flex tw-w-fit tw-font-bold tw-text-[2.5rem] sm:tw-text-8xl tw-font-[Lateef] tw-text-center">
          Adventure starts here
        </div>
        <div className="tw-flex tw-w-80 sm:tw-w-fit tw-font-medium tw-text-3xl tw-font-[Lateef] tw-text-center">
          Discover fully planned trips led by professional guides.
        </div>
        <div className="tw-flex tw-items-center tw-gap-2 tw-mt-5">
          <Button
            className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-bg-[#a6701d] hover:tw-bg-[#824f00] tw-px-8"
            onClick={() => setShowWaitlist(true)}
          >
            Request access
          </Button>
        </div>
        <Image src={Hero} className="tw-mt-10 sm:tw-rounded-xl tw-object-cover tw-h-[400px]" />
      </div>
    </div>
  );
};
