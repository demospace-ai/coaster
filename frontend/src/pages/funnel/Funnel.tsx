import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { FunnelIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@nextui-org/react';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { SaveIcon } from 'src/components/icons/Icons';
import { Loading } from 'src/components/loading/Loading';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { ConnectionSelector, EventSelector, EventSetSelector } from "src/components/selector/Selector";
import { getEvents, runFunnelQuery } from 'src/queries/queries';
import { sendRequest } from 'src/rpc/ajax';
import { AnalysisType, CreateAnalysis, CreateAnalysisRequest, DataConnection, EventSet, GetAnalysis, QueryResults, Schema, toCsvData, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";

type FunnelParams = {
  id: string,
};

type FunnelUpdates = {
  connection?: DataConnection,
  eventSet?: EventSet,
  steps?: string[],
};

/*

TODO: tests

- updating connection should clear event set and steps
- updating event set should clear steps
- should request event set once when connection changes
- should request events once when event set or connection changes
- should not trigger update if the object changes but the ID does not
- should not trigger update on load

*/
export const Funnel: React.FC = () => {
  const { id } = useParams<FunnelParams>();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [eventSet, setEventSet] = useState<EventSet | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);
  const hasResults = schema !== null && queryResults !== null;

  const createNewFunnel = useCallback(async () => {
    setInitialLoading(true);
    const payload: CreateAnalysisRequest = { analysis_type: AnalysisType.Funnel };
    try {
      const response = await sendRequest(CreateAnalysis, payload);
      navigate(`/funnel/${response.analysis.id}`);
    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, [navigate]);

  const loadSavedFunnel = useCallback(async (id: string) => {
    setInitialLoading(true);
    try {
      const response = await sendRequest(GetAnalysis, { analysisID: id });
      if (response.connection) {
        setConnection(response.connection);
      }

      if (response.event_set) {
        setEventSet(response.event_set);
      }

      if (response.analysis.funnel_steps) {
        setSteps(response.analysis.funnel_steps.map(step => step.step_name));
      }

    } catch (e) {
      // TODO: handle error here
    }
    setInitialLoading(false);
  }, []);

  const updateFunnel = useCallback(async (id: number, updates: FunnelUpdates) => {
    const payload: UpdateAnalysisRequest = { analysis_id: Number(id) };
    if (updates.connection) {
      payload.connection_id = updates.connection.id;
    }

    if (updates.eventSet) {
      payload.event_set_id = updates.eventSet.id;
    }

    if (updates.steps) {
      payload.step_names = updates.steps;
    }

    try {
      const response = await sendRequest(UpdateAnalysis, payload);
      setConnection(response.connection ? response.connection : null);
      setEventSet(response.event_set ? response.event_set : null);
      setSteps(response.analysis.funnel_steps ? response.analysis.funnel_steps.map(step => step.step_name) : []);
    } catch (e) {
      // TODO: handle error here
    }
  }, []);

  const updateAllProperties = async () => {
    setSaving(true);
    const updates: FunnelUpdates = {};
    if (connection) {
      updates.connection = connection;
    }

    if (eventSet) {
      updates.eventSet = eventSet;
    }

    if (steps) {
      updates.steps = steps;
    }

    await updateFunnel(Number(id), updates);
    setSaving(false);
  };

  useEffect(() => {
    // Reset state on new ID since data will be newly loaded
    setConnection(null);
    setEventSet(null);
    setSteps([]);

    if (id === "new") {
      createNewFunnel();
    } else if (id != null) {
      loadSavedFunnel(id);
    } else {
      // TODO: use bugsnag here to record bad state
    }
  }, [id, createNewFunnel, loadSavedFunnel]);

  const onConnectionSelected = useCallback((value: DataConnection) => {
    if (!connection || connection.id !== value.id) {
      setErrorMessage(null);
      setConnection(value);
      updateFunnel(Number(id), { connection: value });
    }
  }, [id, connection, updateFunnel]);

  const onEventSetSelected = useCallback((value: EventSet) => {
    if (!eventSet || eventSet.id !== value.id) {
      setErrorMessage(null);
      setEventSet(value);
      updateFunnel(Number(id), { eventSet: value });
    }
  }, [id, eventSet, updateFunnel]);

  const onEventSelected = useCallback((value: string, index: number) => {
    if (steps[index] !== value) {
      setErrorMessage(null);
      const updatedSteps: string[] = [...steps];
      updatedSteps[index] = value;
      setSteps(updatedSteps);
      updateFunnel(Number(id), { steps: updatedSteps });
    }
  }, [id, steps, updateFunnel]);

  const onEventRemoved = useCallback((index: number) => {
    setErrorMessage(null);
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    updateFunnel(Number(id), { steps: updatedSteps });
  }, [id, steps, updateFunnel]);

  const onEventAdded = useCallback((value: string) => {
    setErrorMessage(null);
    const updatedSteps = [...steps, value];
    setSteps(updatedSteps);
    updateFunnel(Number(id), { steps: updatedSteps });
  }, [id, steps, updateFunnel]);

  const runQuery = async () => {
    setQueryLoading(true);
    setErrorMessage(null);

    if (!connection) {
      setErrorMessage("Data source is not set!");
      setQueryLoading(false);
      return;
    }

    if (!eventSet) {
      setErrorMessage("Event set is not set!");
      setQueryLoading(false);
      return;
    }

    if (steps.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setQueryLoading(false);
      return;
    }

    try {
      const response = await runFunnelQuery(connection.id, eventSet, steps);
      if (response.success) {
        setSchema(response.schema);
        setQueryResults(response.query_results);
      } else {
        setErrorMessage(response.error_message);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
    }

    setQueryLoading(false);
  };

  if (shouldRun) {
    runQuery();
    setShouldRun(false);
  }

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="tw-px-10 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0" >
      <div className='tw-flex tw-flex-1 tw-min-w-0 tw-min-h-0'>
        <div id='left-panel' className="tw-w-96 tw-min-w-[20rem] tw-inline-block tw-select-none tw-pt-8">
          <div className='tw-mt-[2px]'>
            <span className='tw-uppercase tw-font-bold'>Data Source</span>
            <ConnectionSelector className="tw-mt-1 hover:tw-border-green-500" connection={connection} setConnection={onConnectionSelected} />
          </div>
          <div className='tw-mt-5'>
            <span className='tw-uppercase  tw-font-bold'>Event Set</span>
            <EventSetSelector className="tw-mt-1 hover:tw-border-green-500" connection={connection} eventSet={eventSet} setEventSet={onEventSetSelected} />
          </div>
          <div className='tw-mt-5'>
            <Steps connectionID={connection ? connection.id : null} eventSetID={eventSet ? eventSet.id : null} steps={steps} onEventSelected={onEventSelected} onEventAdded={onEventAdded} onEventRemoved={onEventRemoved} />
          </div>
          <Tooltip className='tw-mt-10' color={"invert"} content={"⌘ + Enter"}>
            <Button className="tw-w-40 tw-h-8" onClick={runQuery}>{queryLoading ? "Stop" : "Run"}</Button>
          </Tooltip>
        </div>
        <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-10 tw-my-8 tw-border-gray-300 tw-border-solid tw-border tw-rounded-md">
          <div id="top-panel" className="tw-p-4 tw-pl-5 tw-border-gray-300 tw-border-solid tw-border-b tw-flex tw-select-none">
            <span className='tw-text-lg tw-font-bold'>
              Results
            </span>
            <div className='tw-flex tw-ml-auto'>
              <Tooltip className="tw-select-none" color={"invert"} content={hasResults ? '' : "You must run the query to fetch results before exporting."}>
                <CSVLink
                  className={classNames(
                    'tw-flex tw-rounded-md tw-font-bold tw-py-1 tw-tracking-wide tw-justify-center tw-align-middle tw-ml-2 tw-w-36 tw-h-8 tw-bg-white tw-border tw-border-solid tw-border-primary-text tw-text-primary-text hover:tw-bg-gray-200',
                    hasResults ? null : 'tw-bg-gray-300 tw-text-gray-500 tw-border-0 tw-cursor-not-allowed hover:tw-bg-gray-300'
                  )}
                  data={toCsvData(schema, queryResults)}
                  filename={`funnel_${id}_results.csv`} // TODO: use saved name
                  onClick={() => hasResults} // prevent download if there are no results
                >
                  <ArrowDownTrayIcon className='tw-h-5 tw-inline tw-mr-1' />
                  Export CSV
                </CSVLink>
              </Tooltip>
              <Button className="tw-flex tw-justify-center tw-align-middle tw-ml-3 tw-w-24 tw-h-8 tw-bg-white tw-border-primary-text tw-text-primary-text hover:tw-bg-gray-200" onClick={updateAllProperties}>
                {saving ? <Loading /> : <><SaveIcon className='tw-h-5 tw-inline tw-mr-1' />Save</>}
              </Button>
            </div>
          </div>
          <div id="bottom-panel" className='tw-flex tw-flex-col tw-flex-1'>
            <div className="tw-mb-5 tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
              {errorMessage &&
                <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                  Error: {errorMessage}
                </div>
              }
              <MemoizedResultsTable loading={queryLoading} schema={schema} results={queryResults} placeholder="Choose two or more steps to see results!" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type StepsProps = {
  connectionID: number | null;
  eventSetID: number | null;
  steps: string[];
  onEventSelected: (event: string, index: number) => void;
  onEventAdded: (event: string) => void;
  onEventRemoved: (index: number) => void;
};

const Steps: React.FC<StepsProps> = props => {
  const { connectionID, eventSetID, steps, onEventSelected, onEventAdded, onEventRemoved } = props;
  const [eventOptions, setEventOptions] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!connectionID || !eventSetID) {
      return;
    }

    setLoading(true);
    let ignore = false;
    getEvents(connectionID, eventSetID).then((results) => {
      if (!ignore) {
        setEventOptions(results);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [connectionID, eventSetID]);

  return (
    <>
      <span className='tw-uppercase tw-font-bold'>Steps</span>
      <div className='tw-mt-1'>
        {steps.map((event, index) =>
          <Step key={index} connectionID={connectionID} eventSetID={eventSetID} event={event} setEvent={(event) => onEventSelected(event, index)} eventOptions={eventOptions} loading={loading} removeEvent={() => onEventRemoved(index)} />
        )}
        <Step connectionID={connectionID} eventSetID={eventSetID} event={null} setEvent={onEventAdded} eventOptions={eventOptions} loading={loading} removeEvent={() => null} />
      </div>
    </>
  );
};

type StepProp = {
  connectionID: number | null;
  eventSetID: number | null;
  event: string | null;
  eventOptions: string[] | undefined;
  setEvent: (event: string) => void;
  removeEvent: () => void;
  loading: boolean;
};

const Step: React.FC<StepProp> = props => {
  const { connectionID, eventSetID, event, eventOptions, setEvent, removeEvent, loading } = props;
  return (
    <div className='tw-flex tw-items-center tw-mt-[-1px] tw-p-4 tw-border tw-border-solid tw-border-gray-300 first:tw-rounded-t-md last:tw-rounded-b-md'>
      <EventSelector className="hover:tw-border-green-500" connectionID={connectionID} eventSetID={eventSetID} event={event} setEvent={setEvent} eventOptions={eventOptions} loading={loading} controlled={true} />
      <div className='tw-p-1 tw-ml-2 hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md'>
        <FunnelIcon className='tw-h-6 tw-stroke-[1.7]' />
      </div>
      <div className='tw-p-1 tw-ml-[1px] hover:tw-bg-gray-200 tw-cursor-pointer tw-rounded-md'>
        <TrashIcon className='tw-h-6 tw-stroke-[1.7]' onClick={removeEvent} />
      </div>
    </div>
  );
};