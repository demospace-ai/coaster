"use server";

import { Image, ListingInput } from "@coaster/types";
import { isProd } from "@coaster/utils/common";
import { cookies } from "next/headers";
import { sendRequest } from "./ajax";
import { AddListingImage, DeleteListingImage, UpdateListing, UpdateListingImages } from "./api";

export async function updateListingServerAction(listingID: number, updates: ListingInput) {
  const cookieString = cookies().toString();
  const listing = await sendRequest(UpdateListing, {
    pathParams: { listingID },
    payload: updates,
    extraHeaders: [["Cookie", cookieString]],
  });

  let rootDomain = isProd() ? "https://www.trycoaster.com" : "http://localhost:3000";
  await fetch(`${rootDomain}/api/revalidate/listings/${listingID}`);
  return listing;
}

export async function updateListingImagesServerAction(listingID: number, images: Image[]) {
  const cookieString = cookies().toString();
  const listing = await sendRequest(UpdateListingImages, {
    pathParams: { listingID },
    payload: { images },
    extraHeaders: [["Cookie", cookieString]],
  });

  let rootDomain = isProd() ? "https://www.trycoaster.com" : "http://localhost:3000";
  await fetch(`${rootDomain}/api/revalidate/listings/${listingID}`);
  return listing;
}

export async function addListingImagesServerAction(listingID: number, imageFormData: FormData) {
  const cookieString = cookies().toString();
  const listingImage = await sendRequest(AddListingImage, {
    pathParams: { listingID },
    formData: imageFormData,
    extraHeaders: [["Cookie", cookieString]],
  });

  let rootDomain = isProd() ? "https://www.trycoaster.com" : "http://localhost:3000";
  await fetch(`${rootDomain}/api/revalidate/listings/${listingID}`);
  return listingImage;
}

export async function deleteListingImagesServerAction(listingID: number, imageID: number) {
  const cookieString = cookies().toString();
  await sendRequest(DeleteListingImage, {
    pathParams: { listingID, imageID },
    extraHeaders: [["Cookie", cookieString]],
  });

  let rootDomain = isProd() ? "https://www.trycoaster.com" : "http://localhost:3000";
  await fetch(`${rootDomain}/api/revalidate/listings/${listingID}`);
}
