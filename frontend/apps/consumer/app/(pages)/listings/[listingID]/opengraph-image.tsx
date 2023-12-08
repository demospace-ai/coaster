import { getListingServer } from "@coaster/rpc/server";
import sharp from "sharp";

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

  const imageRes = await fetch(listing.images[0].url);
  const original = await imageRes.arrayBuffer();
  const converted = await sharp(original).resize({ height: 630, width: 1200 }).rotate().png({ quality: 80 }).toBuffer();
  return new Response(converted);
}
