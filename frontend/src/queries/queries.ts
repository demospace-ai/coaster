import { sendRequest } from "src/rpc/ajax";
import { GetEvents, GetEventsRequest, GetProperties, GetPropertiesRequest, GetPropertyValues, GetPropertyValuesRequest, PropertyGroup, RunFunnelQuery, RunFunnelQueryRequest, RunQueryResponse } from "src/rpc/api";

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

export const getProperties = async (connectionID: number, eventSetID: number): Promise<PropertyGroup[]> => {
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