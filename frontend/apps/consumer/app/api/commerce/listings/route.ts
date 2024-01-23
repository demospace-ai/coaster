// import { SearchListings, sendRequest } from "@coaster/rpc/common";
// import { NextRequest } from "next/server";

// const HEADER =
//   "destination_id,name,type[0],url,address.addr1,address.city,address.country,latitude,longitude,neighborhood[0],image[0].url,image[0].tag[0],description,price,address.region";

// export async function GET(_: NextRequest) {
//   // TODO: authenticate request
//   const listings = await sendRequest(SearchListings, { revalidate: 3600 });
//   const data = await getAddressComponents(listings[0]?.place_id!);
//   console.log(data);
//   // const listingRows = listings.map((listing) => {
//   //   const location = listing.location;
//   //   return `${listing.id},${listing.name},${listing.categories?.[0]},https://www.trycoaster.com/listings/${listing.id},${listing.location},${listing.address.city},${listing.address.country},${listing.address.latitude},${listing.address.longitude},${listing.neighborhood[0]},${listing.images[0].url},Listing Image 1,${listing.description},${listing.price},${listing.address.region}`;
//   // });
//   return new Response("");
// }

// async function getAddressComponents(placeId: string): Promise<string> {
//   const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);

//   const response = await fetch(url, {
//     headers: {
//       "X-Goog-FieldMask": "address_components",
//       "X-Goog-Api-Key": process.env.NODE_MAPS_API_KEY ?? "",
//     },
//   });
//   const results = await response.json();
//   return results;
// }
