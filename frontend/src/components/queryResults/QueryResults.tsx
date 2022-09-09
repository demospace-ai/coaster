import { Loading } from "src/components/loading/Loading";
import { QueryResults, Schema } from "src/rpc/api";


type QueryResultsProps = {
  loading: boolean,
  schema: Schema | null,
  results: QueryResults | null,
};

export const QueryResultsTable: React.FC<QueryResultsProps> = props => {
  if (props.loading) {
    return <Loading />;
  }

  if (props.schema && props.results) {
    return (
      <div className="tw-overflow-auto tw-overscroll-contain tw-max-h-[500px] tw-border-gray-300 tw-border-solid tw-border-2">
        <table>
          <ResultsSchema schema={props.schema} />
          <tbody className="tw-py-2">
            {
              props.results.map((resultRow, index) => {
                return (
                  <tr key={index} className="even:tw-bg-gray-100">
                    <td key={-1} className="tw-px-3 tw-py-2 tw-text-right tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r tw-border-b-0 tw-tabular-nums">
                      {index + 1}
                    </td>
                    {resultRow.map((resultValue, valueIndex) => {
                      return (
                        <td key={valueIndex} className="tw-pl-3 tw-pr-5 tw-py-2 tw-text-left tw-border-gray-300 tw-border-solid tw-border-r tw-border-t last:tw-w-full focus:tw-bg-blue-300">
                          <div className="tw-h-5 tw-whitespace-nowrap">{resultValue}</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }

  return <>Run a query to see results</>;
};

const ResultsSchema: React.FC<{ schema: Schema; }> = ({ schema }) => {
  return (
    <thead className="tw-sticky">
      <tr>
        <th key={-1} scope="col" className="tw-pl-3 tw-pr-5 tw-py-2 tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r tw-border-b"></th>
        {
          schema.map((columnSchema, index) => {
            return (
              <th key={index} scope="col" className="tw-pl-3 tw-pr-5 tw-py-2 tw-text-left tw-bg-gray-100 tw-border-gray-300 tw-border-solid tw-border-r">
                <div className="tw-h-5 tw-whitespace-nowrap">{columnSchema.name}</div>
              </th>
            );
          })
        }
      </tr>
    </thead>
  );
};