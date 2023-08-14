import {
  CheckSessionResponse,
  Listing,
  ListingUpdates,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
} from "src/rpc/types";

export interface IEndpoint<RequestType, ResponseType, PathParams = {}, QueryParams = {}> {
  name: string;
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
  path: string;
  track?: boolean;
  queryParams?: string[]; // These will be used as query params instead of being used as path params
  noJson?: boolean; // TODO: do this better
}

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
  name: "Check session",
  method: "GET",
  path: "/check_session",
};

export const SearchListings: IEndpoint<{ location?: string; radius?: number }, Listing[]> = {
  name: "Search listings",
  method: "GET",
  path: "/listings",
  queryParams: ["location", "radius"],
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
  queryParams: ["provider"],
  track: true,
};
