import { getListingServer } from "@coaster/rpc/server";
import { getGcsImageUrl } from "@coaster/utils/common";
import { ImageResponse } from "next/server";

export async function generateImageMetadata({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  if (!listing || !listing.name || listing.images.length < 1) {
    return undefined;
  }

  return {
    alt: listing.name,
    size: {
      width: 1200,
      height: 630,
    },
    contentType: "image/png",
  };
}

export default async function OpengraphImage({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  if (!listing || !listing.name || listing.images.length < 1) {
    return undefined;
  }

  return new ImageResponse(
    (
      <img
        width="1200"
        height="630"
        src={getGcsImageUrl(listing.images[0].storage_id)}
        style={{
          objectFit: "cover",
        }}
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
