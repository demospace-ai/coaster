import React from "react";
import { ObjectSelector, SourceNamespaceSelector, SourceTableSelector } from "src/components/selector/Selector";
import { SetupSyncState } from "src/connect/App";
import { Object } from "src/rpc/api";

type ObjectSetupProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

export const ObjectSetup: React.FC<ObjectSetupProps> = (props) => {
  const setObject = (object: Object) => props.setState({ ...props.state, object: object });
  const setNamespace = (namespace: string) => props.setState({ ...props.state, namespace: namespace });
  const setTableName = (tableName: string) => props.setState({ ...props.state, tableName: tableName });

  return (
    <div className="tw-w-full tw-px-20 tw-flex tw-flex-col tw-items-center">
      <div className="tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">Select your data warehouse</div>
      <div className="tw-text-center tw-mb-8 tw-text-slate-600">Choose the data warehouse, database, or data lake to connect.</div>
      <div className="tw-w-[50%] tw-min-w-[400px] tw-h-full">
        <div className="tw-text-base tw-font-semibold tw-mb-1">Select object to create</div>
        <div className="tw-text-slate-600">This is the object that will be created from the data you define in this sync configuration.</div>
        <ObjectSelector object={props.state.object} setObject={setObject} linkToken={props.linkToken} />
        <div className="tw-text-base tw-font-semibold tw-mt-8 tw-mb-1">Select a table to sync from</div>
        <div className="tw-text-slate-400">This is where the data will be pulled from in your own data warehouse.</div>
        <SourceNamespaceSelector namespace={props.state.namespace} setNamespace={setNamespace} linkToken={props.linkToken} source={props.state.source} dropdownHeight="tw-max-h-40" />
        <SourceTableSelector tableName={props.state.tableName} setTableName={setTableName} linkToken={props.linkToken} source={props.state.source} namespace={props.state.namespace} dropdownHeight="tw-max-h-40" />
        <div className="tw-pb-52"></div>
      </div>
    </div>
  );
};