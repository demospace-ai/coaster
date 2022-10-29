import { Transition } from "@headlessui/react";
import { editor as EditorLib } from "monaco-editor/esm/vs/editor/editor.api";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import { useNavigate, useParams } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from "src/components/button/Button";
import { BoxLeftIcon, BoxRightIcon } from "src/components/icons/Icons";
import { ReportHeader } from "src/components/insight/InsightComponents";
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { useSelector } from 'src/root/model';
import { sendRequest } from "src/rpc/ajax";
import { AnalysisType, CreateAnalysis, CreateAnalysisRequest, DataConnection, GetAnalysis, GetSchema, GetSchemaRequest, QueryResults, RunCustomQuery, RunCustomQueryRequest, Schema, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";
import { useDebounce } from 'src/utils/debounce';
import { createResizeFunction } from 'src/utils/resize';

type QueryParams = {
  id: string,
};

/*

TODO: tests

- updating connection should not clear query
- should only trigger one update for a string of changes within 1.5 seconds
- should not trigger update if the connection object changes but the ID does not
- should not trigger update on load
- should not trigger update when setting the query after the first load

*/
export const CustomQuery: React.FC<{ setHeaderTitle: (title: string | undefined) => void; }> = ({ setHeaderTitle }) => {
  const { id } = useParams<QueryParams>();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [topPanelHeight, setTopPanelHeight] = useState<number>();
  const topPanelRef = useRef<HTMLDivElement>(null);

  const defaultConnectionID = useSelector(state => state.login.organization?.default_data_connection_id);
  const [connection, setConnection] = useState<DataConnection | undefined>(undefined);
  const connectionID = connection?.id;
  const [datasetName, setDatasetName] = useState<string | undefined>(undefined);
  const [tableName, setTableName] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);

  const [query, setQuery] = useState<string>("");
  const [schema, setSchema] = useState<Schema | undefined>(undefined);
  const [queryResults, setQueryResults] = useState<QueryResults | undefined>(undefined);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [shouldSave, setShouldSave] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const setTitleAndHeader = useCallback((title: string | undefined) => {
    setTitle(title);
    setHeaderTitle(title);
  }, [setHeaderTitle]);

  const setConnectionAndClear = (dataConnection: DataConnection) => {
    setConnection(dataConnection);
    setDatasetName(undefined);
    setTableName(undefined);
  };

  const setDatasetAndClear = (datasetName: string) => {
    setDatasetName(datasetName);
    setTableName(undefined);
  };

  // TODO: what should we do if no default connection ID is configured?
  const createNewCustomQuery = useCallback(async () => {
    setInitialLoading(true);
    const payload: CreateAnalysisRequest = {
      connection_id: defaultConnectionID,
      analysis_type: AnalysisType.CustomQuery,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const response = await sendRequest(CreateAnalysis, payload);
      navigate(`/customquery/${response.analysis.id}`);
    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, [navigate, defaultConnectionID]);

  const loadSavedCustomQuery = useCallback(async (id: string) => {
    setInitialLoading(true);
    try {
      const response = await sendRequest(GetAnalysis, { analysisID: id });
      setTitleAndHeader(response.analysis.title);
      if (response.connection) {
        setConnection(response.connection);
      }
      if (response.analysis.query) {
        setQuery(response.analysis.query);
      }
    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, [setQuery, setTitleAndHeader]);

  const updateCustomQuery = useCallback(async (id: number, updates: { query?: string; }) => {
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.query) {
      payload.query = updates.query;
    }

    try {
      await sendRequest(UpdateAnalysis, payload);
    } catch (e) {
      // TODO: handle error here
    }
  }, []);

  useEffect(() => {
    // Reset state on new ID since data will be newly loaded
    setQuery("");
    setQueryResults(undefined);
    setSchema(undefined);
    setTitleAndHeader(undefined);

    if (id === "new") {
      createNewCustomQuery();
    } else if (id != null) {
      loadSavedCustomQuery(id);
    } else {
      // TODO: use bugsnag here to record bad state
    }
  }, [id, createNewCustomQuery, loadSavedCustomQuery, setTitleAndHeader]);

  // Limit how much the top panel can be resized
  const setTopPanelHeightBounded = (height: number) => {
    if (height > 714) {
      setTopPanelHeight(714);
      return;
    }

    if (height < 100) {
      setTopPanelHeight(100);
      return;
    }

    setTopPanelHeight(height);
  };
  const startResize = createResizeFunction(topPanelRef, setTopPanelHeightBounded);

  const debouncedUpdate = useDebounce((id: number, query: string) => updateCustomQuery(id, { query: query }), 1500);
  const onQueryChange = useCallback((query: string) => {
    setQuery(query);
    debouncedUpdate(Number(id), query);
  }, [id, debouncedUpdate]);

  const runQuery = useCallback(async (id: number, query: string) => {
    setQueryLoading(true);
    setErrorMessage(null);

    // Save the query even if it can't be run
    await updateCustomQuery(Number(id), { query: query });
    if (!query.trim()) {
      setErrorMessage("Query cannot be empty!");
      setQueryLoading(false);
      return;
    }

    const payload: RunCustomQueryRequest = {
      'analysis_id': Number(id),
    };

    try {
      const response = await sendRequest(RunCustomQuery, payload);
      if (response.success) {
        setSchema(response.schema);
        setQueryResults(response.query_results);
      } else {
        setErrorMessage(response.error_message);
        rudderanalytics.track(`run_query_processing_error`);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
      setSchema(undefined);
      setQueryResults(undefined);
    }

    setQueryLoading(false);
  }, [updateCustomQuery]);

  // Hack to run/save the query since the Monaco editor will keep a memoized version of the runQuery function
  // that uses the first query passed to it.
  useEffect(() => {
    if (shouldRun) {
      setShouldRun(false);
      runQuery(Number(id), query);
    }

    if (shouldSave) {
      setShouldSave(false);
      // Only set saving state (and therefore UI feedback) if user interfaction triggered the save
      setSaving(true);
      updateCustomQuery(Number(id), { query: query });
      setSaving(false);
    }
  }, [id, connectionID, query, shouldRun, shouldSave, runQuery, updateCustomQuery]);

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
      'editor.background': '#161b22',
      'editor.lineHighlightBackground': '#2c2c2c',
    }
  });

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 1200);
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <>
      <ConfigureAnalysisModal analysisID={Number(id)} analysisType={AnalysisType.CustomQuery} connection={connection} setConnection={setConnectionAndClear} eventSet={undefined} setEventSet={() => undefined} show={showModal} close={() => setShowModal(false)} />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll" >
        <ReportHeader title={title} setTitle={setTitleAndHeader} description={description} setDescription={setDescription} copied={copied} saving={saving} copyLink={copyLink} save={() => setShouldSave(true)} showModal={() => setShowModal(true)} />
        <div className='tw-flex tw-flex-1 tw-min-w-0 tw-min-h-0 tw-my-8'>
          <div id='left-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-grow">
            <div id="top-panel" className="tw-h-[30vh] tw-border tw-border-solid tw-border-gray-300 tw-p-2 tw-bg-dark tw-rounded-t-[4px] tw-shrink-0" style={{ height: topPanelHeight + "px" }} ref={topPanelRef}>
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
                onChange={onQueryChange}
                editorDidMount={(editor: EditorLib.IStandaloneCodeEditor) => {
                  editor.addAction({ id: "run query", label: "run query", keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter], run: () => setShouldRun(true), });
                  editor.addAction({ id: "save query", label: "save query", keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], run: () => setShouldSave(true), });
                }}
              />
              <div id='resize-grabber' className='tw-relative'>
                <div className="tw-absolute tw-left-0 tw-right-0 tw-pt-3 tw-h-3 tw-cursor-row-resize" onMouseDown={startResize}>
                  <svg className="tw-mx-auto" xmlns="http://www.w3.org/2000/svg" width="36" viewBox="0 0 40 16" fill="none">
                    <path fill="#b2b2b2" d="M5.5 6.5C5.06667 6.5 4.70833 6.35833 4.425 6.075C4.14167 5.79167 4 5.43333 4 5C4 4.56667 4.14167 4.20833 4.425 3.925C4.70833 3.64167 5.06667 3.5 5.5 3.5H34.5C34.9333 3.5 35.2917 3.64167 35.575 3.925C35.8583 4.20833 36 4.56667 36 5C36 5.43333 35.8583 5.79167 35.575 6.075C35.2917 6.35833 34.9333 6.5 34.5 6.5H5.5ZM5.5 12.5C5.06667 12.5 4.70833 12.3583 4.425 12.075C4.14167 11.7917 4 11.4333 4 11C4 10.5667 4.14167 10.2083 4.425 9.925C4.70833 9.64167 5.06667 9.5 5.5 9.5H34.5C34.9333 9.5 35.2917 9.64167 35.575 9.925C35.8583 10.2083 36 10.5667 36 11C36 11.4333 35.8583 11.7917 35.575 12.075C35.2917 12.3583 34.9333 12.5 34.5 12.5H5.5Z" />
                  </svg>
                </div>
              </div>
            </div>
            <div id="resize-panel" className="tw-rounded-b-[4px] tw-border-x tw-border-b tw-border-solid tw-border-gray-300">
              <div className="tw-p-[10px] tw-flex">
                <Tooltip label="⌘ + Enter">
                  <Button className="tw-w-40 tw-h-8 tw-ml-auto" onClick={() => setShouldRun(true)}>{queryLoading ? "Stop" : "Run"}</Button>
                </Tooltip>
              </div>
            </div>
            <div className="tw-pb-20 tw-mt-5">
              <span className='tw-uppercase tw-font-bold tw-select-none'>Results</span>
              <div className="tw-flex tw-h-96 tw-border tw-border-solid tw-border-gray-300 tw-mt-2 tw-bg-gray-200 tw-rounded-[4px] tw-overflow-hidden">
                {errorMessage &&
                  <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                    Error: {errorMessage}
                  </div>
                }
                <MemoizedResultsTable loading={queryLoading} schema={schema} results={queryResults} />
              </div>
            </div>
          </div>
          <SchemaExplorer connection={connection} datasetName={datasetName} tableName={tableName} setDatasetAndClear={setDatasetAndClear} setTableName={setTableName} />
        </div>
      </div>
    </>
  );
};

type SchemaExplorerProps = {
  connection: DataConnection | undefined;
  datasetName: string | undefined;
  tableName: string | undefined;
  setDatasetAndClear: (datasetName: string) => void;
  setTableName: (datasetName: string) => void;
};

const SchemaExplorer: React.FC<SchemaExplorerProps> = props => {
  const { connection, datasetName, tableName, setDatasetAndClear, setTableName } = props;
  const [showSchemaExplorer, setShowSchemaExplorer] = useState<boolean>(true);
  const [showExpand, setShowExpand] = useState<boolean>(false);

  return (
    <>
      <Transition
        as={Fragment}
        show={showSchemaExplorer}
        enter="tw-transition tw-ease-out tw-duration-250"
        enterFrom="tw-transform tw-opacity-0 tw-scale-85"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-150"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        afterLeave={() => setShowExpand(true)}
      >
        <div id='right-panel' className="tw-w-96 tw-min-w-[384px] tw-flex tw-flex-col tw-select-none tw-border tw-border-solid tw-border-gray-300 tw-p-5 tw-rounded tw-ml-10">
          <div className="tw-font-semibold tw-text-lg -tw-mt-1 tw-mb-2 tw-flex tw-flex-row tw-justify-center tw-items-center">
            Schema Explorer
            <div className="tw-p-1 tw-rounded-md hover:tw-bg-gray-200 tw-ml-auto tw-cursor-pointer" onClick={() => setShowSchemaExplorer(false)}>
              <BoxRightIcon className="tw-h-5" />
            </div>
          </div>
          <div className='tw-text-xs tw-uppercase tw-select-none tw-mt-4 tw-mb-2'>Dataset</div>
          <DatasetSelector connection={connection} datasetName={datasetName} setDatasetName={setDatasetAndClear} />
          <div className='tw-text-xs tw-uppercase tw-select-none tw-mt-4 tw-mb-2'>Table</div>
          <TableSelector connection={connection} datasetName={datasetName} tableName={tableName} setTableName={setTableName} />
          {connection && datasetName && tableName &&
            <>
              <div className="tw-mt-5 tw-pt-3 tw-border-t tw-border-solid tw-border-gray-300" />
              <div className='tw-text-sm tw-font-semibold tw-select-none tw-mb-2'>{tableName}</div>
              <SchemaPreview connectionID={connection.id} datasetName={datasetName} tableName={tableName} />
            </>
          }
        </div>
      </Transition>
      <Transition
        as={Fragment}
        show={showExpand}
        afterLeave={() => setShowSchemaExplorer(true)}
      >
        <div className="tw-flex tw-flex-col tw-justify-center tw-items-center hover:tw-bg-gray-200 tw-ml-2 tw-px-2 tw-cursor-pointer tw-rounded" onClick={() => setShowExpand(false)}>
          <BoxLeftIcon className="tw-h-5" />
        </div>
      </Transition>
    </>
  );
};

type SchemaPreviewProps = {
  connectionID: number;
  datasetName: string;
  tableName: string;
};

const SchemaPreview: React.FC<SchemaPreviewProps> = props => {
  const { connectionID, datasetName, tableName } = props;
  const [schema, setSchema] = useState<Schema | undefined>(undefined);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  useEffect(() => {
    setSchemaLoading(true);
    let payload: GetSchemaRequest = {
      connectionID: connectionID,
      datasetID: datasetName,
      tableName: tableName,
    };

    let ignore = false;
    sendRequest(GetSchema, payload).then((results) => {
      if (!ignore) {
        setSchema(results.schema);
        setSchemaLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [connectionID, datasetName, tableName]);

  return (
    <div className="tw-overflow-scroll tw-flex-shrink tw-ml-1">
      {schemaLoading ?
        <Loading className="tw-mt-5" />
        :
        <ul>
          {schema?.map(columnSchema => (
            <li className="tw-whitespace-nowrap tw-flex tw-flex-row tw-my-0.5">
              <div className="tw-uppercase tw-pr-16 tw-select-text">
                {columnSchema.name}
              </div>
              <div className="tw-uppercase tw-ml-auto tw-text-gray-500">
                {columnSchema.type}
              </div>
            </li>
          ))}
        </ul>
      }
    </div>
  );
};