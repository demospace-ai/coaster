import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { NewConnection } from "src/pages/newconnection/NewConnection";
import { NewEventSet } from "src/pages/neweventset/NewEventSet";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, GetDataConnections, GetEventSets } from "src/rpc/api";

enum Step {
  Initial,
  NewDataSource,
  NewEventSet,
}

const tableCellStyle = "tw-p-4 tw-w-56";

export const WorkspaceSettings: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Initial);
  const [connectionMap, setConnectionMap] = useState<Map<number, DataConnection> | null>(null);
  const setConnectionMapCallback = useCallback(setConnectionMap, [setConnectionMap]);


  let content;
  switch (step) {
    case Step.Initial:
      content = (
        <div className='tw-py-14 tw-px-20'>
          <DataSourceSettings setStep={setStep} setConnectionMap={setConnectionMapCallback} />
          <EventSetSettings setStep={setStep} connectionMap={connectionMap} />
        </div>
      );
      break;
    case Step.NewDataSource:
      content = <NewConnection onComplete={() => setStep(Step.Initial)} />;
      break;
    case Step.NewEventSet:
      content = <NewEventSet onComplete={() => setStep(Step.Initial)} />;
      break;
  }

  return content;
};

const DataSourceSettings: React.FC<{ setStep: (step: Step) => void; setConnectionMap: (map: Map<number, DataConnection>) => void; }> = ({ setStep, setConnectionMap }) => {
  const [dataConnections, setDataConnections] = useState<DataConnection[] | null>(null);
  const [dataConnectionsLoading, setDataConnectionsLoading] = useState<boolean>(true);
  // TODO: reload on new data source added
  useEffect(() => {
    let ignore = false;
    sendRequest(GetDataConnections).then((results) => {
      if (!ignore) {
        setDataConnections(results.data_connections);
        setConnectionMap(new Map(results.data_connections.map(i => [i.id, i])));
      }

      setDataConnectionsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [setConnectionMap]);

  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-3">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Data Sources</div>
        <Button className='tw-ml-auto tw-flex' onClick={() => setStep(Step.NewDataSource)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-[6px]' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-pr-2">
            New data source
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-auto tw-overscroll-contain' >
        {dataConnectionsLoading
          ?
          <Loading className="tw-my-5" />
          :
          <table className="tw-w-full">
            <thead className="tw-text-left tw-sticky tw-top-0 tw-shadow-[0_0px_0.5px_1px] tw-shadow-gray-300 tw-bg-gray-100">
              <tr>
                <th scope="col" className="tw-p-4">Display Name</th>
                <th scope="col" className="tw-p-4">Source Type</th>
              </tr>
            </thead>
            <tbody>
              {dataConnections!.length > 0 ? dataConnections!.map((dataConnection, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {dataConnection.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {dataConnection.connection_type}
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No data sources configured yet!</td></tr>}
            </tbody>
          </table>
        }
      </div>
    </>
  );
};

const EventSetSettings: React.FC<{ setStep: (step: Step) => void, connectionMap: Map<number, DataConnection> | null; }> = props => {
  const [eventSets, setEventSets] = useState<EventSet[] | null>(null);
  const [eventSetsLoading, setEventSetsLoading] = useState<boolean>(true);
  // TODO: reload on new event set added
  useEffect(() => {
    let ignore = false;

    sendRequest(GetEventSets).then((results) => {
      if (!ignore) {
        setEventSets(results.event_sets);
      }

      setEventSetsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-3 tw-mt-8">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Event Sets</div>
        <Button className='tw-ml-auto tw-flex' onClick={() => props.setStep(Step.NewEventSet)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-[6px]' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-pr-2">
            New event set
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-auto tw-overscroll-contain' >
        {eventSetsLoading
          ?
          <Loading className="tw-my-5" />
          :
          <table className="tw-w-full">
            <thead className="tw-text-left tw-sticky tw-top-0 tw-shadow-[0_0px_0.5px_1px] tw-shadow-gray-300 tw-bg-gray-100">
              <tr>
                <th scope="col" className="tw-p-4 tw-whitespace-nowrap">Display Name</th>
                <th scope="col" className="tw-p-4 tw-whitespace-nowrap">Data Source Name</th>
                <th scope="col" className="tw-p-4 tw-whitespace-nowrap">Dataset Name</th>
                <th scope="col" className="tw-p-4 tw-whitespace-nowrap">Table Name</th>
                <th scope="col" className="tw-p-4 tw-whitespace-nowrap">Custom Join</th>
              </tr>
            </thead>
            <tbody>
              {eventSets!.length > 0 ? eventSets!.map((eventSet, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {eventSet.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {props.connectionMap ? props.connectionMap.get(eventSet.connection_id)?.display_name : <Loading />}
                  </td>
                  <td className={tableCellStyle}>
                    {eventSet.dataset_name}
                  </td>
                  <td className={tableCellStyle}>
                    {eventSet.table_name}
                  </td>
                  <td className={tableCellStyle}>
                    <Tooltip content={eventSet.custom_join} rounded color="invert" leaveDelay={100}>
                      <div className="tw-max-w-[240px] tw-max-h-24 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
                        {eventSet.custom_join}
                      </div>
                    </Tooltip>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No event sets configured yet!</td></tr>}
            </tbody>
          </table>
        }
      </div>
    </>
  );
};
