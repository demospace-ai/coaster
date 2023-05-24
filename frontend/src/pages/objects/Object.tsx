import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { needsCursorField, needsEndCustomerId, needsPrimaryKey, TargetType, targetTypeToString } from "src/rpc/api";
import { useObject } from "src/rpc/data";

const tableHeaderStyle =
  "tw-sticky tw-top-0 tw-z-0 tw-border-b tw-border-slate-300 tw-py-3.5 tw-px-4 sm:tw-pr-6 lg:tw-pr-8 tw-text-left tw-whitespace-nowrap";
const tableCellStyle =
  "tw-whitespace-nowrap tw-left tw-overflow-hidden tw-py-4 tw-pl-4 tw-text-sm tw-text-slate-800 tw-hidden sm:tw-table-cell";

export const Object: React.FC = () => {
  const navigate = useNavigate();
  const { objectID } = useParams<{ objectID: string }>();
  const { object } = useObject(Number(objectID));

  if (!object) {
    return <Loading />;
  }

  return (
    <div className="tw-pt-5 tw-pb-24 tw-px-10 tw-h-full tw-w-full tw-overflow-scroll">
      <BackButton onClick={() => navigate("/objects")} />
      <div className="tw-flex tw-flex-row tw-items-center tw-font-bold tw-text-2xl tw-my-4">{object.display_name}</div>
      <div className="tw-flex tw-flex-col tw-flex-wrap tw-items-start tw-w-1/2 tw-min-w-[400px] tw-p-4 tw-mb-5 tw-bg-white tw-border tw-border-slate-200 tw-rounded-md">
        <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
          <span className="tw-font-medium tw-whitespace-pre">Destination ID: </span>
          {object.destination_id}
        </div>
        <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
          <span className="tw-font-medium tw-whitespace-pre">Target Type: </span>
          {targetTypeToString(object.target_type)}
        </div>
        {object.target_type !== TargetType.Webhook && (
          <>
            <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
              <span className="tw-font-medium tw-whitespace-pre">Namespace: </span>
              {object.namespace}
            </div>
            <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
              <span className="tw-font-medium tw-whitespace-pre">Table Name: </span>
              {object.table_name}
            </div>
          </>
        )}
        {needsCursorField(object.sync_mode) && (
          <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
            <span className="tw-font-medium tw-whitespace-pre">Cursor Field: </span>
            {object.cursor_field}
          </div>
        )}
        {needsPrimaryKey(object.sync_mode) && (
          <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
            <span className="tw-font-medium tw-whitespace-pre">Primary Key: </span>
            {object.primary_key}
          </div>
        )}
        {needsEndCustomerId(object.target_type) && (
          <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
            <span className="tw-font-medium tw-whitespace-pre">End Customer ID Field: </span>
            {object.end_customer_id_field}
          </div>
        )}
        <div className="tw-flex tw-flex-row tw-items-center tw-text-base tw-mt-1">
          <span className="tw-font-medium tw-whitespace-pre">Frequency: </span>
          {object.frequency} {object.frequency_units}
        </div>
      </div>

      <div className="tw-font-bold tw-text-lg tw-mt-10 tw-mb-2">Object Fields</div>
      <div className="tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-lg tw-overflow-auto tw-overscroll-contain tw-shadow-md tw-w-1/2 tw-min-w-[400px]">
        <table className="tw-min-w-full tw-border-spacing-0 tw-divide-y tw-divide-slate-200">
          <thead className="tw-bg-slate-600 tw-text-white">
            <tr>
              <th scope="col" className={tableHeaderStyle}>
                Name
              </th>
              <th scope="col" className={tableHeaderStyle}>
                Type
              </th>
            </tr>
          </thead>
          <tbody className="tw-divide-y tw-divide-slate-200 tw-bg-white">
            {object.object_fields.map((objectField, index) => {
              return (
                <tr key={index} className="tw-cursor-pointer hover:tw-bg-slate-50">
                  <td className={tableCellStyle}>{objectField.name}</td>
                  <td className={tableCellStyle}>{objectField.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
