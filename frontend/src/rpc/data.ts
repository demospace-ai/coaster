import { useOnLoginSuccess } from "src/pages/login/actions";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import {
  CreateAvailabilityRule,
  CreateListing,
  GetAvailabilityRules,
  GetDraftListing,
  GetFeaturedListings,
  GetHostedListings,
  GetListing,
  ResetPassword,
  SearchListings,
  UpdateAvailabilityRule,
  UpdateListing,
  UpdateProfilePicture,
  UpdateUser,
} from "src/rpc/api";
import {
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleUpdates,
  Listing,
  ListingInput,
  ResetPasswordRequest,
  User,
  UserUpdates,
} from "src/rpc/types";
import { HttpError, forceErrorMessage } from "src/utils/errors";
import { Mutation, MutationOpts, useMutation } from "src/utils/queryHelpers";
import useSWR, { Fetcher, SWRConfiguration, mutate } from "swr";

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
  const fetcher: Fetcher<Listing | undefined, {}> = async () => {
    try {
      const result = await sendRequest(GetDraftListing);
      return result;
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.code === 404) {
          // If there is no draft listing, just return undefined
          return undefined;
        }
      }
      throw e;
    }
  };
  const { data, mutate, error, isLoading } = useSWR({ GetDraftListing }, fetcher, opts);
  return { listing: data, mutate, error, loading: isLoading };
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

export function useAvailabilityRules(listingID: number | undefined) {
  const shouldFetch = listingID;
  const fetcher: Fetcher<AvailabilityRule[], { listingID: number }> = (pathParams: { listingID: number }) =>
    sendRequest(GetAvailabilityRules, { pathParams });
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { GetAvailabilityRules, listingID } : null,
    fetcher,
  );
  return { availabilityRules: data, mutate, error, loading: isLoading || isValidating };
}

export function useUpdateListing(listingID: number): Mutation<ListingInput> {
  return useMutation<Listing, ListingInput>(
    async (updates: ListingInput) => {
      return await sendRequest(UpdateListing, { pathParams: { listingID }, payload: updates });
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
    mutate({ GetDraftListing });
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

export function useUpdateAvailabilityRule(
  listingID: number,
  availabilityRuleID: number,
  opts?: MutationOpts<AvailabilityRuleUpdates>,
): Mutation<AvailabilityRuleUpdates> {
  return useMutation<AvailabilityRule, AvailabilityRuleUpdates>(
    async (updates: AvailabilityRuleUpdates) => {
      return await sendRequest(UpdateAvailabilityRule, {
        pathParams: { listingID, availabilityRuleID },
        payload: updates,
      });
    },
    {
      onSuccess: (availabilityRule: AvailabilityRule) => {
        mutate({ GetAvailabilityRules, listingID }, (availabilityRules) =>
          availabilityRules.map((existingRule: AvailabilityRule) => {
            if (existingRule.id === availabilityRuleID) {
              return availabilityRule;
            }
            return existingRule;
          }),
        );
        opts?.onSuccess && opts.onSuccess(availabilityRule);
      },
      onError: opts?.onError,
    },
  );
}

export function useCreateAvailabilityRule(
  listingID: number,
  opts?: MutationOpts<AvailabilityRuleInput>,
): Mutation<AvailabilityRuleInput> {
  return useMutation<AvailabilityRule, AvailabilityRuleInput>(
    async (input: AvailabilityRuleInput) => {
      return await sendRequest(CreateAvailabilityRule, { payload: input });
    },
    {
      onSuccess: (availabilityRule: AvailabilityRule) => {
        mutate({ GetAvailabilityRules, listingID }, (availabilityRules) => [...availabilityRules, availabilityRule]);
        opts?.onSuccess && opts.onSuccess(availabilityRule);
      },
      onError: opts?.onError,
    },
  );
}

export function useUpdateUser(onSuccess?: () => void): Mutation<UserUpdates> {
  const dispatch = useDispatch();
  return useMutation<User, UserUpdates>(
    async (updates: UserUpdates) => {
      return await sendRequest(UpdateUser, { payload: updates });
    },
    {
      onSuccess: (user: User) => {
        dispatch({ type: "login.update", user: user });
        onSuccess && onSuccess();
      },
    },
  );
}

export function useUpdateProfilePicture(): Mutation<File> {
  const dispatch = useDispatch();

  return useMutation<User, File>(
    async (profilePicture: File) => {
      const formData = new FormData();
      formData.append("profile_picture", profilePicture);
      return await sendRequest(UpdateProfilePicture, { formData });
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
  const onLoginSuccess = useOnLoginSuccess();
  return useMutation<User, ResetPasswordRequest>(
    async (request: ResetPasswordRequest) => {
      return await sendRequest(ResetPassword, { payload: request });
    },
    {
      onSuccess: (user: User) => {
        dispatch({ type: "login.authenticated", user: user });
        onLoginSuccess(user);
      },
    },
  );
}
