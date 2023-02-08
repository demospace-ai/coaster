import { PlusCircleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { useDestinations } from "src/rpc/data";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-gray-300 tw-bg-gray-50 tw-bg-opacity-75 tw-py-3.5 tw-pr-4 tw-pl-3 backdrop-blur backdrop-filter sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500 tw-hidden sm:tw-table-cell";

export const Destinations: React.FC = () => {
  const { destinations } = useDestinations();
  return (
    <div className='tw-py-5 tw-px-10'>
      <div className="tw-flex tw-w-full tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Destinations</div>
        <Button className='tw-ml-auto tw-flex' onClick={() => { }}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-2' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-mr-0.5">
            Add Destination
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-x-auto tw-overscroll-contain' >
        {destinations
          ?
          <table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
            <thead className="tw-bg-gray-100">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Name</th>
                <th scope="col" className={tableHeaderStyle}>Type</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {destinations!.length > 0 ? destinations!.map((destination, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {destination.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {destination.connection.connection_type}
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
    </div>
  );
};