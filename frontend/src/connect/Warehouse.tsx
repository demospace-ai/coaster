import React, { useImperativeHandle, useState } from "react";
import bigquery from "src/components/images/bigquery.svg";
import mongodb from "src/components/images/mongodb.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { SourceSelector } from "src/components/selector/Selector";
import { SetupStep } from "src/connect/App";
import { ConnectionType, Source } from "src/rpc/api";

type WarehouseSelectorProps = {
  linkToken: string;
  setConnectionType: (connectionType: ConnectionType) => void;
  nextStep: () => void;
  skipConnection: (source: Source) => void;
};

export const WarehouseSelector = React.forwardRef<SetupStep, WarehouseSelectorProps>((props, ref) => {
  const [source, setSource] = useState<Source | undefined>(undefined);
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-64 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow-md tw-select-none";
  useImperativeHandle(ref, () => {
    return {
      continue: async () => {
        if (!source) {
          return;
        }
        props.skipConnection(source);
      }
    };
  });

  const onClick = (connectionType: ConnectionType) => {
    props.setConnectionType(connectionType);
    props.nextStep();
  };

  return (
    <div className="tw-w-full tw-px-20">
      <div className="tw-text-center tw-mb-2 tw-text-2xl tw-font-bold">Select your data warehouse</div>
      <div className="tw-text-center tw-mb-10 tw-text-slate-700">Choose the data warehouse, database, or data lake to connect.</div>
      <div className="tw-flex tw-flex-row tw-gap-5">
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
      <div className="tw-text-center tw-mt-12 tw-text-slate-700">Or, choose an existing source:</div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-w-full">
        <div className="tw-w-64">
          <SourceSelector source={source} setSource={setSource} linkToken={props.linkToken} />
        </div>
      </div>
    </div>
  );
});