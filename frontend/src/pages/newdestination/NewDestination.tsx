import React, { FormEvent, useState } from "react";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import bigquery from "src/components/images/bigquery.svg";
import snowflake from "src/components/images/snowflake.svg";
import { ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, CreateDestination, CreateDestinationRequest, getConnectionType, GetDestinations, SnowflakeConfig, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
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
      <BackButton className="tw-mt-2" onClick={onBack} />
      <div className="tw-flex tw-justify-center tw-h-full">
        <div className='tw-w-[600px] tw-pb-10 tw-px-8 tw-mx-auto tw-mt-10'>
          <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Destination</div>
          {connectionType ?
            <NewDestinationConfiguration connectionType={connectionType} setConnectionType={setConnectionType} onComplete={props.onComplete} />
            :
            <ConnectionTypeSelector setConnectionType={setConnectionType} />
          }
        </div>
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
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_DESTINATION_STATE: NewDestinationState = {
  displayName: "",
  bigqueryConfig: {
    credentials: "",
  },
  snowflakeConfig: {
    username: "",
    password: "",
    database_name: "",
    warehouse_name: "",
    role: "",
    host: "",
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
      default:
      // TODO: throw an error here
    }

    try {
      await sendRequest(CreateDestination, payload);
      mutate({ GetDestinations }); // Tell SWRs to refetch destinatinos connections
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
  };

  if (createConnectionSuccess) {
    return (
      <div className="tw-w-[200%] tw-translate-x-[-25%]">
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your destination is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <>
      <div className="tw-text-center tw-mb-5">Enter your {getConnectionType(props.connectionType)} configuration:</div>
      <form onSubmit={createNewDestination}>
        {inputs}
        <TestConnectionButton state={state} connectionType={props.connectionType} />
        <FormButton className="tw-mt-5 tw-w-full tw-h-10">{saveLoading ? <Loading /> : "Continue"}</FormButton>
        {createConnectionSuccess !== null &&
          /* TODO: return error message here */
          <div className="tw-mt-3 tw-text-center">{createConnectionSuccess ? "Success!" : "Failure"}</div>
        }
      </form >
    </>
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
      <Button className="tw-mt-8 tw-bg-gray-500 tw-border-gray-500 tw-w-full tw-h-10" onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
      {testConnectionSuccess !== null &&
        /* TODO: return error message here */
        <div className="tw-mt-3 tw-text-center">{testConnectionSuccess ? "Success!" : "Failure"}</div>
      }
    </>
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
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='DisplayName' />
      <ValidatedInput id='username' value={state.snowflakeConfig.username} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, username: value } }); }} placeholder='Username' />
      <ValidatedInput id='password' type="password" value={state.snowflakeConfig.password} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, password: value } }); }} placeholder='Password' />
      <ValidatedInput id='databaseName' value={state.snowflakeConfig.database_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, database_name: value } }); }} placeholder='Database Name' />
      <ValidatedInput id='warehouseName' value={state.snowflakeConfig.warehouse_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, warehouse_name: value } }); }} placeholder='Warehouse Name' />
      <ValidatedInput id='role' value={state.snowflakeConfig.role} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, role: value } }); }} placeholder='Role' />
      <ValidatedInput id='host' value={state.snowflakeConfig.host} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, host: value } }); }} placeholder='Host' />
    </>
  );
};

const BigQueryInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='DisplayName' />
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
};

type ConnectionTypeSelectorProps = {
  setConnectionType: (connectionType: ConnectionType) => void;
};

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = props => {
  return (
    <>
      <div className="tw-text-center tw-mb-5">Choose your data warehouse:</div>
      <div className="tw-flex tw-flex-row tw-justify-center">
        <Button className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-mt-5 tw-mx-10 !tw-py-5 !tw-px-20 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border-gray-400 hover:tw-bg-green-100" onClick={() => props.setConnectionType(ConnectionType.Snowflake)}>
          <img src={snowflake} alt="data source logo" className="tw-h-6 tw-mr-1" />
          Snowflake
        </Button>
        <Button className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-mt-5 tw-mx-10 !tw-py-5 !tw-px-20 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border-gray-400 hover:tw-bg-green-100" onClick={() => props.setConnectionType(ConnectionType.BigQuery)}>
          <img src={bigquery} alt="data source logo" className="tw-h-6 tw-mr-1" />
          BigQuery
        </Button>
      </div>
    </>
  );
};