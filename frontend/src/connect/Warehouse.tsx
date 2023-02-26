import { ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";
import { InfoIcon } from "src/components/icons/Icons";
import bigquery from "src/components/images/bigquery.svg";
import mongodb from "src/components/images/mongodb.svg";
import redshift from "src/components/images/redshift.svg";
import snowflake from "src/components/images/snowflake.svg";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SetupSyncProps } from "src/connect/App";
import { ConnectionType, Source } from "src/rpc/api";
import { useLinkSources } from "src/rpc/data";

export const WarehouseSelector: React.FC<SetupSyncProps> = (props) => {
  const connectionButton = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-5 tw-font-bold tw-w-56 tw-rounded-md tw-cursor-pointer tw-bg-white tw-text-slate-800 tw-border tw-border-slate-300 hover:tw-bg-slate-100 tw-tracking-[1px] tw-shadow-md tw-select-none";
  const onClick = (connectionType: ConnectionType) => {
    props.setState({ ...props.state, connectionType: connectionType, step: props.state.step + 1, skippedSourceSetup: false });
  };
  const setExistingSource = (source: Source) => {
    props.setState({ ...props.state, source: source, step: props.state.step + 2, skippedSourceSetup: true });
  };

  return (
    <div className="tw-w-full tw-px-28">
      <div className="tw-text-left tw-mb-2 tw-text-2xl tw-font-semibold tw-text-slate-900">Add a new data source</div>
      <div className="tw-text-left tw-mb-8 tw-text-slate-600">Choose the data warehouse, database, or data lake to connect.</div>
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
      <div className="tw-text-center tw-font-bold tw-text-lg tw-mt-8 tw-mb-2 tw-text-slate-700">or</div>
      <div className="tw-text-2xl tw-font-semibold tw-text-slate-900 tw-flex tw-flex-row tw-items-center">
        Choose an existing source
        <Tooltip place="right" maxWidth="500px" label="If you've already setup a source, you can sync additional tables from it.">
          <InfoIcon className="tw-ml-1.5 tw-h-3.5 tw-fill-slate-400" />
        </Tooltip>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-w-full tw-pb-4">
        <div className="tw-w-full">
          <SourceTable linkToken={props.linkToken} setExistingSource={setExistingSource} />
        </div>
      </div>
    </div>
  );
};

const SourceTable: React.FC<{ linkToken: string; setExistingSource: (source: Source) => void; }> = ({ linkToken, setExistingSource }) => {
  const { sources } = useLinkSources(linkToken);
  return (
    <div className="tw-mt-6 tw-flow-root">
      <div className="tw-inline-block tw-min-w-full tw-py-2 tw-align-middle">
        <div className="tw-overflow-auto tw-shadow tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-rounded-md">
          <table className="tw-min-w-full tw-divide-y tw-divide-gray-300">
            <thead className="tw-bg-gray-50">
              <tr>
                <th scope="col" className="tw-py-3.5 tw-pl-4 tw-pr-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900">
                  Name
                </th>
                <th scope="col" className="tw-px-3 tw-py-3.5 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-900">
                  Connection Type
                </th>
                <th scope="col" className="tw-relative tw-py-3.5 tw-pl-3">
                  <span className="tw-sr-only">Continue</span>
                </th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-200 tw-bg-white">
              {sources && sources.map((source) => (
                <tr key={source.id} className="tw-cursor-pointer hover:tw-bg-slate-100" onClick={() => setExistingSource(source)}>
                  <td className="tw-whitespace-nowrap tw-py-4 tw-pl-4 tw-pr-3 tw-text-sm tw-font-medium tw-text-gray-900 tw-flex tw-flex-row tw-items-center">
                    <img className="tw-mr-2 tw-h-5" src={getConnectionTypeImg(source.connection.connection_type)} alt="warehouse icon" />
                    {source.display_name}
                  </td>
                  <td className="tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500">{source.connection.connection_type}</td>
                  <td className="tw-pr-4" align="right">
                    <ChevronRightIcon className="tw-h-4 tw-w-4 tw-text-gray-400" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};