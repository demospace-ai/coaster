import { compile } from 'path-to-regexp';
import { rudderanalytics } from 'src/app/rudder';
import { IEndpoint } from 'src/rpc/api';

const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DOMAIN = IS_PROD ? 'https://app.fabra.io/api' : 'http://localhost:8080/api';

export async function sendRequest<RequestType extends Record<string, any>, ResponseType>(
    endpoint: IEndpoint<RequestType, ResponseType>,
    payload?: RequestType,
): Promise<ResponseType> {
    if (endpoint.track) {
        rudderanalytics.track(`${endpoint.name}_start`);
    }

    const toPath = compile(endpoint.path);
    const path = toPath(payload);

    const url = new URL(ROOT_DOMAIN + path);
    if (endpoint.queryParams && payload) {
        endpoint.queryParams.forEach(queryParam => {
            const queryParamValue = payload[queryParam];
            if (queryParamValue) {
                url.searchParams.append(queryParam, queryParamValue);
            }
        });
    }

    let options: RequestInit = {
        method: endpoint.method,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'include',
    };

    if (endpoint.method === 'POST' || endpoint.method === 'PATCH') {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorMessage = response.statusText ? response.statusText : await response.text();
        if (endpoint.track) {
            rudderanalytics.track(`${endpoint.name}_error`);
        }
        throw new Error(errorMessage);
    }

    if (endpoint.track) {
        rudderanalytics.track(`${endpoint.name}_success`);
    }

    // not all AJAX requests have a response. the ones that do will be formatted as JSON
    return response.json().catch(e => { throw e; });
}
