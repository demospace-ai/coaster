import {
  CheckSessionResponse,
  CreateUserRequest,
  CreateUserResponse,
  EmailLoginRequest,
  EmailLoginResponse,
  Listing,
  ListingUpdates,
  LoginMethod,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
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

export const GetNewListing: IEndpoint<undefined, Listing> = {
  name: "Get new listing",
  method: "GET",
  path: "/listings/new",
};

export const UpdateListing: IEndpoint<ListingUpdates, Listing, { listingID: number }> = {
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

export const UpdateUser: IEndpoint<UserUpdates, undefined> = {
  name: "Update user",
  method: "POST",
  path: "/user",
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

export const JoinWaitlist: IEndpoint<{ phone: string }, undefined> = {
  name: "Join waitlist",
  method: "POST",
  path: "/waitlist",
  track: true,
};
