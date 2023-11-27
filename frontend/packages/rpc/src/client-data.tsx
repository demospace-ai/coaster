"use client";

import {
  Availability,
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleUpdates,
  CreateCheckoutLinkRequest,
  Image,
  Listing,
  ListingInput,
  PayoutMethod,
  ResetPasswordRequest,
  User,
  UserUpdates,
} from "@coaster/types";
import { Mutation, MutationOpts, useMutation } from "@coaster/utils/client";
import { HttpError, forceErrorMessage, isProd } from "@coaster/utils/common";
import { H } from "highlight.run";
import { createContext, useCallback, useContext } from "react";
import useSWR, { Fetcher, SWRConfiguration, mutate } from "swr";
import { sendRequest } from "./ajax";
import {
  CheckSession,
  CreateAvailabilityRule,
  CreateCheckoutLink,
  CreateListing,
  CreatePayoutMethod,
  GetAvailability,
  GetAvailabilityRules,
  GetDraftListing,
  GetFeaturedListings,
  GetHostedListings,
  GetListing,
  GetPayoutMethods,
  GetStripeDashboardLink,
  Logout,
  ResetPassword,
  SearchListings,
  UpdateAvailabilityRule,
  UpdateProfilePicture,
  UpdateUser,
} from "./api";
import {
  addListingImagesServerAction,
  deleteListingImagesServerAction,
  updateListingImagesServerAction,
  updateListingServerAction,
} from "./server-actions";

// TODO: this isn't the right place for this so reorganize later
// We use context so that we can populate the initial user from the server-side fetch
export const AuthContext = createContext<{
  user: User | undefined;
  loading: boolean;
  loginOpen: boolean;
  create: boolean;
  openLoginModal: (create?: boolean) => void;
  closeLoginModal: () => void;
}>({
  user: undefined,
  loading: false,
  loginOpen: false,
  create: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});
export const useAuthContext = () => useContext(AuthContext);

export const NotificationContext = createContext<{
  showNotification: (type: "error" | "success" | "info", content: React.ReactNode, duration?: number) => void;
}>({
  showNotification: () => {},
});
export const useNotificationContext = () => useContext(NotificationContext);

export function useListing(listingID: number | undefined, initialData?: Listing) {
  const shouldFetch = listingID;
  const fetcher: Fetcher<Listing, { listingID: number }> = (pathParams: { listingID: number }) =>
    sendRequest(GetListing, { pathParams });
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { GetListing, listingID } : null,
    fetcher,
    { fallbackData: initialData },
  );
  return { listing: data, mutate, error, loading: isLoading || isValidating };
}

export function useAvailability(listingID: number, startDate: string, endDate: string) {
  const fetcher: Fetcher<Availability[], { listingID: number; startDate: string; endDate: string }> = ({
    listingID,
    startDate,
    endDate,
  }) =>
    sendRequest(GetAvailability, {
      pathParams: { listingID },
      queryParams: { start_date: startDate, end_date: endDate },
    });

  const { data, mutate, error, isLoading, isValidating } = useSWR(
    { GetAvailability, listingID, startDate, endDate },
    fetcher,
  );
  return {
    availability: data,
    mutate,
    error,
    loading: isLoading || isValidating,
  };
}

export function useHostedListings() {
  const fetcher: Fetcher<Listing[], {}> = () => sendRequest(GetHostedListings);
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetHostedListings }, fetcher);
  return { hosted: data, mutate, error, loading: isLoading || isValidating };
}

export function usePayoutMethods() {
  const fetcher: Fetcher<PayoutMethod[], {}> = () => sendRequest(GetPayoutMethods);
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetPayoutMethods }, fetcher);
  return {
    payoutMethods: data,
    mutate,
    error,
    loading: isLoading || isValidating,
  };
}

export function useDraftListing(opts?: SWRConfiguration) {
  const fetcher: Fetcher<Listing | undefined, {}> = async (): Promise<Listing | undefined> => {
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

export function useSearch(location?: string, categories?: string) {
  const shouldFetch = location || categories;
  const fetcher: Fetcher<Listing[], { location?: string; categories?: string }> = ({ location, categories }) => {
    const queryParams: { location?: string; categories?: string } = {};
    if (location) {
      queryParams.location = location;
    }

    if (categories) {
      queryParams.categories = categories;
    }

    return sendRequest(SearchListings, { queryParams });
  };
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { SearchListings, location, categories } : null,
    fetcher,
  );
  return { listings: data, mutate, error, loading: isLoading || isValidating };
}

export function useFeatured(categories?: string, duration?: number, initialData?: Listing[]) {
  const fetcher: Fetcher<Listing[], { categories?: string }> = ({ categories }) => {
    const queryParams: { categories?: string; durationMinutes?: number } = {};
    if (categories) {
      queryParams.categories = categories;
    }

    if (duration) {
      queryParams.durationMinutes = duration;
    }

    return sendRequest(GetFeaturedListings, { queryParams });
  };
  const { data, mutate, error, isLoading, isValidating } = useSWR({ GetFeaturedListings, categories }, fetcher, {
    fallbackDate: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return { listings: data, mutate, error, loading: isLoading || isValidating };
}

export function useAvailabilityRules(listingID: number | undefined) {
  const shouldFetch = listingID;
  const fetcher: Fetcher<AvailabilityRule[], { listingID: number }> = (pathParams: { listingID: number }) =>
    sendRequest(GetAvailabilityRules, { pathParams });
  const { data, mutate, error, isLoading, isValidating } = useSWR(
    shouldFetch ? { GetAvailabilityRules, listingID } : null,
    fetcher,
  );
  return {
    availabilityRules: data,
    mutate,
    error,
    loading: isLoading || isValidating,
  };
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

export async function updateListing(listingID: number, updates: ListingInput, isDraft?: boolean) {
  const listing = await updateListingServerAction(listingID, updates);
  isDraft && mutate({ GetDraftListing });
  mutate({ GetListing, listingID }, listing);
}

export async function updateListingImages(listingID: number, images: Image[], isDraft?: boolean) {
  const listing = await updateListingImagesServerAction(listingID, images);
  isDraft && mutate({ GetDraftListing });
  mutate({ GetListing, listingID }, listing);
}

export async function addListingImage(listing: Listing, imageFormData: FormData, isDraft?: boolean): Promise<Image> {
  const listingImage = await addListingImagesServerAction(listing.id, imageFormData);
  isDraft && mutate({ GetDraftListing });
  mutate({ GetListing, listingID: listing.id }, { ...listing, images: [...listing.images, listingImage] });
  return listingImage;
}

export async function deleteListingImage(listing: Listing, imageID: number, isDraft?: boolean): Promise<Image[]> {
  await deleteListingImagesServerAction(listing.id, imageID);
  isDraft && mutate({ GetDraftListing });
  const newImages = listing.images.filter((item) => item.id !== imageID);
  mutate({ GetListing, listingID: listing.id }, { ...listing, images: newImages });
  return newImages;
}

export function useUpdateAvailabilityRule(
  listingID: number,
  availabilityRuleID: number,
  opts?: MutationOpts<AvailabilityRule>,
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

export function useCreatePayoutMethod(opts?: MutationOpts<string>): Mutation<void> {
  return useMutation<string, void>(async () => {
    return await sendRequest(CreatePayoutMethod);
  }, opts);
}

export function useGetStripeDashboardLink(opts?: MutationOpts<string>): Mutation<void> {
  return useMutation<string, void>(async () => {
    return await sendRequest(GetStripeDashboardLink);
  }, opts);
}

export function useCreateCheckoutLink(opts?: MutationOpts<string>): Mutation<CreateCheckoutLinkRequest> {
  return useMutation<string, CreateCheckoutLinkRequest>(async (payload) => {
    return await sendRequest(CreateCheckoutLink, { payload });
  }, opts);
}

export function useCreateAvailabilityRule(
  listingID: number,
  opts?: MutationOpts<AvailabilityRule>,
): Mutation<AvailabilityRuleInput> {
  return useMutation<AvailabilityRule, AvailabilityRuleInput>(
    async (input: AvailabilityRuleInput) => {
      return await sendRequest(CreateAvailabilityRule, {
        pathParams: { listingID },
        payload: input,
      });
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
  return useMutation<User, UserUpdates>(
    async (updates: UserUpdates) => {
      return await sendRequest(UpdateUser, { payload: updates });
    },
    {
      onSuccess: (user: User) => {
        mutate({ CheckSession }, user);
        onSuccess && onSuccess();
      },
    },
  );
}

export function useUpdateProfilePicture(): Mutation<File> {
  const { showNotification } = useNotificationContext();
  return useMutation<User, File>(
    async (profilePicture: File) => {
      const formData = new FormData();
      formData.append("profile_picture", profilePicture);
      return await sendRequest(UpdateProfilePicture, { formData });
    },
    {
      onSuccess: (user) => {
        mutate({ CheckSession }, user);
      },
      onError: (e) => {
        showNotification("error", forceErrorMessage(e));
      },
    },
  );
}

export function useResetPassword(): Mutation<ResetPasswordRequest> {
  return useMutation<User, ResetPasswordRequest>(
    async (request: ResetPasswordRequest) => {
      return await sendRequest(ResetPassword, { payload: request });
    },
    {
      onSuccess: (user: User) => {
        mutate({ CheckSession }, user);
      },
    },
  );
}

export function useOnLoginSuccess() {
  return useCallback(async (user: User) => {
    mutate({ CheckSession }, user);
    identifyUser(user);
  }, []);
}

export function identifyUser(user: User) {
  if (isProd()) {
    H.identify(user.email, {
      id: user.id.toString(),
    });
    if ((window as any).rudderanalytics) {
      (window as any).rudderanalytics.identify(user.id.toString());
    }
  }
}

export function useLogout(onHostApp?: boolean) {
  return useCallback(async () => {
    await sendRequest(Logout);
    mutate({ CheckSession }, undefined);
  }, []);
}
