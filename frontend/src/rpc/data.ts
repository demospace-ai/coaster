import { sendRequest } from "src/rpc/ajax";
import { GetListing } from "src/rpc/api";
import { Listing } from "src/rpc/types";
import useSWR, { Fetcher } from "swr";

export function useListing(listingID: number | undefined) {
  const shouldFetch = listingID;
  const fetcher: Fetcher<Listing, { listingID: number }> = (payload: { listingID: number }) =>
    sendRequest(GetListing, payload);
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { GetListing, listingID } : null,
    fetcher,
  );
  return { listing: data, mutate, error, loading: isLoading || isValidating };
}
