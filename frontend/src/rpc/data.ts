import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import {
  CreateListing,
  GetDraftListing,
  GetFeaturedListings,
  GetHostedListings,
  GetListing,
  ResetPassword,
  SearchListings,
  UpdateListing,
  UpdateProfilePicture,
  UpdateUser,
} from "src/rpc/api";
import { Listing, ListingInput, ResetPasswordRequest, User, UserUpdates } from "src/rpc/types";
import { forceErrorMessage } from "src/utils/errors";
import { Mutation, useMutation } from "src/utils/queryHelpers";
import useSWR, { Fetcher, SWRConfiguration, mutate } from "swr";
import useSWRImmutable from "swr/immutable";

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

export function useDraftListing(opts?: SWRConfiguration) {
  const fetcher: Fetcher<Listing, {}> = () => sendRequest(GetDraftListing);
  const { data, mutate, error, isLoading } = useSWR({ GetDraftListing }, fetcher, opts);
  return { listing: data, mutate, error, loading: isLoading };
}

export function useDraftListingOnce(opts?: SWRConfiguration) {
  const fetcher: Fetcher<Listing, {}> = () => sendRequest(GetDraftListing);
  const { data, error, isLoading } = useSWRImmutable({ GetDraftListing, immutable: true }, fetcher, opts);
  return { listing: data, loading: isLoading, error };
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

export function useUpdateListing(listingID: number): Mutation<ListingInput> {
  return useMutation<Listing, ListingInput>(
    (updates: ListingInput) => {
      return sendRequest(UpdateListing, { pathParams: { listingID }, payload: updates });
    },
    {
      onSuccess: (listing: Listing) => {
        mutate({ GetDraftListing }, listing);
        mutate({ GetListing, listingID }, listing);
      },
    },
  );
}

export async function updateListing(listingID: number, updates: ListingInput) {
  try {
    const listing = await sendRequest(UpdateListing, { pathParams: { listingID }, payload: updates });
    mutate({ GetDraftListing }, listing);
    mutate({ GetListing, listingID }, listing);
    return { success: true, error: "" };
  } catch (e) {
    return { success: false, error: forceErrorMessage(e) };
  }
}

export async function createListing(input: ListingInput) {
  try {
    const listing = await sendRequest(CreateListing, { payload: input });
    mutate({ GetDraftListing }, listing);
    return { success: true, error: "" };
  } catch (e) {
    return { success: false, error: forceErrorMessage(e) };
  }
}

export function useUpdateUser(): Mutation<UserUpdates> {
  const dispatch = useDispatch();
  return useMutation<User, UserUpdates>(
    (updates: UserUpdates) => {
      return sendRequest(UpdateUser, { payload: updates });
    },
    {
      onSuccess: (user: User) => {
        dispatch({ type: "login.update", user: user });
      },
    },
  );
}

export function useUpdateProfilePicture(): Mutation<File> {
  const dispatch = useDispatch();

  return useMutation<User, File>(
    (profilePicture: File) => {
      const formData = new FormData();
      formData.append("profile_picture", profilePicture);
      return sendRequest(UpdateProfilePicture, { formData });
    },
    {
      onSuccess: (user) => {
        dispatch({ type: "login.update", user: user });
      },
      onError: (e) => {
        dispatch({ type: "toast", toast: { type: "error", content: forceErrorMessage(e) } });
      },
    },
  );
}

export function useResetPassword(): Mutation<ResetPasswordRequest> {
  const dispatch = useDispatch();
  return useMutation<User, ResetPasswordRequest>(
    (request: ResetPasswordRequest) => {
      return sendRequest(ResetPassword, { payload: request });
    },
    {
      onSuccess: (user: User) => {
        dispatch({ type: "login.authenticated", user: user });
      },
    },
  );
}
