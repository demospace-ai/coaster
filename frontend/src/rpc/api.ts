
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

export const GetColumnValues: IEndpoint<GetColumnValuesRequest, GetColumnValuesResponse> = {
    name: 'Column Values Fetched',
    method: 'GET',
    path: '/connection/column_values',
    queryParams: ['connectionID', 'namespace', 'tableName', 'columnName'],
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

// TODO
export const LinkGetSyncs: IEndpoint<undefined, GetSyncsResponse> = {
    name: 'Syncs Fetched',
    method: 'GET',
    path: '/link/syncs',
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
    namespace: string;
    table_name: string;
    end_customer_id_column: string;
    object_fields: ObjectFieldInput[];
}

export interface ObjectField {
    id: number;
    name: string;
    type: string;
    display_name?: string;
    description?: string;
    omit: boolean;
}

export interface ObjectFieldInput {
    name: string;
    type: string;
    display_name?: string;
    description?: string;
    omit: boolean;
}

export interface FieldMappingInput {
    source_field_name: string;
    destination_field_id: number;
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
    port: string;
    host: string;
}

export interface MongoDbConfig {
    username: string;
    password: string;
    host: string;
    connection_options: string;
}

export interface LinkCreateSyncRequest {
    display_name: string;
    source_id: number;
    object_id: number;
    namespace?: string;
    table_name?: string;
    custom_join?: string;
    cursor_field?: string;
    primary_key?: string;
    sync_mode: SyncMode;
    frequency: number;
    frequency_units: FrequencyUnits;
    field_mappings: FieldMappingInput[];
}

export interface CreateSyncResponse {
    sync: Sync;
}

export interface GetSyncsResponse {
    syncs: Sync[];
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

export interface ColumnSchema {
    name: string;
    type: string;
}

export interface Schema extends Array<ColumnSchema> { }

export interface LinkGetPreviewRequest {
    source_id: number;
    namespace: string;
    table_name: string;
}

export interface GetColumnValuesRequest {
    connectionID: number;
    namespace: string;
    tableName: string;
    columnName: string;
}

export interface GetColumnValuesResponse {
    column_values: string[];
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

export interface GetSyncsResponse {
    syncs: Sync[];
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

export enum ColumnType {
    String = "STRING",
    Integer = "INTEGER",
    Timestamp = "TIMESTAMP"
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
}

export interface Sync {
    id: number;
    display_name: string;
    source: Source;
    object_id: number;
    namespace: string | undefined;
    table_name: string | undefined;
    custom_join: string | undefined;
    cursor_field: string | undefined;
    primary_key: string | undefined;
    sync_mode: SyncMode;
    frequency: number;
    frequency_units: FrequencyUnits;
}

export enum SyncMode {
    FullOverwrite = "full_overwrite",
    FullAppend = "full_append",
    IncrementalAppend = "incremental_append",
    IncrementalUpdate = "incremental_update",
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
    }
}
