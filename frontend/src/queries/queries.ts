import { sendRequest } from "src/rpc/ajax";
import { GetPropertyValues, QueryResult, RunFunnelQuery } from "src/rpc/api";

export const getPropertyValues = async (connectionID: number, eventSetID: number, propertyName: string): Promise<string[]> => {
  try {
    const response = await sendRequest(GetPropertyValues, {
      connectionID: connectionID,
      eventSetID: eventSetID,
      propertyName: propertyName,
    });
    return response.property_values;
  } catch (e) {
    throw e;
  }
};

export const runFunnelQuery = async (analysisID: number): Promise<QueryResult> => {
  try {
    const response = await sendRequest(RunFunnelQuery, {
      'analysis_id': analysisID,
    });
    return response;
  } catch (e) {
    throw e;
  }
};