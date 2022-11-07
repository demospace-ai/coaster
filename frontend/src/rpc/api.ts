
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEndpoint<RequestType, ResponseType> {
    name: string;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
    path: string;
    track?: boolean;
    queryParams?: string[]; // These will be used as query params instead of being used as path params
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

export const GetAllAnalyses: IEndpoint<{ page: string; }, GetAllAnalysesResponse> = {
    name: 'All Analyses Fetched',
    method: 'GET',
    path: '/get_all_analyses',
};

export const GetDataConnections: IEndpoint<undefined, GetDataConnectionsResponse> = {
    name: 'Data Connections Fetched',
    method: 'GET',
    path: '/get_data_connections',
};

export const GetEventSets: IEndpoint<undefined, GetEventSetsResponse> = {
    name: 'Event Sets Fetched',
    method: 'GET',
    path: '/get_event_sets',
};

export const GetDatasets: IEndpoint<{ connectionID: number; }, GetDatasetsResponse> = {
    name: 'Datasets Fetched',
    method: 'GET',
    path: '/get_datasets',
    queryParams: ['connectionID']
};

export const GetTables: IEndpoint<{ connectionID: number, datasetID: string; }, GetTablesResponse> = {
    name: 'Tables Fetched',
    method: 'GET',
    path: '/get_tables',
    queryParams: ['connectionID', 'datasetID'],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
    name: 'Schema Fetched',
    method: 'GET',
    path: '/get_schema',
    queryParams: ['connectionID', 'datasetID', 'tableName', 'customJoin'],
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

export const Search: IEndpoint<SearchRequest, SearchResponse> = {
    name: 'Search',
    method: 'POST',
    path: '/search',
    track: true,
};

export const SetOrganization: IEndpoint<SetOrganizationRequest, SetOrganizationResponse> = {
    name: 'Organization Set',
    method: 'POST',
    path: '/set_organization',
    track: true,
};

export const UpdateOrganization: IEndpoint<UpdateOrganizationRequest, UpdateOrganizationResponse> = {
    name: 'Organization Updated',
    method: 'PATCH',
    path: '/update_organization',
    track: true,
};

export const GetAnalysis: IEndpoint<{ analysisID: string; }, Analysis> = {
    name: 'Analysis Fetched',
    method: 'GET',
    path: '/get_analysis/:analysisID',
    track: true,
};

export const CreateAnalysis: IEndpoint<CreateAnalysisRequest, Analysis> = {
    name: 'Analysis Created',
    method: 'POST',
    path: '/create_analysis',
    track: true,
};

export const DeleteAnalysis: IEndpoint<{ analysisID: number; }, undefined> = {
    name: 'Analysis Deleted',
    method: 'DELETE',
    path: '/delete_analysis/:analysisID',
    track: true,
};

export const UpdateAnalysis: IEndpoint<UpdateAnalysisRequest, Analysis> = {
    name: 'Analysis Updated',
    method: 'PATCH',
    path: '/update_analysis',
    track: true,
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
    name: 'Test Data Connection',
    method: 'POST',
    path: '/test_data_connection',
};

export const RunCustomQuery: IEndpoint<RunQueryRequest, QueryResult> = {
    name: 'Custom Query Run',
    method: 'POST',
    path: '/run_custom_query',
    track: true,
};

export const RunTrendQuery: IEndpoint<RunQueryRequest, QueryResult[]> = {
    name: 'Trend Run',
    method: 'POST',
    path: '/run_trend_query',
    track: true,
};

export const GetEvents: IEndpoint<GetEventsRequest, GetEventsResponse> = {
    name: 'Events Fetched',
    method: 'GET',
    path: '/get_events',
    queryParams: ['connectionID', 'eventSetID'],
    track: true,
};

export const GetProperties: IEndpoint<GetPropertiesRequest, GetPropertiesResponse> = {
    name: 'Event Properties Fetched',
    method: 'GET',
    path: '/get_properties',
    queryParams: ['connectionID', 'eventSetID'],
    track: true,
};

export const GetPropertyValues: IEndpoint<GetPropertyValuesRequest, GetPropertyValuesResponse> = {
    name: 'Event Property Values Fetched',
    method: 'GET',
    path: '/get_property_values',
    queryParams: ['connectionID', 'eventSetID', 'propertyName'],
    track: true,
};

export const RunFunnelQuery: IEndpoint<RunQueryRequest, QueryResult> = {
    name: 'Funnel Run',
    method: 'POST',
    path: '/run_funnel_query',
    track: true,
};

export const CreateDataConnection: IEndpoint<CreateDataConnectionRequest, undefined> = {
    name: 'Data Connection Created',
    method: 'POST',
    path: '/create_data_connection',
    track: true,
};

export const CreateEventSet: IEndpoint<CreateEventSetRequest, undefined> = {
    name: 'Event Set Created',
    method: 'POST',
    path: '/create_event_set',
    track: true,
};

export interface TestDataConnectionRequest {
    display_name: string;
    connection_type: DataConnectionType;
    credentials?: string;
    username?: string;
    password?: string;
    database_name?: string;
    warehouse_name?: string;
    role?: string;
    account?: string;
}

export interface CreateDataConnectionRequest {
    display_name: string;
    connection_type: DataConnectionType;
    credentials?: string;
    username?: string;
    password?: string;
    database_name?: string;
    warehouse_name?: string;
    role?: string;
    account?: string;
}

export interface CreateEventSetRequest {
    display_name: string;
    connection_id: number;
    dataset_name: string;
    table_name: string;
    event_type_column: string;
    timestamp_column: string;
    user_identifier_column: string;
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

export type Property = ColumnSchema;

export interface PropertyGroup {
    name: string;
    properties: Property[];
}

export interface RunQueryRequest {
    analysis_id: number;
}

export interface GetEventsRequest {
    connectionID: number;
    eventSetID: number;
}

export interface GetEventsResponse {
    events: string[];
}

export interface GetPropertiesRequest {
    connectionID: number;
    eventSetID: number;
}

export interface GetPropertiesResponse {
    property_groups: PropertyGroup[];
}

export interface GetPropertyValuesRequest {
    connectionID: number;
    eventSetID: number;
    propertyName: string;
}

export interface GetPropertyValuesResponse {
    property_values: string[];
}

export interface SetOrganizationRequest {
    organization_name?: string;
    organization_id?: number;
}

export interface SetOrganizationResponse {
    organization: Organization;
}

export interface UpdateOrganizationRequest {
    connection_id?: number;
    event_set_id?: number;
}

export interface UpdateOrganizationResponse {
    organization: Organization;
}

export interface ValidationCodeRequest {
    email: string;
}

export interface EmailAuthentication {
    email: string;
    validation_code: string;
}

export interface LoginRequest {
    id_token?: string;
    email_authentication?: EmailAuthentication;
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

export interface GetAllAnalysesResponse {
    analyses: Analysis[];
}

export interface GetDataConnectionsResponse {
    data_connections: DataConnection[];
}

export interface GetEventSetsResponse {
    event_sets: EventSet[];
}

export interface GetDatasetsResponse {
    datasets: string[];
}

export interface GetTablesResponse {
    tables: string[];
}

export interface GetSchemaRequest {
    connectionID: number,
    datasetID?: string,
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
    default_data_connection_id?: number;
    default_event_set_id?: number;
}

export interface CheckSessionResponse {
    user: User;
    organization?: Organization,
    suggested_organizations?: Organization[];
}

export interface CreateAnalysisRequest {
    connection_id?: number;
    event_set_id?: number;
    analysis_type: AnalysisType;
    timezone: string;
}

export interface UpdateAnalysisRequest {
    analysis_id: number;
    connection_id?: number;
    event_set_id?: number;
    title?: string;
    query?: string;
    events?: EventInput[];
}

export interface EventInput {
    name: string;
    filters: EventFilter[];
};

export interface TrendSeriesInput {
    name: string;
    filters: EventFilter[];
};

export interface SearchRequest {
    search_query: string;
}

export interface SearchResponse {
    analyses: Analysis[];
}

export interface Analysis {
    id: number;
    user_id: number;
    organization_id: number;
    connection?: DataConnection;
    event_set?: EventSet;
    analysis_type: AnalysisType;
    title?: string;
    description?: string;
    query?: string; // used for Custom Query analysis type
    events?: Event[]; // used for Funnel and Trend analysis types
}

export interface Event {
    id: number;
    name: string;
    filters: EventFilter[];
}

export interface EventFilter {
    property: Property;
    filter_type: FilterType;
    property_value: string | null;
    custom_property_group_id?: number;
}

export enum ColumnType {
    String = "STRING",
    Integer = "INTEGER",
    Timestamp = "TIMESTAMP"
}

export enum FilterType {
    Equal = "equal",
    NotEqual = "not_equal",
    GreaterThan = "greater_than",
    LessThan = "less_than",
    Contains = "contains",
    NotContains = "not_contains",
}

export const filtersMatch = (filters1: EventFilter[], filters2: EventFilter[]) => {
    return filters1.length === filters2.length && filters1.every((filter1, index) => {
        const filter2: EventFilter = filters2[index];
        return filter1.property.name === filter2.property.name
            && filter1.property.type === filter2.property.type
            && filter1.filter_type === filter2.filter_type
            && filter1.property_value === filter2.property_value
            && filter1.custom_property_group_id === filter2.custom_property_group_id;
    });
};

export enum AnalysisType {
    CustomQuery = "custom_query",
    Funnel = "funnel",
    Trend = "trend",
}

export interface DataConnection {
    id: number;
    display_name: string;
    connection_type: DataConnectionType;
}

export interface EventSet {
    id: number;
    display_name: string;
    connection_id: number;
    dataset_name: string;
    table_name: string;
    event_type_column: string;
    timestamp_column: string;
    user_identifier_column: string;
    custom_join: string | undefined;
}

export enum DataConnectionType {
    BigQuery = "bigquery",
    Snowflake = "snowflake",
}