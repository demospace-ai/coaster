import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { FormEvent, useState } from "react";
import { BackButton, Button, FormButton } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { getConnectionTypeImg } from "src/components/images/connections";
import { Input, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { BigQueryConfig, ConnectionType, CreateDestination, CreateDestinationRequest, getConnectionType, GetDestinations, HeaderInput, MongoDbConfig, RedshiftConfig, SnowflakeConfig, TestDataConnection, TestDataConnectionRequest, WebhookConfig } from "src/rpc/api";
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
      <div className='tw-flex tw-flex-col tw-w-[900px] tw-mt-8 tw-mb-24 tw-py-12 tw-px-10 tw-mx-auto tw-bg-white tw-rounded-lg tw-shadow-md tw-items-center'>
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
  staging_bucket: string;
  bigqueryConfig: BigQueryConfig;
  snowflakeConfig: SnowflakeConfig;
  redshiftConfig: RedshiftConfig;
  mongodbConfig: MongoDbConfig;
  webhookConfig: WebhookConfig;
};

// Values must be empty strings otherwise the input will be uncontrolled
const INITIAL_DESTINATION_STATE: NewDestinationState = {
  displayName: "",
  staging_bucket: "",
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
  mongodbConfig: {
    username: "",
    password: "",
    host: "",
    connection_options: "",
  },
  webhookConfig: {
    url: "",
    headers: [],
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
      return state.displayName.length > 0
        && state.staging_bucket.length > 0
        && state.bigqueryConfig.location.length > 0
        && state.bigqueryConfig.credentials.length > 0;
    case ConnectionType.Redshift:
      return state.displayName.length > 0
        && state.redshiftConfig.username.length > 0
        && state.redshiftConfig.password.length > 0
        && state.redshiftConfig.database_name.length > 0
        && state.redshiftConfig.endpoint.length > 0;
    case ConnectionType.MongoDb:
      return state.displayName.length > 0
        && state.mongodbConfig.username.length > 0
        && state.mongodbConfig.password.length > 0
        && state.mongodbConfig.host.length > 0; // connection options is optional
    case ConnectionType.Webhook:
      return state.displayName.length > 0
        && state.webhookConfig.url.length > 0
        && validateHeaders(state.webhookConfig.headers);
  }
};

const validateHeaders = (headers: HeaderInput[]): boolean => {
  return headers.every(header => header.name.length > 0 && header.value.length > 0);
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
    case ConnectionType.Webhook:
      inputs = <WebhookInputs state={state} setState={setState} />;
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
    <div className="tw-w-full">
      <div className="tw-flex tw-items-center tw-mb-8">
        <img src={getConnectionTypeImg(props.connectionType)} alt="icon" className="tw-h-6 tw-mr-1.5" />
        <div className="tw-font-medium">Enter your {getConnectionType(props.connectionType)} configuration:</div>
      </div>
      <form onSubmit={createNewDestination}>
        {inputs}
        <div className="tw-flex tw-flex-row tw-justify-start tw-w-100 tw-gap-5 tw-mt-16">
          <TestConnectionButton state={state} connectionType={props.connectionType} />
          <FormButton className="tw-w-full tw-h-10">{saveLoading ? <Loading /> : "Save"}</FormButton>
          {createConnectionSuccess !== null &&
            /* TODO: return error message here */
            <div className="tw-mt-3 tw-text-center">{createConnectionSuccess ? "Success!" : "Failure"}</div>
          }
        </div>
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
    <Button className={mergeClasses("tw-bg-slate-200 tw-text-slate-900 hover:tw-bg-slate-300 tw-border-slate-200 tw-w-full tw-h-10", testColor)} onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
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
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip placement="right" label="You can choose your personal username or create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='username' value={state.snowflakeConfig.username} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, username: value } }); }} placeholder='Username' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip placement="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='password' type="password" value={state.snowflakeConfig.password} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, password: value } }); }} placeholder='Password' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip placement="right" label="The Snowflake database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='databaseName' value={state.snowflakeConfig.database_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, database_name: value } }); }} placeholder='Database Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Warehouse Name</span>
        <Tooltip placement="right" label="The warehouse that will be used to run syncs in Snowflake.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='warehouseName' value={state.snowflakeConfig.warehouse_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, warehouse_name: value } }); }} placeholder='Warehouse Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Role</span>
        <Tooltip placement="right" label="The role that will be used to run syncs.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='role' value={state.snowflakeConfig.role} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, role: value } }); }} placeholder='Role' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Host</span>
        <Tooltip placement="right" label={<div className="tw-m-2"><span>This is your Snowflake URL. Format may differ based on Snowflake account age. For details, </span><a className="tw-text-blue-400" target="_blank" rel="noreferrer" href="https://docs.snowflake.com/en/user-guide/admin-account-identifier.html">visit the Snowflake docs.</a><div className="tw-mt-2"><span>Example:</span><div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">abc123.us-east1.gcp.snowflakecomputing.com</div></div></div>} interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div >
      <ValidatedInput id='host' value={state.snowflakeConfig.host} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, host: value } }); }} placeholder='Host' className="tw-w-100" />
    </>
  );
};

const RedshiftInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip placement="right" label="You can choose your personal username or create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='username' value={state.redshiftConfig.username} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, username: value } }); }} placeholder='Username' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip placement="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='password' type="password" value={state.redshiftConfig.password} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, password: value } }); }} placeholder='Password' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip placement="right" label="The Redshift database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='databaseName' value={state.redshiftConfig.database_name} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, database_name: value } }); }} placeholder='Database Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Endpoint</span>
        <Tooltip placement="right" label={
          <div className="tw-m-2">
            <div>This is the URL for your Redshift data warehouse. For Redshift clusters, it can be found on the specific cluster page under "General Information" and should look like:</div>
            <div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">your-cluster.abc123.us-west-2.redshift.amazonaws.com</div>
            <div className="tw-mt-3">For Serverless Redshift, <a className="tw-text-blue-400" target="_blank" rel="noreferrer" href="https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-connecting.html">visit the Redshift docs.</a> The following is the expected format for Serverless Redshift:</div>
            <div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2"><span className="tw-italic">workgroup-name</span>.<span className="tw-italic">account-number</span>.<span className="tw-italic">aws-region</span>.redshift-serverless.amazonaws.com</div>
          </div>}
          interactive maxWidth={640}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div >
      <ValidatedInput id='endpoint' value={state.redshiftConfig.endpoint} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, endpoint: value } }); }} placeholder='Endpoint' className="tw-w-100" />
    </>
  );
};

const MongoDbInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' label="Display Name" className="tw-w-100" />
      <ValidatedInput id='username' value={state.mongodbConfig.username} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, username: value } }); }} placeholder='Username' label="Username" className="tw-w-100" />
      <ValidatedInput id='password' type="password" value={state.mongodbConfig.password} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, password: value } }); }} placeholder='Password' label="Password" className="tw-w-100" />
      <ValidatedInput id='host' value={state.mongodbConfig.host} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, host: value } }); }} placeholder='Host' label="Host" />
      <Input id='connectionOptions' value={state.mongodbConfig.connection_options} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, connection_options: value } }); }} placeholder='Connection Options (optional)' label="Connection Options (optional)" className="tw-w-100" />
    </>
  );
};

const WebhookInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  const setHeaderName = (index: number, newName: string) => {
    const headers = [...state.webhookConfig.headers];
    headers[index].name = newName;
    props.setState({ ...state, webhookConfig: { ...state.webhookConfig, headers: headers } });
  };
  const setHeaderValue = (index: number, newValue: string) => {
    const headers = [...state.webhookConfig.headers];
    headers[index].value = newValue;
    props.setState({ ...state, webhookConfig: { ...state.webhookConfig, headers: headers } });
  };
  const removeHeader = (index: number) => {
    const headers = [...state.webhookConfig.headers];
    headers.splice(index, 1);
    props.setState({ ...state, webhookConfig: { ...state.webhookConfig, headers: headers } });
  };

  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>URL</span>
        <Tooltip placement="right" label="The URL that Fabra will send your customer's data to during syncs. Must use HTTPS.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <div className="tw-flex tw-items-center tw-w-100 tw-border tw-border-slate-300 hover:tw-border-primary-hover focus:tw-border-primary tw-rounded-md tw-overflow-clip">
        <span className="tw-select-none tw-text-slate-500 tw-px-2 tw-bg-slate-100 tw-h-10 tw-flex tw-items-center">https://</span>
        <ValidatedInput className="tw-w-100 tw-pl-1 tw-border-0 tw-bg-transparent tw-rounded-none" id='URL' value={state.webhookConfig.url} setValue={(value) => { props.setState({ ...state, webhookConfig: { ...state.webhookConfig, url: value } }); }} placeholder='URL' />
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Headers</span>
        <Tooltip placement="right" maxWidth={400} interactive label={
          <div>
            Any headers you want Fabra to send when calling your webhook. For <span className="tw-font-mono tw-bg-slate-900 tw-rounded tw-px-1">Variable</span> webhooks, the header value can be populated from any end customer metadata you send to Fabra. Read more <a className="tw-text-blue-400" target="_blank" rel="noreferrer" href="https://docs.fabra.io/concepts/webhooks#headers">here</a>.
          </div>
        }>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      {state.webhookConfig.headers.map((header, index) => (
        <div key={index} className="tw-flex tw-flex-row tw-items-center tw-w-full tw-justify-start tw-gap-5 tw-mb-4">
          <ValidatedInput id='Header Name' value={header.name} setValue={(value) => setHeaderName(index, value)} placeholder='Header Name' className="tw-w-64" />
          <ValidatedInput id='Header Value' value={header.value} setValue={(value) => setHeaderValue(index, value)} placeholder='Header Value' className="tw-w-64" />
          <Button onClick={() => removeHeader(index)}><XMarkIcon className="tw-h-5" /></Button>
        </div>
      ))}
      <Button className="tw-mt-1" onClick={() => props.setState({ ...state, webhookConfig: { ...state.webhookConfig, headers: [...state.webhookConfig.headers, { name: "", value: "", }] } })}>Add Header</Button>
    </>
  );
};

const BigQueryInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='displayName' value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder='Display Name' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Location</span>
        <Tooltip placement="right" label="The geographic location of your BigQuery dataset(s).">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='location' value={state.bigqueryConfig.location} setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, location: value } }); }} placeholder='Location' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Staging Bucket</span>
        <Tooltip placement="right" label={<div>The Google Cloud Storage (GCS) bucket Fabra will use for temporarily staging data during syncs. Learn more <a className="tw-text-blue-400" target="_blank" rel="noreferrer" href="https://docs.fabra.io/staging">here</a>.</div>}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id='staging-bucket' value={state.staging_bucket} setValue={(value) => { props.setState({ ...state, staging_bucket: value }); }} placeholder='Staging Bucket' className="tw-w-100" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Credentials</span>
        <Tooltip placement="right" label="This can be obtained in the Google Cloud web console by navigating to the IAM page and clicking on Service Accounts in the left sidebar. Then, find your service account in the list, go to its Keys tab, and click Add Key. Finally, click on Create new key and choose JSON." interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput
        className="tw-h-24 tw-min-h-[40px] tw-max-h-80 tw-w-100"
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
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-56 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow-md tw-select-none";
  return (
    <>
      <div className="tw-text-center tw-mb-8">Choose one of our supported destinations for syncs:</div>
      <div className="tw-flex tw-flex-row tw-gap-5 tw-flex-wrap tw-justify-center">
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.Snowflake)}>
          <img src={getConnectionTypeImg(ConnectionType.Snowflake)} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Snowflake
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.BigQuery)}>
          <img src={getConnectionTypeImg(ConnectionType.BigQuery)} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          BigQuery
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.Redshift)}>
          <img src={getConnectionTypeImg(ConnectionType.Redshift)} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Redshift
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.MongoDb)}>
          <img src={getConnectionTypeImg(ConnectionType.MongoDb)} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          MongoDB
        </button>
        <button className={connectionButton} onClick={() => props.setConnectionType(ConnectionType.Webhook)}>
          <img src={getConnectionTypeImg(ConnectionType.Webhook)} alt="data source logo" className="tw-h-5 tw-mr-1.5" />
          Webhook
        </button>
      </div>
    </>
  );
};