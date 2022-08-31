
import classNames from "classnames";
import { FormEvent, useState } from "react";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { DataConnectionType } from "src/rpc/api";

import styles from './newconnection.m.css';


export const NewConnection: React.FC = () => {
  const [connectionType, setConnectionType] = useState<DataConnectionType | null>(null);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.newConnectionPage}>
      <div className={styles.newConnectionPane}>
        {connectionType ?
          <NewConnectionConfiguration connectionType={connectionType} setLoading={setLoading} setConnectionType={setConnectionType} />
          :
          <ConnectionTypeSelector setConnectionType={setConnectionType} />
        }
      </div>
    </div >
  );
};

type NewConnectionConfigurationProps = {
  connectionType: DataConnectionType;
  setLoading: (loading: boolean) => void;
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

const NewConnectionConfiguration: React.FC<NewConnectionConfigurationProps> = props => {
  const [state, setState] = useState<NewConnectionState>(INITIAL_CONNECTION_STATE);

  const validateAll = (): boolean => {
    switch (props.connectionType) {
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

  const createNewDataConnection = async (e: FormEvent) => {
    e.preventDefault();
    props.setLoading(true);
    if (!validateAll()) {
      return;
    }

    // TODO: await setDataConnection({});
    props.setLoading(false);
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

  return (
    <>
      <BackButton className={styles.backButton} onClick={() => props.setConnectionType(null)} />
      <div className={styles.connectionSelectorTitle}>Enter your data warehouse configuration:</div>
      <form onSubmit={createNewDataConnection}>
        {inputs}
        <Button className={styles.testButton} onClick={() => {/*TODO: fill this in*/ }}>Test</Button>
        <FormButton className={styles.submit} value='Continue' />
      </form >
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
      <ValidatedInput id='password' value={state.databaseName} setValue={(value) => { props.setState({ ...state, databaseName: value }); }} placeholder='Database Name' />
      <ValidatedInput id='password' value={state.warehouseName} setValue={(value) => { props.setState({ ...state, warehouseName: value }); }} placeholder='Warehouse Name' />
      <ValidatedInput id='password' value={state.role} setValue={(value) => { props.setState({ ...state, role: value }); }} placeholder='Role' />
      <ValidatedInput id='password' value={state.account} setValue={(value) => { props.setState({ ...state, account: value }); }} placeholder='Account' />
    </>
  );
};

const BigQueryInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='DisplayName' />
      <ValidatedInput id='credentials' value={state.credentials} setValue={(value) => { props.setState({ ...state, credentials: value }); }} placeholder='Credentials' />
    </>
  );
};

type ValidatedInputProps = {
  id: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
};

const ValidatedInput: React.FC<ValidatedInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  let classes = [styles.input];
  if (!isValid) {
    classes.push(styles.invalidBorder);
  }

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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