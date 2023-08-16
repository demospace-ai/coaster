import { compile } from "path-to-regexp";
import { rudderanalytics } from "src/app/rudder";
import { IEndpoint } from "src/rpc/api";
import { isProd } from "src/utils/env";
import { HttpError } from "src/utils/errors";

const ROOT_DOMAIN = isProd() ? "https://api.trycoaster.com" : "http://localhost:8080";

export function getEndpointUrl<QueryParams extends Record<string, any>>(
  endpoint: IEndpoint<any, any, any, QueryParams>,
  queryParams?: QueryParams,
): string {
  const toPath = compile(endpoint.path);
  const path = toPath();

  const url = new URL(ROOT_DOMAIN + path);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

export async function sendRequest<
  RequestType extends Record<string, any>,
  ResponseType,
  PathParams extends Record<string, any>,
  QueryParams extends Record<string, any>,
>(
  endpoint: IEndpoint<RequestType, ResponseType, PathParams, QueryParams>,
  opts?: {
    payload?: RequestType;
    extraHeaders?: [string, string][];
    pathParams?: PathParams;
    queryParams?: QueryParams;
    formData?: FormData;
  },
): Promise<ResponseType> {
  const toPath = compile(endpoint.path);
  const path = toPath(opts?.pathParams);

  const url = new URL(ROOT_DOMAIN + path);
  if (opts?.queryParams) {
    Object.entries(opts.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const extraHeadersList = opts?.extraHeaders ? opts?.extraHeaders : [];
  const headers = new Headers([["X-TIME-ZONE", Intl.DateTimeFormat().resolvedOptions().timeZone], ...extraHeadersList]);
  if (!opts?.formData) {
    headers.append("Content-Type", "application/json");
  }
  let options: RequestInit = {
    method: endpoint.method,
    headers: headers,
    credentials: "include",
  };

  if (["POST", "PATCH", "PUT"].includes(endpoint.method)) {
    if (opts?.formData) {
      options.body = opts?.formData;
    } else {
      options.body = JSON.stringify(opts?.payload);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorMessage = response.statusText + ": " + (await response.text());
    throw new HttpError(response.status, response.statusText, errorMessage);
  }

  if (endpoint.track) {
    rudderanalytics.track(`${endpoint.name}`);
  }

  // TODO: clean this up
  // not all AJAX requests have a response. the ones that do will be formatted as JSON
  // so just catch any error from trying to fetch the json and do nothing with it
  if (endpoint.noJson) {
    return response.text() as ResponseType;
  }
  return response.json().catch(() => null);
}
