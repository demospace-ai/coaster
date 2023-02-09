
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
    path: '/get_all_users',
};

export const GetDestinations: IEndpoint<undefined, GetDestinationsResponse> = {
    name: 'Destinations Fetched',
    method: 'GET',
    path: '/get_destinations',
};

export const GetModels: IEndpoint<undefined, GetModelsResponse> = {
    name: 'Models Fetched',
    method: 'GET',
    path: '/get_models',
};

export const GetSyncConfigurations: IEndpoint<undefined, GetSyncConfigurationsResponse> = {
    name: 'Sync Configurations Fetched',
    method: 'GET',
    path: '/get_sync_configurations',
};

export const GetNamespaces: IEndpoint<{ connectionID: number; }, GetNamespacesResponse> = {
    name: 'Namespaces Fetched',
    method: 'GET',
    path: '/get_namespaces',
    queryParams: ['connectionID']
};

export const GetTables: IEndpoint<{ connectionID: number, namespace: string; }, GetTablesResponse> = {
    name: 'Tables Fetched',
    method: 'GET',
    path: '/get_tables',
    queryParams: ['connectionID', 'namespace'],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
    name: 'Schema Fetched',
    method: 'GET',
    path: '/get_schema',
    queryParams: ['connectionID', 'namespace', 'tableName', 'customJoin'],
};

export const GetApiKey: IEndpoint<undefined, string> = {
    name: 'API Key Fetched',
    method: 'GET',
    path: '/get_api_key',
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
    path: '/set_organization',
    track: true,
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
    name: 'Test Data Connection',
    method: 'POST',
    path: '/test_data_connection',
};

export const GetColumnValues: IEndpoint<GetColumnValuesRequest, GetColumnValuesResponse> = {
    name: 'Column Values Fetched',
    method: 'GET',
    path: '/get_column_values',
    queryParams: ['connectionID', 'namespace', 'tableName', 'columnName'],
    track: true,
};

export const CreateDestination: IEndpoint<CreateDestinationRequest, undefined> = {
    name: 'Destination Created',
    method: 'POST',
    path: '/create_destination',
    track: true,
};


export const CreateModel: IEndpoint<CreateModelRequest, undefined> = {
    name: 'Model Created',
    method: 'POST',
    path: '/create_model',
    track: true,
};

export const CreateSyncConfiguration: IEndpoint<CreateSyncConfigurationRequest, undefined> = {
    name: 'Sync Configuration Created',
    method: 'POST',
    path: '/create_sync_configuration',
    track: true,
};

export interface TestDataConnectionRequest {
    display_name: string;
    connection_type: ConnectionType;
    bigquery_config?: BigQueryConfig;
    snowflake_config?: SnowflakeConfig;
}

export interface CreateDestinationRequest {
    display_name: string;
    connection_type: ConnectionType;
    bigquery_config?: BigQueryConfig;
    snowflake_config?: SnowflakeConfig;
}


export interface CreateModelRequest {
    display_name: string;
    destination_id: number;
    namespace?: string;
    table_name?: string;
    custom_join?: string;
    customer_id_column: string;
    model_fields: ModelField[];
}

export interface ModelField {
    name: string;
    type: string;
}

export interface BigQueryConfig {
    credentials: string;
}

export interface SnowflakeConfig {
    username: string;
    password: string;
    database_name: string;
    warehouse_name: string;
    role: string;
    host: string;
}

export interface CreateSyncConfigurationRequest {
    display_name: string;
    connection_id: number;
    dataset_name: string;
    table_name: string;
    custom_join?: string;
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
export interface QueryResult {
    success: boolean,
    error_message: string,
    schema: Schema,
    data: ResultRow[],
}

export interface ColumnSchema {
    name: string;
    type: string;
}

export interface Schema extends Array<ColumnSchema> { }

export function toCsvData(queryResult: QueryResult | undefined): (string | number)[][] {
    if (queryResult) {
        const header = queryResult.schema.map(columnSchema => columnSchema.name);
        return [header, ...queryResult.data];
    }

    return [];
}

export interface RunQueryRequest {
    analysis_id: number;
}

export interface GetColumnValuesRequest {
    connectionID: number;
    datasetName: string;
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


export interface GetModelsResponse {
    models: Model[];
}

export interface Model {
    id: number;
    display_name: string;
    destination_id: number;
    namespace?: string;
    table_name?: string;
    custom_join?: string;
    model_fields: ModelField[];
}

export interface GetSyncConfigurationsResponse {
    sync_configurations: SyncConfiguration[];
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

export interface Connection {
    id: number;
    connection_type: ConnectionType;
}

export interface SyncConfiguration {
    id: number;
    display_name: string;
    connection_id: number;
    dataset_name: string;
    table_name: string;
    custom_join: string | undefined;
}

export enum ConnectionType {
    BigQuery = "bigquery",
    Snowflake = "snowflake",
}

export function getConnectionType(connectionType: ConnectionType): string {
    switch (connectionType) {
        case ConnectionType.BigQuery:
            return "BigQuery";
        case ConnectionType.Snowflake:
            return "Snowflake";
    }
}
