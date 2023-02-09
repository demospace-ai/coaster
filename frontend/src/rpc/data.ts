import { sendRequest } from "src/rpc/ajax";
import { GetAllUsers, GetAllUsersResponse, GetApiKey, GetColumnValues, GetColumnValuesRequest, GetColumnValuesResponse, GetDestinations, GetDestinationsResponse, GetModels, GetModelsResponse, GetNamespaces, GetNamespacesResponse, GetSchema, GetSchemaRequest, GetSchemaResponse, GetSyncConfigurations, GetSyncConfigurationsResponse, GetTables, GetTablesResponse } from "src/rpc/api";
import useSWR, { Fetcher } from "swr";

export function useApiKey() {
  const fetcher: Fetcher<string, {}> = () => sendRequest(GetApiKey);
  const { data, error } = useSWR({ GetApiKey }, fetcher);
  return { apiKey: data, error };
}

export function useSchema(connectionID: number | undefined, namespace: string | undefined, tableName: string | undefined, customJoin: string | undefined) {
  const fetcher: Fetcher<GetSchemaResponse, GetSchemaRequest> = (request: GetSchemaRequest) => sendRequest(GetSchema, request);
  const shouldFetch = connectionID && ((namespace && tableName) || customJoin);
  const { data, error } = useSWR(shouldFetch ? { GetSchema, connectionID, namespace, tableName, customJoin } : null, fetcher);
  return { schema: data?.schema, error };
}

export function useUsers() {
  const fetcher: Fetcher<GetAllUsersResponse, {}> = () => sendRequest(GetAllUsers);
  const { data, mutate, error } = useSWR({ GetAllUsers }, fetcher);
  return { users: data?.users, mutate, error };
}

export function useDestinations() {
  const fetcher: Fetcher<GetDestinationsResponse, {}> = () => sendRequest(GetDestinations);
  const { data, mutate, error } = useSWR({ GetDestinations }, fetcher);
  return { destinations: data?.destinations, mutate, error };
}

export function useModels() {
  const fetcher: Fetcher<GetModelsResponse, {}> = () => sendRequest(GetModels);
  const { data, mutate, error } = useSWR({ GetModels }, fetcher);
  return { models: data?.models, mutate, error };
}

export function useNamespaces(connectionID: number | undefined) {
  const fetcher: Fetcher<GetNamespacesResponse, { connectionID: number; }> = (payload: { connectionID: number; }) => sendRequest(GetNamespaces, payload);
  const shouldFetch = connectionID;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetNamespaces, connectionID } : null, fetcher);
  return { namespaces: data?.namespaces, mutate, error };
}

export function useTables(connectionID: number | undefined, namespace: string | undefined) {
  const fetcher: Fetcher<GetTablesResponse, { connectionID: number, namespace: string; }> = (payload: { connectionID: number, namespace: string; }) => sendRequest(GetTables, payload);
  const shouldFetch = connectionID && namespace;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetTables, connectionID, namespace } : null, fetcher);
  return { tables: data?.tables, mutate, error };
}

export function useSyncConfigurations() {
  const fetcher: Fetcher<GetSyncConfigurationsResponse, {}> = () => sendRequest(GetSyncConfigurations);
  const { data, mutate, error } = useSWR({ GetSyncConfigurations }, fetcher);
  return { syncConfigurations: data?.sync_configurations, mutate, error };
}

export function useColumnValues(connectionID: number | undefined, namespace: string | undefined, tableName: string | undefined, columnName: string | undefined) {
  const fetcher: Fetcher<GetColumnValuesResponse, GetColumnValuesRequest> = (payload: GetColumnValuesRequest) => sendRequest(GetColumnValues, payload);
  const shouldFetch = connectionID && namespace && tableName && columnName;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetColumnValues, connectionID, namespace, tableName, columnName } : null, fetcher);
  return { columnValues: data?.column_values, mutate, error };
}