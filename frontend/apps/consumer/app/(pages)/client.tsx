"use client";

import AdventureGuarantee from "@coaster/assets/adventure-guarantee.jpg";
import CuratedExperiences from "@coaster/assets/curated-experiences.jpg";
import FreeCancellation from "@coaster/assets/free-cancellation.jpg";
import SustainableTravel from "@coaster/assets/sustainable-travel.jpg";
import { PromoBanner } from "@coaster/components/header/Header";
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
import { ReactNode, useCallback, useEffect, useState } from "react";

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
    <div className="tw-mb-5 tw-flex tw-w-full tw-flex-col">
      <div className="tw-flex tw-w-full tw-items-center tw-justify-between">
        <div className="tw-mr-5 tw-text-xl tw-font-semibold sm:tw-text-2xl">{title}</div>
        {searchQuery && (
          <Link className="tw-flex tw-items-center tw-pt-1 tw-font-medium" href={`/search?${searchQuery}`}>
            <span className="tw-whitespace-nowrap tw-underline">View all</span>
            <ArrowRightIcon className="tw-ml-2 tw-h-4 tw-w-5 sm:tw-h-5 sm:tw-w-5" />
          </Link>
        )}
      </div>
      <div className="tw-relative tw-mt-3 tw-w-full sm:tw-mt-4">
        <div ref={emblaRef} className="tw-w-full tw-overflow-hidden">
          <div className="tw-flex tw-w-full tw-gap-5 tw-text-3xl tw-font-bold sm:tw-gap-10">
            {listings ? (
              <>
                {listings?.map((listing: Listing) => (
                  <SearchResult
                    key={listing.id}
                    listing={listing}
                    className="tw-w-[75vw] tw-shrink-0 xs:tw-w-[50vw] sm:tw-w-[40vw] md:tw-w-[30vw] lg:tw-w-[25vw] xl:tw-w-[20vw] 2xl:tw-w-[15vw] 4xl:tw-w-[12vw]"
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
        <div className="tw-pointer-events-none tw-absolute tw-top-0 tw-flex tw-h-[75vw] tw-w-full tw-items-center tw-justify-between xs:tw-h-[50vw] sm:tw-h-[40vw] md:tw-h-[30vw] lg:tw-h-[25vw] xl:tw-h-[20vw] 2xl:tw-h-[15vw] 4xl:tw-h-[12vw]">
          <button
            className={mergeClasses(
              "tw-pointer-events-auto tw-absolute tw-left-1 tw-hidden tw-rounded-full tw-bg-white tw-bg-opacity-90 tw-p-2 tw-shadow-centered-md tw-transition-colors hover:tw-bg-opacity-100 sm:-tw-left-7",
              showBack && "tw-flex",
            )}
            onClick={scrollPrev}
          >
            <ChevronLeftIcon className="tw-h-8 tw-cursor-pointer tw-stroke-slate-900" />
          </button>
          <button
            className={mergeClasses(
              "tw-pointer-events-auto tw-absolute tw-right-1 tw-hidden tw-rounded-full tw-bg-white tw-bg-opacity-90 tw-p-2 tw-shadow-centered-md tw-transition-colors hover:tw-bg-opacity-100 sm:-tw-right-7",
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
    <div className="tw-flex tw-w-full tw-flex-col">
      <div className="tw-mb-4 tw-flex tw-w-full tw-justify-between">
        <div className="tw-text-2xl tw-font-semibold">Latest blog posts</div>
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
              className="tw-group tw-mx-3 tw-flex tw-w-[90vw] tw-shrink-0 tw-flex-col tw-items-center tw-rounded-xl tw-bg-blue-950 tw-p-8 tw-text-white sm:tw-w-[50vw] lg:tw-mx-0 lg:tw-w-1/3 lg:tw-shrink"
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
                className="tw-h-60 tw-object-cover tw-shadow-md tw-transition-transform tw-duration-200 group-hover:tw-scale-[1.02]"
              />
              <div className="tw-flex tw-h-48 tw-flex-col tw-text-center">
                <div className="tw-mt-4 tw-uppercase">By {post.authorName}</div>
                <div className="tw-mt-1 tw-text-2xl tw-font-bold">{post.title}</div>
              </div>
              <div className="tw-w-fit tw-border-b tw-border-solid tw-border-white tw-text-center tw-transition-all tw-duration-200 group-hover:tw-font-semibold">
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
    <div className="tw-mb-5 tw-mt-12 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-mb-10 sm:tw-mt-16 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <div className="tw-mb-6 tw-text-xl tw-font-semibold sm:tw-mb-10 sm:tw-text-3xl">
          We make adventure travel easy
        </div>
        <div ref={emblaRef} className="tw-w-full tw-overflow-hidden">
          <div className="tw-flex sm:tw-w-full sm:tw-justify-between">
            <div className="tw-flex tw-w-[90vw] tw-shrink-0 tw-flex-col tw-items-center tw-text-center sm:tw-w-fit">
              <Image
                alt="Free cancellation"
                priority
                src={FreeCancellation}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-mb-4 tw-h-16 tw-w-16"
              />
              <span className="tw-mb-2 tw-text-lg tw-font-semibold">Free Cancellation</span>
              <span className="tw-max-w-[240px] tw-text-base">
                Booking a trip on Coaster is stress-free thanks to our flexible booking options.
              </span>
            </div>
            <div className="tw-flex tw-w-[90vw] tw-shrink-0 tw-flex-col tw-items-center tw-text-center sm:tw-w-fit">
              <Image
                alt="Curated experiences"
                priority
                src={CuratedExperiences}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-mb-4 tw-h-16 tw-w-16"
              />
              <span className="tw-mb-2 tw-text-lg tw-font-semibold">Curated experiences</span>
              <span className="tw-max-w-[240px] tw-text-base">
                We do the research so you don't have to. Every trip is verified for safety and stoke.
              </span>
            </div>
            <div className="tw-flex tw-w-[90vw] tw-shrink-0 tw-flex-col tw-items-center tw-text-center sm:tw-w-fit">
              <Image
                alt="Sustainable travel"
                priority
                src={SustainableTravel}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-mb-4 tw-h-16 tw-w-16"
              />
              <span className="tw-mb-2 tw-text-lg tw-font-semibold">Sustainable Travel</span>
              <span className="tw-max-w-[240px] tw-text-base">
                We care deeply about our planet, and only work with responsible guides.
              </span>
            </div>
            <div className="tw-flex tw-w-[90vw] tw-shrink-0 tw-flex-col tw-items-center tw-text-center sm:tw-w-fit">
              <Image
                alt="Adventure guarantee"
                priority
                src={AdventureGuarantee}
                sizes="40px"
                quality={100}
                placeholder="blur"
                className="tw-mb-4 tw-h-16 tw-w-16"
              />
              <span className="tw-mb-2 tw-text-lg tw-font-semibold">Adventure Guarantee</span>
              <span className="tw-max-w-[240px] tw-text-base">
                Didn't have a good time? We'll give you a full refund, no questions asked.
              </span>
            </div>
          </div>
        </div>
        <div className="tw-mt-5 tw-flex sm:tw-hidden">
          {scrollSnaps.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => scrollTo(index)}
              className={mergeClasses(
                "tw-mx-2 tw-h-1.5 tw-w-1.5 tw-rounded-3xl tw-bg-slate-200",
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
      className="tw-flex tw-aspect-square tw-h-full tw-w-full tw-rounded-xl"
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
  const searchParams = useSearchParams();

  const Header = dynamic(() => import("@coaster/components/header/Header").then((mod) => mod.Header), {
    loading: () => (
      <div
        className={mergeClasses(
          "tw-sticky tw-top-0 tw-z-10 tw-box-border tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-border-b tw-border-solid tw-border-slate-200 tw-bg-white",
          isHome && "tw-border-none",
        )}
      >
        <PromoBanner />
        <div className="tw-flex tw-max-h-[72px] tw-min-h-[72px] tw-w-[calc(100%-2.5rem)] tw-max-w-7xl tw-items-center tw-justify-between sm:tw-max-h-[96px] sm:tw-min-h-[96px] sm:tw-w-[calc(100%-10rem)]">
          <div
            className={mergeClasses(
              lateef.className,
              "tw-mt-[-2px] tw-flex tw-flex-1 tw-select-none tw-overflow-hidden tw-whitespace-nowrap tw-text-[48px] tw-font-bold tw-tracking-[-0.5px]",
            )}
            translate="no"
          >
            Coaster
          </div>
          {!isHome && (
            <div className="tw-hidden tw-h-9 tw-max-w-[400px] tw-flex-1 tw-items-center tw-justify-between tw-rounded-[99px] tw-ring-1 tw-ring-slate-300 sm:tw-flex">
              <span className="tw-ml-4 tw-text-base tw-text-gray-700">
                {searchParams.get("query") ?? "Search trips"}
              </span>
              <MagnifyingGlassIcon className="tw-ml-2 tw-mr-4 tw-h-[18px] tw-w-[18px] tw-stroke-gray-600" />
            </div>
          )}
          <div className="tw-flex tw-flex-1 tw-justify-end">
            <div className="tw-hidden tw-items-center lg:tw-flex">
              <button className="tw-my-auto tw-mr-4 tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-medium">
                <QuestionMarkCircleIcon className="tw-mr-1 tw-h-[18px] tw-w-[18px]" />
                Help
              </button>
              <div className="tw-flex tw-select-none tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-gray-300 tw-px-2 tw-py-1.5">
                <Bars3Icon className="tw-mr-2 tw-h-5 tw-w-5" />
                <ProfilePlaceholder width={28} height={28} />
              </div>
            </div>
            <div className="tw-flex tw-items-center lg:tw-hidden">
              <button className="tw-my-auto tw-flex tw-px-1 tw-py-2 tw-text-sm tw-font-medium">Help</button>
              <MagnifyingGlassIcon className="tw-ml-3 tw-flex tw-h-6 tw-w-6 tw-cursor-pointer" />
              <Bars3Icon className="tw-ml-4 tw-w-7" />
            </div>
          </div>
        </div>
      </div>
    ),
  });

  return <Header />;
};

export const DynamicLoginModal: React.FC = () => {
  const LoginModal = dynamic(() => import("@coaster/components/login/LoginModal").then((mod) => mod.LoginModal));
  return <LoginModal />;
};

export const DynamicFooter: React.FC = () => {
  const Footer = dynamic(() => import("@coaster/components/footer/Footer").then((mod) => mod.Footer));
  return <Footer />;
};
