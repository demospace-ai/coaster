import { useCallback } from "react";
import { sendRequest } from "src/rpc/ajax";
import { Analysis, AnalysisType, CreateAnalysis, CreateAnalysisRequest, GetAnalysis, GetAnalysisResponse, GetSchema, GetSchemaRequest, GetSchemaResponse } from "src/rpc/api";
import useSWR, { Fetcher } from 'swr';

export function useAnalysis(id: string | undefined) {
  const fetcher: Fetcher<GetAnalysisResponse, { id: string; }> = (value: { id: string; }) => sendRequest(GetAnalysis, { analysisID: value.id });
  const shouldFetch = id !== undefined;
  const { data, error, mutate } = useSWR(() => shouldFetch ? { GetAnalysis, id } : null, fetcher);
  return { analysisData: data, error, mutate };
}

export function useSchema(connectionID: number, datasetName: string, tableName: string) {
  const fetcher: Fetcher<GetSchemaResponse, GetSchemaRequest> = (request: GetSchemaRequest) => sendRequest(GetSchema, request);
  const { data, error } = useSWR({ GetSchema, connectionID, datasetID: datasetName, tableName }, fetcher);
  return { schema: data?.schema, error };
}

export const useCreateAnalysis = () => {
  // TODO: what should we do if no default connection ID is configured?
  return useCallback(async (analysisType: AnalysisType, defaultConnectionID?: number, defaultEventSetID?: number): Promise<Analysis | undefined> => {
    const payload: CreateAnalysisRequest = {
      connection_id: defaultConnectionID,
      event_set_id: defaultEventSetID,
      analysis_type: analysisType,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const response = await sendRequest(CreateAnalysis, payload);
      return response.analysis;
    } catch (e) {
      // TODO: handle error here
    }
  }, []);
};