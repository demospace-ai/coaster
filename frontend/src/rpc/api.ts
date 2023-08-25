import {
  CheckSessionResponse,
  CreateUserRequest,
  CreateUserResponse,
  EmailLoginRequest,
  EmailLoginResponse,
  Listing,
  ListingInput,
  LoginMethod,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
  ResetPasswordRequest,
  SendResetRequest,
  User,
  UserUpdates,
} from "src/rpc/types";

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

export const SearchListings: IEndpoint<undefined, Listing[], undefined, { location?: string; radius?: number }> = {
  name: "Search listings",
  method: "GET",
  path: "/listings",
};

export const GetListing: IEndpoint<undefined, Listing, { listingID: number }> = {
  name: "Get listing",
  method: "GET",
  path: "/listings/:listingID",
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

export const UploadListingImage: IEndpoint<undefined, Listing, { listingID: number }> = {
  name: "Upload listing image",
  method: "POST",
  path: "/listings/:listingID/image",
};

export const GetFeaturedListings: IEndpoint<undefined, Listing[]> = {
  name: "Get featured listings",
  method: "GET",
  path: "/featured",
};

export const GetHostedListings: IEndpoint<undefined, Listing[]> = {
  name: "Get hosted listings",
  method: "GET",
  path: "/listings/hosted",
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

export const OAuthRedirect: IEndpoint<{ provider: OAuthProvider }, undefined> = {
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

export const JoinWaitlist: IEndpoint<{ phone: string }, undefined> = {
  name: "Join waitlist",
  method: "POST",
  path: "/waitlist",
  track: true,
};
