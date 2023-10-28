import { getListingServer } from "@coaster/rpc/server";
import { getGcsImageUrl } from "@coaster/utils/common";
import { ImageResponse } from "next/server";

export const runtime = "edge";

export const alt = "Coaster - Find your next adventure";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { listingID: string } }) {
  const listing = await getListingServer(Number(params.listingID));
  if (!listing || listing.images.length === 0) {
    return undefined;
  }

  return new ImageResponse(
    (
      <img
        src={getGcsImageUrl(listing.images[0].storage_id)}
        style={{ width: size.width, height: size.height, objectFit: "cover" }}
      ></img>
    ),
    {
      ...size,
    },
  );
}
