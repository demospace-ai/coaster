"use client";

import AdventureGuarantee from "@coaster/assets/adventure-guarantee.jpg";
import CuratedExperiences from "@coaster/assets/curated-experiences.jpg";
import FreeCancellation from "@coaster/assets/free-cancellation.jpg";
import SustainableTravel from "@coaster/assets/sustainable-travel.jpg";
import { ProfilePlaceholder } from "@coaster/components/profile/ProfilePicture";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { Listing } from "@coaster/types";
import { lateef, mergeClasses } from "@coaster/utils/common";
import {
  ArrowRightIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Post, urlFor } from "app/(pages)/blog/utils";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useCallback, useEffect, useState } from "react";

export const ListingsSectionClient: React.FC<{
  title: string;
  listings: Listing[];
  searchQuery: string | undefined;
}> = ({ title, listings, searchQuery }) => {
  const [showBack, setShowBack] = useState(false);
  const [showForward, setShowForward] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
  });
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      setShowBack(emblaApi.canScrollPrev());
      setShowForward(emblaApi.canScrollNext());
      emblaApi.on("select", () => {
        setShowBack(emblaApi.canScrollPrev());
        setShowForward(emblaApi.canScrollNext());
      });
    }
  }, [emblaApi]);

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-mb-5">
      <div className="tw-flex tw-w-full tw-justify-between tw-items-center">
        <div className="tw-text-xl sm:tw-text-2xl tw-mr-5 tw-font-minion">{title}</div>
        {searchQuery && (
          <Link className="tw-flex tw-font-medium tw-items-center tw-pt-1" href={`/search?${searchQuery}`}>
            <span className="tw-underline tw-whitespace-nowrap">View all</span>
            <ArrowRightIcon className="tw-ml-2 tw-h-4 tw-w-4" />
          </Link>
        )}
      </div>
      <div className="tw-relative tw-w-full tw-mt-3 sm:tw-mt-4">
        <div ref={emblaRef} className="tw-w-full tw-overflow-hidden">
          <div className="tw-flex tw-font-bold tw-text-3xl tw-gap-5 sm:tw-gap-10 tw-w-full">
            {listings ? (
              <>
                {listings?.map((listing: Listing) => (
                  <SearchResult
                    key={listing.id}
                    listing={listing}
                    className="tw-w-[75vw] xs:tw-w-[50vw] sm:tw-w-[40vw] md:tw-w-[30vw] lg:tw-w-[25vw] xl:tw-w-[20vw] 2xl:tw-w-[15vw] 4xl:tw-w-[12vw] tw-shrink-0"
                  />
                ))}
              </>
            ) : (
              <>
                {[1, 2, 3, 4].map((idx) => (
                  <LoadingListing key={idx} />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="tw-absolute tw-top-0 tw-w-full tw-h-[75vw] xs:tw-h-[50vw] sm:tw-h-[40vw] md:tw-h-[30vw] lg:tw-h-[25vw] xl:tw-h-[20vw] 2xl:tw-h-[15vw] 4xl:tw-h-[12vw] tw-flex tw-items-center tw-justify-between tw-pointer-events-none">
          <button
            className={mergeClasses(
              "tw-absolute tw-left-1 sm:-tw-left-7 tw-p-2 tw-hidden tw-rounded-full tw-bg-white tw-bg-opacity-90 hover:tw-bg-opacity-100 tw-transition-colors tw-pointer-events-auto tw-shadow-centered-md",
              showBack && "tw-flex",
            )}
            onClick={scrollPrev}
          >
            <ChevronLeftIcon className="tw-h-8 tw-cursor-pointer tw-stroke-slate-900" />
          </button>
          <button
            className={mergeClasses(
              "tw-absolute tw-right-1 sm:-tw-right-7 tw-hidden tw-p-2 tw-rounded-full tw-bg-white tw-bg-opacity-90 hover:tw-bg-opacity-100 tw-transition-colors tw-pointer-events-auto tw-shadow-centered-md",
              showForward && "tw-flex",
            )}
            onClick={scrollNext}
            style={{
              backgroundImage: "linear-gradient(to left, rgb(255 255 255/0), rgb(255 255 255) 40px)",
            }}
          >
            <ChevronRightIcon className="tw-h-8 tw-cursor-pointer tw-stroke-slate-900" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const BlogSectionClient: React.FC<{ posts: Post[] }> = ({ posts }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      <div className="tw-flex tw-w-full tw-justify-between tw-mb-4">
        <div className="tw-text-2xl tw-font-minion">Latest blog posts</div>
        <Link className="tw-flex tw-items-center tw-font-medium" href="/blog">
          <span className="tw-underline">View blog</span>
          <ArrowRightIcon className="tw-ml-2 tw-h-5 tw-w-5" />
        </Link>
      </div>
      <div ref={emblaRef} className="tw-overflow-hidden">
        <div className="tw-flex lg:tw-w-full lg:tw-gap-4">
          {posts.map((post) => (
            <Link
              href={`/blog/${post.slug.current}`}
              key={post._id}
              className="tw-flex tw-flex-col tw-items-center tw-shrink-0 lg:tw-shrink tw-w-[90vw] sm:tw-w-[50vw] lg:tw-w-1/3 tw-rounded-xl tw-bg-blue-950 tw-p-8 tw-text-white tw-mx-3 lg:tw-mx-0 tw-group"
            >
              <Image
                priority
                alt={post.mainImage.alt}
                src={urlFor(post.mainImage).url()}
                sizes="100vw"
                width={post.mainImage.metadata.dimensions.width}
                height={post.mainImage.metadata.dimensions.height}
                placeholder="blur"
                blurDataURL={post.mainImage.metadata.lqip}
                className="tw-shadow-md tw-h-60 tw-object-cover group-hover:tw-scale-[1.02] tw-transition-transform tw-duration-200"
              />
              <div className="tw-flex tw-flex-col tw-h-48 tw-text-center">
                <div className="tw-mt-4 tw-uppercase">By {post.authorName}</div>
                <div className="tw-mt-1 tw-font-minion tw-text-2xl">{post.title}</div>
              </div>
              <div className="tw-w-fit tw-text-center tw-border-b tw-border-solid tw-border-white group-hover:tw-font-semibold tw-transition-all tw-duration-200">
                READ NOW
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ValuePropSection: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-12 sm:tw-mt-16 tw-mb-5 sm:tw-mb-10">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <div className="tw-text-2xl sm:tw-text-3xl tw-font-minion tw-mb-6 sm:tw-mb-10">
          We make adventure travel easy
        </div>
        <div ref={emblaRef} className="tw-w-full tw-overflow-hidden">
          <div className="tw-flex sm:tw-w-full sm:tw-justify-between">
            <div className="tw-flex tw-flex-col tw-shrink-0 tw-items-center tw-w-[90vw] sm:tw-w-fit tw-text-center">
              <Image
                alt="Free cancellation"
                priority
                src={FreeCancellation}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-w-16 tw-h-16 tw-mb-4"
              />
              <span className="tw-font-minion tw-text-lg tw-mb-2">Free Cancellation</span>
              <span className="tw-max-w-[240px]">
                Booking a trip on Coaster is stress-free thanks to our flexible booking options.
              </span>
            </div>
            <div className="tw-flex tw-flex-col tw-shrink-0 tw-items-center tw-w-[90vw] sm:tw-w-fit tw-text-center">
              <Image
                alt="Curated experiences"
                priority
                src={CuratedExperiences}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-w-16 tw-h-16 tw-mb-4"
              />
              <span className="tw-font-minion tw-text-lg tw-mb-2">Curated experiences</span>
              <span className="tw-max-w-[240px]">
                We do the research so you don&apos;t have to. Every trip is verified for safety and stoke.
              </span>
            </div>
            <div className="tw-flex tw-flex-col tw-shrink-0 tw-items-center tw-w-[90vw] sm:tw-w-fit tw-text-center">
              <Image
                alt="Sustainable travel"
                priority
                src={SustainableTravel}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-w-16 tw-h-16 tw-mb-4"
              />
              <span className="tw-font-minion tw-text-lg tw-mb-2">Sustainable Travel</span>
              <span className="tw-max-w-[240px]">
                We care deeply about our planet, and only work with responsible guides.
              </span>
            </div>
            <div className="tw-flex tw-flex-col tw-shrink-0 tw-items-center tw-w-[90vw] sm:tw-w-fit tw-text-center">
              <Image
                alt="Adventure guarantee"
                priority
                src={AdventureGuarantee}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-w-16 tw-h-16 tw-mb-4"
              />
              <span className="tw-font-minion tw-text-lg tw-mb-2">Adventure Guarantee</span>
              <span className="tw-max-w-[240px]">
                Didn&apos;t have a good time? We&apos;ll give you a full refund, no questions asked.
              </span>
            </div>
          </div>
        </div>
        <div className="tw-flex sm:tw-hidden tw-mt-5">
          {scrollSnaps.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => scrollTo(index)}
              className={mergeClasses(
                "tw-bg-slate-200 tw-w-1.5 tw-h-1.5 tw-mx-2 tw-rounded-3xl",
                selectedIndex === index && "tw-bg-slate-600",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingListing: React.FC = () => {
  return (
    <div
      className="tw-flex tw-w-full tw-h-full tw-aspect-square tw-rounded-xl"
      style={{
        backgroundImage:
          "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
      }}
    />
  );
};

export const DynamicNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const NotificationProvider = dynamic(() =>
    import("@coaster/components/notifications/Notifications").then((mod) => mod.NotificationProvider),
  );
  return <NotificationProvider>{children}</NotificationProvider>;
};

export const DynamicHeader: React.FC = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const Header = dynamic(() => import("@coaster/components/header/Header").then((mod) => mod.Header), {
    loading: () => (
      <div
        className={mergeClasses(
          "tw-sticky tw-z-10 tw-top-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border tw-w-full tw-bg-white tw-border-b tw-border-solid tw-border-slate-200",
          isHome && "tw-border-none",
        )}
      >
        <div className="tw-flex tw-w-[calc(100%-2.5rem)] sm:tw-w-[calc(100%-10rem)] tw-max-w-7xl tw-max-h-[72px] tw-min-h-[72px] sm:tw-max-h-[96px] sm:tw-min-h-[96px] tw-items-center tw-justify-between">
          <div
            className={mergeClasses(
              lateef.className,
              "tw-flex tw-flex-1 tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] tw-mt-[-2px] tw-font-bold tw-text-[48px]",
            )}
            translate="no"
          >
            Coaster
          </div>
          {!isHome && (
            <div className="tw-hidden sm:tw-flex tw-flex-1 tw-justify-between tw-items-center tw-max-w-[400px] tw-h-9 tw-ring-1 tw-ring-slate-300 tw-rounded-[99px]">
              <Suspense>
                <FallbackPlaceholder />
              </Suspense>
              <MagnifyingGlassIcon className="tw-ml-2 tw-mr-4 tw-h-[18px] tw-w-[18px] tw-stroke-gray-600" />
            </div>
          )}
          <div className="tw-flex tw-flex-1 tw-justify-end">
            <div className="tw-hidden lg:tw-flex tw-items-center">
              <button className="tw-flex tw-items-center tw-my-auto tw-mr-4 tw-py-2 tw-px-4 tw-font-medium tw-text-sm">
                <QuestionMarkCircleIcon className="tw-h-[18px] tw-w-[18px] tw-mr-1" />
                Help
              </button>
              <div className="tw-flex tw-select-none tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5">
                <Bars3Icon className="tw-w-5 tw-h-5 tw-mr-2" />
                <ProfilePlaceholder width={28} height={28} />
              </div>
            </div>
            <div className="tw-flex lg:tw-hidden tw-items-center">
              <button className="tw-flex tw-my-auto tw-py-2 tw-px-1 tw-font-medium tw-text-sm">Help</button>
              <MagnifyingGlassIcon className="tw-flex tw-cursor-pointer tw-ml-3 tw-w-6 tw-h-6" />
              <Bars3Icon className="tw-w-7 tw-ml-4" />
            </div>
          </div>
        </div>
      </div>
    ),
  });

  return <Header />;
};

const FallbackPlaceholder = () => {
  const searchParams = useSearchParams();
  return <span className="tw-text-gray-700 tw-text-base tw-ml-4">{searchParams.get("query") ?? "Search trips"}</span>;
};

export const DynamicLoginModal: React.FC = () => {
  const LoginModal = dynamic(() => import("@coaster/components/login/LoginModal").then((mod) => mod.LoginModal));
  return <LoginModal />;
};

export const DynamicFooter: React.FC = () => {
  const Footer = dynamic(() => import("@coaster/components/footer/Footer").then((mod) => mod.Footer));
  return <Footer />;
};
