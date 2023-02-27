import { sendLinkTokenRequest } from "src/rpc/ajax";
import { BigQueryConfig, ColumnSchema, ConnectionType, FieldMappingInput, FrequencyUnits, GetSources, LinkCreateSource, LinkCreateSourceRequest, LinkCreateSync, LinkCreateSyncRequest, LinkGetSources, LinkGetSyncs, MongoDbConfig, Object, RedshiftConfig, SnowflakeConfig, Source, SyncMode } from "src/rpc/api";
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
  sourceCreated: boolean;
  error: string | undefined;
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_SOURCE_STATE: NewSourceState = {
  sourceCreated: false,
  error: undefined,
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

export interface FieldMappingState {
  source_column: ColumnSchema | undefined;
  destination_field_id: number;
}

export type SetupSyncState = {
  step: SyncSetupStep;
  syncCreated: boolean;
  error: string | undefined;
  skippedSourceSetup: boolean;
  object: Object | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  customJoin: string | undefined;
  syncMode: SyncMode | undefined;
  connectionType: ConnectionType | undefined;
  source: Source | undefined;
  newSourceState: NewSourceState;
  displayName: string | undefined,
  frequency: number | undefined,
  frequencyUnits: FrequencyUnits | undefined,
  fieldMappings: FieldMappingState[] | undefined;
};

export const INITIAL_SETUP_STATE: SetupSyncState = {
  step: SyncSetupStep.Initial,
  syncCreated: false,
  error: undefined,
  skippedSourceSetup: false,
  object: undefined,
  namespace: undefined,
  tableName: undefined,
  customJoin: undefined,
  syncMode: SyncMode.FullOverwrite, // TODO
  connectionType: undefined,
  source: undefined,
  newSourceState: INITIAL_SOURCE_STATE,
  displayName: undefined,
  frequency: undefined,
  frequencyUnits: undefined,
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

  if (state.newSourceState.sourceCreated) {
    // TODO: clear success if one of the inputs change and just update the already created source
    // Already created the source, just continue again
    setState({ ...state, step: SyncSetupStep.Object });
    return;
  }

  const payload: LinkCreateSourceRequest = {
    display_name: state.newSourceState.displayName,
    connection_type: state.connectionType!,
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
    const response = await sendLinkTokenRequest(LinkCreateSource, linkToken, payload);
    // Tell SWRs to refetch sources
    mutate({ GetSources });
    mutate({ LinkGetSources }); // Tell SWRs to refetch sources
    setState({
      ...state,
      source: response.source,
      step: SyncSetupStep.Object,
      newSourceState: { ...state.newSourceState, sourceCreated: true },
    });
  } catch (e) {
    setState({ ...state, newSourceState: { ...state.newSourceState, error: String(e) } });
  }
};

export const validateObjectSetup = (state: SetupSyncState): boolean => {
  return (state.object !== undefined && state.namespace !== undefined && state.tableName !== undefined);
};

export const validateSyncSetup = (state: SetupSyncState): boolean => {
  return state.displayName !== undefined && state.displayName.length > 0
    && state.source !== undefined
    && state.object !== undefined
    && ((state.namespace !== undefined && state.namespace !== undefined) || state.customJoin !== undefined)
    && state.syncMode !== undefined
    && state.frequency !== undefined
    && state.frequencyUnits !== undefined
    && state.fieldMappings !== undefined;
};


export const createNewSync = async (
  linkToken: string,
  state: SetupSyncState,
  setState: (state: SetupSyncState) => void,
) => {
  if (!validateSyncSetup(state)) {
    // show alert and make all input boxes red
    return;
  }

  const fieldMappings: FieldMappingInput[] = state.fieldMappings!.map(fieldMapping => {
    return (
      {
        source_field_name: fieldMapping.source_column!.name,
        destination_field_id: fieldMapping.destination_field_id,
      }
    );
  });
  const payload: LinkCreateSyncRequest = {
    display_name: state.newSourceState.displayName,
    source_id: state.source!.id,
    object_id: state.object!.id,
    namespace: state.namespace,
    table_name: state.tableName,
    sync_mode: state.syncMode!,
    frequency: state.frequency!,
    frequency_units: state.frequencyUnits!,
    field_mappings: fieldMappings
  };

  try {
    await sendLinkTokenRequest(LinkCreateSync, linkToken, payload);
    // Tell SWRs to refetch sources
    mutate({ LinkGetSyncs });
    setState({
      ...state,
      syncCreated: true,
    });
  } catch (e) {
    setState({ ...state, error: String(e) });
  }
};