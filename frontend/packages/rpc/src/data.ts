"use server";

import { Booking, Listing, SearchParams } from "@coaster/types";
import { HttpError } from "@coaster/utils/common";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sendRequest } from "./ajax";
import { GetHostedListings, GetListing, GetUserBooking, GetUserBookings, SearchListings } from "./api";

export async function getListingServer(listingID: number, cookieString?: string): Promise<Listing | undefined> {
  const extraHeaders: [string, string][] = cookieString ? [["Cookie", cookieString]] : [];
  try {
    return await sendRequest(GetListing, {
      pathParams: { listingID },
      extraHeaders,
    });
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

export async function search(queryParams: SearchParams): Promise<Listing[]> {
  return sendRequest(SearchListings, { queryParams, revalidate: 600 });
}

export async function getHostedListingsServer() {
  const cookieString = cookies().toString();
  return sendRequest(GetHostedListings, { extraHeaders: [["Cookie", cookieString]] });
}

export async function getBookingsServer(): Promise<Booking[] | undefined> {
  const cookieString = cookies().toString();
  try {
    return await sendRequest(GetUserBookings, { extraHeaders: [["Cookie", cookieString]] });
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.code === 404) {
        notFound();
      }
    }

    // This is an unexpected error, so report it
    // TODO: consumeErrorServer(e);
  }
}

export async function getBookingServer(bookingReference: string): Promise<Booking | undefined> {
  const cookieString = cookies().toString();
  try {
    return await sendRequest(GetUserBooking, {
      pathParams: { bookingReference },
      extraHeaders: [["Cookie", cookieString]],
    });
    // return response;
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.code === 404) {
        notFound();
      }
    }

    // This is an unexpected error, so report it
    // TODO: consumeErrorServer(e);
  }
}
