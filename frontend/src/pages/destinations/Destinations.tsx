import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { ConnectionImage } from "src/components/images/Connections";
import { EmptyTable } from "src/components/table/Table";
import { NewDestination } from "src/pages/destinations/NewDestination";
import { getConnectionType } from "src/rpc/api";
import { useDestinations } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";

const tableHeaderStyle =
  "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-pr-4 tw-pl-3 sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-h-16 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

enum Step {
  Initial,
  NewDestination,
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
  return <div className="tw-py-5 tw-px-10 tw-h-full tw-overflow-scroll">{content}</div>;
};

const DestinationList: React.FC<{ setStep: (step: Step) => void }> = ({ setStep }) => {
  const { destinations } = useDestinations();
  const navigate = useNavigate();
  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Destinations</div>
        <Button
          className="tw-ml-auto tw-flex tw-justify-center tw-items-center"
          onClick={() => setStep(Step.NewDestination)}
        >
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className="tw-h-4 tw-inline-block tw-mr-2" />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-mr-0.5">Add Destination</div>
        </Button>
      </div>
      <div className="tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-lg tw-overflow-x-auto tw-overscroll-contain tw-shadow-md">
        {destinations ? (
          <table className="tw-min-w-full tw-border-spacing-0">
            <thead className="tw-bg-slate-600 tw-text-white">
              <tr>
                <th scope="col" className={tableHeaderStyle}>
                  Name
                </th>
                <th scope="col" className={tableHeaderStyle}>
                  Type
                </th>
                <th scope="col" className={classNames(tableHeaderStyle, "tw-w-5")}></th>
              </tr>
            </thead>
            <tbody>
              {destinations!.length > 0 ? (
                destinations!.map((destination, index) => (
                  <tr
                    key={index}
                    className="tw-border-b tw-border-solid tw-border-slate-200 last:tw-border-0 tw-cursor-pointer hover:tw-bg-slate-50"
                    onClick={() => navigate(`/destination/${destination.id}`)}
                  >
                    <td className={tableCellStyle}>{destination.display_name}</td>
                    <td className={tableCellStyle}>
                      <div className="tw-flex tw-items-center">
                        <ConnectionImage
                          connectionType={destination.connection.connection_type}
                          className="tw-h-6 tw-mr-1"
                        />
                        {getConnectionType(destination.connection.connection_type)}
                      </div>
                    </td>
                    <td className={mergeClasses(tableCellStyle, "tw-pr-5")}>
                      <ChevronRightIcon className="tw-ml-auto tw-h-4 tw-w-4 tw-text-slate-400" aria-hidden="true" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={tableCellStyle}>No destinations yet!</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <EmptyTable />
        )}
      </div>
    </>
  );
};
