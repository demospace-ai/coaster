import { useState } from "react";
import { rudderanalytics } from "src/app/rudder";
import { Button } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { Loading } from "src/components/loading/Loading";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, JSONArray, RunQuery, RunQueryRequest, Schema } from "src/rpc/api";


export const NewQuery: React.FC = () => {
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<JSONArray | null>(null);

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
    <div className="tw-m-10 tw-flex">
      <div className="tw-w-96 tw-inline-block">
        Data Source
        <ConnectionSelector connection={connection} setConnection={onConnectionSelected} />
      </div>
      <div className="tw-ml-10 tw-flex-grow">
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-border-b-0">
          <textarea value={query} onChange={e => setQuery(e.target.value)} className="tw-w-full tw-h-60 focus:tw-outline-none tw-resize-none tw-p-2 tw-font-mono" placeholder="Select ..." />
        </div>
        <div className="tw-border-solid tw-border-gray-200 tw-border tw-p-2">
          <Button className="tw-w-32" onClick={runQuery}>Run</Button>
        </div>
        <div className="tw-mt-5">
          <QueryResults loading={loading} schema={schema} results={queryResults} />
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
  results: JSONArray | null,
};

const QueryResults: React.FC<QueryResultsProps> = props => {
  if (props.loading) {
    return <Loading />;
  }

  if (props.schema && props.results) {
    return (
      <>
        <div>{JSON.stringify(props.schema)}</div>
        {
          props.results.map(result => {
            return <div>{result.toString()}</div>;
          })
        }
      </>
    );
  }

  return <>Run a query to see results</>;
};