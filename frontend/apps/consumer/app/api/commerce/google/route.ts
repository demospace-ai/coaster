import { SearchListings, sendRequest } from "@coaster/rpc/common";
import { NextRequest, NextResponse } from "next/server";

const HEADER = "Destination ID,Title,Final URL,Image URL,Price,Category,Destination address";

export async function GET(req: NextRequest) {
  const basicAuth = req.headers.get("Authorization");
  if (!basicAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = Buffer.from(basicAuth.split(" ")[1], "base64").toString().split(":");
  const username = auth[0];
  const password = auth[1];

  if (!username || username != process.env.BASIC_AUTH_USERNAME) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!password || password != process.env.BASIC_AUTH_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: authenticate request and get all listings
  const listings = await sendRequest(SearchListings, { revalidate: 3600 });
  const listingRows = await Promise.all(
    listings.map(async (listing) => {
      if (!listing.location || !listing.images || !listing.price || !listing.categories) {
        return undefined;
      }

      return `${listing.id},"${listing.name}",https://www.trycoaster.com/listings/${listing.id},${listing.images[0].url},${listing.price},${listing.categories[0]},${listing.location}`;
    }),
  );

  const withHeader = [HEADER, ...listingRows.filter((listing) => listing != undefined)];
  return new Response(withHeader.join("\n"));
}
