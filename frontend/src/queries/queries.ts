import { sendRequest } from "src/rpc/ajax";
import { GetPropertyValues, GetPropertyValuesRequest, QueryResult, RunFunnelQuery, RunFunnelQueryRequest } from "src/rpc/api";

export const getPropertyValues = async (connectionID: number, eventSetID: number, propertyName: string): Promise<string[]> => {
  const payload: GetPropertyValuesRequest = {
    connectionID: connectionID,
    eventSetID: eventSetID,
    propertyName: propertyName,
  };

  try {
    const response = await sendRequest(GetPropertyValues, payload);
    return response.property_values;
  } catch (e) {
    throw e;
  }
};

export const runFunnelQuery = async (analysisID: number): Promise<QueryResult> => {
  const payload: RunFunnelQueryRequest = {
    analysis_id: analysisID,
  };

  try {
    const response = await sendRequest(RunFunnelQuery, payload);
    return response;
  } catch (e) {
    throw e;
  }
};