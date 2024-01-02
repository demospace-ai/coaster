import { SearchResult } from "@coaster/components/search/SearchResult";
import { getTagServer } from "@coaster/rpc/server";
import { Listing } from "@coaster/types";
import { CustomResult } from "app/(pages)/search/client";

export default async function Tag({ params }: { params: { slug: string } }) {
  const tag = await getTagServer(params.slug);
  if (!tag) {
    return undefined;
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-flex-col tw-items-center tw-pt-5 sm:tw-pt-8 tw-pb-24 tw-w-full tw-max-w-7xl">
        <div className="tw-mt-3 sm:tw-mt-8 tw-font-bold tw-text-3xl sm:tw-text-4xl tw-w-full tw-text-center">
          {tag.title}
        </div>
        <div className="tw-mt-4 tw-mb-4 sm:tw-mb-10 tw-w-full tw-max-w-xl tw-text-center">{tag.description}</div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-5 tw-mb-5 tw-gap-10 tw-w-full">
          {tag.listings.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
          <CustomResult />
        </div>
      </div>
    </div>
  );
}
