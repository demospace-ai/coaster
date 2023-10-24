import { HttpError } from "@coaster/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendRequest } from "./ajax";
import { CheckSession, GetListing, SearchListings } from "./api";
import { Listing } from "./types";

export async function getUserServer() {
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
  return sendRequest(GetListing, { pathParams: { listingID } });
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
