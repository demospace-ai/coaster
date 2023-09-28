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
  duration_minutes: number | undefined;
  max_guests: number | undefined;
  highlights: string[] | undefined;
  includes: string[] | undefined;
  languages: string[] | undefined;
  status: ListingStatus;
  availability_type: AvailabilityTypeType;

  host: Host;

  images: Image[];
}

export interface AvailabilityRule {
  id: number;
  listing_id: number;
  name: string;
  type: AvailabilityRuleTypeType;
  start_date: Date;
  end_date: Date;
  recurring_years: number[];
  recurring_months: number[];

  time_slots: TimeSlot[];
}

export const AvailabilityRuleType = z.enum(["fixed_date", "fixed_range", "recurring"]);
export type AvailabilityRuleTypeType = z.infer<typeof AvailabilityRuleType>;

export interface TimeSlot {
  id: number;
  availability_rule_id: number;
  day_of_week: number;
  start_time: Date;
  capacity: number;
}

export interface Image {
  id: number;
  storage_id: string;
}

export interface Host {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  about: string | undefined;
  profile_picture_url: string | undefined;
}

export interface ListingInput {
  name?: string;
  description?: string;
  category?: CategoryType;
  price?: number;
  location?: string;
  status?: ListingStatus;
  duration_minutes?: number;
  max_guests?: number;
  includes?: string[];
  availability_type?: AvailabilityTypeType;
}

export interface AvailabilityRuleInput {
  name: string;
  type: AvailabilityRuleTypeType;
  start_date?: Date;
  end_date?: Date;
  recurring_years?: number[];
  recurring_months?: number[];
  time_slots?: TimeSlotInput[];
}

export interface AvailabilityRuleUpdates {
  name?: string;
  type?: AvailabilityRuleTypeType;
  start_date?: Date;
  end_date?: Date;
  recurring_years?: number[];
  recurring_months?: number[];
  time_slots?: TimeSlotInput[];
}

export interface TimeSlotInput {
  day_of_week: number;
  start_time?: Date;
  capacity?: number;
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
}

export enum LoginMethod {
  Google = "google",
  Email = "email",
  Undefined = "undefined",
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
  last_name?: string;
  about?: string;
  password?: string;
}

export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
}

export interface CreateUserResponse {
  user: User;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface SendResetRequest {
  email: string;
  destination: string;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
}

export interface SendInviteRequest {
  emails: string[];
}

export interface EmailLoginResponse {
  user: User;
}

export const Category = z.enum([
  "surfing",
  "kiteboarding",
  "kayaking",
  "skiing",
  "fishing",
  "hiking",
  "camping",
  "climbing",
  "cycling",
  "boating",
  "diving",
  "wakesurfing",
  "windsurfing",
  "paddleboarding",
  "outdoors",
  "buggying",
  "efoiling",
  "kitefoiling",
  "safari",
]);
export type CategoryType = z.infer<typeof Category>;

export const AvailabilityType = z.enum(["date", "datetime"]);
export type AvailabilityTypeType = z.infer<typeof AvailabilityType>;
