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
  images: string[];
}

export interface ListingUpdates {
  name?: string;
  description?: string;
  category?: CategoryType;
  price?: number;
  location?: string;
}

export type Coordinates = { latitude: number; longitude: number };

export enum OAuthProvider {
  Google = "google",
  Github = "github",
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export const Category = z.enum(["surfing", "skiing", "fishing", "hiking", "camping", "cycling", "boating", "climbing"]);
export type CategoryType = z.infer<typeof Category>;
