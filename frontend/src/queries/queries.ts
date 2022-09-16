import { rudderanalytics } from "src/app/rudder";
import { sendRequest } from "src/rpc/ajax";
import { EventSet, RunQuery, RunQueryRequest, RunQueryResponse } from "src/rpc/api";

export const getEvents = async (connectionID: number, eventSet: EventSet): Promise<string[]> => {
  const queryArray = [
    "SELECT DISTINCT", eventSet.event_type_column, "FROM",
    eventSet.dataset_name + "." + eventSet.table_name + ";"
  ];
  const query = queryArray.join(' ');

  const payload: RunQueryRequest = {
    'connection_id': connectionID,
    'query_string': query,
  };

  try {
    rudderanalytics.track("get_events.start");
    const response = await sendRequest(RunQuery, payload);
    rudderanalytics.track("get_events.success");

    // The result should only have a single query result column, which is the event types
    return response.query_results.map(result => result[0]) as string[];
  } catch (e) {
    console.log(e);
    rudderanalytics.track("get_events.error");
    return [];
  }
};

const createStepQuery = (eventSet: EventSet, event: string, previous?: string): string => {
  const queryArray = [
    event, "AS", "(",
    "SELECT DISTINCT", event + "." + eventSet.user_identifier_column + ",", event + "." + eventSet.timestamp_column + ",", "FROM",
    eventSet.dataset_name + "." + eventSet.table_name, 'AS', event,
    ...previous ? ["JOIN", previous, "ON", previous + "." + eventSet.user_identifier_column, "=", event + "." + eventSet.user_identifier_column] : [],
    "WHERE", event + '.' + eventSet.event_type_column, "=", "'" + event + "'",
    ...previous ? ["AND", previous + "." + eventSet.timestamp_column, "<", event + "." + eventSet.timestamp_column] : [],
    ")"
  ];
  return queryArray.join(' ');
};

const createResultsQuery = (eventSet: EventSet, events: string[]): string => {
  const rollupArray = events.map(event => {
    return [
      "SELECT COUNT(DISTINCT", eventSet.user_identifier_column, ") AS count,", "'" + event + "'", "AS event FROM", event,
    ].join(' ');
  });

  const queryArray = [
    "results AS (",
    rollupArray.join(" UNION ALL "),
    ")"
  ];

  return queryArray.join(" ");
};

export const runFunnelQuery = async (connectionID: number, eventSet: EventSet, events: string[]): Promise<RunQueryResponse> => {
  const stepQueryArray = events.map((event, index) => {
    return createStepQuery(eventSet, event, index === 0 ? undefined : events[index - 1]);
  });
  const stepQueryString = stepQueryArray.join(", ");

  const queryArray = [
    "WITH", stepQueryString, ",",
    createResultsQuery(eventSet, events),
    "SELECT count, event, (count / (SELECT MAX(count) FROM results)) as percent from results"
  ];

  const query = queryArray.join(' ');

  const payload: RunQueryRequest = {
    'connection_id': connectionID,
    'query_string': query,
  };

  try {
    rudderanalytics.track("run_funnel_query.start");
    const response = await sendRequest(RunQuery, payload);
    rudderanalytics.track("run_funnel_query.success");
    return response;
  } catch (e) {
    rudderanalytics.track("run_funnel_query.error");
    throw e;
  }
};