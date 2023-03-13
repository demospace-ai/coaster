import { ChevronRightIcon, PencilIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { useSyncDetails } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle = "tw-whitespace-nowrap tw-left tw-px-4 tw-min-w-[200px] tw-overflow-hidden tw-text-ellipsis tw-py-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const SyncDetails: React.FC = () => {
  const { syncID } = useParams<{ syncID: string; }>();
  const { syncDetails } = useSyncDetails(Number(syncID));

  return (
    <div className='tw-pt-5 tw-pb-24 tw-px-10 tw-h-full tw-w-full tw-overflow-scroll'>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-2">
        <div className="tw-flex tw-flex-row tw-items-center tw-font-bold tw-text-lg">
          {syncDetails?.sync.display_name}
          <div className="hover:tw-bg-slate-200 tw-p-1 tw-rounded tw-ml-2 tw-cursor-pointer"><PencilIcon className="tw-h-4"></PencilIcon></div>
        </div>
      </div>
      <div className='tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-lg tw-overflow-auto tw-overscroll-contain tw-shadow-md tw-w-full' >
        {syncDetails
          ?
          <table className="tw-min-w-full tw-border-spacing-0">
            <thead className="tw-bg-slate-600 tw-text-white">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Status</th>
                <th scope="col" className={tableHeaderStyle}>Started At</th>
                <th scope="col" className={tableHeaderStyle}>Completed At</th>
                <th scope="col" className={tableHeaderStyle}>Error</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {syncDetails?.sync_runs.length > 0 ? syncDetails?.sync_runs!.map((syncRun, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-slate-200 last:tw-border-0 tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => { }}>
                  <td className={mergeClasses(tableCellStyle, "tw-min-w-[120px]")}>
                    {syncRun.status}
                  </td>
                  <td className={tableCellStyle}>
                    {syncRun.started_at}
                  </td>
                  <td className={tableCellStyle}>
                    {syncRun.completed_at}
                  </td>
                  <td className={mergeClasses(tableCellStyle, "tw-max-w-[450px]")}>
                    <Tooltip label={<div className="tw-m-2 tw-cursor-text">{syncRun.error}</div>} maxWidth={600} interactive>
                      <div>
                        {syncRun.error}
                      </div>
                    </Tooltip>
                  </td>
                  <td className={mergeClasses(tableCellStyle, "tw-min-w-[50px] tw-w-full tw-pr-5")}>
                    <ChevronRightIcon className="tw-ml-auto tw-h-4 tw-w-4 tw-text-slate-400" aria-hidden="true" />
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No sync runs yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </div>
  );
};