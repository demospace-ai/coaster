import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "src/components/button/Button";
import { DotsLoading, Loading } from "src/components/loading/Loading";
import { Toast } from "src/components/notifications/Notifications";
import { EmptyTable } from "src/components/table/Table";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { sendRequest } from "src/rpc/ajax";
import { RunSync, SyncRunStatus } from "src/rpc/api";
import { useSync } from "src/rpc/data";
import { useMutation } from "src/utils/queryHelpers";
import { mergeClasses } from "src/utils/twmerge";

const tableHeaderStyle =
  "tw-sticky tw-top-0 tw-z-0 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle =
  "tw-whitespace-nowrap tw-left tw-overflow-hidden tw-py-4 tw-pl-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const Sync: React.FC = () => {
  const navigate = useNavigate();
  const { syncID } = useParams<{ syncID: string }>();
  const { sync, mutate } = useSync(Number(syncID));
  const syncRuns = sync?.sync_runs ? sync.sync_runs : [];

  const runSyncMutation = useMutation(
    async () => {
      await sendRequest(RunSync, { syncID });
    },
    {
      onSuccess: () => {
        mutate();
        setTimeout(() => {
          runSyncMutation.reset();
        }, 2000);
      },
    },
  );

  const renderRunSyncResult = () => {
    if (runSyncMutation.isSuccess) {
      return (
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
          <CheckCircleIcon className="tw-w-5 tw-h-5 tw-text-green-500 tw-stroke-2" />
          <p className="tw-ml-2 tw-text-base tw-text-gray-900">Success! Sync will start shortly.</p>
        </div>
      );
    }

    if (runSyncMutation.isFailed) {
      return (
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
          <XCircleIcon className="tw-w-5 tw-h-5 tw-text-red-500 tw-stroke-2" />
          <p className="tw-ml-2 tw-text-sm tw-text-gray-900">Failed!</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="tw-pt-5 tw-pb-24 tw-px-10 tw-h-full tw-w-full tw-overflow-scroll">
      <BackButton onClick={() => navigate("/syncs")} />
      <div className="tw-pointer-events-none tw-fixed tw-w-full tw-h-full">
        <Toast
          content={renderRunSyncResult()}
          show={runSyncMutation.isSuccess}
          setShow={() => runSyncMutation.reset()}
        />
      </div>
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-4">
        <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-font-bold tw-text-lg tw-justify-between">
          <div>{sync?.sync.display_name}</div>
          <div className="tw-flex">
            <button
              className="tw-ml-auto tw-px-3 tw-py-1 tw-rounded-md tw-font-medium tw-text-base hover:tw-bg-slate-100 tw-text-blue-600 tw-mr-2"
              onClick={() => {
                throw new Error("Edit sync not implemented");
              }}
            >
              Edit
            </button>
            <button
              disabled={runSyncMutation.isLoading}
              className="tw-ml-auto tw-px-4 tw-py-1 tw-rounded-md tw-font-medium tw-text-base tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white disabled:tw-bg-gray-500"
              onClick={() => runSyncMutation.mutate()}
            >
              {runSyncMutation.isLoading ? <Loading light className="tw-w-4 tw-h-4" /> : "Run sync"}
            </button>
          </div>
        </div>
      </div>
      <div className="tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-bg-white tw-rounded-lg tw-overflow-auto tw-shadow-md tw-w-full">
        {sync ? (
          <table className="tw-min-w-full tw-border-spacing-0 tw-divide-y tw-divide-slate-200">
            <thead className="tw-bg-slate-100 tw-text-slate-900">
              <tr>
                <th scope="col" className={tableHeaderStyle}>
                  Status
                </th>
                <th scope="col" className={tableHeaderStyle}>
                  Started At
                </th>
                <th scope="col" className={tableHeaderStyle}>
                  Rows Synced
                </th>
                <th scope="col" className={tableHeaderStyle}>
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-slate-200 tw-bg-white">
              {syncRuns.length > 0 ? (
                syncRuns.map((syncRun, index) => (
                  <tr key={index} className="tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => {}}>
                    <td className={tableCellStyle}>
                      <div
                        className={mergeClasses(
                          "tw-flex tw-justify-center tw-items-center tw-py-1 tw-px-2 tw-rounded tw-text-center tw-w-[110px] tw-text-xs tw-font-medium",
                          getStatusStyle(syncRun.status),
                        )}
                      >
                        {syncRun.status.toUpperCase()}{" "}
                        {syncRun.status === SyncRunStatus.Running && <DotsLoading className="tw-ml-1.5" />}
                      </div>
                    </td>
                    <td className={tableCellStyle}>
                      <div>
                        <div className="tw-font-medium tw-mb-0.5">{syncRun.started_at}</div>
                        {syncRun.duration && (
                          <div className="tw-text-xs tw-text-slate-500">Duration: {syncRun.duration}</div>
                        )}
                      </div>
                    </td>
                    <td className={tableCellStyle}>{syncRun.rows_written}</td>
                    <td className={tableCellStyle}>
                      <Tooltip
                        label={<div className="tw-m-2 tw-cursor-text tw-font-mono">{syncRun.error}</div>}
                        maxWidth={600}
                        interactive
                      >
                        <div className="tw-overflow-hidden tw-text-ellipsis tw-max-w-[450px]">{syncRun.error}</div>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={tableCellStyle}>No sync runs yet!</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <EmptyTable />
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status: SyncRunStatus): string => {
  switch (status) {
    case SyncRunStatus.Running:
      return "tw-bg-sky-100 tw-border tw-border-solid tw-border-sky-500 tw-text-sky-600";
    case SyncRunStatus.Completed:
      return "tw-bg-green-100 tw-border tw-border-solid tw-border-green-500 tw-text-green-600";
    case SyncRunStatus.Failed:
      return "tw-bg-red-100 tw-border tw-border-solid tw-border-red-500 tw-text-red-500";
    default:
      return "tw-bg-gray-100 tw-border tw-border-solid tw-border-gray-500 tw-text-gray-500";
  }
};
