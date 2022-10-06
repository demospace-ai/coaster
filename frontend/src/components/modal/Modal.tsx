import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Button } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import { ConnectionSelector, EventSetSelector } from 'src/components/selector/Selector';
import { sendRequest } from 'src/rpc/ajax';
import { AnalysisType, DataConnection, EventSet, UpdateAnalysis, UpdateAnalysisRequest } from 'src/rpc/api';
import styles from './modal.m.css';

interface ModalProps {
  show: boolean;
  close?: () => void;
  children?: React.ReactNode;
  title?: string;
  titleStyle?: string;
  clickToEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = props => {
  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (props.close) {
          props.close();
        }
        document.removeEventListener('keydown', escFunction);
      }
    };

    document.addEventListener('keydown', escFunction);
  });

  const showHideClassName = props.show ? styles.displayBlock : styles.displayNone;

  return (
    <div className={classNames(styles.modal, showHideClassName)} onClick={props.clickToEscape ? props.close : undefined}>
      <section className={styles.modalMain} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex" }}>
          <div className={classNames(styles.title, props.titleStyle)}>
            {props.title}
          </div>
          <button className={styles.closeButton} onClick={props.close}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" fill="black" />
            </svg>
          </button>
        </div>
        {props.children}
      </section>
    </div>
  );
};


type ConfigureAnalysisModalProps = {
  analysisID: number;
  analysisType: AnalysisType;
  connection: DataConnection | undefined;
  eventSet: EventSet | undefined;
  show: boolean;
  close: () => void;
};

export const ConfigureAnalysisModal: React.FC<ConfigureAnalysisModalProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [connection, setConnection] = useState<DataConnection | undefined>(props.connection);
  const [eventSet, setEventSet] = useState<EventSet | undefined>(props.eventSet);

  const updateAnalysis = async (analysisID: number | null) => {
    if (analysisID === null) {
      return;
    }

    const payload: UpdateAnalysisRequest = { analysis_id: analysisID };

    setLoading(true);
    if (connection) {
      payload.connection_id = connection.id;
    }

    if (eventSet) {
      payload.event_set_id = eventSet.id;
    }

    try {
      await sendRequest(UpdateAnalysis, payload);
    } catch (e) {
      // TODO: handle error here
    }

    setLoading(false);
  };

  return (
    <Modal show={props.show} close={props.close} title="Configure Analysis" titleStyle='tw-font-bold tw-text-xl'>
      <div className='tw-w-80 tw-m-6'>
        <ConnectionSelector connection={connection} setConnection={setConnection} />
        {props.analysisType === AnalysisType.Funnel && <EventSetSelector className="tw-mt-4" connection={connection} eventSet={eventSet} setEventSet={setEventSet} />}
        <div className='tw-mt-8 tw-flex'>
          <div className='tw-ml-auto'>
            <Button className='tw-bg-white tw-text-primary-text hover:tw-bg-gray-200 tw-border-0 tw-mr-3' onClick={props.close}>Cancel</Button>
            <Button className='tw-w-24 tw-bg-fabra hover:tw-bg-primary-highlight tw-border-0' onClick={() => updateAnalysis(props.analysisID)}>{loading ? <Loading className='tw-inline' /> : "Save"}</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};