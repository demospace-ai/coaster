import classNames from "classnames";
import React, { FormEvent, useState } from "react";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SetupSyncState } from "src/connect/App";
import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, getConnectionType, GetSources, LinkCreateSource, LinkCreateSourceRequest, LinkGetSources, MongoDbConfig, RedshiftConfig, SnowflakeConfig, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
import { mutate } from "swr";

type NewConnectionConfigurationProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

export type NewSourceState = {
  success: boolean | null;
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
export const INITIAL_SOURCE_STATE: NewSourceState = {
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

export const NewSourceConfiguration: React.FC<NewConnectionConfigurationProps> = (props) => {
  const state = props.state.newSourceState;
  const setState = (newSourceState: NewSourceState) => props.setState({ ...props.state, newSourceState: newSourceState });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    createNewSource(props.linkToken, props.state, props.setState);
  };

  const connectionType = props.state.connectionType;
  if (!connectionType) {
    // TODO: handle error, this should never happen
    return <></>;
  }

  let inputs: React.ReactElement;
  switch (props.state.connectionType!) {
    case ConnectionType.Snowflake:
      inputs = <SnowflakeInputs state={props.state.newSourceState} setState={setState} />;
      break;
    case ConnectionType.BigQuery:
      inputs = <BigQueryInputs state={state} setState={setState} />;
      break;
    case ConnectionType.Redshift:
      inputs = <RedshiftInputs state={state} setState={setState} />;
      break;
    case ConnectionType.MongoDb:
      inputs = <MongoDbInputs state={state} setState={setState} />;
      break;
  };

  return (
    <div className="tw-w-[500px] tw-flex tw-flex-col">
      <div className="tw-flex tw-justify-center tw-items-center tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">
        <img src={getConnectionTypeImg(connectionType)} alt="icon" className="tw-h-8 tw-mr-1.5" />
        Connect to {getConnectionType(connectionType)}
      </div>
      <div className="tw-text-center tw-mb-2 tw-text-slate-600">Provide the settings and credentials for your data source.</div>
      <form className="tw-pb-16" onSubmit={submit}>
        {inputs}
        <TestConnectionButton state={state} connectionType={connectionType} />
      </form >
    </div>
  );
};

const validateAll = (connectionType: ConnectionType | undefined, state: NewSourceState): boolean => {
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
  if (!validateAll(state.connectionType, state.newSourceState)) {
    // show alert and make all input boxes red
    return;
  }

  if (state.newSourceState.success) {
    // TODO: clear success if one of the inputs change and just update the already created source
    // Already created the source, just continue again
    setState({ ...state, step: state.step + 1, prevStep: state.step });
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
      step: state.step + 1,
      prevStep: state.step,
      newSourceState: { ...state.newSourceState, success: true },
    });
  } catch (e) {
    setState({ ...state, newSourceState: { ...state.newSourceState, success: false } });
  }
};

const TestConnectionButton: React.FC<{ state: NewSourceState, connectionType: ConnectionType; }> = props => {
  const [testLoading, setTestLoading] = useState(false);
  const [testConnectionSuccess, setTestConnectionSuccess] = useState<boolean | null>(null);
  const state = props.state;

  const testConnection = async () => {
    setTestLoading(true);
    if (!validateAll(props.connectionType, state)) {
      setTestLoading(false);
      setTestConnectionSuccess(false);
      return;
    }

    const payload: TestDataConnectionRequest = {
      'display_name': state.displayName,
      'connection_type': props.connectionType,
    };

    switch (props.connectionType) {
      case ConnectionType.BigQuery:
        payload.bigquery_config = state.bigqueryConfig;
        break;
      case ConnectionType.Snowflake:
        payload.snowflake_config = state.snowflakeConfig;
        break;
      case ConnectionType.MongoDb:
        payload.mongodb_config = state.mongodbConfig;
        break;
      default:
      // TODO: throw an error here
    }

    try {
      await sendRequest(TestDataConnection, payload);
      setTestConnectionSuccess(true);
    } catch (e) {
      setTestConnectionSuccess(false);
    }

    setTestLoading(false);
  };

  const testColor = testConnectionSuccess === null ? null : testConnectionSuccess ? "tw-bg-green-700" : "tw-bg-red-700";
  return (
    <Button className={classNames("tw-mt-8 tw-bg-slate-200 tw-text-slate-900 hover:tw-bg-slate-300 tw-border-slate-200 tw-w-full tw-h-10", testColor)} onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
  );
};

type ConnectionConfigurationProps = {
  state: NewSourceState;
  setState: (state: NewSourceState) => void;
};

const SnowflakeInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip place="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip place="right" label="You can choose your personal username or create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='username' value={state.snowflakeConfig.username} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, username: value } }); }} placeholder='Username' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip place="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='password' type="password" value={state.snowflakeConfig.password} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, password: value } }); }} placeholder='Password' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip place="right" label="The Snowflake database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='databaseName' value={state.snowflakeConfig.database_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, database_name: value } }); }} placeholder='Database Name' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Warehouse Name</span>
        <Tooltip place="right" label="The warehouse that will be used to run syncs in Snowflake.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='warehouseName' value={state.snowflakeConfig.warehouse_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, warehouse_name: value } }); }} placeholder='Warehouse Name' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Role</span>
        <Tooltip place="right" label="The role that will be used to run syncs.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='role' value={state.snowflakeConfig.role} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, role: value } }); }} placeholder='Role' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Host</span>
        <Tooltip place="right" label={<div className="tw-m-2"><span>This is your Snowflake URL. Format may differ based on Snowflake account age. For details, </span><a className="tw-text-blue-400" href="https://docs.snowflake.com/en/user-guide/admin-account-identifier.html">visit the Snowflake docs.</a><div className="tw-mt-2"><span>Example:</span><div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">abc123.us-east1.gcp.snowflakecomputing.com</div></div></div>} interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div >
      <ValidatedInput id='host' value={state.snowflakeConfig.host} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, host: value } }); }} placeholder='Host' />
    </>
  );
};

const RedshiftInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" />
      <ValidatedInput id='username' value={state.redshiftConfig.username} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, username: value } }); }} placeholder='Username' label="Username" />
      <ValidatedInput id='password' type="password" value={state.redshiftConfig.password} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, password: value } }); }} placeholder='Password' label="Password" />
      <ValidatedInput id='databaseName' value={state.redshiftConfig.database_name} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, database_name: value } }); }} placeholder='Database Name' label="Database Name" />
      <ValidatedInput id='host' value={state.redshiftConfig.host} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, host: value } }); }} placeholder='Host' label="Host" />
      <ValidatedInput id='port' value={state.redshiftConfig.port} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, port: value } }); }} placeholder='Port' label="Port" />
    </>
  );
};

const MongoDbInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" />
      <ValidatedInput id='username' value={state.mongodbConfig.username} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, username: value } }); }} placeholder='Username' label="Username" />
      <ValidatedInput id='password' type="password" value={state.mongodbConfig.password} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, password: value } }); }} placeholder='Password' label="Password" />
      <ValidatedInput id='host' value={state.mongodbConfig.host} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, host: value } }); }} placeholder='Host' label="Host" />
      <ValidatedInput id='connectionOptions' value={state.mongodbConfig.connection_options} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, connection_options: value } }); }} placeholder='Connection Options' label="Connection Options" />
    </>
  );
};

const BigQueryInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip place="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Location</span>
        <Tooltip place="right" label="The geographic location of your BigQuery dataset(s).">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='location' value={state.bigqueryConfig.location} setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, location: value } }); }} placeholder='Location' />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Credentials</span>
        <Tooltip place="right" label="This can be obtained in the Google Cloud web console by navigating to the IAM page and clicking on Service Accounts in the left sidebar. Then, find your service account in the list, go to its Keys tab, and click Add Key. Finally, click on Create new key and choose JSON." interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput
        className="tw-h-24 tw-min-h-[40px] tw-max-h-80"
        id='credentials'
        value={state.bigqueryConfig.credentials}
        setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, credentials: value } }); }}
        placeholder='Credentials (paste JSON here)'
        textarea={true}
      />
    </>
  );
};;