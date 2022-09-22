import { Tooltip } from '@nextui-org/react';
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { ConnectionSelector, EventSelector, EventSetSelector } from "src/components/selector/Selector";
import { getEvents, runFunnelQuery } from 'src/queries/queries';
import { sendRequest } from 'src/rpc/ajax';
import { AnalysisType, CreateAnalysis, CreateAnalysisRequest, DataConnection, EventSet, GetAnalysis, QueryResults, Schema, UpdateAnalysis, UpdateAnalysisRequest } from "src/rpc/api";

type FunnelParams = {
  id: string,
};

export const Funnel: React.FC = () => {
  const { id } = useParams<FunnelParams>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [eventSet, setEventSet] = useState<EventSet | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);

  const createNewFunnel = useCallback(async () => {
    setLoading(true);
    const payload: CreateAnalysisRequest = { analysis_type: AnalysisType.Funnel };
    try {
      const response = await sendRequest(CreateAnalysis, payload);
      navigate(`/funnel/${response.analysis.id}`);
    } catch (e) {
      // TODO: handle error here
    }
    setLoading(false);
  }, [navigate]);

  const loadSavedFunnel = useCallback(async (id: string) => {
    setLoading(true);
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
    setLoading(false);
  }, []);

  const updateFunnel = useCallback(async (id: number, updates: { connection?: DataConnection, eventSet?: EventSet, steps?: string[]; }) => {
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

  const onEventAdded = useCallback((value: string) => {
    setErrorMessage(null);
    const updatedSteps = [...steps, value];
    setSteps(updatedSteps);
    updateFunnel(Number(id), { steps: updatedSteps });
  }, [id, steps, updateFunnel]);

  const runQuery = async () => {
    setLoading(true);
    setErrorMessage(null);

    if (!connection) {
      setErrorMessage("Data source is not set!");
      setLoading(false);
      return;
    }

    if (!eventSet) {
      setErrorMessage("Event set is not set!");
      setLoading(false);
      return;
    }

    if (steps.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setLoading(false);
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

    setLoading(false);
  };

  if (shouldRun) {
    runQuery();
    setShouldRun(false);
  }

  return (
    <div className="tw-px-10 tw-flex tw-flex-1 tw-flex-col tw-min-w-0 tw-min-h-0" >
      <div className='tw-flex tw-flex-1 tw-min-w-0 tw-min-h-0'>
        <div id='left-panel' className="tw-w-80 tw-min-w-[20rem] tw-inline-block tw-select-none tw-pt-8">
          <div className='tw-mt-[2px]'>
            <span className='tw-uppercase'>Data Source</span>
            <ConnectionSelector className="tw-mt-1 hover:tw-border-green-500" connection={connection} setConnection={onConnectionSelected} />
          </div>
          <div className='tw-mt-5'>
            <span className='tw-uppercase'>Event Set</span>
            <EventSetSelector className="tw-mt-1 hover:tw-border-green-500" connection={connection} eventSet={eventSet} setEventSet={onEventSetSelected} />
          </div>
          <div className='tw-mt-5'>
            <Steps connectionID={connection ? connection.id : null} eventSetID={eventSet ? eventSet.id : null} steps={steps} onEventSelected={onEventSelected} onEventAdded={onEventAdded} />
          </div>
          <Tooltip className='tw-mt-10' color={"invert"} content={"⌘ + Enter"}>
            <Button className="tw-w-40 tw-h-8" onClick={runQuery}>{loading ? "Stop" : "Run"}</Button>
          </Tooltip>
        </div>
        <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-10 tw-my-8 tw-border-gray-300 tw-border-solid tw-border tw-rounded-md">
          <div id="top-panel" className="tw-p-4 tw-pl-5 tw-border-gray-300 tw-border-solid tw-border-b tw-text-lg tw-font-bold">
            Results
          </div>
          <div id="bottom-panel" className='tw-flex tw-flex-col tw-flex-1'>
            <div className="tw-mb-5 tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
              {errorMessage &&
                <div className="tw-p-5 tw-text-red-600 tw-font-bold tw-border-gray-300 tw-border-solid tw-border-b">
                  Error: {errorMessage}
                </div>
              }
              <MemoizedResultsTable loading={loading} schema={schema} results={queryResults} placeholder="Choose two or more steps to see results!" />
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
};

const Steps: React.FC<StepsProps> = props => {
  const { connectionID, eventSetID, steps, onEventSelected, onEventAdded } = props;
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
      }

      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [connectionID, eventSetID]);

  return (
    <>
      <span className='tw-uppercase'>Steps</span>
      {steps.map((event, index) =>
        <EventSelector key={index} className="first:tw-mt-1 tw-mt-2 hover:tw-border-green-500" connectionID={connectionID} eventSetID={eventSetID} event={event} setEvent={(event) => onEventSelected(event, index)} eventOptions={eventOptions} loading={loading} controlled={true} />
      )}
      <EventSelector className="tw-mt-2 hover:tw-border-green-500" connectionID={connectionID} eventSetID={eventSetID} event={null} setEvent={onEventAdded} eventOptions={eventOptions} loading={loading} controlled={true} />
    </>
  );
};