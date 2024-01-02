import {
  Availability,
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleUpdates,
  Booking,
  CheckSessionResponse,
  CreateCheckoutLinkRequest,
  CreateUserRequest,
  CreateUserResponse,
  EmailLoginRequest,
  EmailLoginResponse,
  Image,
  ItineraryStep,
  ItineraryStepInput,
  Listing,
  ListingInput,
  ListingMetadata,
  LoginMethod,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
  PayoutMethod,
  ResetPasswordRequest,
  SearchParams,
  SendInviteRequest,
  SendResetRequest,
  Tag,
  User,
  UserUpdates,
} from "@coaster/types";

export interface IEndpoint<RequestType, ResponseType, PathParams = {}, QueryParams = {}> {
  name: string;
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
  path: string;
}

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
  name: "Check session",
  method: "GET",
  path: "/check_session",
};

export const SearchListings: IEndpoint<undefined, Listing[], undefined, SearchParams> = {
  name: "Search listings",
  method: "GET",
  path: "/listings",
};

export const GetListing: IEndpoint<undefined, Listing, { listingID: number }> = {
  name: "Get listing",
  method: "GET",
  path: "/listings/:listingID",
};

export const GetTag: IEndpoint<undefined, Tag, { slug: string }> = {
  name: "Get tag",
  method: "GET",
  path: "/tags/:slug",
};

export const GetUserBookings: IEndpoint<undefined, Booking[]> = {
  name: "Get user bookings",
  method: "GET",
  path: "/user_bookings",
};

export const GetUserBooking: IEndpoint<undefined, Booking, { bookingReference: string }> = {
  name: "Get user bookings",
  method: "GET",
  path: "/user_bookings/:bookingReference",
};

export const GetAvailability: IEndpoint<
  undefined,
  Availability[],
  { listingID: number },
  { start_date: string; end_date: string }
> = {
  name: "Get availability",
  method: "GET",
  path: "/listings/:listingID/availability",
};

export const GetDraftListing: IEndpoint<undefined, Listing> = {
  name: "Get draft listing",
  method: "GET",
  path: "/listings/draft",
};

export const CreateListing: IEndpoint<ListingInput, Listing> = {
  name: "Create new listing",
  method: "POST",
  path: "/listings",
};

export const UpdateListing: IEndpoint<ListingInput, Listing, { listingID: number }> = {
  name: "Update listing",
  method: "POST",
  path: "/listings/:listingID",
};

export const DeleteListing: IEndpoint<undefined, undefined, { listingID: number }> = {
  name: "Delete listing",
  method: "DELETE",
  path: "/listings/:listingID",
};

export const UpdateItinerarySteps: IEndpoint<ItineraryStepInput[], ItineraryStep[], { listingID: number }> = {
  name: "Update itinerary steps",
  method: "POST",
  path: "/listings/:listingID/itinerary_steps",
};

export const CreateAvailabilityRule: IEndpoint<AvailabilityRuleInput, AvailabilityRule, { listingID: number }> = {
  name: "Create new availability rule",
  method: "POST",
  path: "/listings/:listingID/availability_rules",
};

export const UpdateAvailabilityRule: IEndpoint<
  AvailabilityRuleUpdates,
  AvailabilityRule,
  { listingID: number; availabilityRuleID: number }
> = {
  name: "Update availability rule",
  method: "PATCH",
  path: "/listings/:listingID/availability_rules/:availabilityRuleID",
};

export const DeleteAvailabilityRule: IEndpoint<
  undefined,
  undefined,
  { listingID: number; availabilityRuleID: number }
> = {
  name: "Delete availability rule",
  method: "DELETE",
  path: "/listings/:listingID/availability_rules/:availabilityRuleID",
};

export const AddListingImage: IEndpoint<undefined, Image, { listingID: number }> = {
  name: "Add listing image",
  method: "POST",
  path: "/listings/:listingID/image",
};

export const DeleteListingImage: IEndpoint<undefined, undefined, { listingID: number; imageID: number }> = {
  name: "Delete listing image",
  method: "DELETE",
  path: "/listings/:listingID/image/:imageID",
};

export const UpdateListingImages: IEndpoint<{ images: Image[] }, undefined, { listingID: number }> = {
  name: "Update listing images",
  method: "PATCH",
  path: "/listings/:listingID/images",
};

export const GetAvailabilityRules: IEndpoint<undefined, AvailabilityRule[]> = {
  name: "Get availability rules",
  method: "GET",
  path: "/listings/:listingID/availability_rules",
};

export const GetHostedListings: IEndpoint<undefined, Listing[]> = {
  name: "Get hosted listings",
  method: "GET",
  path: "/listings/hosted",
};

export const GetPayoutMethods: IEndpoint<undefined, PayoutMethod[]> = {
  name: "Get payout methods",
  method: "GET",
  path: "/payout_methods",
};

export const CreatePayoutMethod: IEndpoint<undefined, string> = {
  name: "Create payout method",
  method: "POST",
  path: "/payout_methods",
};

export const GetStripeDashboardLink: IEndpoint<undefined, string> = {
  name: "Get Stripe dashboard link",
  method: "GET",
  path: "/stripe_dashboard_link",
};

export const CreateCheckoutLink: IEndpoint<CreateCheckoutLinkRequest, string> = {
  name: "Create Checkout link",
  method: "POST",
  path: "/checkout_link",
};

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
  name: "Login",
  method: "POST",
  path: "/login",
};

export const Logout: IEndpoint<undefined, undefined> = {
  name: "Logout",
  method: "DELETE",
  path: "/logout",
};

export const OAuthRedirect: IEndpoint<undefined, undefined, undefined, { provider: OAuthProvider; origin: string }> = {
  name: "OAuth Redirect",
  method: "GET",
  path: "/oauth_redirect",
};

export const UpdateUser: IEndpoint<UserUpdates, User> = {
  name: "Update user",
  method: "POST",
  path: "/user",
};

export const UpdateProfilePicture: IEndpoint<undefined, User> = {
  name: "Update listing image",
  method: "POST",
  path: "/user/profile_picture",
};

export const CheckEmail: IEndpoint<
  undefined,
  { exists: boolean; login_method: LoginMethod },
  undefined,
  { email: string }
> = {
  name: "Check email",
  method: "GET",
  path: "/email",
};

export const CreateUser: IEndpoint<CreateUserRequest, CreateUserResponse> = {
  name: "Create user",
  method: "POST",
  path: "/register",
};

export const EmailLogin: IEndpoint<EmailLoginRequest, EmailLoginResponse> = {
  name: "Email login",
  method: "POST",
  path: "/login",
};

export const SendReset: IEndpoint<SendResetRequest, undefined> = {
  name: "Send reset",
  method: "POST",
  path: "/send_reset",
};

export const ResetPassword: IEndpoint<ResetPasswordRequest, User> = {
  name: "Reset password",
  method: "POST",
  path: "/reset_password",
};

export const SendInvite: IEndpoint<SendInviteRequest, undefined> = {
  name: "SendInvite",
  method: "POST",
  path: "/send_invite",
};

export const GetAllListingMetadata: IEndpoint<undefined, ListingMetadata[]> = {
  name: "Get all listing metadata",
  method: "GET",
  path: "/listing_metadata",
};
