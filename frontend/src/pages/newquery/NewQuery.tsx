import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from "react";
import { rudderanalytics } from "src/app/rudder";
import { Button } from "src/components/button/Button";
import { ConnectionSelector } from "src/components/connectionSelector/ConnectionSelector";
import { QueryResultsTable } from 'src/components/queryResults/QueryResults';
import { sendRequest } from "src/rpc/ajax";
import { QueryResults, RunQuery, RunQueryRequest, Schema } from "src/rpc/api";
import { useLocalStorage } from "src/utils/localStorage";
import { createResizeFunction } from 'src/utils/resize';

export const NewQuery: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionID, setConnectionID] = useLocalStorage<number | null>("selectedConnectionID", null);
  const [query, setQuery] = useLocalStorage<string>("query", "");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const startResize = createResizeFunction(editorRef);

  // Automatically resize text area based on content
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

  const onConnectionSelected = (value: number) => {
    setErrorMessage(null);
    setConnectionID(value);
  };

  const runQuery = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!connectionID) {
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
      'connection_id': connectionID,
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
    <>
      <QueryNavigation />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-min-w-0">
        <div className="tw-w-80 tw-min-w-[20rem] tw-inline-block tw-select-none">
          Data Source
          <ConnectionSelector className="tw-mt-1" connectionID={connectionID} setConnectionID={onConnectionSelected} />
        </div>
        <div className="tw-ml-10 tw-flex-1 tw-min-w-0 tw-min-h-0">
          <div className="tw-relative ">
            <div ref={editorRef} className="tw-border-solid tw-border-slate-900 tw-border tw-border-b-0 tw-bg-slate-900 tw-h-80 tw-min-h-[200px] tw-max-h-[700px] tw-flex tw-overflow-scroll">
              <div ref={lineNumberRef} className="tw-pt-2 tw-w-10 tw-min-h-full tw-pl-4 tw-text-white tw-text-mono tw-text-xs tw-border-solid tw-border-gray-800 tw-border-r ">
                {lines.map((_, index) => (
                  <div key={index}>
                    <div className="tw-h-5 tw-leading-5 tw-pr-3 tw-text-right tw-select-none">{index + 1}</div>
                  </div>
                ))}
              </div>
              <textarea
                ref={textAreaRef}
                className="tw-pt-2 tw-pl-2 tw-min-h-full tw-leading-[20px] tw-w-full focus:tw-outline-none tw-resize-none tw-overflow-y-hidden tw-font-mono tw-bg-slate-900 tw-text-white tw-whitespace-nowrap"
                value={query} onKeyDown={onKeyDown} onChange={e => setQuery(e.target.value)} placeholder="Select ..."
              />
            </div>
            <div className="tw-absolute tw-left-0 tw-right-0 tw-pt-[2px]">
              <svg className="tw-mx-auto tw-cursor-grab" onMouseDown={startResize} xmlns="http://www.w3.org/2000/svg" width="36" viewBox="0 0 40 16" fill="none">
                <path fill="#b2b2b2" d="M5.5 6.5C5.06667 6.5 4.70833 6.35833 4.425 6.075C4.14167 5.79167 4 5.43333 4 5C4 4.56667 4.14167 4.20833 4.425 3.925C4.70833 3.64167 5.06667 3.5 5.5 3.5H34.5C34.9333 3.5 35.2917 3.64167 35.575 3.925C35.8583 4.20833 36 4.56667 36 5C36 5.43333 35.8583 5.79167 35.575 6.075C35.2917 6.35833 34.9333 6.5 34.5 6.5H5.5ZM5.5 12.5C5.06667 12.5 4.70833 12.3583 4.425 12.075C4.14167 11.7917 4 11.4333 4 11C4 10.5667 4.14167 10.2083 4.425 9.925C4.70833 9.64167 5.06667 9.5 5.5 9.5H34.5C34.9333 9.5 35.2917 9.64167 35.575 9.925C35.8583 10.2083 36 10.5667 36 11C36 11.4333 35.8583 11.7917 35.575 12.075C35.2917 12.3583 34.9333 12.5 34.5 12.5H5.5Z" />
              </svg>
            </div>
          </div>
          <div className="tw-border-solid tw-border-gray-200 tw-border tw-p-2">
            <Button tooltip={loading ? undefined : "⌘ + Enter"} className="tw-w-40 tw-h-8" onClick={runQuery}>{loading ? "Stop" : "Run"}</Button>
          </div>
          <div className="tw-mt-5">
            <QueryResultsTable loading={loading} schema={schema} results={queryResults} />
          </div>
          {errorMessage &&
            <div className="tw-mt-5 tw-text-red-600 tw-font-bold">{errorMessage}</div>
          }
        </div>
      </div>
    </>
  );
};

const QueryNavigation: React.FC = () => {
  return (
    <div className="tw-h-10 tw-bg-gray-200 tw-flex">
      <QueryNavigationTab active={true}>
        Query 1
      </QueryNavigationTab>
      <div className="tw-inline-block tw-mx-4 tw-my-2 tw-w-[1px] tw-bg-gray-400"></div>
      <QueryNavigationTab>
        New Chart
        <PlusCircleIcon className='tw-mt-[-2px] tw-ml-1.5 tw-h-4 tw-inline'></PlusCircleIcon>
      </QueryNavigationTab>
    </div >
  );
};

const QueryNavigationTab: React.FC<{ active?: boolean, children: React.ReactNode; }> = ({ active, children }) => {
  return (
    <div className={"first:tw-ml-5 tw-cursor-pointer tw-inline-block tw-bg-white tw-w-32 tw-rounded-t-md tw-mt-1.5 tw-mb-0" + (active ? " tw-border-t-2 tw-border-green-400 tw-border-solid" : " tw-border-b tw-border-gray-200 tw-border-solid")}>
      <div className="tw-leading-[32px] tw-ml-3 tw-font-semibold tw-select-none">
        {children}
      </div>
    </div>
  );
};