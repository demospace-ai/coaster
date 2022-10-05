
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEndpoint<RequestType, ResponseType> {
    name: string;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
    path: string;
    track?: boolean;
    queryParams?: string[]; // These will be used as query params instead of being used as path params
}

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
    name: 'login',
    method: 'POST',
    path: '/login',
    track: true,
};

export const GetAllUsers: IEndpoint<undefined, GetAllUsersResponse> = {
    name: 'get_all_users',
    method: 'GET',
    path: '/get_all_users',
};

export const GetAllAnalyses: IEndpoint<{ page: string; }, GetAllAnalysesResponse> = {
    name: 'get_all_analyses',
    method: 'GET',
    path: '/get_all_analyses',
};

export const GetDataConnections: IEndpoint<undefined, GetDataConnectionsResponse> = {
    name: 'get_data_connections',
    method: 'GET',
    path: '/get_data_connections',
};

export const GetEventSets: IEndpoint<undefined, GetEventSetsResponse> = {
    name: 'get_event_sets',
    method: 'GET',
    path: '/get_event_sets',
};

export const GetDatasets: IEndpoint<{ connectionID: number; }, GetDatasetsResponse> = {
    name: 'get_datasets',
    method: 'GET',
    path: '/get_datasets',
    queryParams: ['connectionID']
};

export const GetTables: IEndpoint<{ connectionID: number, datasetID: string; }, GetTablesResponse> = {
    name: 'get_tables',
    method: 'GET',
    path: '/get_tables',
    queryParams: ['connectionID', 'datasetID'],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
    name: 'get_schema',
    method: 'GET',
    path: '/get_schema',
    queryParams: ['connectionID', 'datasetID', 'tableName', 'customJoin'],
};

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
    name: 'check_session',
    method: 'GET',
    path: '/check_session',
};

export const Logout: IEndpoint<undefined, undefined> = {
    name: 'logout',
    method: 'DELETE',
    path: '/logout',
    track: true,
};

export const Search: IEndpoint<SearchRequest, SearchResponse> = {
    name: 'search',
    method: 'POST',
    path: '/search',
    track: true,
};

export const SetOrganization: IEndpoint<SetOrganizationRequest, SetOrganizationResponse> = {
    name: 'set_organization',
    method: 'POST',
    path: '/set_organization',
    track: true,
};

export const GetAnalysis: IEndpoint<{ analysisID: string; }, GetAnalysisResponse> = {
    name: 'get_analysis',
    method: 'GET',
    path: '/get_analysis/:analysisID',
    track: true,
};

export const CreateAnalysis: IEndpoint<CreateAnalysisRequest, CreateAnalysisResponse> = {
    name: 'create_analysis',
    method: 'POST',
    path: '/create_analysis',
    track: true,
};

export const DeleteAnalysis: IEndpoint<{ analysisID: number; }, undefined> = {
    name: 'delete_analysis',
    method: 'DELETE',
    path: '/delete_analysis/:analysisID',
    track: true,
};

export const UpdateAnalysis: IEndpoint<UpdateAnalysisRequest, UpdateAnalysisResponse> = {
    name: 'update_analysis',
    method: 'PATCH',
    path: '/update_analysis',
    track: true,
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
    name: 'test_data_connection',
    method: 'POST',
    path: '/test_data_connection',
    track: true,
};

export const RunQuery: IEndpoint<RunQueryRequest, RunQueryResponse> = {
    name: 'run_query',
    method: 'POST',
    path: '/run_query',
    track: true,
};

export const GetEvents: IEndpoint<GetEventsRequest, GetEventsResponse> = {
    name: 'get_events',
    method: 'GET',
    path: '/get_events',
    queryParams: ['connectionID', 'eventSetID'],
    track: true,
};

export const GetProperties: IEndpoint<GetPropertiesRequest, GetPropertiesResponse> = {
    name: 'get_properties',
    method: 'GET',
    path: '/get_properties',
    queryParams: ['connectionID', 'eventSetID'],
    track: true,
};

export const GetPropertyValues: IEndpoint<GetPropertyValuesRequest, GetPropertyValuesResponse> = {
    name: 'get_property_values',
    method: 'GET',
    path: '/get_property_values',
    queryParams: ['connectionID', 'eventSetID', 'propertyName'],
    track: true,
};

export const RunFunnelQuery: IEndpoint<RunFunnelQueryRequest, RunQueryResponse> = {
    name: 'run_funnel_query',
    method: 'POST',
    path: '/run_funnel_query',
    track: true,
};

export const CreateDataConnection: IEndpoint<CreateDataConnectionRequest, undefined> = {
    name: 'create_data_connection',
    method: 'POST',
    path: '/create_data_connection',
    track: true,
};

export const CreateEventSet: IEndpoint<CreateEventSetRequest, undefined> = {
    name: 'create_event_set',
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

export interface QueryResult extends Array<string | number> { }
export interface QueryResults extends Array<QueryResult> { }

export interface ColumnSchema {
    name: string;
    type: string;
}

export interface Schema extends Array<ColumnSchema> { }

export type Property = ColumnSchema;

export interface PropertyGroup {
    name: string;
    properties: Property[];
}

export interface RunQueryRequest {
    connection_id: number;
    query_string: string;
}

export function toCsvData(schema: Schema | undefined, queryResults: QueryResults | undefined): (string | number)[][] {
    if (schema && queryResults) {
        const header = schema.map(columnSchema => columnSchema.name);
        return [header, ...queryResults];
    }

    return [];
}

export interface RunFunnelQueryRequest {
    connection_id: number;
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

export interface RunQueryResponse {
    success: boolean;
    error_message: string;
    schema: Schema;
    query_results: QueryResults;
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
}

export interface CheckSessionResponse {
    user: User;
    organization?: Organization,
    suggested_organizations?: Organization[];
}

export interface CreateAnalysisRequest {
    analysis_type: AnalysisType;
}

export interface CreateAnalysisResponse {
    analysis: Analysis;
    connection?: DataConnection;
    event_set?: EventSet;
}

export interface UpdateAnalysisRequest {
    analysis_id: number;
    connection_id?: number;
    event_set_id?: number;
    title?: string;
    query?: string;
    funnel_steps?: FunnelStep[];
}

export interface UpdateAnalysisResponse {
    analysis: Analysis;
    connection?: DataConnection;
    event_set?: EventSet;
}

export interface SearchRequest {
    search_query: string;
}

export interface SearchResponse {
    analyses: Analysis[];
}

export interface GetAnalysisResponse {
    analysis: Analysis;
    connection?: DataConnection;
    event_set?: EventSet;
}

export interface Analysis {
    id: number;
    user_id: number;
    organization_id: number;
    analysis_type: AnalysisType;
    connection_id?: number;
    event_set_id?: number;
    title?: string;
    query?: string;
    funnel_steps?: FunnelStep[];
}

export interface FunnelStep {
    step_name: string;
    filters: StepFilter[];
}

export interface StepFilter {
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

export const stepFiltersMatch = (filters1: StepFilter[], filters2: StepFilter[]) => {
    return filters1.length === filters2.length && filters1.every((filter1, index) => {
        const filter2: StepFilter = filters2[index];
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