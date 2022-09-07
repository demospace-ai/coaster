import { useState } from "react";
import { rudderanalytics } from "src/app/rudder";
import { Button } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, QueryResults, RunQuery, RunQueryRequest, Schema } from "src/rpc/api";
import { useLocalStorage } from "src/utils/localStorage";


export const NewQuery: React.FC = () => {
  const [connection, setConnection] = useLocalStorage<DataConnection | null>("selectedConnection", null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);

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
      rudderanalytics.track("run_query.error");
      setErrorMessage((e as Error).message);
      setSchema(null);
      setQueryResults(null);
    }

    setLoading(false);
  };

  return (
    <div className="tw-p-10 tw-flex tw-min-w-0">
      <div className="tw-w-80 tw-min-w-[20rem] tw-inline-block">
        Data Source
        <ConnectionSelector connection={connection} setConnection={onConnectionSelected} />
      </div>
      <div className="tw-ml-10 tw-flex-1 tw-min-w-0 tw-min-h-0">
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-border-b-0">
          <textarea value={query} onKeyDown={onKeyDown} onChange={e => setQuery(e.target.value)} className="tw-w-full tw-h-60 focus:tw-outline-none tw-resize-none tw-p-2 tw-font-mono" placeholder="Select ..." />
        </div>
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-p-2">
          <Button className="tw-w-32" onClick={runQuery}>Run</Button>
        </div>
        <div className="tw-mt-5 tw-w-full tw-overflow-auto tw-overscroll-contain tw-h-[500px]">
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
  // TODO: display this nicely

  if (props.loading) {
    return <Loading />;
  }

  if (props.schema && props.results) {
    return (
      <table className="">
        <ResultsSchema schema={props.schema} />
        <tbody className="tw-py-2">
          {
            props.results.map(resultRow => {
              return <tr>
                {resultRow.map(resultValue => {
                  return <td className="tw-px-6 tw-py-3 tw-text-left"><div className="tw-h-8 tw-whitespace-nowrap">{resultValue}</div></td>;
                })}
              </tr>;
            })
          }
        </tbody>
      </table>
    );
  }

  return <>Run a query to see results</>;
};

const ResultsSchema: React.FC<{ schema: Schema; }> = ({ schema }) => {
  return (
    <thead>
      <tr>
        {
          schema.map(columnSchema => {
            return <th scope="col" className="tw-px-6 tw-py-3 tw-text-left"><div className="tw-h-8">{columnSchema.name}</div></th>;
          })
        }
      </tr>
    </thead>
  );
};