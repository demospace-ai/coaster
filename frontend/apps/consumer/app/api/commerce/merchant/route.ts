import { SearchListings, sendRequest } from "@coaster/rpc/common";
import { convert } from "html-to-text";
import { NextRequest, NextResponse } from "next/server";

const HEADER =
  "id\ttitle\tdescription\tavailability\tlink\timage_link\tprice\tidentifier_exists\tbrand\tproduct_detail";

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
        !listing.id ||
        !listing.name ||
        !listing.description ||
        !listing.images ||
        !listing.price ||
        !listing.host ||
        !listing.categories
      ) {
        return undefined;
      }

      var description = convert(listing.description);
      description = description.replace(/\n+/g, " ");
      description = description.replace(/\t+/g, " ");
      description = description.replace(/"/g, '""');

      return `${listing.id}\t${listing.name}\t${description}\tin_stock\thttps://www.trycoaster.com/listings/${listing.id}\t${listing.images[0].url}\t${listing.price}\tno\t${listing.host.first_name}\tGeneral:Activity Type:${listing.categories[0]}`;
    }),
  );

  const withHeader = [HEADER, ...listingRows.filter((listing) => listing != undefined)];
  return new Response(withHeader.join("\n"));
}
