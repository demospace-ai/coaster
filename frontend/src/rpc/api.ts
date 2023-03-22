
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEndpoint<RequestType, ResponseType> {
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  track?: boolean;
  queryParams?: string[]; // These will be used as query params instead of being used as path params
  noJson?: boolean; // TODO: do this better
}

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
  name: 'Login',
  method: 'POST',
  path: '/login',
  track: true,
};

export const GetAllUsers: IEndpoint<undefined, GetAllUsersResponse> = {
  name: 'All Users Fetched',
  method: 'GET',
  path: '/users',
};

export const GetDestinations: IEndpoint<undefined, GetDestinationsResponse> = {
  name: 'Destinations Fetched',
  method: 'GET',
  path: '/destinations',
};

export const GetSources: IEndpoint<undefined, GetSourcesResponse> = {
  name: 'Sources Fetched',
  method: 'GET',
  path: '/sources',
};

export const GetObjects: IEndpoint<undefined, GetObjectsResponse> = {
  name: 'Objects Fetched',
  method: 'GET',
  path: '/objects',
};

export const GetObject: IEndpoint<{ objectID: number; }, GetObjectResponse> = {
  name: 'Object Fetched',
  method: 'GET',
  path: '/object',
  queryParams: ['objectID'],
};

export const GetSyncs: IEndpoint<undefined, GetSyncsResponse> = {
  name: 'Syncs Fetched',
  method: 'GET',
  path: '/syncs',
};

export const GetSyncDetails: IEndpoint<{ syncID: number; }, GetSyncDetailsResponse> = {
  name: 'Sync Details Fetched',
  method: 'GET',
  path: '/sync/:syncID',
  track: true,
};

export const GetNamespaces: IEndpoint<{ connectionID: number; }, GetNamespacesResponse> = {
  name: 'Namespaces Fetched',
  method: 'GET',
  path: '/connection/namespaces',
  queryParams: ['connectionID']
};

export const GetTables: IEndpoint<{ connectionID: number, namespace: string; }, GetTablesResponse> = {
  name: 'Tables Fetched',
  method: 'GET',
  path: '/connection/tables',
  queryParams: ['connectionID', 'namespace'],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
  name: 'Schema Fetched',
  method: 'GET',
  path: '/connection/schema',
  queryParams: ['connectionID', 'namespace', 'tableName', 'customJoin'],
};

export const LinkGetPreview: IEndpoint<LinkGetPreviewRequest, QueryResults> = {
  name: 'Get Preview',
  method: 'POST',
  path: '/link/preview',
};

export const LinkGetSources: IEndpoint<undefined, GetSourcesResponse> = {
  name: 'Sources Fetched',
  method: 'GET',
  path: '/link/sources',
};

export const LinkGetNamespaces: IEndpoint<{ sourceID: number; }, GetNamespacesResponse> = {
  name: 'Namespaces Fetched',
  method: 'GET',
  path: '/link/namespaces',
  queryParams: ['sourceID']
};

export const LinkGetTables: IEndpoint<{ sourceID: number, namespace: string; }, GetTablesResponse> = {
  name: 'Tables Fetched',
  method: 'GET',
  path: '/link/tables',
  queryParams: ['sourceID', 'namespace'],
};

export const LinkGetSchema: IEndpoint<LinkGetSchemaRequest, GetSchemaResponse> = {
  name: 'Schema Fetched',
  method: 'GET',
  path: '/link/schema',
  queryParams: ['sourceID', 'namespace', 'tableName', 'customJoin'],
};

export const GetApiKey: IEndpoint<undefined, string> = {
  name: 'API Key Fetched',
  method: 'GET',
  path: '/api_key',
  noJson: true,
};

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
  name: 'Session Checked',
  method: 'GET',
  path: '/check_session',
};

export const Logout: IEndpoint<undefined, undefined> = {
  name: 'Logout',
  method: 'DELETE',
  path: '/logout',
  track: true,
};

export const SetOrganization: IEndpoint<SetOrganizationRequest, SetOrganizationResponse> = {
  name: 'Organization Set',
  method: 'POST',
  path: '/organization',
  track: true,
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
  name: 'Test Data Connection',
  method: 'POST',
  path: '/connection/test',
};

export const GetFieldValues: IEndpoint<GetFieldValuesRequest, GetFieldValuesResponse> = {
  name: 'Field Values Fetched',
  method: 'GET',
  path: '/connection/field_values',
  queryParams: ['connectionID', 'namespace', 'tableName', 'fieldName'],
  track: true,
};

export const CreateDestination: IEndpoint<CreateDestinationRequest, undefined> = {
  name: 'Destination Created',
  method: 'POST',
  path: '/destination',
  track: true,
};

export const LinkCreateSource: IEndpoint<LinkCreateSourceRequest, CreateSourceResponse> = {
  name: 'Source Created',
  method: 'POST',
  path: '/link/source',
  track: true,
};

export const LinkCreateSync: IEndpoint<LinkCreateSyncRequest, CreateSyncResponse> = {
  name: 'Sync Created',
  method: 'POST',
  path: '/link/sync',
  track: true,
};

export const LinkGetSyncs: IEndpoint<undefined, GetSyncsResponse> = {
  name: 'Syncs Fetched',
  method: 'GET',
  path: '/link/syncs',
  track: true,
};

export const LinkGetSyncDetails: IEndpoint<{ syncID: number; }, GetSyncDetailsResponse> = {
  name: 'Sync Details Fetched',
  method: 'GET',
  path: '/link/sync/:syncID',
  track: true,
};

export const CreateObject: IEndpoint<CreateObjectRequest, undefined> = {
  name: 'Object Created',
  method: 'POST',
  path: '/object',
  track: true,
};

export interface TestDataConnectionRequest {
  display_name: string;
  connection_type: ConnectionType;
  bigquery_config?: BigQueryConfig;
  snowflake_config?: SnowflakeConfig;
  mongodb_config?: MongoDbConfig;
  redshift_config?: RedshiftConfig;
}

export interface CreateDestinationRequest {
  display_name: string;
  connection_type: ConnectionType;
  bigquery_config?: BigQueryConfig;
  snowflake_config?: SnowflakeConfig;
  redshift_config?: RedshiftConfig;
  mongodb_config?: MongoDbConfig;
}

export interface LinkCreateSourceRequest {
  display_name: string;
  connection_type: ConnectionType;
  bigquery_config?: BigQueryConfig;
  snowflake_config?: SnowflakeConfig;
  redshift_config?: RedshiftConfig;
  mongodb_config?: MongoDbConfig;
}

export interface CreateSourceResponse {
  source: Source;
}

export interface CreateObjectRequest {
  display_name: string;
  destination_id: number;
  target_type: TargetType;
  namespace: string;
  table_name: string;
  end_customer_id_field: string;
  sync_mode: SyncMode;
  frequency: number;
  frequency_units: FrequencyUnits;
  object_fields: ObjectFieldInput[];
  cursor_field?: string; // required for incremental append: need cursor field to detect new data
  primary_key?: string; // required  for incremental update: need primary key to match up rows
}

export interface ObjectField {
  id: number;
  name: string;
  type: FieldType;
  omit: boolean;
  optional: boolean;
  display_name?: string;
  description?: string;
}

export interface ObjectFieldInput {
  name: string;
  type: FieldType;
  omit: boolean;
  optional: boolean;
  display_name?: string;
  description?: string;
}

export interface FieldMappingInput {
  source_field_name: string;
  source_field_type: FieldType;
  destination_field_id: number;
}

export enum FieldType {
  String = "STRING",
  Integer = "INTEGER",
  Timestamp = "TIMESTAMP",
  TimestampTz = "TIMESTAMP_TZ",
  Json = "JSON",
}

export interface BigQueryConfig {
  credentials: string;
  location: string;
}

export interface SnowflakeConfig {
  username: string;
  password: string;
  database_name: string;
  warehouse_name: string;
  role: string;
  host: string;
}

export interface RedshiftConfig {
  username: string;
  password: string;
  database_name: string;
  endpoint: string;
}

export interface MongoDbConfig {
  username: string;
  password: string;
  host: string;
  connection_options: string;
}

export interface WebhookConfig {
  url: string;
  headers: HeaderInput[];
}

export interface HeaderInput {
  name: string;
  value: string;
}

export interface LinkCreateSyncRequest {
  display_name: string;
  source_id: number;
  object_id: number;
  namespace?: string;
  table_name?: string;
  custom_join?: string;
  field_mappings: FieldMappingInput[];
  // remaining fields will inherit from object if empty
  source_cursor_field?: string;
  source_primary_key?: string;
  sync_mode?: SyncMode;
  frequency?: number;
  frequency_units?: FrequencyUnits;
}

export interface CreateSyncResponse {
  sync: Sync;
}

export interface GetSyncsResponse {
  syncs: Sync[];
  sources: Source[];
  objects: Object[];
}

export interface GetSyncDetailsResponse {
  sync: Sync;
  next_run_time: string;
  sync_runs: SyncRun[];
}

export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> { };

export interface ResultRow extends Array<string | number> { }

export interface Field {
  name: string;
  type: FieldType;
}

export interface Schema extends Array<Field> { }

export interface LinkGetPreviewRequest {
  source_id: number;
  namespace: string;
  table_name: string;
}

export interface GetFieldValuesRequest {
  connectionID: number;
  namespace: string;
  tableName: string;
  fieldName: string;
}

export interface GetFieldValuesResponse {
  field_values: string[];
}

export interface SetOrganizationRequest {
  organization_name?: string;
  organization_id?: number;
}

export interface SetOrganizationResponse {
  organization: Organization;
}

export interface ValidationCodeRequest {
  email: string;
}

export interface LoginRequest {
  id_token?: string;
  organization_name?: string;
  organization_id?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface GetAllUsersResponse {
  users: User[];
}

export interface GetDestinationsResponse {
  destinations: Destination[];
}

export interface GetSourcesResponse {
  sources: Source[];
}

export interface GetObjectsResponse {
  objects: Object[];
}

export interface GetObjectResponse {
  object: Object;
}

export interface Object {
  id: number;
  display_name: string;
  destination_id: number;
  namespace?: string;
  table_name?: string;
  custom_join?: string;
  object_fields: ObjectField[];
}

export interface GetNamespacesResponse {
  namespaces: string[];
}

export interface GetTablesResponse {
  tables: string[];
}

export interface GetSchemaRequest {
  connectionID: number,
  namespace?: string,
  tableName?: string,
  customJoin?: string,
}

export interface LinkGetSchemaRequest {
  sourceID: number,
  namespace?: string,
  tableName?: string,
  customJoin?: string,
}

export interface QueryResults {
  schema: Schema;
  data: ResultRow[];
}

export interface GetSchemaResponse {
  schema: Schema;
}

export interface LoginResponse {
  user: User;
  organization?: Organization;
  suggested_organizations?: Organization[];
}

export interface Organization {
  id: number;
  name: string;
}

export interface CheckSessionResponse {
  user: User;
  organization?: Organization,
  suggested_organizations?: Organization[];
}

export interface Destination {
  id: number;
  display_name: string;
  connection: Connection;
}

export interface Source {
  id: number;
  display_name: string;
  connection: Connection;
  end_customer_id: number;
}

export interface Connection {
  id: number;
  connection_type: ConnectionType;
}

export enum ConnectionType {
  BigQuery = "bigquery",
  Snowflake = "snowflake",
  Redshift = "redshift",
  MongoDb = "mongodb",
  Webhook = "webhook",
}

export interface Sync {
  id: number;
  display_name: string;
  end_customer_id: number;
  source_id: number;
  object_id: number;
  namespace: string | undefined;
  table_name: string | undefined;
  custom_join: string | undefined;
  // the following settings will override object settings if set
  source_cursor_field: string | undefined;
  source_primary_key: string | undefined;
  sync_mode: SyncMode | undefined;
  frequency: number | undefined;
  frequency_units: FrequencyUnits | undefined;
}

export interface SyncRun {
  id: number;
  sync_id: number;
  status: SyncRunStatus;
  error: string | undefined;
  started_at: string;
  completed_at: string;
  duration: string;
  rows_written: number;
}

export enum SyncRunStatus {
  Running = "running",
  Failed = "failed",
  Completed = "completed",
}

export enum SyncMode {
  FullOverwrite = "full_overwrite",
  IncrementalAppend = "incremental_append",
  IncrementalUpdate = "incremental_update",
}

export const needsCursorField = (syncMode: SyncMode): boolean => {
  // no default so it isn't possible to add a new mode without updating
  switch (syncMode) {
    case SyncMode.FullOverwrite:
      return false;
    case SyncMode.IncrementalAppend:
      return true;
    case SyncMode.IncrementalUpdate:
      return true;
  }
};

export const needsPrimaryKey = (syncMode: SyncMode): boolean => {
  // no default so it isn't possible to add a new mode without updating
  switch (syncMode) {
    case SyncMode.FullOverwrite:
      return false;
    case SyncMode.IncrementalAppend:
      return false;
    case SyncMode.IncrementalUpdate:
      return true;
  }
};

export enum TargetType {
  SingleExisting = "single_existing",
  SingleNew = "single_new",
  TablePerCustomer = "table_per_customer",
}

export enum FrequencyUnits {
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
  Weeks = "weeks",
}

export function getConnectionType(connectionType: ConnectionType): string {
  switch (connectionType) {
    case ConnectionType.BigQuery:
      return "BigQuery";
    case ConnectionType.Snowflake:
      return "Snowflake";
    case ConnectionType.Redshift:
      return "Redshift";
    case ConnectionType.MongoDb:
      return "MongoDB";
    case ConnectionType.Webhook:
      return "Webhook";
  }
}
