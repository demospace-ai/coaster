import { CheckSessionResponse, LoginRequest, LoginResponse, OAuthProvider } from "src/rpc/types";

export interface IEndpoint<RequestType, ResponseType> {
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

export const SearchListings: IEndpoint<{ location: string; radius?: number }, CheckSessionResponse> = {
  name: "Search listings",
  method: "GET",
  path: "/listings",
  queryParams: ["location", "radius"],
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
