import { compile } from 'path-to-regexp';
import { IEndpoint } from 'src/rpc/api';

const IS_PROD = process.env.NODE_ENV === "production";
const ROOT_DOMAIN = IS_PROD ? "https://app.fabra.io/api" : "http://localhost:8080";

export async function sendRequest<RequestType extends object, ResponseType>(
    endpoint: IEndpoint<RequestType, ResponseType>,
    payload?: RequestType,
): Promise<ResponseType> {
    const toPath = compile(endpoint.path);
    const path = toPath(payload);

    const url = ROOT_DOMAIN + path;
    let options: RequestInit = {
        method: endpoint.method,
        headers: new Headers({'Content-Type': 'application/json'}),
        credentials: 'include',
    };

    if (endpoint.method === "POST") {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    // not all AJAX requests have a response. the ones that do will be formatted as JSON
    return response.json().catch(() => {});
}
