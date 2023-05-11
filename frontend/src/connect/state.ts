import { sendLinkTokenRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, FabraObject, Field, FieldMappingInput, FrequencyUnits, GetSources, LinkCreateSource, LinkCreateSourceRequest, LinkCreateSync, LinkCreateSyncRequest, LinkGetSources, LinkGetSyncs, MongoDbConfig, RedshiftConfig, SnowflakeConfig, Source, SynapseConfig } from "src/rpc/api";
import { HttpError } from "src/utils/errors";
import { mutate } from "swr";

export type SetupSyncProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: React.Dispatch<React.SetStateAction<SetupSyncState>>;
};

export enum SyncSetupStep {
  ExistingSources = 1,
  ChooseSourceType,
  ConnectionDetails,
  ChooseData,
  Finalize,
}

export type NewSourceState = {
  sourceCreated: boolean;
  error: string | undefined;
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  synapseConfig: SynapseConfig;
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
    endpoint: "",
  },
  synapseConfig: {
    username: "",
    password: "",
    database_name: "",
    endpoint: "",
  },
  mongodbConfig: {
    username: "",
    password: "",
    host: "",
    connection_options: "",
  },
};

export const resetState = (setState: React.Dispatch<React.SetStateAction<SetupSyncState>>) => {
  setState(_ => {
    return INITIAL_SETUP_STATE;
  });
};

export interface FieldMappingState {
  sourceField: Field | undefined;
  destinationFieldId: number;
  expandedJson: boolean;
  jsonFields: (Field | undefined)[];
}

export type SetupSyncState = {
  step: SyncSetupStep;
  syncCreated: boolean;
  error: string | undefined;
  skippedSourceSetup: boolean;
  skippedSourceSelection: boolean;
  object: FabraObject | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  customJoin: string | undefined;
  connectionType: ConnectionType | undefined;
  source: Source | undefined;
  newSourceState: NewSourceState;
  displayName: string | undefined,
  frequency: number | undefined,
  frequencyUnits: FrequencyUnits | undefined,
  fieldMappings: FieldMappingState[] | undefined;
};

export const INITIAL_SETUP_STATE: SetupSyncState = {
  step: SyncSetupStep.ExistingSources,
  syncCreated: false,
  error: undefined,
  skippedSourceSetup: false,
  skippedSourceSelection: false,
  object: undefined,
  namespace: undefined,
  tableName: undefined,
  customJoin: undefined,
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
        && state.redshiftConfig.endpoint.length > 0;
    case ConnectionType.Synapse:
      return state.displayName.length > 0
        && state.synapseConfig.username.length > 0
        && state.synapseConfig.password.length > 0
        && state.synapseConfig.database_name.length > 0
        && state.synapseConfig.endpoint.length > 0;
    case ConnectionType.MongoDb:
      return state.displayName.length > 0
        && state.mongodbConfig.username.length > 0
        && state.mongodbConfig.password.length > 0
        && state.mongodbConfig.host.length > 0; // connection options is optional
    case ConnectionType.Webhook:
      return false; // cannot create a sync with a webhook source
  }
};

export const createNewSource = async (
  linkToken: string,
  state: SetupSyncState,
  setState: React.Dispatch<React.SetStateAction<SetupSyncState>>,
) => {
  if (!validateConnectionSetup(state.connectionType, state.newSourceState)) {
    // show alert and make all input boxes red
    return;
  }

  if (state.newSourceState.sourceCreated) {
    // TODO: clear success if one of the inputs change and just update the already created source
    // Already created the source, just continue again
    setState(state => ({ ...state, step: SyncSetupStep.ChooseData }));
    return;
  }

  const payload: LinkCreateSourceRequest = {
    display_name: state.newSourceState.displayName,
    connection_type: state.connectionType!,
  };

  switch (state.connectionType!) {
    case ConnectionType.BigQuery:
      payload.bigquery_config = state.newSourceState.bigqueryConfig;
      break;
    case ConnectionType.Snowflake:
      payload.snowflake_config = state.newSourceState.snowflakeConfig;
      break;
    case ConnectionType.Redshift:
      payload.redshift_config = state.newSourceState.redshiftConfig;
      break;
    case ConnectionType.Synapse:
      payload.synapse_config = state.newSourceState.synapseConfig;
      break;
    case ConnectionType.MongoDb:
      payload.mongodb_config = state.newSourceState.mongodbConfig;
      break;
    case ConnectionType.Webhook:
      // TODO: throw an error
      return;
  }

  try {
    const response = await sendLinkTokenRequest(LinkCreateSource, linkToken, payload);
    // Tell SWRs to refetch sources
    mutate({ GetSources });
    mutate({ LinkGetSources }); // Tell SWRs to refetch sources
    setState(state => ({
      ...state,
      source: response.source,
      step: SyncSetupStep.ChooseData,
      newSourceState: { ...state.newSourceState, sourceCreated: true },
      namespace: undefined, // set namespace and table name to undefined since we"re using a new source
      tableName: undefined,
    }));
  } catch (e) {
    if (e instanceof HttpError) {
      const errorMessage = e.message;
      setState(state => ({ ...state, newSourceState: { ...state.newSourceState, error: errorMessage } }));
    }
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
    // && state.frequency !== undefined
    // && state.frequencyUnits !== undefined
    && state.fieldMappings !== undefined && validateFieldMappings(state.fieldMappings);
};

const validateFieldMappings = (fieldMapppings: FieldMappingState[]): boolean => {
  return fieldMapppings.every(fieldMapping => {
    if (fieldMapping.expandedJson) {
      return fieldMapping.jsonFields.every(jsonField => jsonField !== undefined);
    } else {
      return fieldMapping.sourceField !== undefined;
    }
  });
};

export const createNewSync = async (
  linkToken: string,
  state: SetupSyncState,
  setState: React.Dispatch<React.SetStateAction<SetupSyncState>>,
) => {
  if (!validateSyncSetup(state)) {
    // show alert and make all input boxes red
    return;
  }

  const convertFieldMappings = (fieldMapping: FieldMappingState): FieldMappingInput[] => {
    if (fieldMapping.expandedJson) {
      return fieldMapping.jsonFields.map(jsonMapping => {
        return {
          source_field_name: jsonMapping!.name,
          source_field_type: jsonMapping!.type,
          destination_field_id: fieldMapping.destinationFieldId,
          is_json_field: true,
        };
      });
    } else {
      return [{
        source_field_name: fieldMapping.sourceField!.name,
        source_field_type: fieldMapping.sourceField!.type,
        destination_field_id: fieldMapping.destinationFieldId,
        is_json_field: false,
      }];
    }
  };

  const fieldMappings: FieldMappingInput[] = state.fieldMappings!.flatMap(convertFieldMappings);
  const payload: LinkCreateSyncRequest = {
    display_name: state.displayName!,
    source_id: state.source!.id,
    object_id: state.object!.id,
    namespace: state.namespace,
    table_name: state.tableName,
    frequency: state.frequency!,
    frequency_units: state.frequencyUnits!,
    field_mappings: fieldMappings
  };

  try {
    await sendLinkTokenRequest(LinkCreateSync, linkToken, payload);
    // Tell SWRs to refetch syncs
    mutate({ LinkGetSyncs });
    setState(state => ({
      ...state,
      syncCreated: true,
    }));
  } catch (e) {
    if (e instanceof HttpError) {
      const errorMessage = e.message;
      setState(state => ({ ...state, error: errorMessage }));
    }
  }
};