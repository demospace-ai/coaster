import { GeneratedSearchResult } from "@coaster/components/generated/GeneratedListings";
import { getCategoryForDisplay } from "@coaster/components/icons/Category";
import { SearchResult } from "@coaster/components/search/SearchResult";
import { search } from "@coaster/rpc/server";
import { GeneratedListing, type CategoryType, type Listing } from "@coaster/types";
import { CustomResult } from "app/(pages)/search/client";
import { getGeneratedListings } from "app/(pages)/search/server-actions";

export async function generateMetadata({ searchParams }: { searchParams: { query: string } }) {
  return {
    alternates: {
      canonical: `https://www.trycoaster.com/search?query=${searchParams.query}`,
    },
  };
}

export default async function Search({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const listings = await search(searchParams);
  const query = searchParams["query"];
  const location = searchParams["location"];
  const categories = searchParams["categories"];

  let categoriesParsed: CategoryType[] = [];
  if (categories) {
    categoriesParsed = JSON.parse(categories) as CategoryType[];
  }

  let generatedListings: GeneratedListing[] = [];
  if (query) {
    generatedListings = await getGeneratedListings(query);
  }

  let searchTitle = "";
  if (query) {
    searchTitle = `${listings.length + generatedListings.length} result(s) for "${query}"`;
  } else if (categories) {
    const categoryString = categoriesParsed.map((category) => getCategoryForDisplay(category)).join(", ");
    searchTitle = `${listings.length} result(s) for ${categoryString}`;
  } else if (location) {
    searchTitle = `${listings.length} result(s) for ${location}`;
  } else {
    searchTitle = `${listings.length} result(s)`;
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center tw-pb-24 tw-pt-5 sm:tw-pt-8">
        <div className="tw-w-full tw-text-center tw-text-xl tw-font-bold sm:tw-text-left"> {searchTitle}</div>
        <div className="tw-mb-5 tw-mt-5 tw-grid tw-w-full tw-grid-flow-row-dense tw-grid-cols-1 tw-gap-10 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4">
          {listings.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
          {generatedListings.map((listing: GeneratedListing) => (
            <GeneratedSearchResult key={listing.category} listing={listing} />
          ))}
          <CustomResult />
        </div>
      </div>
    </div>
  );
}
