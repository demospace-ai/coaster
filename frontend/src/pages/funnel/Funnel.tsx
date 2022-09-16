import { Tooltip } from '@nextui-org/react';
import { useState } from "react";
import { Button } from 'src/components/button/Button';
import { MemoizedResultsTable } from 'src/components/queryResults/QueryResults';
import { ConnectionSelector, EventSelector, EventSetSelector } from "src/components/selector/Selector";
import { runFunnelQuery } from 'src/queries/queries';
import { DataConnection, EventSet, QueryResults, Schema } from "src/rpc/api";
import { useLocalStorage } from "src/utils/localStorage";

export const Funnel: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connection, setConnection] = useLocalStorage<DataConnection | null>("selectedConnection", null);
  const [eventSet, setEventSet] = useLocalStorage<EventSet | null>("eventSet", null);
  const [events, setEvents] = useState<string[]>([]);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [shouldRun, setShouldRun] = useState<boolean>(false);
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);

  const onConnectionSelected = (value: DataConnection) => {
    setErrorMessage(null);
    setConnection(value);
  };

  const onEventSetSelected = (value: EventSet) => {
    setErrorMessage(null);
    setEventSet(value);
  };

  const onEventSelected = (value: string, index: number) => {
    setErrorMessage(null);
    const updatedEvents: string[] = [...events];
    updatedEvents[index] = value;
    setEvents(updatedEvents);
  };

  const onEventAdded = (value: string) => {
    setErrorMessage(null);
    setEvents(events => [...events, value]);
  };

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

    if (events.length < 2) {
      setErrorMessage("Must have 2 or more steps!");
      setLoading(false);
      return;
    }

    try {
      const results = await runFunnelQuery(connection.id, eventSet, events);
      setSchema(results.schema);
      setQueryResults(results.query_results);
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
            <EventSetSelector className="tw-mt-1 hover:tw-border-green-500" connectionID={connection ? connection.id : null} eventSet={eventSet} setEventSet={onEventSetSelected} />
          </div>
          <div className='tw-mt-5'>
            <span className='tw-uppercase'>Steps</span>
            {events.map((event, index) =>
              <EventSelector key={index} className="first:tw-mt-1 tw-mt-2 hover:tw-border-green-500" connectionID={connection ? connection.id : null} eventSet={eventSet} event={event} setEvent={(event) => onEventSelected(event, index)} />
            )}
            <EventSelector className="tw-mt-2 hover:tw-border-green-500" connectionID={connection ? connection.id : null} eventSet={eventSet} event={null} setEvent={onEventAdded} />
          </div>
          <Tooltip className='tw-mt-10' color={"invert"} content={"⌘ + Enter"}>
            <Button className="tw-w-40 tw-h-8" onClick={runQuery}>{loading ? "Stop" : "Run"}</Button>
          </Tooltip>
        </div>
        <div id='right-panel' className="tw-min-w-0 tw-min-h-0 tw-flex tw-flex-col tw-flex-1 tw-ml-10 tw-my-8 tw-border-gray-300 tw-border-solid tw-border tw-rounded-md">
          <div id="top-panel" className="tw-p-5 tw-border-gray-300 tw-border-solid tw-border-b">
            Results
          </div>
          <div id="bottom-panel" className='tw-flex tw-flex-col tw-flex-1'>
            <div className="tw-mb-5 tw-flex tw-flex-col tw-flex-auto tw-min-h-0 tw-overflow-hidden">
              <MemoizedResultsTable loading={loading} schema={schema} results={queryResults} placeholder="Choose two or more steps to see results!" />
              {errorMessage &&
                <div className="tw-m-5 tw-text-red-600 tw-font-bold">{errorMessage}</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};