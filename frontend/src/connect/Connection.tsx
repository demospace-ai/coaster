import React, { FormEvent, useState } from "react";
import { Button } from "src/components/button/Button";
import { InfoIcon } from "src/components/icons/Icons";
import { ConnectionImage } from "src/components/images/Connections";
import sync from "src/components/images/sync.svg";
import { Input, ValidatedInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { createNewSource, NewSourceState, SetupSyncProps, validateConnectionSetup } from "src/connect/state";
import { sendRequest } from "src/rpc/ajax";
import { ConnectionType, getConnectionType, TestDataConnection, TestDataConnectionRequest } from "src/rpc/api";
import { mergeClasses } from "src/utils/twmerge";

export const NewSourceConfiguration: React.FC<SetupSyncProps> = (props) => {
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

  if (props.state.newSourceState.sourceCreated) {
    return <div className="tw-flex tw-flex-col tw-justify-top">
      <span className="tw-text-center tw-text-2xl tw-font-bold tw-mb-10">Source is all setup!</span>
      <img src={sync} alt="sync success illustration" className="tw-h-[300px]" />
    </div>;
  }

  let inputs: React.ReactElement;
  switch (connectionType) {
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
    case ConnectionType.Synapse:
      inputs = <SynapseInputs state={state} setState={setState} />;
      break;
    case ConnectionType.Webhook:
      inputs = <>Unexpected</>;
      break;
  }

  return (
    <div className="tw-pl-20 tw-pr-[72px] tw-flex tw-flex-col tw-w-full">
      <div className="tw-flex tw-mb-2 tw-text-2xl tw-font-semibold tw-text-slate-900">
        <ConnectionImage connectionType={connectionType} className="tw-h-8 tw-mr-1.5" />
        Connect to {getConnectionType(connectionType)}
      </div>
      <div className="tw-flex tw-flex-row">
        <form className="tw-pb-16 tw-w-[500px] tw-mr-10" onSubmit={submit}>
          <div className="tw-mb-4 tw-text-slate-600">Provide the settings and credentials for your data source.</div>
          {inputs}
          <TestConnectionButton state={state} connectionType={connectionType} />
        </form>
        <div className="tw-w-80 tw-ml-auto tw-text-xs tw-leading-5 tw-border-l tw-border-slate-200 tw-h-fit tw-py-2 tw-pl-8 tw-mr-10">
          <div className="">
            <div className="tw-text-[13px] tw-mb-1 tw-font-medium">Read our docs</div>
            Not sure where to start? Check out <a href="https://docs.fabra.io" target="_blank" rel="noreferrer" className="tw-text-blue-500">the docs</a> for step-by-step instructions.
          </div>
          <div className="tw-my-5 tw-py-5 tw-border-y tw-border-slate-200">
            <div className="tw-text-[13px] tw-mb-1 tw-font-medium">Allowed IPs</div>
            If your warehouse is behind a firewall/private network, please add the following static IP addresses:
            <ul className="tw-mt-1">
              <li>• 34.145.25.122</li>
              <li>• 34.83.102.120</li>
            </ul>
          </div>
          <div>
            <div className="tw-text-[13px] tw-mb-1 tw-font-medium">Contact support</div>
            We"re here to help! <a href="mailto:help@fabra.io" className="tw-text-blue-500">Reach out</a> if you feel stuck or have any questions.
          </div>
        </div>
      </div>
    </div>
  );
};

const TestConnectionButton: React.FC<{ state: NewSourceState, connectionType: ConnectionType; }> = props => {
  const [testLoading, setTestLoading] = useState(false);
  const [testConnectionSuccess, setTestConnectionSuccess] = useState<boolean | null>(null);
  const state = props.state;

  const testConnection = async () => {
    setTestLoading(true);
    if (!validateConnectionSetup(props.connectionType, state)) {
      setTestLoading(false);
      setTestConnectionSuccess(false);
      return;
    }

    const payload: TestDataConnectionRequest = {
      "display_name": state.displayName,
      "connection_type": props.connectionType,
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
      case ConnectionType.Redshift:
        payload.redshift_config = state.redshiftConfig;
        break;
      case ConnectionType.Synapse:
        payload.synapse_config = state.synapseConfig;
        break;
      case ConnectionType.Webhook:
        // TODO: throw error
        return;
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
    <Button className={mergeClasses("tw-mt-8 tw-border-slate-200 tw-w-48 tw-h-10", testColor)} onClick={testConnection}>{testLoading ? <Loading /> : "Test"}</Button>
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
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="displayName" value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder="Display Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip placement="right" label="We recommend you create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="username" value={state.snowflakeConfig.username} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, username: value } }); }} placeholder="Username" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip placement="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="password" type="password" value={state.snowflakeConfig.password} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, password: value } }); }} placeholder="Password" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip placement="right" label="The Snowflake database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="databaseName" value={state.snowflakeConfig.database_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, database_name: value } }); }} placeholder="Database Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Warehouse Name</span>
        <Tooltip placement="right" label="The warehouse that will be used to run syncs in Snowflake.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="warehouseName" value={state.snowflakeConfig.warehouse_name} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, warehouse_name: value } }); }} placeholder="Warehouse Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Role</span>
        <Tooltip placement="right" label="The role that will be used to run syncs.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="role" value={state.snowflakeConfig.role} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, role: value } }); }} placeholder="Role" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Host</span>
        <Tooltip placement="right" label={<div className="tw-m-2"><span>This is your Snowflake URL. Format may differ based on Snowflake account age. For details, </span><a className="tw-text-blue-400" target="_blank" rel="noreferrer" href="https://docs.snowflake.com/en/user-guide/admin-account-identifier.html">visit the Snowflake docs.</a><div className="tw-mt-2"><span>Example:</span><div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">abc123.us-east1.gcp.snowflakecomputing.com</div></div></div>} interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div >
      <ValidatedInput id="host" value={state.snowflakeConfig.host} setValue={(value) => { props.setState({ ...state, snowflakeConfig: { ...state.snowflakeConfig, host: value } }); }} placeholder="Host" />
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
      <ValidatedInput id="displayName" value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder="Display Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip placement="right" label="We recommend you create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="username" value={state.redshiftConfig.username} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, username: value } }); }} placeholder="Username" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip placement="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="password" type="password" value={state.redshiftConfig.password} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, password: value } }); }} placeholder="Password" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip placement="right" label="The Redshift database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="databaseName" value={state.redshiftConfig.database_name} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, database_name: value } }); }} placeholder="Database Name" />
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
      <ValidatedInput id="endpoint" value={state.redshiftConfig.endpoint} setValue={(value) => { props.setState({ ...state, redshiftConfig: { ...state.redshiftConfig, endpoint: value } }); }} placeholder="Endpoint" />
    </>
  );
};

const SynapseInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-2 tw-mb-1">
        <span>Display Name</span>
        <Tooltip placement="right" label="Pick a name to help you identify this source in the future.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="displayName" value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder="Display Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Username</span>
        <Tooltip placement="right" label="We recommend you create a dedicated user for syncing.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="username" value={state.synapseConfig.username} setValue={(value) => { props.setState({ ...state, synapseConfig: { ...state.synapseConfig, username: value } }); }} placeholder="Username" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Password</span>
        <Tooltip placement="right" label="Password for the user specified above.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="password" type="password" value={state.synapseConfig.password} setValue={(value) => { props.setState({ ...state, synapseConfig: { ...state.synapseConfig, password: value } }); }} placeholder="Password" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Database Name</span>
        <Tooltip placement="right" label="The Synapse database to sync from.">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="databaseName" value={state.synapseConfig.database_name} setValue={(value) => { props.setState({ ...state, synapseConfig: { ...state.synapseConfig, database_name: value } }); }} placeholder="Database Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Endpoint</span>
        <Tooltip placement="right" label={
          <div className="tw-m-2">
            <div>This is the URL for your Synapse data warehouse. It can be found on your Synapse Workspace Overview page under "Essentials". For Dedicated SQL pools it should look like:</div>
            <div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">abc123.sql.azuresynapse.net</div>
            <div className="tw-mt-3">For Serverless Synapse, it should look like:</div>
            <div className="tw-mt-2 tw-w-full tw-bg-slate-900 tw-rounded-md tw-p-2">abc123-ondemand.sql.azuresynapse.net</div>
          </div>}
          interactive maxWidth={640}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div >
      <ValidatedInput id="endpoint" value={state.synapseConfig.endpoint} setValue={(value) => { props.setState({ ...state, synapseConfig: { ...state.synapseConfig, endpoint: value } }); }} placeholder="Endpoint" />
    </>
  );
};

const MongoDbInputs: React.FC<ConnectionConfigurationProps> = props => {
  const state = props.state;
  return (
    <>
      <ValidatedInput id="displayName" value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder="Display Name" label="Display Name" />
      <ValidatedInput id="username" value={state.mongodbConfig.username} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, username: value } }); }} placeholder="Username" label="Username" />
      <ValidatedInput id="password" type="password" value={state.mongodbConfig.password} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, password: value } }); }} placeholder="Password" label="Password" />
      <ValidatedInput id="host" value={state.mongodbConfig.host} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, host: value } }); }} placeholder="Host" label="Host" />
      <Input id="connectionOptions" value={state.mongodbConfig.connection_options} setValue={(value) => { props.setState({ ...state, mongodbConfig: { ...state.mongodbConfig, connection_options: value } }); }} placeholder="Connection Options (optional)" label="Connection Options (optional)" />
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
      <ValidatedInput id="displayName" value={state.displayName} setValue={(value) => { props.setState({ ...state, displayName: value }); }} placeholder="Display Name" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Location</span>
        <Tooltip placement="right" label="The geographic location of your BigQuery dataset(s).">
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput id="location" value={state.bigqueryConfig.location} setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, location: value } }); }} placeholder="Location" />
      <div className="tw-flex tw-flex-row tw-items-center tw-mt-4 tw-mb-1">
        <span>Service Account Key</span>
        <Tooltip placement="right" label="This can be obtained in the Google Cloud web console by navigating to the IAM page and clicking on Service Accounts in the left sidebar. Then, find your service account in the list, go to its Keys tab, and click Add Key. Finally, click on Create new key and choose JSON." interactive maxWidth={500}>
          <InfoIcon className="tw-ml-1 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <ValidatedInput
        className="tw-h-24 tw-min-h-[40px] tw-max-h-80"
        id="credentials"
        value={state.bigqueryConfig.credentials}
        setValue={(value) => { props.setState({ ...state, bigqueryConfig: { ...state.bigqueryConfig, credentials: value } }); }}
        placeholder="Credentials (paste JSON here)"
        textarea={true}
      />
    </>
  );
};