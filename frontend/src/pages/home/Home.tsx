import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { FormError } from "src/components/FormError";
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
import Hero from "src/components/images/hero.webp";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { SearchResult } from "src/pages/search/Search";
import { useSelector } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { JoinWaitlist } from "src/rpc/api";
import { Listing } from "src/rpc/types";
import { z } from "zod";

export const Home: React.FC = () => {
  // const { featured } = useFeatured();
  const featured = [];

  // TODO: launch
  if (true) {
    return <ComingSoon />;
  }

  if (!featured) {
    return <Loading />;
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 sm:tw-pt-5 tw-pb-24 tw-px-5 sm:tw-px-20">
      <CategorySelector />
      <div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 2xl:tw-grid-cols-5 tw-mt-1 sm:tw-mt-4 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10 tw-w-full">
          {featured?.map((listing: Listing) => (
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
    <div className="tw-mx-[-4px] tw-flex tw-w-full tw-overflow-auto tw-pt-4 tw-pb-6">
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
  const isAuthenticated = useSelector((state) => state.login.authenticated);
  const [showWaitlist, setShowWaitlist] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const waitlistSchema = z.object({
    email: z.string().email(),
  });
  type WaitlistSchemaType = z.infer<typeof waitlistSchema>;
  const {
    handleSubmit,
    register,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<WaitlistSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(waitlistSchema),
  });

  const joinWaitlist = async (data: { email: string }) => {
    await sendRequest(JoinWaitlist, { payload: { email: data.email } });
    setJoined(true);
  };

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-h-full">
      <Modal
        show={showWaitlist}
        close={() => {
          setShowWaitlist(false);
          clearErrors();
        }}
        clickToEscape={true}
      >
        <div className="tw-w-[320px] sm:tw-w-[420px] tw-px-8 sm:tw-px-12 tw-pb-10">
          {joined ? (
            <div className="tw-mt-10 tw-flex tw-flex-col tw-items-center tw-justify-center">
              <div className="tw-text-center tw-w-full tw-text-2xl tw-font-bold">You're on the list!</div>
              <div className="tw-text-center tw-mt-2 tw-pb-10">We'll let you know when you can get started.</div>
            </div>
          ) : (
            <>
              <div className="tw-text-center tw-w-full tw-text-2xl tw-font-bold tw-mb-2">Join waitlist</div>
              <div className="tw-text-center tw-w-full tw-mb-4">Coaster is currently invite only.</div>
              <Input
                value={watch("email")}
                label="Email"
                className={errors.email && "tw-border-red-600 hover:tw-border-red-600"}
                {...register("email")}
              />
              <FormError message={errors.email?.message} />
              <Button
                className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-w-full tw-bg-blue-700 hover:tw-bg-blue-900 tw-mt-4"
                onClick={handleSubmit(joinWaitlist)}
              >
                Join waitlist
              </Button>
            </>
          )}
        </div>
      </Modal>
      <div
        className="tw-flex tw-flex-col tw-w-screen tw-h-screen tw-justify-center tw-items-center tw-bg-top tw-bg-cover"
        style={{ backgroundImage: `url(${Hero})` }}
      >
        <div className="tw-flex tw-w-80 sm:tw-w-fit tw-font-semibold tw-text-5xl tw-font-[Lateef] tw-text-center -tw-mt-24 sm:-tw-mt-32">
          Explore the world with local guides
        </div>
        <div className="tw-flex tw-items-center tw-mt-8">
          {isAuthenticated ? (
            <NavLink
              className="tw-flex tw-h-[52px] tw-w-48 tw-rounded-xl tw-font-bold tw-tracking-[1px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-px-8 tw-bg-transparent tw-border-black tw-border-solid tw-border-2 hover:tw-bg-[rgba(0,0,0,0.2)] tw-text-black"
              to="/profile"
            >
              Dashboard
            </NavLink>
          ) : (
            <>
              <Button
                className="tw-flex tw-h-[52px] tw-w-32 sm:tw-w-48 tw-rounded-l-xl tw-rounded-r-none tw-items-center tw-justify-center tw-whitespace-nowrap tw-px-8 tw-bg-transparent tw-border-black tw-border-solid tw-border-2 hover:tw-bg-[rgba(0,0,0,0.2)] tw-text-black"
                onClick={() => setShowWaitlist(true)}
              >
                Join
              </Button>
              <NavLink
                className="tw-flex tw-h-[52px] tw-w-32 sm:tw-w-48 tw-rounded-r-xl tw-font-bold tw-tracking-[1px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-px-8 tw-bg-transparent tw-border-black tw-border-solid tw-border-r-2 tw-border-b-2 tw-border-t-2 hover:tw-bg-[rgba(0,0,0,0.2)] tw-text-black"
                to="/login?destination=profile"
              >
                Sign In
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
