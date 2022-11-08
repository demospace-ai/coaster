import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Button } from 'src/components/button/Button';
import { Loading } from 'src/components/loading/Loading';
import { ConnectionSelector, EventSetSelector } from 'src/components/selector/Selector';
import { AnalysisType, DataConnection, EventSet, UpdateAnalysisRequest } from 'src/rpc/api';
import { useAnalysis } from 'src/rpc/data';
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
  analysisID: string;
  show: boolean;
  close: () => void;
};

export const ConfigureAnalysisModal: React.FC<ConfigureAnalysisModalProps> = props => {
  const { analysis, updateAnalysis } = useAnalysis(props.analysisID);
  const [connection, setConnection] = useState<DataConnection | undefined>(analysis?.connection);
  const [eventSet, setEventSet] = useState<EventSet | undefined>(analysis?.event_set);
  const [loading, setLoading] = useState<boolean>(false);

  const save = async () => {
    if (!props.analysisID) {
      return;
    }

    const payload: UpdateAnalysisRequest = { analysis_id: Number(props.analysisID) };
    if (connection) {
      payload.connection_id = connection.id;
    }

    if (eventSet) {
      payload.event_set_id = eventSet.id;
    }

    setLoading(true);
    await updateAnalysis(payload);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Modal show={props.show} close={props.close} title="Configure Analysis" titleStyle='tw-font-bold tw-text-xl'>
      {analysis ?
        <div className='tw-w-80 tw-m-6'>
          {analysis.analysis_type !== AnalysisType.CustomQuery && <div className="tw-mb-5"><span className='tw-font-bold'>Important:</span> changing the connection or event set will clear any events you've selected.</div>}
          <ConnectionSelector connection={connection} setConnection={setConnection} />
          {analysis.analysis_type !== AnalysisType.CustomQuery && <EventSetSelector className="tw-mt-4" connection={connection} eventSet={eventSet} setEventSet={setEventSet} />}
          <div className='tw-mt-8 tw-flex'>
            <div className='tw-ml-auto'>
              <Button className='tw-bg-white tw-text-gray-800 hover:tw-bg-gray-200 tw-border-0 tw-mr-3' onClick={props.close}>Cancel</Button>
              <Button className='tw-w-24 tw-bg-fabra-green-500 hover:tw-bg-fabra-green-600 tw-border-0' onClick={save}>{loading ? <Loading className='tw-inline' /> : "Save"}</Button>
            </div>
          </div>
        </div>
        :
        <Loading />
      }
    </Modal>
  );
};