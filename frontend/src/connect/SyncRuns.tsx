import { ChevronRightIcon, PencilIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { SyncRunStatus } from "src/rpc/api";
import { useLinkSyncDetails } from "src/rpc/data";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";

export const SyncRuns: React.FC<{ linkToken: string; close: () => void; }> = ({ linkToken, close }) => {
  return (
    <div className="tw-w-full">
      <Header close={close} />
      <SyncRunsList linkToken={linkToken} />
    </div>
  );
};

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle = "tw-whitespace-nowrap tw-left tw-pl-3 tw-min-w-[180px] tw-overflow-hidden tw-py-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

const SyncRunsList: React.FC<{ linkToken: string; }> = ({ linkToken }) => {
  const { syncID } = useParams<{ syncID: string; }>();
  const { syncDetails } = useLinkSyncDetails(Number(syncID), linkToken);
  const syncRuns = syncDetails?.sync_runs ? syncDetails.sync_runs : [];

  return (
    <div className="tw-pb-24 tw-px-20 tw-overflow-auto">
      <div className='tw-mt-2 tw-h-full tw-w-full'>
        <div className="tw-flex tw-w-full tw-mb-8">
          <div className="tw-flex tw-flex-row tw-items-center tw-font-bold tw-text-xl">
            Sync Runs • {syncDetails?.sync.display_name}
            <div className="hover:tw-bg-slate-200 tw-p-1 tw-rounded tw-ml-2 tw-cursor-pointer"><PencilIcon className="tw-h-4"></PencilIcon></div>
          </div>
        </div>
        <div className='tw-shadow tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-rounded-md tw-overflow-auto tw-overscroll-contain tw-w-full tw-max-h-[420px]' >
          {syncDetails
            ?
            <table className="tw-min-w-full tw-border-spacing-0 tw-divide-y tw-divide-slate-200">
              <thead className="tw-sticky tw-top-0 tw-bg-slate-100">
                <tr>
                  <th scope="col" className={tableHeaderStyle}>Status</th>
                  <th scope="col" className={tableHeaderStyle}>Started At</th>
                  <th scope="col" className={tableHeaderStyle}>Completed At</th>
                  <th scope="col" className={tableHeaderStyle}>Error</th>
                  <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                </tr>
              </thead>
              <tbody className="tw-divide-y tw-divide-slate-200 tw-bg-white">
                {syncRuns.length > 0 ? syncRuns.map((syncRun, index) => (
                  <tr key={index} className="tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => { }}>
                    <td className={mergeClasses(tableCellStyle, "tw-min-w-[140px]")}>
                      <div className={mergeClasses("tw-py-1 tw-px-2 tw-rounded tw-text-center tw-w-[100px] tw-border tw-font-medium", getStatusStyle(syncRun.status))}>
                        {toTitleCase(syncRun.status)}
                      </div>
                    </td>
                    <td className={tableCellStyle}>
                      {syncRun.started_at}
                    </td>
                    <td className={tableCellStyle}>
                      {syncRun.completed_at}
                    </td>
                    <td className={tableCellStyle}>
                      <Tooltip label={<div className="tw-m-2 tw-cursor-text tw-font-mono">{syncRun.error}</div>} maxWidth={600} interactive>
                        <div className="tw-overflow-hidden tw-text-ellipsis tw-max-w-[450px]">
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
    </div>
  );
};

const Header: React.FC<{ close: () => void; }> = ({ close }) => {
  const navigate = useNavigate();
  return (
    <div className='tw-flex tw-flex-row tw-items-center tw-w-full tw-h-20 tw-min-h-[80px]'>
      <BackButton className="tw-absolute tw-left-10" onClick={() => { navigate("/"); }} />
      <button className="tw-absolute tw-flex tw-items-center t tw-right-10 tw-border-none tw-cursor-pointer tw-p-0" onClick={close}>
        <svg className='tw-h-6 tw-fill-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
          <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" />
        </svg>
      </button>
    </div >
  );
};

const getStatusStyle = (status: SyncRunStatus): string => {
  switch (status) {
    case SyncRunStatus.Running:
      return "tw-bg-sky-100 tw-border-sky-600 tw-text-sky-600";
    case SyncRunStatus.Completed:
      return "tw-bg-green-100 tw-border-green-600 tw-text-green-600";
    case SyncRunStatus.Failed:
      return "tw-bg-red-100 tw-border-red-500 tw-text-red-500";
    default:
      return "tw-bg-gray-100 tw-border-gray-500 tw-text-gray-500";
  }
};