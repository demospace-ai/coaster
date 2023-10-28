import { Listing, User } from "@coaster/types";
import { HttpError } from "@coaster/utils/common";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { sendRequest } from "./ajax";
import { CheckSession, GetFeaturedListings, GetHostedListings, GetListing, SearchListings } from "./api";

export async function getUserServer(): Promise<User | undefined> {
  const cookieString = cookies().toString();
  try {
    const checkSessionResponse = await sendRequest(CheckSession, {
      extraHeaders: [["Cookie", cookieString]],
    });
    return checkSessionResponse.user;
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.code === 403) {
        redirect("/unauthorized");
      } else if (e.code === 401) {
        return undefined;
      }
    }

    // This is an unexpected error, so report it
    // TODO: consumeErrorServer(e);
  }
}

export async function getListingServer(listingID: number): Promise<Listing | undefined> {
  const cookieString = cookies().toString();
  try {
    const response = await sendRequest(GetListing, {
      pathParams: { listingID },
      extraHeaders: [["Cookie", cookieString]],
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
  const cookieString = cookies().toString();
  const queryParams: { location?: string; categories?: string } = {};
  if (location) {
    queryParams.location = location;
  }

  if (categories) {
    queryParams.categories = categories;
  }

  return sendRequest(SearchListings, { queryParams, extraHeaders: [["Cookie", cookieString]] });
}

export async function getHostedListingsServer() {
  const cookieString = cookies().toString();
  return sendRequest(GetHostedListings, { extraHeaders: [["Cookie", cookieString]] });
}

export async function getFeaturedServer(): Promise<Listing[]> {
  const cookieString = cookies().toString();
  return sendRequest(GetFeaturedListings, { extraHeaders: [["Cookie", cookieString]] });
}
