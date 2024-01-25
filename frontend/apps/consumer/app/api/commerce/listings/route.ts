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
        postalCode = await getPostalCodeFallback(listing.coordinates);
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
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);

  url.searchParams.append("fields", "addressComponents");
  url.searchParams.append("languageCode", "en");
  url.searchParams.append("key", process.env.NODE_MAPS_API_KEY ?? "");

  const response = await fetch(url);
  const results = await response.json();
  return results.addressComponents;
}

async function getPostalCodeFallback(coordinates: Coordinates): Promise<string> {
  const url = new URL("https://places.googleapis.com/v1/places:searchNearby");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.NODE_MAPS_API_KEY ?? "",
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types",
    },
    body: JSON.stringify({
      languageCode: "en",
      includedTypes: ["postal_code"],
      maxResultCount: 1,
      locationRestriction: {
        circle: {
          center: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
          radius: 20000,
        },
      },
    }),
  });

  const results = await response.json();
  if (!results.places || results.places.length == 0) {
    return "";
  }

  return results.places[0].displayName.text;
}

function convertComponentsToMap(components: any[]): Map<string, string> {
  const map = new Map();
  components.forEach((component) => {
    component.types.forEach((type: string) => {
      map.set(type, component.shortText);
    });
  });
  return map;
}
