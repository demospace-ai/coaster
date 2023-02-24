import React, { FormEvent, useImperativeHandle, useState } from "react";
import { Button } from "src/components/button/Button";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { SetupStep } from "src/connect/App";
import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, CreateSource, CreateSourceRequest, getConnectionType, GetSources, MongoDbConfig, RedshiftConfig, SnowflakeConfig, Source, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
import { mutate } from "swr";

type NewConnectionConfigurationProps = {
  connectionType: ConnectionType;
  endCustomerId: number;
  nextStep: () => void;
  previousStep: () => void;
  setSource: (source: Source) => void;
};

type NewSourceState = {
  success: boolean | null;
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_DESTINATION_STATE: NewSourceState = {
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

const validateAll = (connectionType: ConnectionType, state: NewSourceState): boolean => {
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

// TODO: figure out what this type is
export const NewSourceConfiguration = React.forwardRef<SetupStep, NewConnectionConfigurationProps>((props, ref) => {
  const [state, setState] = useState<NewSourceState>(INITIAL_DESTINATION_STATE);
  useImperativeHandle(ref, () => {
    return {
      continue: async () => {
        console.log("hi");
        return new Promise(resolve => setTimeout(resolve, 10000));
      }
    };
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    createNewSource();
  };

  const createNewSource = async () => {
    if (!validateAll(props.connectionType, state)) {
      return;
    }

    const payload: CreateSourceRequest = {
      'display_name': state.displayName,
      'connection_type': props.connectionType,
      'end_customer_id': props.endCustomerId,
    };

    switch (props.connectionType) {
      case ConnectionType.BigQuery:
        payload.bigquery_config = state.bigqueryConfig;
        break;
      case ConnectionType.Snowflake:
        payload.snowflake_config = state.snowflakeConfig;
        break;
      case ConnectionType.Redshift:
        payload.redshift_config = state.redshiftConfig;
        break;
      case ConnectionType.MongoDb:
        payload.mongodb_config = state.mongodbConfig;
        break;
      default:
      // TODO: throw an error here
    }

    try {
      const response = await sendRequest(CreateSource, payload);
      mutate({ GetSources }); // Tell SWRs to refetch destinatinos connections
      props.setSource(response.source);
      props.nextStep();
    } catch (e) {
      setState({ ...state, success: false });
    }
  };

  let inputs: React.ReactElement;
  switch (props.connectionType) {
    case ConnectionType.Snowflake:
      inputs = <SnowflakeInputs state={state} setState={setState} />;
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
        <img src={getConnectionTypeImg(props.connectionType)} alt="icon" className="tw-h-8 tw-mr-1.5" />
        Connect to {getConnectionType(props.connectionType)}
      </div>
      <div className="tw-text-center tw-mb-5 tw-text-slate-700">Provide the settings and credentials for your data source.</div>
      <form className="tw-pb-16" onSubmit={submit}>
        {inputs}
        <TestConnectionButton state={state} connectionType={props.connectionType} />
        {state.success !== null &&
          /* TODO: return error message here */
          <div className="tw-mt-3 tw-text-center">{state.success ? "Success!" : "Failure"}</div>
        }
      </form >
    </div>
  );
});

const TestConnectionButton: React.FC<{ state: NewSourceState, connectionType: ConnectionType; }> = props => {
  const [testLoading, setTestLoading] = useState(false);
  const [testConnectionSuccess, setTestConnectionSuccess] = useState<boolean | null>(null);
  const state = props.state;

  const testConnection = async () => {
    setTestLoading(true);
    if (!validateAll(props.connectionType, state)) {
      setTestLoading(false);
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

  return (
    <>
      <Button className="tw-mt-8 tw-bg-slate-200 tw-text-slate-900 hover:tw-bg-slate-300 tw-border-slate-200 tw-w-full tw-h-10" onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
      {testConnectionSuccess !== null &&
        /* TODO: return error message here */
        <div className="tw-mt-3 tw-text-center">{testConnectionSuccess ? "Success!" : "Failure"}</div>
      }
    </>
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
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" />
      <ValidatedInput id='username' value={state.snowflakeConfig.username} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, username: value } }); }} placeholder='Username' label="Username" />
      <ValidatedInput id='password' type="password" value={state.snowflakeConfig.password} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, password: value } }); }} placeholder='Password' label="Password" />
      <ValidatedInput id='databaseName' value={state.snowflakeConfig.database_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, database_name: value } }); }} placeholder='Database Name' label="Database Name" />
      <ValidatedInput id='warehouseName' value={state.snowflakeConfig.warehouse_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, warehouse_name: value } }); }} placeholder='Warehouse Name' label="Warehouse Name" />
      <ValidatedInput id='role' value={state.snowflakeConfig.role} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, role: value } }); }} placeholder='Role' label="Role" />
      <ValidatedInput id='host' value={state.snowflakeConfig.host} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, host: value } }); }} placeholder='Host' label="Host" />
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
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" />
      <ValidatedInput id='location' value={state.bigqueryConfig.location} setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, location: value } }); }} placeholder='Location' label="Location" />
      <ValidatedInput
        className="tw-h-24 tw-min-h-[40px] tw-max-h-80"
        id='credentials'
        value={state.bigqueryConfig.credentials}
        setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, credentials: value } }); }}
        placeholder='Credentials (paste JSON here)'
        textarea={true}
        label="Credentials"
      />
    </>
  );
};;