import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, FieldMappingInput, GetSources, LinkCreateSource, LinkCreateSourceRequest, LinkGetSources, MongoDbConfig, Object, RedshiftConfig, SnowflakeConfig, Source } from "src/rpc/api";
import { mutate } from "swr";

export type SetupSyncProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

export enum SyncSetupStep {
  Initial = 1,
  Warehouse,
  Connection,
  Object,
  Finalize,
}

export type NewSourceState = {
  success: boolean | null;
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_SOURCE_STATE: NewSourceState = {
  success: null,
  displayName: "",
  bigqueryConfig: {
    credentials: "",
    location: "",
  },
  snowflakeConfig: {
    username: "",
    password: "",
    database_name: "",
    warehouse_name: "",
    role: "",
    host: "",
  },
  redshiftConfig: {
    username: "",
    password: "",
    database_name: "",
    port: "",
    host: "",
  },
  mongodbConfig: {
    username: "",
    password: "",
    host: "",
    connection_options: "",
  },
};

export type SetupSyncState = {
  step: SyncSetupStep;
  skippedSourceSetup: boolean;
  object: Object | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  connectionType: ConnectionType | undefined;
  source: Source | undefined;
  newSourceState: NewSourceState;
  fieldMappings: FieldMappingInput[] | undefined;
};

export const INITIAL_SETUP_STATE: SetupSyncState = {
  step: SyncSetupStep.Initial,
  skippedSourceSetup: false,
  object: undefined,
  namespace: undefined,
  tableName: undefined,
  connectionType: undefined,
  source: undefined,
  newSourceState: INITIAL_SOURCE_STATE,
  fieldMappings: undefined,
};

export const validateConnectionSetup = (connectionType: ConnectionType | undefined, state: NewSourceState): boolean => {
  if (!connectionType) {
    return false;
  }

  switch (connectionType) {
    case ConnectionType.Snowflake:
      return state.displayName.length > 0
        && state.snowflakeConfig.username.length > 0
        && state.snowflakeConfig.password.length > 0
        && state.snowflakeConfig.database_name.length > 0
        && state.snowflakeConfig.warehouse_name.length > 0
        && state.snowflakeConfig.role.length > 0
        && state.snowflakeConfig.host.length > 0;
    case ConnectionType.BigQuery:
      return state.displayName.length > 0 && state.bigqueryConfig.credentials.length > 0;
    case ConnectionType.Redshift:
      return state.displayName.length > 0
        && state.redshiftConfig.username.length > 0
        && state.redshiftConfig.password.length > 0
        && state.redshiftConfig.database_name.length > 0
        && state.redshiftConfig.host.length > 0;
    case ConnectionType.MongoDb:
      return state.displayName.length > 0
        && state.mongodbConfig.username.length > 0
        && state.mongodbConfig.password.length > 0
        && state.mongodbConfig.host.length > 0; // connection options is optional
  }
};

export const createNewSource = async (
  linkToken: string,
  state: SetupSyncState,
  setState: (state: SetupSyncState) => void,
) => {
  if (!validateConnectionSetup(state.connectionType, state.newSourceState)) {
    // show alert and make all input boxes red
    return;
  }

  if (state.newSourceState.success) {
    // TODO: clear success if one of the inputs change and just update the already created source
    // Already created the source, just continue again
    setState({ ...state, step: SyncSetupStep.Object });
    return;
  }

  const payload: LinkCreateSourceRequest = {
    'display_name': state.newSourceState.displayName,
    'connection_type': state.connectionType!,
  };

  switch (state.connectionType) {
    case ConnectionType.BigQuery:
      payload.bigquery_config = state.newSourceState.bigqueryConfig;
      break;
    case ConnectionType.Snowflake:
      payload.snowflake_config = state.newSourceState.snowflakeConfig;
      break;
    case ConnectionType.Redshift:
      payload.redshift_config = state.newSourceState.redshiftConfig;
      break;
    case ConnectionType.MongoDb:
      payload.mongodb_config = state.newSourceState.mongodbConfig;
      break;
    default:
    // TODO: throw an error here
  }

  try {
    const response = await sendRequest(LinkCreateSource, payload, [["X-LINK-TOKEN", linkToken]]);
    // Tell SWRs to refetch sources
    mutate({ GetSources });
    mutate({ LinkGetSources }); // Tell SWRs to refetch sources
    setState({
      ...state,
      source: response.source,
      step: SyncSetupStep.Object,
      newSourceState: { ...state.newSourceState, success: true },
    });
  } catch (e) {
    setState({ ...state, newSourceState: { ...state.newSourceState, success: false } });
  }
};

export const validateObjectSetup = (state: SetupSyncState): boolean => {
  return (state.object !== undefined && state.namespace !== undefined && state.tableName !== undefined);
};