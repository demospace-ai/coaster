import React, { FormEvent, useState } from "react";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import bigquery from "src/components/images/bigquery.svg";
import mongodb from "src/components/images/mongodb.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, CreateDestination, CreateDestinationRequest, getConnectionType, GetDestinations, MongoDbConfig, RedshiftConfig, SnowflakeConfig, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";

export const NewDestination: React.FC<{ onComplete: () => void; }> = props => {
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const onBack = () => {
    if (connectionType) {
      setConnectionType(null);
    } else {
      props.onComplete();
    }
  };

  return (
    <>
      <BackButton className="tw-mt-3" onClick={onBack} />
      <div className='tw-flex tw-flex-col tw-w-[900px] tw-py-12 tw-px-10 tw-mx-auto tw-mb-20 tw-mt-8 tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center'>
        <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Destination</div>
        {connectionType ?
          <NewDestinationConfiguration connectionType={connectionType} setConnectionType={setConnectionType} onComplete={props.onComplete} />
          :
          <ConnectionTypeSelector setConnectionType={setConnectionType} />
        }
      </div>
    </>
  );
};

type NewConnectionConfigurationProps = {
  connectionType: ConnectionType;
  setConnectionType: (connectionType: ConnectionType | null) => void;
  onComplete: () => void;
};

type NewDestinationState = {
  displayName: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_DESTINATION_STATE: NewDestinationState = {
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

const validateAll = (connectionType: ConnectionType, state: NewDestinationState): boolean => {
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

const NewDestinationConfiguration: React.FC<NewConnectionConfigurationProps> = props => {
  const [state, setState] = useState<NewDestinationState>(INITIAL_DESTINATION_STATE);
  const [saveLoading, setSaveLoading] = useState(false);
  const [createConnectionSuccess, setCreateConnectionSuccess] = useState<boolean | null>(null);

  const createNewDestination = async (e: FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    if (!validateAll(props.connectionType, state)) {
      setSaveLoading(false);
      return;
    }

    const payload: CreateDestinationRequest = {
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
      await sendRequest(CreateDestination, payload);
      mutate({ GetDestinations }); // Tell SWRs to refetch destinations
      setCreateConnectionSuccess(true);
    } catch (e) {
      setCreateConnectionSuccess(false);
    }

    setSaveLoading(false);
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

  if (createConnectionSuccess) {
    return (
      <div>
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your destination is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <div className="tw-w-[500px]">
      <div className="tw-flex tw-justify-center tw-items-center tw-mb-5">
        <img src={getConnectionTypeImg(props.connectionType)} alt="icon" className="tw-h-6 tw-mr-1.5" />
        <div>Enter your {getConnectionType(props.connectionType)} configuration:</div>
      </div>
      <form onSubmit={createNewDestination}>
        {inputs}
        <TestConnectionButton state={state} connectionType={props.connectionType} />
        <FormButton className="tw-mt-5 tw-w-full tw-h-10">{saveLoading ? <Loading /> : "Continue"}</FormButton>
        {createConnectionSuccess !== null &&
          /* TODO: return error message here */
          <div className="tw-mt-3 tw-text-center">{createConnectionSuccess ? "Success!" : "Failure"}</div>
        }
      </form >
    </div>
  );
};

const TestConnectionButton: React.FC<{ state: NewDestinationState, connectionType: ConnectionType; }> = props => {
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

  const testColor = testConnectionSuccess === null ? null : testConnectionSuccess ? "tw-bg-green-700" : "tw-bg-red-700";
  return (
    <Button className={mergeClasses("tw-mt-8 tw-bg-slate-200 tw-text-slate-900 hover:tw-bg-slate-300 tw-border-slate-200 tw-w-full tw-h-10", testColor)} onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
  );
};

type ConnectionConfigurationProps = {
  state: NewDestinationState;
  setState: (state: NewDestinationState) => void;
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
};

type ConnectionTypeSelectorProps = {
  setConnectionType: (connectionType: ConnectionType) => void;
};

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = props => {
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-56 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow-md tw-select-none";
  return (
    <>
      <div className="tw-text-center tw-mb-10">Choose your data warehouse:</div>
      <div className="tw-flex tw-flex-row tw-gap-5 tw-flex-wrap tw-justify-center">
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.Snowflake)}>
          <img src={snowflake} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Snowflake
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.BigQuery)}>
          <img src={bigquery} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          BigQuery
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.Redshift)}>
          <img src={redshift} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Redshift
        </button>
      </div>
      <div className="tw-flex tw-flex-row tw-mt-10">
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.MongoDb)}>
          <img src={mongodb} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          MongoDB
        </button>
      </div>
    </>
  );
};