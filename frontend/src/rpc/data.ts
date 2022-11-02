import { sendRequest } from "src/rpc/ajax";
import { Analysis, GetAllAnalyses, GetAllAnalysesResponse, GetAnalysis, GetDataConnections, GetDataConnectionsResponse, GetDatasets, GetDatasetsResponse, GetEvents, GetEventSets, GetEventSetsResponse, GetEventsRequest, GetEventsResponse, GetProperties, GetPropertiesRequest, GetPropertiesResponse, GetPropertyValues, GetPropertyValuesRequest, GetPropertyValuesResponse, GetSchema, GetSchemaRequest, GetSchemaResponse, GetTables, GetTablesResponse } from "src/rpc/api";
import useSWR, { Fetcher } from "swr";

export function useAnalysis(id: string | undefined) {
  const fetcher: Fetcher<Analysis, { id: string; }> = (value: { id: string; }) => sendRequest(GetAnalysis, { analysisID: value.id });
  const shouldFetch = id !== undefined;
  const { data, error, mutate } = useSWR(shouldFetch ? { GetAnalysis, id } : null, fetcher);
  return { analysis: data, error, mutate };
}

export function useSchema(connectionID: number, datasetName: string, tableName?: string, customJoin?: string) {
  const fetcher: Fetcher<GetSchemaResponse, GetSchemaRequest> = (request: GetSchemaRequest) => sendRequest(GetSchema, request);
  const shouldFetch = connectionID && ((datasetName && tableName) || customJoin);
  const { data, error } = useSWR(shouldFetch ? { GetSchema, connectionID, datasetID: datasetName, tableName, customJoin } : null, fetcher);
  return { schema: data?.schema, error };
}

export function useEvents(connectionID: number | undefined, eventSetID: number | undefined) {
  const fetcher: Fetcher<GetEventsResponse, GetEventsRequest> = (payload: GetEventsRequest) => sendRequest(GetEvents, payload);
  const shouldFetch = connectionID && eventSetID;
  const { data, error } = useSWR(shouldFetch ? { GetEvents, connectionID, eventSetID } : null, fetcher);
  return { events: data?.events, error };
}

export function useEventProperties(connectionID: number | undefined, eventSetID: number | undefined) {
  const fetcher: Fetcher<GetPropertiesResponse, GetPropertiesRequest> = (payload: GetPropertiesRequest) => sendRequest(GetProperties, payload);
  const shouldFetch = connectionID && eventSetID;
  const { data, error } = useSWR(shouldFetch ? { GetProperties, connectionID, eventSetID } : null, fetcher);
  return { properties: data?.property_groups, error };
}

export function useAnalyses() {
  const fetcher: Fetcher<GetAllAnalysesResponse, {}> = async () => (await sendRequest(GetAllAnalyses));
  const { data, mutate, error } = useSWR({ GetAllAnalyses }, fetcher);
  return { analyses: data?.analyses, mutate, error };
}

export function useDataConnections() {
  const fetcher: Fetcher<GetDataConnectionsResponse, {}> = () => sendRequest(GetDataConnections);
  const { data, mutate, error } = useSWR({ GetDataConnections }, fetcher);
  return { connections: data?.data_connections, mutate, error };
}

export function useDatasets(connectionID: number | undefined) {
  const fetcher: Fetcher<GetDatasetsResponse, { connectionID: number; }> = (payload: { connectionID: number; }) => sendRequest(GetDatasets, payload);
  const shouldFetch = connectionID;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetDataConnections, connectionID } : null, fetcher);
  return { datasets: data?.datasets, mutate, error };
}

export function useTables(connectionID: number | undefined, datasetID: string | undefined) {
  const fetcher: Fetcher<GetTablesResponse, { connectionID: number, datasetID: string; }> = (payload: { connectionID: number, datasetID: string; }) => sendRequest(GetTables, payload);
  const shouldFetch = connectionID && datasetID;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetDataConnections, connectionID, datasetID } : null, fetcher);
  return { tables: data?.tables, mutate, error };
}

export function useEventSets() {
  const fetcher: Fetcher<GetEventSetsResponse, {}> = () => sendRequest(GetEventSets);
  const { data, mutate, error } = useSWR({ GetEventSets }, fetcher);
  return { eventSets: data?.event_sets, mutate, error };
}

export function usePropertyValues(connectionID: number | undefined, eventSetID: number | undefined, propertyName: string | undefined) {
  const fetcher: Fetcher<GetPropertyValuesResponse, GetPropertyValuesRequest> = (payload: GetPropertyValuesRequest) => sendRequest(GetPropertyValues, payload);
  const shouldFetch = connectionID && eventSetID && propertyName;
  const { data, mutate, error } = useSWR(shouldFetch ? { GetPropertyValues, connectionID, eventSetID, propertyName } : null, fetcher);
  return { propertyValues: data?.property_values, mutate, error };
}