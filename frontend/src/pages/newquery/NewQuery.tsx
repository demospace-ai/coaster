import { useEffect, useRef, useState } from "react";
import { rudderanalytics } from "src/app/rudder";
import { Button } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, QueryResults, RunQuery, RunQueryRequest, Schema } from "src/rpc/api";
import { useLocalStorage } from "src/utils/localStorage";


export const NewQuery: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connection, setConnection] = useLocalStorage<DataConnection | null>("selectedConnection", null);
  const [query, setQuery] = useLocalStorage<string>("query", "");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }

    if (lineNumberRef.current) {
      lineNumberRef.current.style.height = "0px";
      const scrollHeight = lineNumberRef.current.scrollHeight;
      lineNumberRef.current.style.height = scrollHeight + "px";
    }
  }, [query]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.metaKey && event.key === 'Enter') {
      runQuery();
    }
  };

  const onConnectionSelected = (value: DataConnection) => {
    setErrorMessage(null);
    setConnection(value);
  };

  const runQuery = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!connection) {
      setErrorMessage("Data source is not set!");
      setLoading(false);
      return;
    }

    if (!query.trim()) {
      setErrorMessage("Query cannot be empty!");
      setLoading(false);
      return;
    }

    const payload: RunQueryRequest = {
      'connection_id': connection!.id,
      'query_string': query,
    };

    try {
      rudderanalytics.track("run_query.start");
      const response = await sendRequest(RunQuery, payload);
      rudderanalytics.track("run_query.success");
      setSchema(response.schema);
      setQueryResults(response.query_results);
    } catch (e) {
      console.log(e);
      rudderanalytics.track("run_query.error");
      setErrorMessage((e as Error).message);
      setSchema(null);
      setQueryResults(null);
    }

    setLoading(false);
  };

  const lines = query.split('\n');

  return (
    <div className="tw-p-10 tw-flex tw-min-w-0">
      <div className="tw-w-80 tw-min-w-[20rem] tw-inline-block">
        Data Source
        <ConnectionSelector connection={connection} setConnection={onConnectionSelected} />
      </div>
      <div className="tw-ml-10 tw-flex-1 tw-min-w-0 tw-min-h-0">
        <div className="tw-border-solid tw-border-slate-900 tw-border tw-border-b-0 tw-bg-slate-900 tw-h-60 tw-flex tw-overflow-scroll">
          <div ref={lineNumberRef} className="tw-pt-2 tw-w-10 tw-min-h-full tw-pl-4 tw-text-white tw-text-mono tw-text-xs tw-border-solid tw-border-gray-800 tw-border-r ">
            {lines.map((_, index) => (
              <div>
                <div className="tw-h-5 tw-leading-5 tw-pr-3 tw-text-right">{index + 1}</div>
              </div>
            ))}
          </div>
          <textarea
            ref={textAreaRef}
            className="tw-pt-2 tw-pl-2 tw-min-h-full tw-leading-[20px] tw-w-full focus:tw-outline-none tw-resize-none tw-overflow-y-hidden tw-font-mono tw-bg-slate-900 tw-text-white tw-whitespace-nowrap"
            value={query} onKeyDown={onKeyDown} onChange={e => setQuery(e.target.value)} placeholder="Select ..." />
        </div>
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-p-2">
          <Button className="tw-w-32 tw-h-8" onClick={runQuery}>{loading ? <Loading /> : "Run"}</Button>
        </div>
        <div className="tw-mt-5">
          <QueryResultsTable loading={loading} schema={schema} results={queryResults} />
        </div>
        {errorMessage &&
          <div className="tw-mt-5 tw-text-red-600 tw-font-bold">{errorMessage}</div>
        }
      </div>
    </div>
  );
};

type QueryResultsProps = {
  loading: boolean,
  schema: Schema | null,
  results: QueryResults | null,
};

const QueryResultsTable: React.FC<QueryResultsProps> = props => {
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
      <tr >
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