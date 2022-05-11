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

export const GetQuestion: IEndpoint<{questionID: string}, GetQuestionResponse> = {
    method: "GET",
    path: "/get_question/:questionID",
}

export const CreateAnswer: IEndpoint<CreateAnswerRequest, CreateAnswerResponse> = {
    method: "POST",
    path: "/create_answer",
}

export const CreateQuestion: IEndpoint<CreateQuestionRequest, CreateQuestionResponse> = {
    method: "POST",
    path: "/create_question",
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
}

export interface LoginResponse {
    first_name: string;
    last_name: string;
}

export interface CheckSessionResponse {
    first_name: string;
    last_name: string;
}

export interface CreateQuestionRequest {
    question_title: string;
    question_body: string;
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