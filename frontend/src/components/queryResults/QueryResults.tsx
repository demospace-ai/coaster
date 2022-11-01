import classNames from "classnames";
import React from "react";
import { QueryResults, Schema } from "src/rpc/api";


type QueryResultsProps = {
  schema: Schema,
  results: QueryResults,
};

const QueryResultsTable: React.FC<QueryResultsProps> = props => {
  // TODO: implement pagination to not render too many results
  return (
    <div className="tw-overflow-auto tw-overscroll-contain tw-max-h-full" style={{ contain: "paint" }}>
      <table className="tw-text-xs">
        <ResultsSchema schema={props.schema} />
        <tbody className="tw-py-2">
          {
            props.results.map((resultRow, index) => {
              return (
                <tr key={index} className={classNames("even:tw-bg-gray-100 odd:tw-bg-white last:tw-border-b-0 tw-border-b tw-border-gray-300 tw-border-solid")}>
                  <td key={-1} className={classNames("tw-px-3 tw-py-2 tw-text-right tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r tw-tabular-nums")} >
                    <div className="tw-h-5 tw-whitespace-nowrap">{index + 1}</div>
                  </td>
                  {
                    resultRow.map((resultValue, valueIndex) => {
                      return (
                        <td key={valueIndex} className={classNames("tw-pl-3 tw-pr-5 tw-py-2 tw-text-left tw-border-gray-300 tw-border-solid tw-border-r last:tw-border-r-0 last:tw-w-full focus:tw-bg-blue-300")}>
                          <div className="tw-h-5 tw-whitespace-nowrap">{resultValue}</div>
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div >
  );
};

const ResultsSchema: React.FC<{ schema: Schema; }> = ({ schema }) => {
  return (
    <thead className="tw-sticky tw-top-0 tw-shadow-[0_0px_0.5px_1px] tw-shadow-gray-300">
      <tr>
        <th key={-1} scope="col" className="tw-pl-3 tw-pr-5 tw-py-2 tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r"></th>
        {
          schema.map((columnSchema, index) => {
            return (
              <th key={index} scope="col" className="tw-pl-3 tw-pr-5 tw-py-2 tw-text-left tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r last:tw-border-r-0">
                <div className="tw-h-5 tw-whitespace-nowrap">{columnSchema.name}</div>
              </th>
            );
          })
        }
      </tr>
    </thead>
  );
};

export const MemoizedResultsTable = React.memo(QueryResultsTable);