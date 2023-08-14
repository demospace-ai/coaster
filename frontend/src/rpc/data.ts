import { sendRequest } from "src/rpc/ajax";
import {
  GetFeaturedListings,
  GetHostedListings,
  GetListing,
  GetNewListing,
  SearchListings,
  UpdateListing,
} from "src/rpc/api";
import { Listing, ListingUpdates } from "src/rpc/types";
import { forceErrorMessage } from "src/utils/errors";
import { MutationResult, useMutation } from "src/utils/queryHelpers";
import useSWR, { Fetcher, mutate } from "swr";

export function useListing(listingID: number | undefined) {
  const shouldFetch = listingID;
  const fetcher: Fetcher<Listing, { listingID: number }> = (pathParams: { listingID: number }) =>
    sendRequest(GetListing, { pathParams });
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { GetListing, listingID } : null,
    fetcher,
  );
  return { listing: data, mutate, error, loading: isLoading || isValidating };
}

export function useHostedListings() {
  const fetcher: Fetcher<Listing[], {}> = () => sendRequest(GetHostedListings);
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetHostedListings }, fetcher);
  return { hosted: data, mutate, error, loading: isLoading || isValidating };
}

export function useNewListing() {
  const fetcher: Fetcher<Listing, {}> = () => sendRequest(GetNewListing);
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetNewListing }, fetcher);
  return { listing: data, mutate, error, loading: isLoading || isValidating };
}

export function useSearch(location: string | undefined) {
  const shouldFetch = location;
  const fetcher: Fetcher<Listing[], { location: string }> = (queryParams: { location: string }) =>
    sendRequest(SearchListings, { queryParams });
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { SearchListings, location } : null,
    fetcher,
  );
  return { listings: data, mutate, error, loading: isLoading || isValidating };
}

export function useFeatured() {
  const fetcher: Fetcher<Listing[], {}> = () => sendRequest(GetFeaturedListings);
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetFeaturedListings }, fetcher);
  return { featured: data, mutate, error, loading: isLoading || isValidating };
}

export function useUpdateListing(listingID: number): MutationResult<ListingUpdates> {
  return useMutation<ListingUpdates>(
    (updates: ListingUpdates) => {
      return sendRequest(UpdateListing, { pathParams: { listingID }, payload: updates });
    },
    {
      onSuccess: () => {
        mutate({ GetNewListing });
        mutate({ GetListing, listingID });
      },
    },
  );
}

export async function updateListing(listingID: number, updates: ListingUpdates) {
  try {
    await sendRequest(UpdateListing, { pathParams: { listingID }, payload: updates });
    mutate({ GetNewListing });
    mutate({ GetListing, listingID });
    return { success: true, error: "" };
  } catch (e) {
    return { success: false, error: forceErrorMessage(e) };
  }
}
