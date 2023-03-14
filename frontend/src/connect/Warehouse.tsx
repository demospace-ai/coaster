import React from "react";
import bigquery from "src/components/images/bigquery.svg";
import mongodb from "src/components/images/mongodb.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { SetupSyncProps, SyncSetupStep } from "src/connect/state";
import { ConnectionType } from "src/rpc/api";

export const WarehouseSelector: React.FC<SetupSyncProps> = (props) => {
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-56 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow tw-select-none";
  const onClick = (connectionType: ConnectionType) => {
    props.setState({ ...props.state, connectionType: connectionType, step: SyncSetupStep.ConnectionDetails, skippedSourceSetup: false });
  };

  return (
    <div className="tw-w-full tw-px-20">
      <div className="tw-text-left tw-mb-2 tw-text-2xl tw-font-semibold tw-text-slate-900">Add a new data source</div>
      <div className="tw-text-left tw-mb-10 tw-text-slate-600">Choose the data warehouse, database, or data lake to connect.</div>
      <div className="tw-flex tw-flex-row tw-gap-5 tw-flex-wrap tw-justify-between">
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
    </div>
  );
};