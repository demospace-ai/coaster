import { Booking, Listing } from "@coaster/types";
import { HttpError } from "@coaster/utils/common";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sendRequest } from "./ajax";
import {
  GetFeaturedListings,
  GetHostedListings,
  GetListing,
  GetUserBooking,
  GetUserBookings,
  SearchListings,
} from "./api";

export async function getListingServer(listingID: number, cookieString?: string): Promise<Listing | undefined> {
  const extraHeaders: [string, string][] = cookieString ? [["Cookie", cookieString]] : [];
  try {
    const response = await sendRequest(GetListing, {
      pathParams: { listingID },
      extraHeaders,
    });
    return response;
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.code === 404) {
        notFound();
      }
    }

    // This is an unexpected error, so report it
    // TODO: consumeErrorServer(e);
  }

  return undefined;
}

export async function search(location: string | undefined, categories: string | undefined): Promise<Listing[]> {
  const queryParams: { location?: string; categories?: string } = {};
  if (location) {
    queryParams.location = location;
  }

  if (categories) {
    queryParams.categories = categories;
  }

  return sendRequest(SearchListings, { queryParams });
}

export async function getHostedListingsServer() {
  const cookieString = cookies().toString();
  return sendRequest(GetHostedListings, { extraHeaders: [["Cookie", cookieString]] });
}

export async function getFeaturedServer(): Promise<Listing[]> {
  return sendRequest(GetFeaturedListings);
}

export async function getBookingsServer(): Promise<Booking[] | undefined> {
  const cookieString = cookies().toString();
  return sendRequest(GetUserBookings, { extraHeaders: [["Cookie", cookieString]] });
}

export async function getBookingServer(bookingID: number): Promise<Booking | undefined> {
  const cookieString = cookies().toString();
  return sendRequest(GetUserBooking, { pathParams: { bookingID }, extraHeaders: [["Cookie", cookieString]] });
}
