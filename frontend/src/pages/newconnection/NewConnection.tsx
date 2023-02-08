
import classNames from "classnames";
import React, { FormEvent, useState } from "react";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import { ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { ConnectionType, CreateDestination, CreateDestinationRequest, GetDestinations, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
import { mutate } from "swr";

import styles from './newconnection.m.css';

export const NewConnection: React.FC<{ onComplete: () => void; }> = props => {
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
      <BackButton className="tw-mt-10 tw-mx-10" onClick={onBack} />
      <div className="tw-flex tw-justify-center tw-h-full">
        <div className='tw-w-[400px] tw-pb-10 tw-px-8 tw-mx-auto tw-mt-24'>
          <div className="tw-w-full tw-text-center tw-mb-5 tw-font-bold tw-text-lg">New Data Source</div>
          {connectionType ?
            <NewConnectionConfiguration connectionType={connectionType} setConnectionType={setConnectionType} onComplete={props.onComplete} />
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

type NewConnectionState = {
  displayName: string;
  credentials: string;
  username: string;
  password: string;
  databaseName: string;
  warehouseName: string;
  role: string;
  account: string;
};

const INITIAL_CONNECTION_STATE: NewConnectionState = {
  displayName: "",
  credentials: "",
  username: "",
  password: "",
  databaseName: "",
  warehouseName: "",
  role: "",
  account: "",
};

const validateAll = (connectionType: ConnectionType, state: NewConnectionState): boolean => {
  switch (connectionType) {
    case ConnectionType.Snowflake:
      return state.displayName.length > 0
        && state.username.length > 0
        && state.password.length > 0
        && state.databaseName.length > 0
        && state.warehouseName.length > 0
        && state.role.length > 0
        && state.account.length > 0;
    case ConnectionType.BigQuery:
      return state.displayName.length > 0 && state.credentials.length > 0;
  }
};

const NewConnectionConfiguration: React.FC<NewConnectionConfigurationProps> = props => {
  const [state, setState] = useState<NewConnectionState>(INITIAL_CONNECTION_STATE);
  const [saveLoading, setSaveLoading] = useState(false);
  const [createConnectionSuccess, setCreateConnectionSuccess] = useState<boolean | null>(null);

  const createNewConnection = async (e: FormEvent) => {
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
        payload.bigquery_config = {
          'credentials': state.credentials,
        };
        break;
      case ConnectionType.Snowflake:
        payload.snowflake_config = {
          'username': state.username,
          'password': state.password,
          'database_name': state.databaseName,
          'warehouse_name': state.warehouseName,
          'role': state.role,
          'account': state.account,
        };
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
        <div className='tw-mt-10 tw-text-center tw-font-bold tw-text-lg'>🎉 Congratulations! Your data connection is set up. 🎉</div>
        <Button className='tw-block tw-mt-8 tw-mx-auto tw-mb-10 tw-w-32' onClick={props.onComplete}>Done</Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.connectionSelectorTitle}>Enter your data source configuration:</div>
      <form onSubmit={createNewConnection}>
        {inputs}
        <TestConnectionButton state={state} connectionType={props.connectionType} />
        <FormButton className={styles.submit}>{saveLoading ? <Loading /> : "Continue"}</FormButton>
        {createConnectionSuccess !== null &&
          /* TODO: return error message here */
          <div className={classNames(styles.result)}>{createConnectionSuccess ? "Success!" : "Failure"}</div>
        }
      </form >
    </>
  );
};

const TestConnectionButton: React.FC<{ state: NewConnectionState, connectionType: ConnectionType; }> = props => {
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
        payload.bigquery_config = {
          'credentials': state.credentials,
        };
        break;
      case ConnectionType.Snowflake:
        payload.snowflake_config = {
          'username': state.username,
          'password': state.password,
          'database_name': state.databaseName,
          'warehouse_name': state.warehouseName,
          'role': state.role,
          'account': state.account,
        };
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
      <Button className={styles.testButton} onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
      {testConnectionSuccess !== null &&
        /* TODO: return error message here */
        <div className={classNames(styles.result)}>{testConnectionSuccess ? "Success!" : "Failure"}</div>
      }
    </>
  );
};

type ConnectionConfigurationProps = {
  state: NewConnectionState;
  setState: (state: NewConnectionState) => void;
};

const SnowflakeInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='DisplayName' />
      <ValidatedInput id='username' value={state.username} setValue={(value) => { props.setState({ ...state, username: value }); }} placeholder='Username' />
      <ValidatedInput id='password' value={state.password} setValue={(value) => { props.setState({ ...state, password: value }); }} placeholder='Password' />
      <ValidatedInput id='databaseName' value={state.databaseName} setValue={(value) => { props.setState({ ...state, databaseName: value }); }} placeholder='Database Name' />
      <ValidatedInput id='warehouseName' value={state.warehouseName} setValue={(value) => { props.setState({ ...state, warehouseName: value }); }} placeholder='Warehouse Name' />
      <ValidatedInput id='role' value={state.role} setValue={(value) => { props.setState({ ...state, role: value }); }} placeholder='Role' />
      <ValidatedInput id='account' value={state.account} setValue={(value) => { props.setState({ ...state, account: value }); }} placeholder='Account' />
    </>
  );
};

const BigQueryInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='DisplayName' />
      <ValidatedInput
        className={styles.credentialsInput}
        id='credentials'
        value={state.credentials}
        setValue={(value) => { props.setState({ ...state, credentials: value }); }}
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
      <div className={styles.connectionSelectorTitle}>Choose your data warehouse:</div>
      <div className={styles.connectionSelector}>
        <Button className={styles.connectionSelection} onClick={() => props.setConnectionType(ConnectionType.Snowflake)}>Snowflake</Button>
        <Button className={styles.connectionSelection} onClick={() => props.setConnectionType(ConnectionType.BigQuery)}>BigQuery</Button>
      </div>
    </>
  );
};