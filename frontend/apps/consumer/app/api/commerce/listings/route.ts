import { SearchListings, sendRequest } from "@coaster/rpc/common";
import { NextRequest } from "next/server";

const HEADER =
  "destination_id,name,type[0],url,address.addr1,address.city,address.region,address.postal_code,address.country,latitude,longitude,image[0].url,description,price";

export async function GET(_: NextRequest) {
  // TODO: authenticate request and get all listings
  const listings = await sendRequest(SearchListings, { revalidate: 3600 });
  const listingRows = await Promise.all(
    listings
      .filter((listing) => listing.place_id)
      .map(async (listing) => {
        const addressComponents = await getAddressComponents(listing.place_id!);
        var componentsMap = convertComponentsToMap(addressComponents);
        var city =
          componentsMap.get("locality") ??
          componentsMap.get("administrative_area_level_4") ??
          componentsMap.get("administrative_area_level_3") ??
          componentsMap.get("administrative_area_level_2") ??
          "";
        var country = componentsMap.get("country") ?? "";
        var region = componentsMap.get("administrative_area_level_1") ?? "";
        var postalCode = componentsMap.get("postal_code") ?? "";
        return `${listing.id},${listing.name},${listing.categories?.[0]},https://www.trycoaster.com/listings/${listing.id},${city},${region},${postalCode},${country},${listing.coordinates?.latitude},${listing.coordinates?.longitude},${listing.images[0].url},${listing.description},${listing.price}`;
      }),
  );

  const withHeader = [HEADER, ...listingRows];
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

function convertComponentsToMap(components: any[]): Map<string, string> {
  const map = new Map();
  components.forEach((component) => {
    map.set(component.types.filter((type) => type != "political")[0], component.long_name);
  });
  return map;
}
