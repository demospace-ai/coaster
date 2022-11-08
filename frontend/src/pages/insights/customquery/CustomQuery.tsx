import { Dialog, Transition } from "@headlessui/react";
import { CommandLineIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { editor as EditorLib } from "monaco-editor/esm/vs/editor/editor.api";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import { useParams } from 'react-router-dom';
import { rudderanalytics } from 'src/app/rudder';
import { Button } from "src/components/button/Button";
import { ReportHeader } from "src/components/insight/InsightComponents";
import { Loading } from 'src/components/loading/Loading';
import { ConfigureAnalysisModal } from 'src/components/modal/Modal';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { DatasetSelector, TableSelector } from "src/components/selector/Selector";
import { Tooltip } from 'src/components/tooltip/Tooltip';
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, QueryResult, RunCustomQuery, UpdateAnalysisRequest } from "src/rpc/api";
import { useAnalysis, useSchema } from "src/rpc/data";
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
export const CustomQuery: React.FC = () => {
  const { id } = useParams<QueryParams>();
  const { analysis, updateAnalysis } = useAnalysis(id);

  const [topPanelHeight, setTopPanelHeight] = useState<number>();
  const topPanelRef = useRef<HTMLDivElement>(null);

  const [queryResult, setQueryResult] = useState<QueryResult | undefined>(undefined);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSchemaExplorer, setShowSchemaExplorer] = useState<boolean>(false);

  const manualSave = useCallback(async () => {
    // Update the query immediately upon manual save
    if (analysis) {
      await updateAnalysis({ analysis_id: Number(id), query: analysis?.query });
    }
  }, [id, analysis, updateAnalysis]);

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

  const debouncedUpdate = useDebounce((payload: UpdateAnalysisRequest) => updateAnalysis(payload), 1500);
  const onQueryChange = useCallback((query: string) => {
    if (analysis) {
      analysis.query = query;
      debouncedUpdate({ analysis_id: Number(id), query: query });
    }
  }, [id, analysis, debouncedUpdate]);

  const runQuery = useCallback(async (id: number, query: string) => {
    setQueryLoading(true);
    setErrorMessage(null);

    // Save the query even if it can't be run
    await updateAnalysis({ analysis_id: Number(id), query: query });
    if (!query.trim()) {
      setErrorMessage("Query cannot be empty!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await sendRequest(RunCustomQuery, {
        'analysis_id': Number(id),
      });
      if (response.success) {
        setQueryResult(response);
      } else {
        setErrorMessage(response.error_message);
        rudderanalytics.track(`Custom Query Failed`);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
      // TODO: log datadog event here
    }

    setQueryLoading(false);
  }, [updateAnalysis]);

  // Hack to run the query since the Monaco editor will keep a stale version of the runQuery function
  useEffect(() => {
    if (shouldRun) {
      setShouldRun(false);
      runQuery(Number(id), analysis?.query ? analysis.query : "");
    }
  }, [id, analysis, shouldRun, runQuery]);

  if (!id) {
    return <Loading />;
  }

  if (!analysis) {
    return <Loading />;
  }

  return (
    <>
      <ConfigureAnalysisModal analysisID={id} show={showModal} close={() => setShowModal(false)} />
      <div className="tw-px-10 tw-pt-5 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0 tw-overflow-scroll" >
        <ReportHeader id={id} onSave={manualSave} showModal={() => setShowModal(true)} showSchemaExplorer={() => setShowSchemaExplorer(true)} />
        <div className='tw-flex tw-flex-1 tw-min-w-0 tw-min-h-0 tw-my-8'>
          <div id='left-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-grow">
            <div id="top-panel" className="tw-h-[30vh] tw-border tw-border-solid tw-border-gray-300 tw-p-2 tw-bg-dark tw-rounded-t-[4px] tw-shrink-0" style={{ height: topPanelHeight + "px" }} ref={topPanelRef}>
              <MonacoEditor
                language="sql"
                theme="fabra"
                value={analysis.query}
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
            <div id="results-panel" className="tw-pb-20 tw-mt-5">
              <span className='tw-uppercase tw-font-bold tw-select-none'>Results</span>
              <div className="tw-flex tw-flex-col tw-min-h-[120px] tw-max-h-96 tw-border tw-border-solid tw-border-gray-300 tw-mt-2 tw-rounded-[4px] tw-overflow-hidden">
                {errorMessage &&
                  <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                    Error: {errorMessage}
                  </div>
                }
                {queryLoading ?
                  <div className="tw-flex tw-justify-center tw-items-center tw-h-96">
                    <Loading />
                  </div>
                  :
                  queryResult ?
                    <MemoizedResultsTable schema={queryResult.schema} results={queryResult.data} />
                    :
                    <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-96 tw-select-none ">
                      <CommandLineIcon className="tw-h-10 tw-mb-1" />
                      <div className="tw-text-lg tw-font-medium">Run a query to see results!</div>
                      <div className="tw-mt-1">Once you run a query, the results will appear here.</div>
                    </div>
                }
              </div>
            </div>
          </div>
          <SchemaExplorer connection={analysis.connection} showSchemaExplorer={showSchemaExplorer} setShowSchemaExplorer={setShowSchemaExplorer} />
        </div>
      </div>
    </>
  );
};

type SchemaExplorerProps = {
  connection: DataConnection | undefined;
  showSchemaExplorer: boolean;
  setShowSchemaExplorer: (value: boolean) => void;
};

const SchemaExplorer: React.FC<SchemaExplorerProps> = props => {
  const { connection, showSchemaExplorer, setShowSchemaExplorer } = props;
  const [datasetName, setDatasetName] = useState<string | undefined>(undefined);
  const [tableName, setTableName] = useState<string | undefined>(undefined);

  const setDatasetAndClear = (datasetName: string) => {
    setDatasetName(datasetName);
    setTableName(undefined);
  };

  return (
    <Transition.Root show={showSchemaExplorer} as={Fragment}>
      <Dialog as="div" className="tw-relative tw-z-10" onClose={setShowSchemaExplorer}>
        <Transition.Child
          as={Fragment}
          enter="tw-ease-in-out tw-duration-500"
          enterFrom="tw-opacity-0"
          enterTo="tw-opacity-100"
          leave="tw-ease-in-out tw-duration-500"
          leaveFrom="tw-opacity-100"
          leaveTo="tw-opacity-0"
        >
          <div className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity" />
        </Transition.Child>
        <div className="tw-fixed tw-inset-0 tw-overflow-hidden">
          <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
            <div className="tw-pointer-events-none tw-fixed tw-inset-y-0 tw-right-0 tw-flex tw-max-w-full tw-pl-10">
              <Transition.Child
                as={Fragment}
                enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
                enterFrom="tw-translate-x-full"
                enterTo="tw-translate-x-0"
                leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-700"
                leaveFrom="tw-translate-x-0"
                leaveTo="tw-translate-x-full"
              >
                <Dialog.Panel className="tw-pointer-events-auto tw-w-screen tw-max-w-md">
                  <div className="tw-flex tw-h-full tw-flex-col tw-overflow-y-scroll tw-bg-white tw-py-6 tw-shadow-xl">
                    <div className="tw-px-4 sm:tw-px-6">
                      <div className="tw-flex tw-items-start tw-justify-between">
                        <Dialog.Title className="tw-text-lg tw-font-medium tw-text-gray-900 tw-select-none">Schema Explorer</Dialog.Title>
                        <div className="tw-ml-3 tw-flex tw-h-7 tw-items-center">
                          <div
                            className="tw-rounded-md tw-bg-white tw-text-gray-400 hover:tw-bg-gray-200 tw-cursor-pointer"
                            onClick={() => setShowSchemaExplorer(false)}
                          >
                            <span className="tw-sr-only">Close panel</span>
                            <XMarkIcon className="tw-h-6 tw-w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tw-relative tw-mt-6 tw-flex-1 tw-px-5">
                      <div id='schema-explorer' className="tw-flex tw-flex-col tw-flex-1 tw-select-none tw-border tw-border-solid tw-border-gray-300 tw-p-5 tw-rounded">
                        <div className='tw-text-xs tw-uppercase tw-select-none tw-mb-2'>Dataset</div>
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
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

type SchemaPreviewProps = {
  connectionID: number;
  datasetName: string;
  tableName: string;
};

const SchemaPreview: React.FC<SchemaPreviewProps> = props => {
  const { connectionID, datasetName, tableName } = props;
  const { schema } = useSchema(connectionID, datasetName, tableName);

  return (
    <div className="tw-overflow-scroll tw-flex-shrink tw-ml-1">
      {!schema ?
        <Loading className="tw-mt-5" />
        :
        <ul>
          {schema.map(columnSchema => (
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