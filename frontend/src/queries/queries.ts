import { sendRequest } from "src/rpc/ajax";
import { GetEvents, GetEventsRequest, GetProperties, GetPropertiesRequest, PropertyGroup, RunFunnelQuery, RunFunnelQueryRequest, RunQueryResponse } from "src/rpc/api";

export const getEvents = async (connectionID: number, eventSetID: number): Promise<string[]> => {
  const payload: GetEventsRequest = {
    connectionID: connectionID,
    eventSetID: eventSetID,
  };

  try {
    const response = await sendRequest(GetEvents, payload);
    // The result should only have a single query result column, which is the event types
    return response.events;
  } catch (e) {
    throw e;
  }
};

export const getEventProperties = async (connectionID: number, eventSetID: number): Promise<PropertyGroup[]> => {
  const payload: GetPropertiesRequest = {
    connectionID: connectionID,
    eventSetID: eventSetID,
  };

  try {
    const response = await sendRequest(GetProperties, payload);
    return response.property_groups;
  } catch (e) {
    throw e;
  }
};

export const runFunnelQuery = async (connectionID: number, analysisID: number): Promise<RunQueryResponse> => {
  const payload: RunFunnelQueryRequest = {
    connection_id: connectionID,
    analysis_id: analysisID,
  };

  try {
    const response = await sendRequest(RunFunnelQuery, payload);
    return response;
  } catch (e) {
    throw e;
  }
};