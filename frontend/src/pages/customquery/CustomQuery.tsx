import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { Tooltip } from '@nextui-org/react';
import { editor as EditorLib } from "monaco-editor/esm/vs/editor/editor.api";
import { useCallback, useEffect, useRef, useState } from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import { useNavigate, useParams } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from "src/components/button/Button";
import { Loading } from 'src/components/loading/Loading';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { ConnectionSelector } from "src/components/selector/Selector";
import { sendRequest } from "src/rpc/ajax";
import { AnalysisType, CreateAnalysis, CreateAnalysisRequest, DataConnection, GetAnalysis, QueryResults, RunQuery, RunQueryRequest, Schema, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { createResizeFunction } from 'src/utils/resize';

type QueryParams = {
  id: string,
};

export const CustomQuery: React.FC = () => {
  const { id } = useParams<QueryParams>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [query, setQuery] = useState<string>("");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [topPanelHeight, setTopPanelHeight] = useState<number>();
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const connectionID = connection ? connection.id : null;

  const createNewCustomQuery = useCallback(async () => {
    setLoading(true);
    const payload: CreateAnalysisRequest = { analysis_type: AnalysisType.CustomQuery };
    try {
      const response = await sendRequest(CreateAnalysis, payload);
      navigate(`/customquery/${response.analysis.id}`);
    } catch (e) {
      // TODO: handle error here
    }
    setLoading(false);
  }, [navigate]);

  const loadSavedCustomQuery = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await sendRequest(GetAnalysis, { analysisID: id });
      if (response.connection) {
        setConnection(response.connection);
      }

      if (response.analysis.query) {
        setQuery(response.analysis.query);
      }

    } catch (e) {
      // TODO: handle error here
    }
    setLoading(false);
  }, [setConnection, setQuery]);

  const updateCustomQuery = useCallback(async (id: number, updates: { connection?: DataConnection, query?: string; }) => {
    setSaving(true);
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.connection) {
      payload.connection_id = updates.connection.id;
    }

    if (updates.connection) {
      payload.connection_id = updates.connection.id;
    }

    if (updates.query) {
      payload.query = updates.query;
    }

    try {
      const response = await sendRequest(UpdateAnalysis, payload);
      setConnection(response.connection ? response.connection : null);
    } catch (e) {
      // TODO: handle error here
    }
    setSaving(false);
  }, []);

  useEffect(() => {
    // Reset state on new ID since data will be newly loaded
    setConnection(null);
    setQuery("");

    if (id === "new") {
      createNewCustomQuery();
    } else if (id != null) {
      loadSavedCustomQuery(id);
    } else {
      // TODO: use bugsnag here to record bad state
    }
  }, [id, createNewCustomQuery, loadSavedCustomQuery]);

  // Limit how much the top panel can be resized
  const setTopPanelHeightBounded = (height: number) => {
    if (height > 700) {
      setTopPanelHeight(700);
      return;
    }

    if (height < 100) {
      setTopPanelHeight(100);
      return;
    }

    setTopPanelHeight(height);
  };
  const startResize = createResizeFunction(topPanelRef, setTopPanelHeightBounded);

  const onConnectionSelected = (value: DataConnection) => {
    if (!connection || connection.id !== value.id) {
      setErrorMessage(null);
      setConnection(value);
      updateCustomQuery(Number(id), { connection: value });
    }
  };

  const updateQuery = () => {
    updateCustomQuery(Number(id), { query: query });
  };

  const runQuery = useCallback(async (id: number, connectionID: number | null, query: string) => {
    setLoading(true);
    setErrorMessage(null);

    // Save the query even if it can't be run
    updateCustomQuery(Number(id), { query: query });

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
      const response = await sendRequest(RunQuery, payload);
      if (response.success) {
        setSchema(response.schema);
        setQueryResults(response.query_results);
      } else {
        setErrorMessage(response.error_message);
        rudderanalytics.track(`run_query_processing_error`);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
      setSchema(null);
      setQueryResults(null);
    }

    setLoading(false);
  }, [updateCustomQuery]);

  // Hack to run the query since the Monaco editor will keep a memoized version of the runQuery function
  // that uses the first query passed to it.
  useEffect(() => {
    if (shouldRun) {
      setShouldRun(false);
      runQuery(Number(id), connectionID, query);
    }
  }, [id, connectionID, query, shouldRun, runQuery]);

  monaco.editor.defineTheme("fabra", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "predefined.sql", foreground: "#66d9ef", fontStyle: "bold" },
      { token: "operator.sql", foreground: "#ffffff" },
      { token: "keyword.sql", fontStyle: "bold" },
      { token: "identifier.sql", foreground: "#ffffff" },
      { token: "string.sql", foreground: "#8888ea" }
    ],
    colors: {
      'editor.lineHighlightBackground': '#2c2c2c',
    }
  });

  return (
    <>
      <QueryNavigation />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0" >
        <div className='tw-flex tw-flex-1 tw-min-w-0 tw-min-h-0'>
          <div id='left-panel' className="tw-w-80 tw-min-w-[20rem] tw-inline-block tw-select-none">
            <span className='tw-uppercase'>Data Source</span>
            <ConnectionSelector className="tw-mt-1 hover:tw-border-green-500" connection={connection} setConnection={onConnectionSelected} />
          </div>
          <div id='right-panel' className="tw-ml-10 tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1">
            <div id="top-panel" className="tw-h-[40%]" style={{ height: topPanelHeight + "px" }} ref={topPanelRef}>
              <MonacoEditor
                language="sql"
                theme="fabra"
                value={query}
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                  quickSuggestions: false,
                  contextmenu: false,
                  renderLineHighlight: "all",
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                }}
                onChange={setQuery}
                editorDidMount={(editor: EditorLib.IStandaloneCodeEditor) => {
                  editor.addAction({ id: "run query", label: "run query", keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], run: () => setShouldRun(true), });
                }}
              />
              <div id='resize-grabber' className='tw-relative'>
                <div className="tw-absolute tw-left-0 tw-right-0 tw-pt-[2px] tw-h-3 tw-cursor-row-resize" onMouseDown={startResize}>
                  <svg className="tw-mx-auto" xmlns="http://www.w3.org/2000/svg" width="36" viewBox="0 0 40 16" fill="none">
                    <path fill="#b2b2b2" d="M5.5 6.5C5.06667 6.5 4.70833 6.35833 4.425 6.075C4.14167 5.79167 4 5.43333 4 5C4 4.56667 4.14167 4.20833 4.425 3.925C4.70833 3.64167 5.06667 3.5 5.5 3.5H34.5C34.9333 3.5 35.2917 3.64167 35.575 3.925C35.8583 4.20833 36 4.56667 36 5C36 5.43333 35.8583 5.79167 35.575 6.075C35.2917 6.35833 34.9333 6.5 34.5 6.5H5.5ZM5.5 12.5C5.06667 12.5 4.70833 12.3583 4.425 12.075C4.14167 11.7917 4 11.4333 4 11C4 10.5667 4.14167 10.2083 4.425 9.925C4.70833 9.64167 5.06667 9.5 5.5 9.5H34.5C34.9333 9.5 35.2917 9.64167 35.575 9.925C35.8583 10.2083 36 10.5667 36 11C36 11.4333 35.8583 11.7917 35.575 12.075C35.2917 12.3583 34.9333 12.5 34.5 12.5H5.5Z" />
                  </svg>
                </div>
              </div>
            </div>
            <div id="bottom-panel" className='tw-h-[60%] tw-flex tw-flex-col tw-flex-1' style={{ height: "calc(100% - " + topPanelHeight + "px)" }}>
              <div className="tw-border-solid tw-border-gray-300 tw-border-x tw-p-[10px] tw-flex">
                <Tooltip color={"invert"} content={"⌘ + Enter"}>
                  <Button className="tw-w-40 tw-h-8" onClick={() => setShouldRun(true)}>{loading ? "Stop" : "Run"}</Button>
                </Tooltip>
                <Button className="tw-flex tw-justify-center tw-align-middle tw-ml-auto tw-w-24 tw-h-8 tw-bg-white tw-border-primary-text tw-text-primary-text hover:tw-bg-gray-200" onClick={updateQuery}>
                  {saving ? <Loading /> : <><SaveIcon className='tw-h-5 tw-inline tw-mr-1' />Save</>}
                </Button>
              </div>
              <div className="tw-mb-5 tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden tw-border-gray-300 tw-border-solid tw-border tw-bg-gray-100">
                {errorMessage &&
                  <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                    Error: {errorMessage}
                  </div>
                }
                <MemoizedResultsTable loading={loading} schema={schema} results={queryResults} />
              </div>
            </div>
          </div>
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
    <div className={"first:tw-ml-5 tw-cursor-pointer tw-inline-block tw-bg-white tw-w-32 tw-rounded-t-md tw-mt-1.5 tw-mb-0" + (active ? " tw-shadow-[0px_-2px_#4ade80]" : " tw-border-b tw-border-gray-200 tw-border-solid")}>
      <div className="tw-leading-[32px] tw-ml-3 tw-font-semibold tw-select-none">
        {children}
      </div>
    </div>
  );
};

const SaveIcon: React.FC<{ className?: string; }> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 48 48' className={className}>
      <path d="M42 13.85V39q0 1.2-.9 2.1-.9.9-2.1.9H9q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h25.15Zm-3 1.35L32.8 9H9v30h30ZM24 35.75q2.15 0 3.675-1.525T29.2 30.55q0-2.15-1.525-3.675T24 25.35q-2.15 0-3.675 1.525T18.8 30.55q0 2.15 1.525 3.675T24 35.75ZM11.65 18.8h17.9v-7.15h-17.9ZM9 15.2V39 9Z" />
    </svg>
  );
};