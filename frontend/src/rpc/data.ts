import { useCallback } from "react";
import { sendRequest } from "src/rpc/ajax";
import { Analysis, Dashboard, GetAllAnalyses, GetAllAnalysesResponse, GetAllDashboards, GetAllDashboardsResponse, GetAnalysis, GetDashboard, GetDataConnections, GetDataConnectionsResponse, GetDatasets, GetDatasetsResponse, GetEvents, GetEventSets, GetEventSetsResponse, GetEventsRequest, GetEventsResponse, GetProperties, GetPropertiesRequest, GetPropertiesResponse, GetPropertyValues, GetPropertyValuesRequest, GetPropertyValuesResponse, GetSchema, GetSchemaRequest, GetSchemaResponse, GetTables, GetTablesResponse, QueryResult, RunFunnelQuery, RunTrendQuery, UpdateAnalysis, UpdateAnalysisRequest, UpdateDashboard, UpdateDashboardRequest } from "src/rpc/api";
import useSWR, { Fetcher } from "swr";

export function useAnalysis(id: string | undefined) {
  const fetcher: Fetcher<Analysis, { id: string; }> = (value: { id: string; }) => sendRequest(GetAnalysis, { analysisID: value.id });
  const shouldFetch = id !== undefined;
  const { data, error, mutate } = useSWR(shouldFetch ? { GetAnalysis, id } : null, fetcher);
  const updateAnalysis = useCallback(async (payload: UpdateAnalysisRequest) => {
    try {
      await mutate(() => {
        return sendRequest(UpdateAnalysis, payload);
      }, {
        rollbackOnError: true,
        revalidate: false,
      });
    } catch (e) {
      // TODO: handle error
    }
  }, [mutate]);
  return { analysis: data, error, updateAnalysis };
}

export function useDashboard(id: string | undefined) {
  const fetcher: Fetcher<Dashboard, { id: string; }> = (value: { id: string; }) => sendRequest(GetDashboard, { dashboardID: value.id });
  const shouldFetch = id !== undefined;
  const { data, error, mutate } = useSWR(shouldFetch ? { GetDashboard, id } : null, fetcher);
  const updateDashboard = useCallback(async (payload: UpdateDashboardRequest) => {
    try {
      await mutate(() => {
        return sendRequest(UpdateDashboard, payload);
      }, {
        rollbackOnError: true,
        revalidate: false,
      });
    } catch (e) {
      // TODO: handle error
    }
  }, [mutate]);
  return { dashboard: data, error, updateDashboard };
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

export function useDashboards() {
  const fetcher: Fetcher<GetAllDashboardsResponse, {}> = async () => (await sendRequest(GetAllDashboards));
  const { data, mutate, error } = useSWR({ GetAllDashboards }, fetcher);
  return { dashboards: data?.dashboards, mutate, error };
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

export function useTrendResults(analysis: Analysis | undefined) {
  const fetcher: Fetcher<QueryResult[], { id: string; }> = (value: { id: string; }) => {
    if (!analysis) {
      throw new Error("this should not happen");
    }

    if (!analysis.events) {
      throw new Error("trend must have at least one event");
    }

    if (!analysis.connection) {
      throw new Error("trend must have a connection defined");
    }

    if (!analysis.event_set) {
      throw new Error("trend must have a event set defined");
    }

    return sendRequest(RunTrendQuery, {
      'analysis_id': Number(analysis.id),
    });
  };
  const shouldFetch = analysis !== undefined;
  const { data, error, mutate } = useSWR(shouldFetch ? { RunTrendQuery, analysis } : null, fetcher);
  return { trendResults: data, error, mutate };
}

export function useFunnelResults(analysis: Analysis | undefined) {
  const fetcher: Fetcher<QueryResult, { id: string; }> = (value: { id: string; }) => {
    if (!analysis) {
      throw new Error("this should not happen");
    }

    if (!analysis.events || analysis.events.length < 2) {
      throw new Error("funnel must have at least two events");
    }

    if (!analysis.connection) {
      throw new Error("funnel must have a connection defined");
    }

    if (!analysis.event_set) {
      throw new Error("funnel must have a event set defined");
    }

    return sendRequest(RunFunnelQuery, {
      'analysis_id': Number(analysis.id),
    });
  };
  const shouldFetch = analysis !== undefined;
  const { data, error, mutate } = useSWR(shouldFetch ? { RunFunnelQuery, analysis } : null, fetcher);
  return { funnelResults: data, error, mutate };
}