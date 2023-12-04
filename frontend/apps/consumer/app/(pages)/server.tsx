import Hero from "@coaster/assets/hero.jpg";
import Footer from "@coaster/assets/home-footer.jpg";
import NeedHelp from "@coaster/assets/need-help.jpg";
import { GlobeIcon, LeafIcon } from "@coaster/components/icons/Icons";
import { SearchBar } from "@coaster/components/search/SearchBar";
import { SanityClient } from "@coaster/rpc/sanity";
import { search } from "@coaster/rpc/server";
import { Listing } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import { BellIcon, BoltIcon, CalendarDaysIcon, CheckBadgeIcon, StarIcon } from "@heroicons/react/24/outline";
import { Post } from "app/(pages)/blog/utils";
import { BlogSectionClient, ListingsSectionClient, ValuePropSection } from "app/(pages)/client";
import Image from "next/image";
import Link from "next/link";

export const FeaturedPage = async () => {
  return (
    <main className="tw-flex tw-flex-col tw-w-full tw-h-full tw-justify-center">
      <HeroSection />
      <ValuePropBanner />
      <ListingsSection type="featured" />
      <ListingsSection type="skiing" />
      <FreeCancellationBanner />
      <ListingsSection type="popular" backsplash />
      <ValuePropSection />
      <BlogSection />
      <NeedHelpSection />
      <ExploreTrips />
      <Image
        src={Footer}
        sizes="100vw"
        alt="Footer image"
        quality={100}
        placeholder="blur"
        className="tw-max-h-96 tw-min-w-full"
      />
    </main>
  );
};

const HeroSection: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-2 tw-w-full tw-max-w-7xl">
        <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-4 tw-mx-10 tw-w-full tw-min-h-[420px] tw-h-[420px] tw-max-h-[420px] sm:tw-min-h-[480px] sm:tw-h-[480px] sm:tw-max-h-[480px] tw-rounded-2xl tw-p-8">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full">
            <Image
              fill
              alt="Hero image"
              priority
              src={Hero}
              sizes="(max-width: 640px) 80vw, 50vw"
              placeholder="blur"
              className="tw-rounded-2xl tw-object-left tw-object-cover"
            />
          </div>
          <div className="tw-z-[1]">
            <div className="tw-text-white tw-w-full tw-max-w-[800px] tw-py-5 tw-rounded-2xl tw-text-center">
              <div className="tw-font-semibold tw-text-5xl sm:tw-text-6xl tw-tracking-tighter">
                Discover, Book, Adventure
              </div>
              <div className="tw-font-medium tw-text-xl tw-tracking-tight tw-mt-2">
                Find a local guide to take you on the trip of a lifetime
              </div>
            </div>
            <SearchBar className="tw-mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ValuePropBanner: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mb-6 sm:tw-mb-8">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <div className="tw-relative tw-flex tw-h-5 tw-w-full tw-pr-1 tw-overflow-hidden tw-select-none">
          <div className="tw-flex tw-animate-infinite-scroll hover:tw-pause-animation">
            <ValuePropScrollChild />
            <ValuePropScrollChild />
          </div>
        </div>
      </div>
    </div>
  );
};

const ValuePropScrollChild: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={mergeClasses("tw-flex tw-justify-between tw-gap-10 tw-mr-10", className)}>
      <div className="tw-flex tw-gap-2">
        <StarIcon className="tw-h-5 tw-w-5" />
        <span className="tw-whitespace-nowrap">Top-rated trips</span>
      </div>
      <div className="tw-flex tw-gap-2">
        <BoltIcon className="tw-h-5 tw-w-5" />
        <span className="tw-whitespace-nowrap">Easy booking</span>
      </div>
      <div className="tw-flex tw-gap-2">
        <CalendarDaysIcon className="tw-h-5 tw-w-5" />
        <span className="tw-whitespace-nowrap">Free cancellation</span>
      </div>
      <div className="tw-flex tw-gap-2">
        <CheckBadgeIcon className="tw-h-5 tw-w-5 tw-stroke-[1.5]" />
        <span className="tw-whitespace-nowrap">Verified guides</span>
      </div>
      <div className="tw-flex tw-gap-2">
        <BellIcon className="tw-h-5 tw-w-5" />
        <span className="tw-whitespace-nowrap">24/7 Concierge</span>
      </div>
      <div className="tw-flex tw-gap-2 tw-stroke-[1.5]">
        <GlobeIcon className="tw-h-5 tw-w-5" />
        <span className="tw-whitespace-nowrap">Global availability</span>
      </div>
      <div className="tw-flex tw-gap-2">
        <LeafIcon className="tw-h-5 tw-w-5 tw-stroke-[1.5]" />
        <span className="tw-whitespace-nowrap">Planet friendly</span>
      </div>
    </div>
  );
};

type ListingsSectionType = "featured" | "skiing" | "popular";
const ListingsSection: React.FC<{ type: ListingsSectionType; backsplash?: boolean }> = async ({ type, backsplash }) => {
  var title: string;
  var searchQuery: string;
  var listings: Listing[];
  switch (type) {
    case "featured":
      title = "Featured adventures";
      searchQuery = 'categories=["featured"]';
      listings = await search(undefined, '["featured"]');
      break;
    case "skiing":
      title = "Guided backcountry skiing";
      searchQuery = 'categories=["skiing"]';
      listings = await search(undefined, '["skiing"]');
      break;
    case "popular":
      title = "Popular this week";
      searchQuery = 'categories=["popular"]';
      listings = await search(undefined, '["popular"]');
      break;
  }

  return (
    <div
      className={mergeClasses(
        "tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20",
        backsplash && "tw-bg-[#000721] tw-py-10 tw-text-white",
      )}
    >
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <ListingsSectionClient title={title} listings={listings} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

const FreeCancellationBanner: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mb-10 sm:tw-mb-16 tw-mt-4 sm:tw-mt-10">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-bg-blue-100 tw-py-12 tw-rounded-xl">
          <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl tw-text-center">
            <div className="tw-text-xl sm:tw-text-2xl tw-font-semibold">Flexible Booking</div>
            <div className="tw-max-w-md tw-text-base tw-mt-2">
              Book now and only pay once the reservation is confirmed by your guide. Change your mind? On most trips
              you'll receive a full refund if you cancel in advance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogSection: React.FC = async () => {
  const posts: Post[] = await SanityClient.fetch(
    `
      *[_type == "post" && defined(slug.current)] | order(publishDate desc){
        _id,
        title,
        slug,
        metaDescription,
        "authorName": author->name,
        mainImage{
          ...,
          "metadata": asset->metadata,
        },
      }[0...3]
    `,
  );

  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-10 tw-mb-10 sm:tw-mb-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <BlogSectionClient posts={posts} />
      </div>
    </div>
  );
};

const NeedHelpSection: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <div className="tw-relative tw-flex tw-flex-col tw-items-center tw-justify-start tw-w-full tw-min-h-[300px] tw-max-h-[300px] tw-h-[300px] sm:tw-min-h-[560px] sm:tw-h-[560px] sm:tw-max-h-[560px]">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-w-full">
            <Image
              fill
              alt="Need help?"
              quality={90}
              src={NeedHelp}
              sizes="90vw"
              placeholder="blur"
              className="tw-rounded-xl tw-object-left tw-object-cover"
            />
          </div>
          <div className="tw-flex tw-flex-col tw-items-center tw-text-center tw-z-[1] tw-mt-16 sm:tw-mt-28 tw-text-white">
            <div className="tw-font-semibold tw-text-xl sm:tw-text-4xl tw-tracking-tighter">
              Need help finding the perfect trip?
            </div>
            <div className="tw-text-base sm:tw-text-lg tw-tracking-tight tw-mt-2">
              Talk to one of our adventure experts!
            </div>
            <Link
              className="tw-flex tw-justify-center tw-items-center tw-mt-4 tw-bg-black tw-text-white tw-w-48 tw-h-10 tw-rounded-lg tw-font-medium"
              href="https://calendly.com/coaster/adventure-expert-call"
            >
              Book a call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreTrips: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-justify-center tw-items-center">
      <div className="tw-text-2xl sm:tw-text-3xl tw-font-semibold tw-mt-20 tw-mb-5">Ready to get out there?</div>
      <Link
        className="tw-flex tw-justify-center tw-items-center tw-bg-blue-950 tw-text-white tw-w-48 tw-h-10 tw-rounded-lg tw-font-medium"
        href="/search"
      >
        Explore trips
      </Link>
    </div>
  );
};
