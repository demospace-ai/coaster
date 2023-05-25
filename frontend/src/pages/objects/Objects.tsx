import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { ReactElement, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { EmptyTable } from "src/components/table/Table";
import { NewObject } from "src/pages/objects/NewObject";
import { useObjects } from "src/rpc/data";
import { mergeClasses } from "src/utils/twmerge";

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-0 tw-py-3.5 tw-pr-4 tw-pl-3 sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-h-16 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

enum Step {
  Initial,
  NewObject,
}

// export const Objects: React.FC = () => {
//   const [step, setStep] = useState<Step>(Step.Initial);

//   let content: ReactElement;
//   switch (step) {
//     case Step.Initial:
//       content = <ObjectList setStep={setStep} />;
//       break;
//     case Step.NewObject:
//       content = <NewObject onComplete={() => setStep(Step.Initial)} />;
//       break;
//     default:
//       content = <></>;
//   }
//   return <div className="tw-py-5 tw-px-10 tw-h-full tw-overflow-scroll">{content}</div>;
// };

export const ObjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { objects } = useObjects();

  return (
    <div className="tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-bg-white tw-rounded-lg tw-overflow-x-auto tw-overscroll-contain tw-shadow-md">
      {objects ? (
        <table className="tw-min-w-full tw-border-spacing-0 tw-divide-y tw-divide-slate-200">
          <thead className="tw-bg-slate-100 tw-text-slate-900">
            <tr>
              <th scope="col" className={tableHeaderStyle}>
                Name
              </th>
              <th scope="col" className={classNames(tableHeaderStyle, "tw-w-5")}></th>
            </tr>
          </thead>
          <tbody className="tw-divide-y tw-divide-slate-200">
            {objects!.length > 0 ? (
              objects!.map((object, index) => (
                <tr
                  key={index}
                  className="tw-cursor-pointer hover:tw-bg-slate-50"
                  onClick={() => navigate(`/object/${object.id}`)}
                >
                  <td className={tableCellStyle}>{object.display_name}</td>
                  <td className={mergeClasses(tableCellStyle, "tw-pr-5")}>
                    <ChevronRightIcon className="tw-ml-auto tw-h-4 tw-w-4 tw-text-slate-400" aria-hidden="true" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={tableCellStyle}>No objects yet!</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <EmptyTable />
      )}
    </div>
  );
};
