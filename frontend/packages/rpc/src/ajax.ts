import { HttpError, isProd } from "@coaster/utils/common";
import { compile } from "path-to-regexp";
import { IEndpoint } from "./api";

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

  const dateReviver = (key: string, value: any) => {
    if (typeof value === "string" && /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }

    if (typeof value === "string" && /^\d\d:\d\d:\d\d$/.test(value)) {
      const d = new Date("1970-01-01T" + value + "Z");
      if (!isNaN(d.getTime())) {
        return d;
      }
    }

    return value;
  };

  return response
    .text()
    .then((text) => JSON.parse(text, dateReviver))
    .catch(() => null);
}
