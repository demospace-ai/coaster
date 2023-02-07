import { PlusCircleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useState } from "react";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { NewConnection } from "src/pages/newconnection/NewConnection";
import { DataConnection } from "src/rpc/api";
import { useDataConnections } from "src/rpc/data";

enum Step {
  Initial,
  NewDataSource,
}

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-gray-300 tw-bg-gray-50 tw-bg-opacity-75 tw-py-3.5 tw-pr-4 tw-pl-3 backdrop-blur backdrop-filter sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500 tw-hidden sm:tw-table-cell";

export const WorkspaceSettings: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Initial);

  const [, setSelectedConnection] = useState<DataConnection | undefined>(undefined);

  let content;
  switch (step) {
    case Step.Initial:
      content = (
        <div className='tw-py-14 tw-px-10'>
          <DataSourceSettings setStep={setStep} setSelectedConnection={setSelectedConnection} />
        </div>
      );
      break;
    case Step.NewDataSource:
      content = <NewConnection onComplete={() => setStep(Step.Initial)} />;
      break;
  }

  return content;
};

type DataSourceSettingsProps = {
  setStep: (step: Step) => void;
  setSelectedConnection: (connection: DataConnection) => void;
};

const DataSourceSettings: React.FC<DataSourceSettingsProps> = ({ setStep, setSelectedConnection }) => {
  const { connections } = useDataConnections();

  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Data Sources</div>
        <Button className='tw-ml-auto tw-flex' onClick={() => setStep(Step.NewDataSource)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-[6px]' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-pr-2">
            New data source
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-x-auto tw-overscroll-contain' >
        {connections
          ?
          <table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
            <thead className="tw-bg-gray-100">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Display Name</th>
                <th scope="col" className={tableHeaderStyle}>Source Type</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {connections!.length > 0 ? connections!.map((connection, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {connection.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {connection.connection_type}
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => null}>Delete</div>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No data sources configured yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </>
  );
};