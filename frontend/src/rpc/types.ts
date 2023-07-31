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

export enum OAuthProvider {
  Google = "google",
  Github = "github",
}

export interface User {
  id: number;
  name: string;
  email: string;
  intercom_hash: string;
}
