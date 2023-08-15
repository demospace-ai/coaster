import { z } from "zod";

export interface LoginRequest {
  code?: string;
  state?: string;
  organization_name?: string;
  organization_id?: string;
}

export interface LoginResponse {
  user: User;
}

export interface CheckSessionResponse {
  user: User;
}

export interface SearchListingsResponse {
  listings: Listing[];
}

export interface Listing {
  id: number;
  name: string | undefined;
  description: string | undefined;
  category: CategoryType | undefined;
  price: number | undefined;
  location: string | undefined;
  coordinates: Coordinates | undefined;
  short_description: string | undefined;
  cancellation: CancellationPolicy | undefined;
  duration_hours: number | undefined;
  max_guests: number | undefined;
  highlights: string[] | undefined;
  includes: string[] | undefined;
  status: ListingStatus;

  host: Host;

  images: string[];
}

export interface Host {
  id: number;
  first_name: string;
  last_name: string;
  about: string | undefined;
  profile_picture_url: string | undefined;
}

export interface ListingUpdates {
  name?: string;
  description?: string;
  category?: CategoryType;
  price?: number;
  location?: string;
  status?: ListingStatus;
}

export enum CancellationPolicy {
  Flexible = "flexible",
  Moderate = "moderate",
  Strict = "strict",
}

export enum ListingStatus {
  Published = "published",
  Draft = "draft",
  Review = "review",
}

export type Coordinates = { latitude: number; longitude: number };

export enum OAuthProvider {
  Google = "google",
  Github = "github",
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_picture_url?: string;
  about?: string;
  is_host: boolean;
}

export interface UserUpdates {
  first_name: string;
  last_name: string;
  about?: string;
}

export const Category = z.enum(["surfing", "skiing", "fishing", "hiking", "camping", "cycling", "boating", "diving"]);
export type CategoryType = z.infer<typeof Category>;
