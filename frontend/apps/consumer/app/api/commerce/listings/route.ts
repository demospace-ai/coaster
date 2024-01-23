import { SearchListings, sendRequest } from "@coaster/rpc/common";
import { Coordinates } from "@coaster/types";
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
      if (!listing.place_id) {
        return undefined;
      }

      if (!listing.description) {
        return undefined;
      }

      if (!listing.coordinates) {
        return undefined;
      }

      const addressComponents = await getAddressComponents(listing.place_id);
      var componentsMap = convertComponentsToMap(addressComponents);

      if (
        !componentsMap.has("locality") &&
        !componentsMap.has("administrative_area_level_3") &&
        !componentsMap.has("administrative_area_level_4") &&
        !componentsMap.has("archipelago") &&
        !componentsMap.has("natural_feature")
      ) {
        return undefined;
      }

      if (!componentsMap.has("country")) {
        return undefined;
      }

      if (!componentsMap.has("administrative_area_level_1")) {
        return undefined;
      }

      var postalCode = componentsMap.get("postal_code");
      if (!postalCode) {
        postalCode = await getPostalCodeFromCoordinates(listing.coordinates);
      }

      var city =
        componentsMap.get("locality") ??
        componentsMap.get("administrative_area_level_3") ??
        componentsMap.get("administrative_area_level_4") ??
        componentsMap.get("archipelago") ??
        componentsMap.get("natural_feature");
      var country = componentsMap.get("country");
      var region = componentsMap.get("administrative_area_level_1");

      var description = convert(listing.description);
      description = description.replace(/\n+/g, " ");
      description = description.replace(/"/g, '"""');

      return `${listing.id},"${listing.name}",${listing.categories?.[0]},https://www.trycoaster.com/listings/${listing.id},${city},${region},${postalCode},${country},${listing.coordinates?.latitude},${listing.coordinates?.longitude},${listing.images[0].url},"${description}",${listing.price}`;
    }),
  );

  const withHeader = [HEADER, ...listingRows.filter((listing) => listing != undefined)];
  return new Response(withHeader.join("\n"));
}

async function getAddressComponents(placeId: string): Promise<any> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");

  url.searchParams.append("place_id", placeId);
  url.searchParams.append("fields", "address_components");
  url.searchParams.append("key", process.env.NODE_MAPS_API_KEY ?? "");

  const response = await fetch(url);
  const results = await response.json();
  return results.result.address_components;
}

async function getPostalCodeFromCoordinates(coordinates: Coordinates): Promise<string> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");

  url.searchParams.append("latlng", coordinates.latitude + "," + coordinates.longitude);
  url.searchParams.append("key", process.env.NODE_MAPS_API_KEY ?? "");
  url.searchParams.append("result_type", "postal_code");

  const response = await fetch(url);
  const results = (await response.json()).results;
  if (results.length == 0) {
    return "";
  }

  const addressComponents = results[0].address_components;
  const componentsMap = convertComponentsToMap(addressComponents);
  return componentsMap.get("postal_code") ?? "";
}

function convertComponentsToMap(components: any[]): Map<string, string> {
  const map = new Map();
  components.forEach((component) => {
    map.set(component.types.filter((type) => type != "political")[0], component.long_name);
  });
  return map;
}
