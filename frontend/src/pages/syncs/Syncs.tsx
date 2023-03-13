import { ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { useObjects, useSyncs } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-pl-3 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle = "tw-whitespace-nowrap tw-left tw-pl-3 tw-min-w-[200px] tw-py-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const Syncs: React.FC = () => {
  const navigate = useNavigate();
  const { syncs } = useSyncs();
  const { objects } = useObjects();
  const objectIdMap = new Map(objects?.map(object => [object.id, object]));

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
                <th scope="col" className={tableHeaderStyle}>End Customer ID</th>
                <th scope="col" className={tableHeaderStyle}>Object</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {syncs!.length > 0 ? syncs!.map((sync, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-slate-200 last:tw-border-0 tw-cursor-pointer hover:tw-bg-slate-50" onClick={() => navigate(`/sync/${sync.id}`)}>
                  <td className={tableCellStyle}>
                    {sync.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {sync.end_customer_id}
                  </td>
                  <td className={tableCellStyle}>
                    {objectIdMap.get(sync.object_id)?.display_name}
                  </td>
                  <td className={mergeClasses(tableCellStyle, "tw-w-full tw-pr-5")}>
                    <ChevronRightIcon className="tw-ml-auto tw-h-4 tw-w-4 tw-text-slate-400" aria-hidden="true" />
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