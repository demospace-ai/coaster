import { PlusCircleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { ReactElement, useState } from "react";
import { Button } from "src/components/button/Button";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { Loading } from "src/components/loading/Loading";
import { NewDestination } from "src/pages/newdestination/NewDestination";
import { getConnectionType } from "src/rpc/api";
import { useDestinations } from "src/rpc/data";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-pr-4 tw-pl-3 sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

enum Step {
  Initial,
  NewDestination
}

export const Destinations: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Initial);

  let content: ReactElement;
  switch (step) {
    case Step.Initial:
      content = <DestinationList setStep={setStep} />;
      break;
    case Step.NewDestination:
      content = <NewDestination onComplete={() => setStep(Step.Initial)} />;
      break;
    default:
      content = <></>;
  }
  return (
    <div className='tw-py-5 tw-px-10'>
      {content}
    </div>
  );
};

const DestinationList: React.FC<{ setStep: (step: Step) => void; }> = ({ setStep }) => {
  const { destinations } = useDestinations();
  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Destinations</div>
        <Button className='tw-ml-auto tw-flex tw-justify-center tw-items-center' onClick={() => setStep(Step.NewDestination)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-2' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-mr-0.5">
            Add Destination
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-slate-300 tw-rounded-lg tw-max-h-64 tw-overflow-x-auto tw-overscroll-contain tw-shadow-md' >
        {destinations
          ?
          <table className="tw-min-w-full tw-border-spacing-0 tw-bg-white">
            <thead className="tw-bg-slate-600 tw-text-white">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Name</th>
                <th scope="col" className={tableHeaderStyle}>Type</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {destinations!.length > 0 ? destinations!.map((destination, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-slate-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {destination.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      <img src={getConnectionTypeImg(destination.connection.connection_type)} alt="data source logo" className="tw-h-6 tw-mr-1" />
                      {getConnectionType(destination.connection.connection_type)}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => null}>Delete</div>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No destinations yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </>
  );
};