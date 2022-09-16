import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { useCallback, useEffect, useState } from "react";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { NewConnection } from "src/pages/newconnection/NewConnection";
import { NewEventSet } from "src/pages/neweventset/NewEventSet";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, GetDataConnections, GetEventSets } from "src/rpc/api";

enum ModalType {
  NewDataSource,
  NewEventSet,
}

const tableCellStyle = "tw-p-4 tw-w-56";

export const WorkspaceSettings: React.FC = () => {
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [connectionMap, setConnectionMap] = useState<Map<number, DataConnection> | null>(null);
  const setConnectionMapCallback = useCallback(setConnectionMap, [setConnectionMap]);

  const triggerModal = (modalType: ModalType) => {
    setModalType(modalType);
    setShowModal(true);
  };

  let modalContent;
  switch (modalType) {
    case ModalType.NewDataSource:
      modalContent = <NewConnection onComplete={() => setShowModal(false)} />;
      break;
    case ModalType.NewEventSet:
      modalContent = <NewEventSet onComplete={() => setShowModal(false)} />;
      break;
  }

  return (
    <>
      <Modal show={showModal} close={() => setShowModal(false)}>
        {modalContent}
      </Modal>
      <div className='tw-py-14 tw-px-20'>
        <DataSourceSettings triggerModal={triggerModal} setConnectionMap={setConnectionMapCallback} />
        <EventSetSettings triggerModal={triggerModal} connectionMap={connectionMap} />
      </div>
    </>
  );
};

const DataSourceSettings: React.FC<{ triggerModal: (modalType: ModalType) => void; setConnectionMap: (map: Map<number, DataConnection>) => void; }> = ({ triggerModal, setConnectionMap }) => {
  const [dataConnections, setDataConnections] = useState<DataConnection[] | null>(null);
  const [dataConnectionsLoading, setDataConnectionsLoading] = useState<boolean>(true);
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
        <Button className='tw-ml-auto tw-flex' onClick={() => triggerModal(ModalType.NewDataSource)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-2' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center">
            New data source
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-scroll' >
        {dataConnectionsLoading
          ?
          <Loading className="tw-my-5" />
          :
          <table className="tw-w-full tw-table-fixed tw-truncate">
            <thead className="tw-text-left">
              <tr>
                <th scope="col" className="tw-p-4">Display Name</th>
                <th scope="col" className="tw-p-4">Source Type</th>
              </tr>
            </thead>
            <tbody className="tw-border-t tw-border-solid tw-border-gray-300">
              {dataConnections!.length > 0 ? dataConnections!.map((dataConnection, index) => (
                <tr key={index}>
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

const EventSetSettings: React.FC<{ triggerModal: (modalType: ModalType) => void, connectionMap: Map<number, DataConnection> | null; }> = props => {
  const [eventSets, setEventSets] = useState<EventSet[] | null>(null);
  const [eventSetsLoading, setEventSetsLoading] = useState<boolean>(true);
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
        <Button className='tw-ml-auto tw-flex' onClick={() => props.triggerModal(ModalType.NewEventSet)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-2' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center">
            New event set
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-scroll' >
        {eventSetsLoading
          ?
          <Loading className="tw-my-5" />
          :
          <table className="tw-w-full tw-table-fixed tw-truncate">
            <thead className="tw-p-4 tw-text-left tw-w-50">
              <tr>
                <th scope="col" className="tw-p-4">Display Name</th>
                <th scope="col" className="tw-p-4">Data Source Name</th>
                <th scope="col" className="tw-p-4">Dataset Name</th>
                <th scope="col" className="tw-p-4">Table Name</th>
              </tr>
            </thead>
            <tbody className="tw-border-t tw-border-solid tw-border-gray-300">
              {eventSets!.length > 0 ? eventSets!.map((eventSet, index) => (
                <tr key={index}>
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
                </tr>
              )) : <tr><td className={tableCellStyle}>No event sets configured yet!</td></tr>}
            </tbody>
          </table>
        }
      </div>
    </>
  );
};
