import Hero from "@coaster/assets/hero.jpg";
import Footer from "@coaster/assets/home-footer.jpg";
import NeedHelp from "@coaster/assets/need-help.jpg";
import { getCategoryForDisplay, getCategoryIcon, getSearchableCategories } from "@coaster/components/icons/Category";
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
    <main className="tw-flex tw-h-full tw-w-full tw-flex-col tw-justify-center">
      <HeroSection />
      <ValuePropBanner />
      <ListingsSection type="featured" />
      <ListingsSection type="skiing" />
      <FreeCancellationBanner />
      <ListingsSection type="popular" backsplash />
      <ValuePropSection />
      <BlogSection />
      <NeedHelpSection />
      <ExploreByCategory />
      <ExploreTrips />
      <Image
        src={Footer}
        sizes="100vw"
        alt="Footer image"
        quality={100}
        placeholder="blur"
        className="tw-max-h-96 tw-min-w-full"
        draggable={false}
      />
    </main>
  );
};

const HeroSection: React.FC = () => {
  return (
    <div className="tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center tw-pt-2">
        <div className="tw-relative tw-mx-10 tw-mb-4 tw-flex tw-h-[420px] tw-max-h-[420px] tw-min-h-[420px] tw-w-full tw-flex-col tw-items-center tw-justify-center tw-rounded-2xl tw-p-8 sm:tw-h-[480px] sm:tw-max-h-[480px] sm:tw-min-h-[480px]">
          <div className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-full">
            <Image
              fill
              alt="Hero image"
              priority
              src={Hero}
              sizes="(max-width: 640px) 80vw, 50vw"
              placeholder="blur"
              className="tw-rounded-2xl tw-object-cover tw-object-left"
              draggable={false}
            />
          </div>
          <div className="tw-z-[1] tw-flex tw-flex-col tw-items-center tw-justify-center">
            <div className="tw-w-full tw-max-w-[800px] tw-rounded-2xl tw-py-5 tw-text-center tw-text-white">
              <h1 className="tw-text-5xl tw-font-semibold tw-tracking-tighter sm:tw-text-6xl">
                Discover, Book, Adventure
              </h1>
              <h2 className="tw-mt-2 tw-text-xl tw-font-medium tw-tracking-tight">
                Find a local guide to take you on the trip of a lifetime
              </h2>
            </div>
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
};

const ValuePropBanner: React.FC = () => {
  return (
    <div className="tw-mb-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-mb-8 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <div className="tw-relative tw-flex tw-h-5 tw-w-full tw-select-none tw-overflow-hidden tw-pr-1">
          <div className="hover:tw-pause-animation tw-flex tw-animate-infinite-scroll">
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
    <div className={mergeClasses("tw-mr-10 tw-flex tw-justify-between tw-gap-10", className)}>
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
      listings = await search({ categories: '["featured"]' });
      break;
    case "skiing":
      title = "Guided backcountry skiing";
      searchQuery = 'categories=["skiing"]';
      listings = await search({ categories: '["skiing"]' });
      break;
    case "popular":
      title = "Popular this week";
      searchQuery = 'categories=["popular"]';
      listings = await search({ categories: '["popular"]' });
      break;
  }

  return (
    <div
      className={mergeClasses(
        "tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-px-20",
        backsplash && "tw-bg-[#000721] tw-py-10 tw-text-white",
      )}
    >
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <ListingsSectionClient title={title} listings={listings} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

const FreeCancellationBanner: React.FC = () => {
  return (
    <div className="tw-mb-10 tw-mt-4 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-mb-16 sm:tw-mt-10 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <div className="tw-flex tw-w-full tw-items-center tw-justify-center tw-rounded-xl tw-bg-blue-100 tw-px-5 tw-py-12 sm:tw-px-20">
          <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center tw-text-center">
            <div className="tw-text-xl tw-font-semibold sm:tw-text-2xl">Flexible Booking</div>
            <div className="tw-mt-2 tw-max-w-md tw-text-base">
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
    <div className="tw-mb-10 tw-mt-10 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-mb-20 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <BlogSectionClient posts={posts} />
      </div>
    </div>
  );
};

const NeedHelpSection: React.FC = () => {
  return (
    <div className="tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <div className="tw-relative tw-flex tw-h-[300px] tw-max-h-[300px] tw-min-h-[300px] tw-w-full tw-flex-col tw-items-center tw-justify-start sm:tw-h-[560px] sm:tw-max-h-[560px] sm:tw-min-h-[560px]">
          <div className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-full">
            <Image
              fill
              alt="Need help?"
              quality={90}
              src={NeedHelp}
              sizes="60vw"
              placeholder="blur"
              className="tw-rounded-xl tw-object-cover tw-object-left lg:tw-object-right"
              draggable={false}
            />
          </div>
          <div className="tw-z-[1] tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-text-center tw-text-white">
            <div className="tw-flex tw-flex-col tw-items-center sm:tw-pb-16">
              <div className="tw-px-5 tw-text-xl tw-font-semibold tw-tracking-tighter sm:tw-text-4xl">
                Need help finding the perfect trip?
              </div>
              <div className="tw-text-base tw-tracking-tight sm:tw-mt-2 sm:tw-text-lg">
                Talk to one of our adventure experts!
              </div>
              <Link
                className="tw-mt-4 tw-flex tw-h-10 tw-w-48 tw-items-center tw-justify-center tw-rounded-lg tw-bg-black tw-font-medium tw-text-white"
                href="https://calendly.com/coaster/adventure-expert-call"
              >
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreByCategory: React.FC = () => {
  return (
    <div className="tw-mt-8 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 sm:tw-mt-16 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col">
        <div className="tw-mb-5 tw-text-2xl tw-font-semibold">Explore by category</div>
        <div className="tw-grid tw-w-full tw-grid-cols-2 tw-gap-y-3 sm:tw-grid-cols-4">
          {getSearchableCategories().map((category) => (
            <Link
              key={category}
              href={`/search?categories=["${category}"]`}
              className="tw-flex tw-items-center tw-justify-start tw-gap-3"
            >
              {getCategoryIcon(category, "tw-h-5 tw-w-5 tw-shrink-0")}
              <span className="tw-px-0.5 tw-text-base tw-underline">{getCategoryForDisplay(category)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExploreTrips: React.FC = () => {
  return (
    <div className="tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center">
      <div className="tw-mb-5 tw-mt-20 tw-text-2xl tw-font-semibold sm:tw-text-3xl">Ready to get out there?</div>
      <Link
        className="tw-flex tw-h-10 tw-w-48 tw-items-center tw-justify-center tw-rounded-lg tw-bg-blue-950 tw-font-medium tw-text-white"
        href="/search"
      >
        Explore trips
      </Link>
    </div>
  );
};
