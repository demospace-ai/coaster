
import classNames from "classnames";
import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rudderanalytics } from "src/app/rudder";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { CreateDataConnection, CreateDataConnectionRequest, DataConnectionType, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";

import styles from './newconnection.m.css';


export const NewConnection: React.FC = () => {
  const [connectionType, setConnectionType] = useState<DataConnectionType | null>(null);

  return (
    <div className={styles.newConnectionPage}>
      <div className={styles.newConnectionPane}>
        {connectionType ?
          <NewConnectionConfiguration connectionType={connectionType} setConnectionType={setConnectionType} />
          :
          <ConnectionTypeSelector setConnectionType={setConnectionType} />
        }
      </div>
    </div >
  );
};

type NewConnectionConfigurationProps = {
  connectionType: DataConnectionType;
  setConnectionType: (connectionType: DataConnectionType | null) => void;
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

const validateAll = (connectionType: DataConnectionType, state: NewConnectionState): boolean => {
  switch (connectionType) {
    case DataConnectionType.Snowflake:
      return state.displayName.length > 0
        && state.username.length > 0
        && state.password.length > 0
        && state.databaseName.length > 0
        && state.warehouseName.length > 0
        && state.role.length > 0
        && state.account.length > 0;
    case DataConnectionType.BigQuery:
      return state.displayName.length > 0 && state.credentials.length > 0;
  }
};

const NewConnectionConfiguration: React.FC<NewConnectionConfigurationProps> = props => {
  const [state, setState] = useState<NewConnectionState>(INITIAL_CONNECTION_STATE);
  const [saveLoading, setSaveLoading] = useState(false);
  const [createConnectionSuccess, setCreateConnectionSuccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const createNewDataConnection = async (e: FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    if (!validateAll(props.connectionType, state)) {
      setSaveLoading(false);
      return;
    }

    const payload: CreateDataConnectionRequest = {
      'display_name': state.displayName,
      'connection_type': props.connectionType,
      'credentials': state.credentials,
      'username': state.username,
      'password': state.password,
      'database_name': state.databaseName,
      'warehouse_name': state.warehouseName,
      'role': state.role,
      'account': state.account,
    };

    try {
      rudderanalytics.track("create_data_connection.start");
      await sendRequest(CreateDataConnection, payload);
      rudderanalytics.track("create_data_connection.success");
      setCreateConnectionSuccess(true);
    } catch (e) {
      rudderanalytics.track("create_data_connection.error");
      setCreateConnectionSuccess(false);
    }

    setSaveLoading(false);
  };

  let inputs: React.ReactElement;
  switch (props.connectionType) {
    case DataConnectionType.Snowflake:
      inputs = <SnowflakeInputs state={state} setState={setState} />;
      break;
    case DataConnectionType.BigQuery:
      inputs = <BigQueryInputs state={state} setState={setState} />;
      break;
  };

  if (createConnectionSuccess) {
    return (
      <div>
        <div className={styles.successMessage}>🎉 Congratulations! Your connection is set up. 🎉</div>
        <Button className={styles.successButton} onClick={() => { navigate("/"); }}>Return Home</Button>
      </div>
    );
  }

  return (
    <>
      <BackButton className={styles.backButton} onClick={() => props.setConnectionType(null)} />
      <div className={styles.connectionSelectorTitle}>Enter your data warehouse configuration:</div>
      <form onSubmit={createNewDataConnection}>
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

const TestConnectionButton: React.FC<{ state: NewConnectionState, connectionType: DataConnectionType; }> = props => {
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
      'credentials': state.credentials,
      'username': state.username,
      'password': state.password,
      'database_name': state.databaseName,
      'warehouse_name': state.warehouseName,
      'role': state.role,
      'account': state.account,
    };

    try {
      rudderanalytics.track("test_connection.start");
      await sendRequest(TestDataConnection, payload);
      rudderanalytics.track("test_connection.success");
      setTestConnectionSuccess(true);
    } catch (e) {
      rudderanalytics.track("test_connection.error");
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

type ValidatedInputProps = {
  id: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  className?: string;
  textarea?: boolean;
};

const ValidatedInput: React.FC<ValidatedInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  let classes = [styles.input, props.className];
  if (!isValid) {
    classes.push(styles.invalidBorder);
  }

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const validateNotEmpty = (value: string): boolean => {
    const valid = value.length > 0;
    setIsValid(valid);
    return valid;
  };

  return (
    <>
      {props.textarea ?
        <textarea
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={props.placeholder}
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => props.setValue(e.target.value)}
          onBlur={() => validateNotEmpty(props.value)}
          value={props.value}
        />
        :
        <input
          type='text'
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={props.placeholder}
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => props.setValue(e.target.value)}
          onBlur={() => validateNotEmpty(props.value)}
          value={props.value}
        />
      }
    </>
  );
};

type ConnectionTypeSelectorProps = {
  setConnectionType: (connectionType: DataConnectionType) => void;
};

const ConnectionTypeSelector: React.FC<ConnectionTypeSelectorProps> = props => {
  return (
    <>
      <div className={styles.connectionSelectorTitle}>Choose your data warehouse:</div>
      <div className={styles.connectionSelector}>
        <Button className={styles.connectionSelection} onClick={() => props.setConnectionType(DataConnectionType.Snowflake)}>Snowflake</Button>
        <Button className={styles.connectionSelection} onClick={() => props.setConnectionType(DataConnectionType.BigQuery)}>BigQuery</Button>
      </div>
    </>
  );
};