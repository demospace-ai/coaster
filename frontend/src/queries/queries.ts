import { sendRequest } from "src/rpc/ajax";
import { EventSet, GetEvents, GetEventsRequest, RunFunnelQuery, RunQueryRequest, RunQueryResponse } from "src/rpc/api";

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
    console.log(e);
    return [];
  }
};

const createStepSubquery = (eventSet: EventSet, event: string, order: number, previous?: string, usingCustomTableQuery?: boolean): string => {
  const tableName = `${event}_${order}`;
  const sourceTable = usingCustomTableQuery ? "custom_events" : `${eventSet.dataset_name}.${eventSet.table_name}`;
  const queryArray = `
    ${tableName} AS (
      SELECT DISTINCT ${tableName}.${eventSet.user_identifier_column}, ${tableName}.${eventSet.timestamp_column}
      FROM ${sourceTable} AS ${tableName}
      ${previous ? `JOIN ${previous} ON ${previous}.${eventSet.user_identifier_column} = ${tableName}.${eventSet.user_identifier_column}` : ``}
      WHERE ${tableName}.${eventSet.event_type_column} = '${event}'
      ${previous ? `AND ${previous}.${eventSet.timestamp_column} < ${tableName}.${eventSet.timestamp_column}` : ``}
    )
  `;
  return queryArray;
};

const createResultsSubquery = (eventSet: EventSet, events: string[]): string => {
  const rollupArray = events.map((event, index) => {
    return `SELECT COUNT(DISTINCT ${eventSet.user_identifier_column}) AS count, '${event}' AS event, ${index} AS event_order FROM ${event}_${index}`;
  });

  const queryArray = [
    "results AS (",
    rollupArray.join(" UNION ALL "),
    ")"
  ];

  return queryArray.join(" ");
};

const getCustomTableQuery = (eventSet: EventSet) => {
  if (eventSet.custom_join) {
    return `
      WITH custom_events AS (
        ${eventSet.custom_join}
      )
    `;
  } else {
    return undefined;
  }
};

export const runFunnelQuery = async (connectionID: number, eventSet: EventSet, events: string[]): Promise<RunQueryResponse> => {
  const customTableQuery = getCustomTableQuery(eventSet);

  const stepSubqueryArray = events.map((event, index) => {
    return createStepSubquery(eventSet, event, index, index === 0 ? undefined : `${events[index - 1]}_${index - 1}`, customTableQuery !== undefined);
  });
  const stepSubqueryString = stepSubqueryArray.join(", ");

  const query = `
    ${customTableQuery ? `${customTableQuery},` : 'WITH'}
    ${stepSubqueryString},
    ${createResultsSubquery(eventSet, events)}
    SELECT count, event, (count / (SELECT MAX(count) FROM results)) as percent from results ORDER BY results.event_order
  `;

  const payload: RunQueryRequest = {
    'connection_id': connectionID,
    'query_string': query,
  };

  try {
    const response = await sendRequest(RunFunnelQuery, payload);
    return response;
  } catch (e) {
    throw e;
  }
};