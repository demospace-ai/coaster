import {
  Availability,
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleUpdates,
  CheckSessionResponse,
  CreateCheckoutLinkRequest,
  CreateUserRequest,
  CreateUserResponse,
  EmailLoginRequest,
  EmailLoginResponse,
  Image,
  Listing,
  ListingInput,
  LoginMethod,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
  PayoutMethod,
  ResetPasswordRequest,
  SendInviteRequest,
  SendResetRequest,
  User,
  UserUpdates,
} from "@coaster/types";

export interface IEndpoint<RequestType, ResponseType, PathParams = {}, QueryParams = {}> {
  name: string;
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
  path: string;
  track?: boolean;
  noJson?: boolean; // TODO: do this better
}

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
  name: "Check session",
  method: "GET",
  path: "/check_session",
};

export const SearchListings: IEndpoint<
  undefined,
  Listing[],
  undefined,
  { location?: string; radius?: number; categories?: string }
> = {
  name: "Search listings",
  method: "GET",
  path: "/listings",
  track: true,
};

export const GetListing: IEndpoint<undefined, Listing, { listingID: number }> = {
  name: "Get listing",
  method: "GET",
  path: "/listings/:listingID",
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
  track: true,
};

export const UpdateListing: IEndpoint<ListingInput, Listing, { listingID: number }> = {
  name: "Update listing",
  method: "POST",
  path: "/listings/:listingID",
  track: true,
};

export const DeleteListing: IEndpoint<undefined, undefined, { listingID: number }> = {
  name: "Delete listing",
  method: "DELETE",
  path: "/listings/:listingID",
  track: true,
};

export const CreateAvailabilityRule: IEndpoint<AvailabilityRuleInput, AvailabilityRule, { listingID: number }> = {
  name: "Create new availability rule",
  method: "POST",
  path: "/listings/:listingID/availability_rules",
  track: true,
};

export const UpdateAvailabilityRule: IEndpoint<
  AvailabilityRuleUpdates,
  AvailabilityRule,
  { listingID: number; availabilityRuleID: number }
> = {
  name: "Update availability rule",
  method: "PATCH",
  path: "/listings/:listingID/availability_rules/:availabilityRuleID",
  track: true,
};

export const DeleteAvailabilityRule: IEndpoint<
  undefined,
  undefined,
  { listingID: number; availabilityRuleID: number }
> = {
  name: "Delete availability rule",
  method: "DELETE",
  path: "/listings/:listingID/availability_rules/:availabilityRuleID",
  track: true,
};

export const AddListingImage: IEndpoint<undefined, Image, { listingID: number }> = {
  name: "Add listing image",
  method: "POST",
  path: "/listings/:listingID/image",
  track: true,
};

export const DeleteListingImage: IEndpoint<undefined, undefined, { listingID: number; imageID: number }> = {
  name: "Delete listing image",
  method: "DELETE",
  path: "/listings/:listingID/image/:imageID",
  track: true,
};

export const UpdateListingImages: IEndpoint<{ images: Image[] }, undefined, { listingID: number }> = {
  name: "Update listing images",
  method: "PATCH",
  path: "/listings/:listingID/images",
  track: true,
};

export const GetFeaturedListings: IEndpoint<undefined, Listing[], undefined, { categories?: string }> = {
  name: "Get featured listings",
  method: "GET",
  path: "/featured",
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
  track: true,
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
  track: true,
};

export const Logout: IEndpoint<undefined, undefined> = {
  name: "Logout",
  method: "DELETE",
  path: "/logout",
  track: true,
};

export const OAuthRedirect: IEndpoint<undefined, undefined, undefined, { provider: OAuthProvider; origin: string }> = {
  name: "OAuth Redirect",
  method: "GET",
  path: "/oauth_redirect",
  track: true,
};

export const UpdateUser: IEndpoint<UserUpdates, User> = {
  name: "Update user",
  method: "POST",
  path: "/user",
  track: true,
};

export const UpdateProfilePicture: IEndpoint<undefined, User> = {
  name: "Update listing image",
  method: "POST",
  path: "/user/profile_picture",
  track: true,
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
  track: true,
};

export const CreateUser: IEndpoint<CreateUserRequest, CreateUserResponse> = {
  name: "Create user",
  method: "POST",
  path: "/register",
  track: true,
};

export const EmailLogin: IEndpoint<EmailLoginRequest, EmailLoginResponse> = {
  name: "Email login",
  method: "POST",
  path: "/login",
  track: true,
};

export const SendReset: IEndpoint<SendResetRequest, undefined> = {
  name: "Send reset",
  method: "POST",
  path: "/send_reset",
  track: true,
};

export const ResetPassword: IEndpoint<ResetPasswordRequest, User> = {
  name: "Reset password",
  method: "POST",
  path: "/reset_password",
  track: true,
};

export const SendInvite: IEndpoint<SendInviteRequest, undefined> = {
  name: "SendInvite",
  method: "POST",
  path: "/send_invite",
  track: true,
};

export const JoinWaitlist: IEndpoint<{ email: string }, undefined> = {
  name: "Join waitlist",
  method: "POST",
  path: "/waitlist",
  track: true,
};
