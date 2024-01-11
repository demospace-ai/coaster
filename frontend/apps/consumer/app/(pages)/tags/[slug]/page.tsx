import { SearchResult } from "@coaster/components/search/SearchResult";
import { getTagServer } from "@coaster/rpc/server";
import { Listing } from "@coaster/types";
import { CustomResult } from "app/(pages)/search/client";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tag = await getTagServer(params.slug);
  if (!tag) {
    return undefined;
  }

  return {
    title: tag.title,
    description: tag.description,
    openGraph: {
      title: tag.title,
      description: tag.description,
    },
    twitter: {
      card: "summary_large_image",
      title: tag.title,
      description: tag.description,
    },
    alternates: {
      canonical: `https://www.trycoaster.com/tags/${params.slug}`,
    },
  };
}

export default async function Tag({ params }: { params: { slug: string } }) {
  const tag = await getTagServer(params.slug);
  if (!tag) {
    return undefined;
  }

  return (
    <div className="tw-flex tw-px-5 sm:tw-px-20">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center tw-pb-24 tw-pt-5 sm:tw-pt-8">
        <div className="tw-mt-3 tw-w-full tw-text-center tw-text-3xl tw-font-bold sm:tw-mt-8 sm:tw-text-4xl">
          {tag.title}
        </div>
        <div className="tw-mb-4 tw-mt-4 tw-w-full tw-max-w-xl tw-text-center sm:tw-mb-10">{tag.description}</div>
        <div className="tw-mb-5 tw-mt-5 tw-grid tw-w-full tw-grid-flow-row-dense tw-grid-cols-1 tw-gap-10 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4">
          {tag.listings.map((listing: Listing) => (
            <SearchResult key={listing.id} listing={listing} />
          ))}
          <CustomResult />
        </div>
      </div>
    </div>
  );
}
