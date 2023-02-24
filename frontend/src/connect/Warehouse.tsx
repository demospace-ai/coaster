import React from "react";
import { InfoIcon } from "src/components/icons/Icons";
import bigquery from "src/components/images/bigquery.svg";
import mongodb from "src/components/images/mongodb.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { SourceSelector } from "src/components/selector/Selector";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SetupSyncState } from "src/connect/App";
import { ConnectionType, Source } from "src/rpc/api";


type WarehouseSelectorProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

export const WarehouseSelector: React.FC<WarehouseSelectorProps> = (props) => {
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-56 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow-md tw-select-none";
  const onClick = (connectionType: ConnectionType) => {
    props.setState({ ...props.state, connectionType: connectionType, step: props.state.step + 1, prevStep: props.state.step });
  };
  const setSource = (source: Source) => {
    props.setState({ ...props.state, source: source });
  };

  return (
    <div className="tw-w-full tw-px-20">
      <div className="tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">Select your data warehouse</div>
      <div className="tw-text-center tw-mb-10 tw-text-slate-600">Choose the data warehouse, database, or data lake to connect.</div>
      <div className="tw-flex tw-flex-row tw-gap-5 tw-flex-wrap tw-justify-center">
        <button className={connectionButton} onClick={() => onClick(ConnectionType.Snowflake)}>
          <img src={snowflake} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Snowflake
        </button>
        <button className={connectionButton} onClick={() => onClick(ConnectionType.BigQuery)}>
          <img src={bigquery} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          BigQuery
        </button>
        <button className={connectionButton} onClick={() => onClick(ConnectionType.Redshift)}>
          <img src={redshift} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          Redshift
        </button>
        <button className={connectionButton} onClick={() => onClick(ConnectionType.MongoDb)}>
          <img src={mongodb} alt="data source logo" className="tw-h-6 tw-mr-1.5" />
          MongoDB
        </button>
      </div>
      <div className="tw-text-center tw-mt-8 tw-mb-4 tw-text-slate-700">or</div>
      <div className="tw-text-base tw-font-medium tw-flex tw-flex-row tw-items-center tw-justify-center">
        Choose an existing source
        <Tooltip place="top" label="If you've already setup a source, you can sync additional tables from it.">
          <InfoIcon className="tw-ml-2 tw-h-3 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-w-full tw-pb-16">
        <div className="tw-w-96">
          <SourceSelector source={props.state.source} setSource={setSource} linkToken={props.linkToken} />
        </div>
      </div>
    </div>
  );
};