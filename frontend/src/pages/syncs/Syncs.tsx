import classNames from "classnames";
import { getConnectionTypeImg } from "src/components/images/warehouses";
import { Loading } from "src/components/loading/Loading";
import { getConnectionType } from "src/rpc/api";
import { useSyncs } from "src/rpc/data";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-pr-4 tw-pl-3 sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const Syncs: React.FC = () => {
  const { syncs } = useSyncs();

  return (
    <div className='tw-py-5 tw-px-10 tw-h-full tw-overflow-scroll'>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Syncs</div>
      </div>
      <div className='tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-lg tw-max-h-64 tw-overflow-x-auto tw-overscroll-contain tw-shadow-md' >
        {syncs
          ?
          <table className="tw-min-w-full tw-border-spacing-0">
            <thead className="tw-bg-slate-600 tw-text-white">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Name</th>
                <th scope="col" className={tableHeaderStyle}>Source Name</th>
                <th scope="col" className={tableHeaderStyle}>Source Type</th>
                <th scope="col" className={tableHeaderStyle}>Destination Name</th>
                <th scope="col" className={tableHeaderStyle}>Destination Type</th>
                <th scope="col" className={tableHeaderStyle}>End Customer ID</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {syncs!.length > 0 ? syncs!.map((sync, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-slate-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {sync.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      {sync.destination.display_name}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      <img src={getConnectionTypeImg(sync.destination.connection.connection_type)} alt="destination connection logo" className="tw-h-6 tw-mr-1" />
                      {getConnectionType(sync.destination.connection.connection_type)}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      {sync.source.display_name}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      <img src={getConnectionTypeImg(sync.source.connection.connection_type)} alt="source connection logo" className="tw-h-6 tw-mr-1" />
                      {getConnectionType(sync.source.connection.connection_type)}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-flex tw-items-center">
                      {sync.source.end_customer_id}
                    </div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => null}>Delete</div>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No syncs yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </div>
  );
};