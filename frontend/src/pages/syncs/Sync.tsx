import {
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "src/components/button/Button";
import { DotsLoading, Loading } from "src/components/loading/Loading";
import { EmptyTable } from "src/components/table/Table";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { RunSync, GetSync, SyncRunStatus } from "src/rpc/api";
import { useSync } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";
import { sendRequest } from "../../rpc/ajax";
import { useState } from "react";

const tableHeaderStyle =
  "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle =
  "tw-whitespace-nowrap tw-left tw-overflow-hidden tw-py-4 tw-pl-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const Sync: React.FC = () => {
  const navigate = useNavigate();
  const { syncID } = useParams<{ syncID: string }>();
  const { sync, mutate } = useSync(Number(syncID));
  const syncRuns = sync?.sync_runs ? sync.sync_runs : [];
  const [runSyncResult, setRunSyncResult] = useState<
    "Success" | "Failure" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSync = async () => {
    setIsLoading(true);
    try {
      await sendRequest(RunSync, { syncID });
      mutate();
      setRunSyncResult("Success");
    } catch (err) {
      console.error(err);
      setRunSyncResult("Failure");
    } finally {
      setTimeout(() => {
        setRunSyncResult(null);
      }, 2000);
    }
    setIsLoading(false);
  };

  const renderButtonStatus = () => {
    if (isLoading) {
      return <Loading light className="tw-w-4 tw-h-4" />;
    }

    if (runSyncResult === "Success") {
      return <CheckIcon className="tw-w-4 tw-h-4 tw-text-green-500" />;
    }

    if (runSyncResult === "Failure") {
      return <XMarkIcon className="tw-w-4 tw-h-4 tw-text-red-500" />;
    }

    return null;
  };

  return (
    <div className="tw-pt-5 tw-pb-24 tw-px-10 tw-h-full tw-w-full tw-overflow-scroll">
      <BackButton onClick={() => navigate("/syncs")} />
      <div className="tw-flex tw-w-full tw-mb-5 tw-mt-4">
        <div className="tw-flex tw-flex-row tw-w-full tw-items-center tw-font-bold tw-text-lg tw-justify-between">
          <div>{sync?.sync.display_name}</div>
          <div>
            <button
              disabled={isLoading}
              className="tw-ml-auto tw-px-8 tw-py-2 tw-rounded-md tw-font-medium tw-text-base tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-mr-2 tw-relative disabled:tw-bg-gray-500"
              onClick={handleRunSync}
            >

              <div className="tw-absolute tw-left-2 tw-top-1/2 tw-transform -tw-translate-y-1/2">
                {renderButtonStatus()}
              </div>
              Sync
            </button>
            <button
              className="tw-ml-auto tw-px-4 tw-py-2 tw-rounded-md tw-font-medium tw-text-base hover:tw-bg-slate-100 tw-text-blue-600"
              onClick={() => {}}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <div className="tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-lg tw-overflow-auto tw-overscroll-contain tw-shadow-md tw-w-full">
        {sync ? (
          <table className="tw-min-w-full tw-border-spacing-0 tw-divide-y tw-divide-slate-200">
            <thead className="tw-bg-slate-600 tw-text-white">
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
                <th
                  scope="col"
                  className={mergeClasses(tableHeaderStyle, "tw-w-5")}
                ></th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-slate-200 tw-bg-white">
              {syncRuns.length > 0 ? (
                syncRuns.map((syncRun, index) => (
                  <tr
                    key={index}
                    className="tw-cursor-pointer hover:tw-bg-slate-50"
                    onClick={() => {}}
                  >
                    <td className={tableCellStyle}>
                      <div
                        className={mergeClasses(
                          "tw-flex tw-justify-center tw-items-center tw-py-1 tw-px-2 tw-rounded tw-text-center tw-w-[110px] tw-border tw-text-xs tw-font-medium",
                          getStatusStyle(syncRun.status)
                        )}
                      >
                        {syncRun.status.toUpperCase()}{" "}
                        {syncRun.status === SyncRunStatus.Running && (
                          <DotsLoading className="tw-ml-1.5" />
                        )}
                      </div>
                    </td>
                    <td className={tableCellStyle}>
                      <div>
                        <div className="tw-font-medium tw-mb-0.5">
                          {syncRun.started_at}
                        </div>
                        {syncRun.duration && (
                          <div className="tw-text-xs tw-text-slate-500">
                            Duration: {syncRun.duration}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={tableCellStyle}>{syncRun.rows_written}</td>
                    <td className={tableCellStyle}>
                      <Tooltip
                        label={
                          <div className="tw-m-2 tw-cursor-text tw-font-mono">
                            {syncRun.error}
                          </div>
                        }
                        maxWidth={600}
                        interactive
                      >
                        <div className="tw-overflow-hidden tw-text-ellipsis tw-max-w-[450px]">
                          {syncRun.error}
                        </div>
                      </Tooltip>
                    </td>
                    <td className={mergeClasses(tableCellStyle, "tw-pr-5")}>
                      <ChevronRightIcon
                        className="tw-ml-auto tw-h-4 tw-w-4 tw-text-slate-400"
                        aria-hidden="true"
                      />
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
      return "tw-bg-sky-100 tw-border-sky-600 tw-text-sky-600";
    case SyncRunStatus.Completed:
      return "tw-bg-green-100 tw-border-green-600 tw-text-green-600";
    case SyncRunStatus.Failed:
      return "tw-bg-red-100 tw-border-red-500 tw-text-red-500";
    default:
      return "tw-bg-gray-100 tw-border-gray-500 tw-text-gray-500";
  }
};
