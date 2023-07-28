import {
  CheckSessionResponse,
  CreateDestinationRequest,
  CreateDestinationResponse,
  CreateObjectRequest,
  CreateObjectResponse,
  GetAllUsersResponse,
  GetDestinationResponse,
  GetDestinationsResponse,
  GetFieldValuesRequest,
  GetFieldValuesResponse,
  GetNamespacesResponse,
  GetObjectResponse,
  GetObjectsResponse,
  GetSchemaRequest,
  GetSchemaResponse,
  GetSourcesResponse,
  GetSyncResponse,
  GetSyncsResponse,
  GetTablesResponse,
  LoginRequest,
  LoginResponse,
  OAuthProvider,
  RunSyncResponse,
  SetOrganizationRequest,
  SetOrganizationResponse,
  TestDataConnectionRequest,
  UpdateObjectFieldsRequest,
  UpdateObjectFieldsResponse,
  UpdateObjectRequest,
  UpdateObjectResponse,
} from "src/rpc/types";

export interface IEndpoint<RequestType, ResponseType> {
  name: string;
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
  path: string;
  track?: boolean;
  queryParams?: string[]; // These will be used as query params instead of being used as path params
  noJson?: boolean; // TODO: do this better
}

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
  name: "Login",
  method: "POST",
  path: "/login",
  track: true,
};

export const OAuthRedirect: IEndpoint<{ provider: OAuthProvider }, undefined> = {
  name: "OAuth Redirect",
  method: "GET",
  path: "/oauth_redirect",
  queryParams: ["provider"],
  track: true,
};

export const GetAllUsers: IEndpoint<undefined, GetAllUsersResponse> = {
  name: "All Users Fetched",
  method: "GET",
  path: "/users",
};

export const GetDestinations: IEndpoint<undefined, GetDestinationsResponse> = {
  name: "Destinations Fetched",
  method: "GET",
  path: "/destinations",
};

export const GetDestination: IEndpoint<{ destinationID: number }, GetDestinationResponse> = {
  name: "Destination Fetched",
  method: "GET",
  path: "/destination/:destinationID",
};

export const GetSources: IEndpoint<undefined, GetSourcesResponse> = {
  name: "Sources Fetched",
  method: "GET",
  path: "/sources",
};

export const GetObjects: IEndpoint<{ destinationID?: number }, GetObjectsResponse> = {
  name: "Objects Fetched",
  method: "GET",
  path: "/objects",
  queryParams: ["destinationID"],
};

export const GetObject: IEndpoint<{ objectID: number }, GetObjectResponse> = {
  name: "Object Fetched",
  method: "GET",
  path: "/object/:objectID",
};

export const UpdateObject: IEndpoint<UpdateObjectRequest, UpdateObjectResponse> = {
  name: "Object Updated",
  method: "PATCH",
  path: "/object/:objectID",
};

export const UpdateObjectFields: IEndpoint<UpdateObjectFieldsRequest, UpdateObjectFieldsResponse> = {
  name: "ObjectField Updated",
  method: "PATCH",
  path: "/object/:objectID/object_fields",
};

export const GetSyncs: IEndpoint<undefined, GetSyncsResponse> = {
  name: "Syncs Fetched",
  method: "GET",
  path: "/syncs",
};

export const GetSync: IEndpoint<{ syncID: number }, GetSyncResponse> = {
  name: "Sync Fetched",
  method: "GET",
  path: "/sync/:syncID",
  track: true,
};

export const GetNamespaces: IEndpoint<{ connectionID: number }, GetNamespacesResponse> = {
  name: "Namespaces Fetched",
  method: "GET",
  path: "/connection/namespaces",
  queryParams: ["connectionID"],
};

export const GetTables: IEndpoint<{ connectionID: number; namespace: string }, GetTablesResponse> = {
  name: "Tables Fetched",
  method: "GET",
  path: "/connection/tables",
  queryParams: ["connectionID", "namespace"],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
  name: "Schema Fetched",
  method: "GET",
  path: "/connection/schema",
  queryParams: ["connectionID", "namespace", "tableName", "customJoin"],
};

export const GetApiKey: IEndpoint<undefined, string> = {
  name: "API Key Fetched",
  method: "GET",
  path: "/api_key",
  noJson: true,
};

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
  name: "Session Checked",
  method: "GET",
  path: "/check_session",
};

export const Logout: IEndpoint<undefined, undefined> = {
  name: "Logout",
  method: "DELETE",
  path: "/logout",
  track: true,
};

export const SetOrganization: IEndpoint<SetOrganizationRequest, SetOrganizationResponse> = {
  name: "Organization Set",
  method: "POST",
  path: "/organization",
  track: true,
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
  name: "Test Data Connection",
  method: "POST",
  path: "/connection/test",
};

export const GetFieldValues: IEndpoint<GetFieldValuesRequest, GetFieldValuesResponse> = {
  name: "Field Values Fetched",
  method: "GET",
  path: "/connection/field_values",
  queryParams: ["connectionID", "namespace", "tableName", "fieldName"],
  track: true,
};

export const CreateDestination: IEndpoint<CreateDestinationRequest, CreateDestinationResponse> = {
  name: "Destination Created",
  method: "POST",
  path: "/destination",
  track: true,
};

export const RunSync: IEndpoint<undefined, RunSyncResponse> = {
  name: "Sync Run",
  method: "POST",
  path: "/sync/:syncID/run",
  track: true,
};

export const CreateObject: IEndpoint<CreateObjectRequest, CreateObjectResponse> = {
  name: "Object Created",
  method: "POST",
  path: "/object",
  track: true,
};
