"use client";

import {
  Availability,
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleUpdates,
  CreateCheckoutLinkRequest,
  Image,
  ItineraryStep,
  ItineraryStepInput,
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
  CreateCheckoutLink,
  CreateListing,
  CreatePayoutMethod,
  GetAvailability,
  GetAvailabilityRules,
  GetDraftListing,
  GetHostedListings,
  GetListing,
  GetPayoutMethods,
  GetStripeDashboardLink,
  Logout,
  ResetPassword,
  SearchListings,
  UpdateProfilePicture,
  UpdateUser,
} from "./api";
import {
  addListingImagesServerAction,
  createAvailabilityRuleServerAction,
  deleteListingImagesServerAction,
  updateAvailabilityRuleServerAction,
  updateItineraryServerAction,
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
    mutate({ GetDraftListing }, listing, { revalidate: false });
    return { success: true, error: "" };
  } catch (e) {
    return { success: false, error: forceErrorMessage(e) };
  }
}

export async function updateListing(listingID: number, updates: ListingInput, isDraft?: boolean) {
  const listing = await updateListingServerAction(listingID, updates);
  isDraft && mutate({ GetDraftListing }, listing, { revalidate: false });
  mutate({ GetListing, listingID }, listing, { revalidate: false });
}

export async function updateItinerarySteps(listingID: number, updates: ItineraryStepInput[]): Promise<ItineraryStep[]> {
  const itinerarySteps = await updateItineraryServerAction(listingID, updates);
  mutate({ GetListing, listingID }, (listing) => {
    if (listing) {
      return { ...listing, itinerary_steps: itinerarySteps };
    }
    return listing;
  });

  return itinerarySteps;
}

export async function updateListingImages(listingID: number, images: Image[], isDraft?: boolean) {
  const listing = await updateListingImagesServerAction(listingID, images);
  isDraft && mutate({ GetDraftListing }, listing, { revalidate: false });
  mutate({ GetListing, listingID }, listing, { revalidate: false });
}

export async function addListingImage(listing: Listing, imageFormData: FormData, isDraft?: boolean): Promise<Image> {
  const listingImage = await addListingImagesServerAction(listing.id, imageFormData);
  isDraft &&
    mutate({ GetDraftListing }, { ...listing, images: [...listing.images, listingImage] }, { revalidate: false });
  mutate(
    { GetListing, listingID: listing.id },
    { ...listing, images: [...listing.images, listingImage] },
    { revalidate: false },
  );
  return listingImage;
}

export async function deleteListingImage(listing: Listing, imageID: number, isDraft?: boolean): Promise<Image[]> {
  await deleteListingImagesServerAction(listing.id, imageID);
  const newImages = listing.images.filter((item) => item.id !== imageID);
  isDraft && mutate({ GetDraftListing }, { ...listing, images: newImages }, { revalidate: false });
  mutate({ GetListing, listingID: listing.id }, { ...listing, images: newImages }, { revalidate: false });
  return newImages;
}

export function useUpdateAvailabilityRule(
  listingID: number,
  availabilityRuleID: number,
  opts?: MutationOpts<AvailabilityRule>,
): Mutation<AvailabilityRuleUpdates> {
  return useMutation<AvailabilityRule, AvailabilityRuleUpdates>(
    async (updates: AvailabilityRuleUpdates) => {
      return await updateAvailabilityRuleServerAction(listingID, availabilityRuleID, updates);
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
      return await createAvailabilityRuleServerAction(listingID, input);
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
    recordSignupConversion(user);
  }, []);
}

export function identifyUser(user: User) {
  if (isProd()) {
    H.identify(user.email, {
      id: user.id.toString(),
    });
    if ((window as any).rudderanalytics) {
      (window as any).rudderanalytics.identify(user.id.toString(), {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }
}

export function recordSignupConversion(user: User) {
  if ((window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-10823158367/ysuFCMa_l4cZEN-U8ago",
    });
  }
}

export function useLogout(onHostApp?: boolean) {
  return useCallback(async () => {
    await sendRequest(Logout);
    mutate({ CheckSession }, undefined);
  }, []);
}
