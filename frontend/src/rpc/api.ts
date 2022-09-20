
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEndpoint<RequestType, ResponseType> {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    path: string;
    queryParams?: string[]; // These will be used as query params instead of being used as path params
}

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
    method: 'POST',
    path: '/login',
};

export const GetAllUsers: IEndpoint<undefined, GetAllUsersResponse> = {
    method: 'GET',
    path: '/get_all_users',
};

export const GetAllQuestions: IEndpoint<{ page: string; }, GetAllQuestionsResponse> = {
    method: 'GET',
    path: '/get_all_questions',
};

export const GetDataConnections: IEndpoint<undefined, GetDataConnectionsResponse> = {
    method: 'GET',
    path: '/get_data_connections',
};

export const GetEventSets: IEndpoint<undefined, GetEventSetsResponse> = {
    method: 'GET',
    path: '/get_event_sets',
};

export const GetDatasets: IEndpoint<{ connectionID: number; }, GetDatasetsResponse> = {
    method: 'GET',
    path: '/get_datasets',
    queryParams: ['connectionID']
};

export const GetTables: IEndpoint<{ connectionID: number, datasetID: string; }, GetTablesResponse> = {
    method: 'GET',
    path: '/get_tables',
    queryParams: ['connectionID', 'datasetID'],
};

export const GetSchema: IEndpoint<GetSchemaRequest, GetSchemaResponse> = {
    method: 'GET',
    path: '/get_schema',
    queryParams: ['connectionID', 'datasetID', 'tableName', 'customJoin'],
};

export const GetAssignedQuestions: IEndpoint<undefined, GetAssignedQuestionsResponse> = {
    method: 'GET',
    path: '/get_assigned_questions',
};

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
    method: 'GET',
    path: '/check_session',
};

export const Logout: IEndpoint<undefined, undefined> = {
    method: 'DELETE',
    path: '/logout',
};

export const Search: IEndpoint<SearchRequest, SearchResponse> = {
    method: 'POST',
    path: '/search',
};

export const ValidationCode: IEndpoint<ValidationCodeRequest, undefined> = {
    method: 'POST',
    path: '/validation_code',
};

export const SetOrganization: IEndpoint<SetOrganizationRequest, SetOrganizationResponse> = {
    method: 'POST',
    path: '/set_organization',
};

export const GetQuestion: IEndpoint<{ questionID: string; }, GetQuestionResponse> = {
    method: 'GET',
    path: '/get_question/:questionID',
};

export const CreateAnswer: IEndpoint<CreateAnswerRequest, CreateAnswerResponse> = {
    method: 'POST',
    path: '/create_answer',
};

export const CreateQuestion: IEndpoint<CreateQuestionRequest, CreateQuestionResponse> = {
    method: 'POST',
    path: '/create_question',
};

export const TestDataConnection: IEndpoint<TestDataConnectionRequest, undefined> = {
    method: 'POST',
    path: '/test_data_connection',
};


export const RunQuery: IEndpoint<RunQueryRequest, RunQueryResponse> = {
    method: 'POST',
    path: '/run_query',
};

export const CreateDataConnection: IEndpoint<CreateDataConnectionRequest, undefined> = {
    method: 'POST',
    path: '/create_data_connection',
};

export const CreateEventSet: IEndpoint<CreateEventSetRequest, undefined> = {
    method: 'POST',
    path: '/create_event_set',
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

export interface RunQueryRequest {
    connection_id: number;
    query_string: string;
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

export interface GetAllQuestionsResponse {
    questions: Post[];
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

export interface GetAssignedQuestionsResponse {
    questions: Post[];
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

export interface CreateQuestionRequest {
    question_title: string;
    question_body: string;
    assigned_user_id?: number;
}

export interface CreateQuestionResponse {
    question: Post;
}

export interface CreateAnswerRequest {
    question_id: number;
    answer_body: string;
}

export interface CreateAnswerResponse {
    question: Post;
    answers: Post[];
}

export interface SearchRequest {
    search_query: string;
}

export interface SearchResponse {
    posts: Post[];
}

export interface GetQuestionResponse {
    question: Post;
    answers: Post[];
}

export interface Post {
    id: number;
    post_type: string;
    title: string | undefined;
    body: string;
    user_id: number;
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