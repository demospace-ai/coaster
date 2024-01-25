import { SearchListings, sendRequest } from "@coaster/rpc/common";
import { convert } from "html-to-text";
import { NextRequest, NextResponse } from "next/server";

const HEADER =
  "destination_id,name,type[0],url,address.city,address.region,address.postal_code,address.country,latitude,longitude,image[0].url,description,price";

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
      if (
        !listing.description ||
        !listing.city ||
        !listing.region ||
        !listing.country ||
        !listing.coordinates ||
        !listing.images ||
        !listing.price ||
        !listing.categories
      ) {
        return undefined;
      }

      var description = convert(listing.description);
      description = description.replace(/\n+/g, " ");
      description = description.replace(/"/g, '"""');

      return `${listing.id},"${listing.name}",${listing.categories[0]},https://www.trycoaster.com/listings/${listing.id},${listing.city},${listing.region},${listing.postal_code},${listing.country},${listing.coordinates.latitude},${listing.coordinates.longitude},${listing.images[0].url},"${description}",${listing.price}`;
    }),
  );

  const withHeader = [HEADER, ...listingRows.filter((listing) => listing != undefined)];
  return new Response(withHeader.join("\n"));
}
