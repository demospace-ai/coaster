// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEndpoint<RequestType, ResponseType> {
    method: "GET" | "POST" | "DELETE" | "PUT";
    path: string;
}

export const Login: IEndpoint<LoginRequest, LoginResponse> = {
    method: "POST",
    path: "/login",
};

export const CheckSession: IEndpoint<undefined, CheckSessionResponse> = {
    method: "GET",
    path: "/check_session",
};


export const Search: IEndpoint<SearchRequest, SearchResponse> = {
    method: "POST",
    path: "/search",
};

export const ValidationCode: IEndpoint<ValidationCodeRequest, undefined> = {
    method: "POST",
    path: "/validation_code",
};

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
}

export interface LoginResponse {
}

export interface CheckSessionResponse {
}

export interface SearchRequest {
    search_query: string;
}

export interface SearchResponse {
    posts: Post[];
}

export interface Post {
    id: number;
    post_type: string;
    title: string | undefined;
    body: string;
    user_id: number;
}