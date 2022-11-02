import { PlusCircleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { Modal } from "src/components/modal/Modal";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { NewConnection } from "src/pages/newconnection/NewConnection";
import { NewEventSet } from "src/pages/neweventset/NewEventSet";
import { useDispatch } from "src/root/model";
import { sendRequest } from "src/rpc/ajax";
import { DataConnection, EventSet, UpdateOrganization } from "src/rpc/api";
import { useDataConnections, useEventSets } from "src/rpc/data";

enum Step {
  Initial,
  NewDataSource,
  NewEventSet,
}

const tableHeaderStyle = "tw-sticky tw-top-0 tw-z-10 tw-border-b tw-border-gray-300 tw-bg-gray-50 tw-bg-opacity-75 tw-py-3.5 tw-pr-4 tw-pl-3 backdrop-blur backdrop-filter sm:tw-pr-6 lg:tw-pr-8 tw-text-left";
const tableCellStyle = "tw-whitespace-nowrap tw-px-3 tw-py-4 tw-text-sm tw-text-gray-500 tw-hidden sm:tw-table-cell";

export const WorkspaceSettings: React.FC = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<Step>(Step.Initial);

  const [selectedConnection, setSelectedConnection] = useState<DataConnection | undefined>(undefined);
  const [selectedEventSet, setSelectedEventSet] = useState<EventSet | undefined>(undefined);

  const close = () => {
    setSelectedConnection(undefined);
    setSelectedEventSet(undefined);
  };

  const setDefault = useCallback(async (connectionID: number | undefined, eventSetID: number | undefined) => {
    try {
      const response = await sendRequest(UpdateOrganization, { connection_id: connectionID, event_set_id: eventSetID });
      dispatch({
        type: 'login.organizationSet',
        organization: response.organization,
      });
    } catch (e) {
    }
  }, [dispatch]);

  let content;
  switch (step) {
    case Step.Initial:
      content = (
        <div className='tw-py-14 tw-px-20'>
          <SetDefaultModal connection={selectedConnection} eventSet={selectedEventSet} setDefault={setDefault} close={close} />
          <DataSourceSettings setStep={setStep} setSelectedConnection={setSelectedConnection} />
          <EventSetSettings setStep={setStep} setSelectedEventSet={setSelectedEventSet} />
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

type DataSourceSettingsProps = {
  setStep: (step: Step) => void;
  setSelectedConnection: (connection: DataConnection) => void;
};

const DataSourceSettings: React.FC<DataSourceSettingsProps> = ({ setStep, setSelectedConnection }) => {
  const { connections } = useDataConnections();

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
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-max-h-64 tw-overflow-x-auto tw-overscroll-contain' >
        {connections
          ?
          <table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
            <thead className="tw-bg-gray-100">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Display Name</th>
                <th scope="col" className={tableHeaderStyle}>Source Type</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody>
              {connections!.length > 0 ? connections!.map((connection, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {connection.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {connection.connection_type}
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => setSelectedConnection(connection)}>Set Default</div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => null}>Delete</div>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No data sources configured yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </>
  );
};

type EventSetSettingsProps = {
  setStep: (step: Step) => void,
  setSelectedEventSet: (eventSet: EventSet) => void;
};

const EventSetSettings: React.FC<EventSetSettingsProps> = ({ setStep, setSelectedEventSet }) => {
  const { connections } = useDataConnections();
  const connectionMap = new Map(connections?.map(i => [i.id, i]));
  const { eventSets } = useEventSets();

  return (
    <>
      <div className="tw-flex tw-w-full tw-mb-3 tw-mt-8">
        <div className="tw-flex tw-flex-col tw-justify-end tw-font-bold tw-text-lg">Event Sets</div>
        <Button className='tw-ml-auto tw-flex' onClick={() => setStep(Step.NewEventSet)}>
          <div className="tw-flex tw-flex-col tw-justify-center tw-h-full">
            <PlusCircleIcon className='tw-h-4 tw-inline-block tw-mr-[6px]' />
          </div>
          <div className="tw-flex tw-flex-col tw-justify-center tw-pr-2">
            New event set
          </div>
        </Button>
      </div>
      <div className='tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-overflow-scroll tw-overscroll-contain'>
        {eventSets
          ?
          <table className="tw-min-w-full tw-border-separate tw-border-spacing-0">
            <thead className="tw-bg-gray-100">
              <tr>
                <th scope="col" className={tableHeaderStyle}>Display Name</th>
                <th scope="col" className={tableHeaderStyle}>Data Source Name</th>
                <th scope="col" className={tableHeaderStyle}>Dataset Name</th>
                <th scope="col" className={tableHeaderStyle}>Table Name</th>
                <th scope="col" className={tableHeaderStyle}>Custom Join</th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
                <th scope="col" className={classNames(tableHeaderStyle, 'tw-w-5')}></th>
              </tr>
            </thead>
            <tbody className="tw-bg-white">
              {eventSets.length > 0 ? eventSets!.map((eventSet, index) => (
                <tr key={index} className="tw-border-b tw-border-solid tw-border-gray-200 last:tw-border-0">
                  <td className={tableCellStyle}>
                    {eventSet.display_name}
                  </td>
                  <td className={tableCellStyle}>
                    {connectionMap ? connectionMap.get(eventSet.connection_id)?.display_name : <Loading />}
                  </td>
                  <td className={tableCellStyle}>
                    {eventSet.dataset_name}
                  </td>
                  <td className={tableCellStyle}>
                    {eventSet.table_name}
                  </td>
                  <td className={tableCellStyle}>
                    <Tooltip label={eventSet.custom_join} delayHide={100}>
                      <div className="tw-max-w-[240px] tw-max-h-24 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
                        {eventSet.custom_join}
                      </div>
                    </Tooltip>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => setSelectedEventSet(eventSet)}>Set Default</div>
                  </td>
                  <td className={tableCellStyle}>
                    <div className="tw-cursor-pointer tw-font-medium tw-select-none tw-text-blue-700 hover:tw-text-blue-900" onClick={() => null}>Delete</div>
                  </td>
                </tr>
              )) : <tr><td className={tableCellStyle}>No event sets configured yet!</td></tr>}
            </tbody>
          </table>
          :
          <Loading className="tw-my-5" />
        }
      </div>
    </>
  );
};

type SetDefaultModalProps = {
  connection: DataConnection | undefined;
  eventSet: EventSet | undefined;
  setDefault: (connectionID: number | undefined, eventSetID: number | undefined) => Promise<void>;
  close: () => void;
};

const SetDefaultModal: React.FC<SetDefaultModalProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const connectionID = props.connection?.id;
  const eventSetID = props.eventSet?.id;
  const show = props.connection !== undefined || props.eventSet !== undefined;
  const setDefault = async (connectionID: number | undefined, eventSetID: number | undefined) => {
    setLoading(true);
    await props.setDefault(connectionID, eventSetID);
    props.close();
    setLoading(false);
  };

  var type: string = "";
  var title: string = "";
  if (props.connection) {
    title = props.connection.display_name;
    type = "data connection";
  } else if (props.eventSet) {
    title = props.eventSet.display_name;
    type = "event set";
  }

  return (
    <Modal show={show} close={props.close} title="Set Default" titleStyle='tw-font-bold tw-text-xl'>
      <div className='tw-w-80 tw-m-6'>
        <div>
          Set {`${type}`} "<span className="tw-font-bold">{`${title}`}</span>" as the organization's default?
        </div>
        <div className='tw-mt-8 tw-flex'>
          <div className='tw-ml-auto'>
            <Button className='tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200 tw-border-0 tw-mr-3' onClick={props.close}>Cancel</Button>
            <Button className='tw-w-28 tw-bg-fabra-green-500 hover:tw-bg-fabra-green-600 tw-border-0' onClick={() => setDefault(connectionID, eventSetID)}>{loading ? <Loading className='tw-inline' /> : "Continue"}</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};