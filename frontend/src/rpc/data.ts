import { sendRequest } from "src/rpc/ajax";
import { GetAllUsers, GetAllUsersResponse, GetApiKey, GetColumnValues, GetColumnValuesRequest, GetColumnValuesResponse, GetDatasets, GetDatasetsResponse, GetDestinations, GetDestinationsResponse, GetSchema, GetSchemaRequest, GetSchemaResponse, GetSyncConfigurations, GetSyncConfigurationsResponse, GetTables, GetTablesResponse } from "src/rpc/api";
import useSWR, { Fetcher } from "swr";

export function useApiKey() {
  const fetcher: Fetcher<string, {}> = () => sendRequest(GetApiKey);
  const { data, error } = useSWR({ GetApiKey }, fetcher);
  return { apiKey: data, error };
}

export function useSchema(connectionID: number, datasetName: string, tableName?: string, customJoin?: string) {
  const fetcher: Fetcher<GetSchemaResponse, GetSchemaRequest> = (request: GetSchemaRequest) => sendRequest(GetSchema, request);
  const shouldFetch = connectionID && ((datasetName && tableName) || customJoin);
  const { data, error } = useSWR(shouldFetch ? { GetSchema, connectionID, datasetID: datasetName, tableName, customJoin } : null, fetcher);
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

export function useDatasets(connectionID: number | undefined) {
  const fetcher: Fetcher<GetDatasetsResponse, { connectionID: number; }> = (payload: { connectionID: number; }) => sendRequest(GetDatasets, payload);
  const shouldFetch = connectionID;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetDatasets, connectionID } : null, fetcher);
  return { datasets: data?.datasets, mutate, error };
}

export function useTables(connectionID: number | undefined, datasetID: string | undefined) {
  const fetcher: Fetcher<GetTablesResponse, { connectionID: number, datasetID: string; }> = (payload: { connectionID: number, datasetID: string; }) => sendRequest(GetTables, payload);
  const shouldFetch = connectionID && datasetID;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetTables, connectionID, datasetID } : null, fetcher);
  return { tables: data?.tables, mutate, error };
}

export function useSyncConfigurations() {
  const fetcher: Fetcher<GetSyncConfigurationsResponse, {}> = () => sendRequest(GetSyncConfigurations);
  const { data, mutate, error } = useSWR({ GetSyncConfigurations }, fetcher);
  return { syncConfigurations: data?.sync_configurations, mutate, error };
}

export function useColumnValues(connectionID: number | undefined, eventSetID: number | undefined, propertyName: string | undefined) {
  const fetcher: Fetcher<GetColumnValuesResponse, GetColumnValuesRequest> = (payload: GetColumnValuesRequest) => sendRequest(GetColumnValues, payload);
  const shouldFetch = connectionID && eventSetID && propertyName;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetColumnValues, connectionID, eventSetID, propertyName } : null, fetcher);
  return { columnValues: data?.column_values, mutate, error };
}