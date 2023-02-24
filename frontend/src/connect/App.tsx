import classNames from 'classnames';
import React, { useState } from 'react';
import { Loading } from 'src/components/loading/Loading';
import { createNewSource, INITIAL_SOURCE_STATE, NewSourceConfiguration, NewSourceState } from 'src/connect/Connection';
import { ObjectSetup } from 'src/connect/Object';
import { WarehouseSelector } from 'src/connect/Warehouse';
import { ConnectionType, Object, Source } from 'src/rpc/api';

export type SetupSyncState = {
  step: number;
  prevStep: number;
  object: Object | undefined;
  namespace: string | undefined;
  tableName: string | undefined;
  connectionType: ConnectionType | undefined;
  source: Source | undefined;
  newSourceState: NewSourceState;
};

const INITIAL_SETUP_STATE: SetupSyncState = {
  step: 0,
  prevStep: 0,
  object: undefined,
  namespace: undefined,
  tableName: undefined,
  connectionType: undefined,
  source: undefined,
  newSourceState: INITIAL_SOURCE_STATE,
};

export const App: React.FC = () => {
  // TODO: figure out how to prevent Redux from being used in this app
  const [state, setState] = useState<SetupSyncState>(INITIAL_SETUP_STATE);
  const close = () => {
    // TODO: close the window
  };
  const back = () => {
    if (state.step > 0) {
      setState({ ...state, step: state.prevStep, prevStep: state.prevStep - 1 });
    } else {
      close();
    }
  };
  const linkToken = "myjYFNQuUmFTfvLF2F/Ddv/sA+n37xgnCHpeeN/nrw4="; // TODO: get real link token from parent window

  // TODO: pull all child state out to a reducer or redux store here so state isn't lost on navigation
  return (
    <div className='tw-fixed tw-bg-[rgb(0,0,0,0.2)] tw-w-full tw-h-full'>
      <div className='tw-fixed tw-bg-white tw-flex tw-flex-col tw-w-[70%] tw-h-[70%] tw-top-[48%] tw-left-1/2 -tw-translate-y-1/2 -tw-translate-x-1/2 tw-rounded-lg tw-shadow-modal tw-items-center'>
        <Header close={close} state={state} />
        <AppContent linkToken={linkToken} state={state} setState={setState} />
        <Footer back={back} linkToken={linkToken} state={state} setState={setState} />
      </div>
    </div>
  );
};

type AppContentProps = {
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

const AppContent: React.FC<AppContentProps> = props => {
  let content: React.ReactNode;
  switch (props.state.step) {
    case 0:
      content = <WarehouseSelector linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case 1:
      content = <NewSourceConfiguration linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case 2:
      content = <ObjectSetup linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    default:
      content = <div />;
      break;
  }

  return (
    <div className='tw-overflow-auto tw-w-full tw-h-full tw-flex tw-justify-center tw-pt-10 tw-bg-transparent'>
      {content}
    </div>
  );
};

const Header: React.FC<{ close: () => void; state: SetupSyncState; }> = ({ close, state }) => {
  return (
    <div className='tw-flex tw-flex-row tw-items-center tw-w-full tw-h-20 tw-min-h-[80px] tw-border-b tw-border-slate-200'>
      <div className='tw-flex tw-flex-row tw-gap-10 tw-justify-center tw-items-center tw-w-full'>
        <StepBreadcrumb step={1} content="Select source" active={state.step === 0} />
        <StepBreadcrumb step={2} content="Connect source" active={state.step === 1} />
        <StepBreadcrumb step={3} content="Define model" active={state.step === 2} />
        <StepBreadcrumb step={4} content="Finalize sync" active={state.step === 3} />
      </div>
      <button className="tw-absolute tw-flex tw-items-center t tw-right-10 tw-border-none tw-cursor-pointer tw-p-0" onClick={close}>
        <svg className='tw-h-6 tw-fill-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
          <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" />
        </svg>
      </button>
    </div >
  );
};

const StepBreadcrumb: React.FC<{ content: string, step: number; active: boolean; }> = ({ step, content, active }) => {
  return (
    <div className='tw-flex tw-flex-row tw-justify-center tw-items-center tw-select-none'>
      <div className={classNames('tw-bg-slate-200 tw-rounded-md tw-h-[18px] tw-w-[18px] tw-flex tw-justify-center tw-items-center tw-text-[10px]', active && 'tw-bg-blue-100 tw-text-blue-700')}>{step}</div>
      <span className={classNames('tw-pl-2', active && 'tw-text-blue-700')}>{content}</span>
    </div>
  );
};


type FooterProps = {
  back: () => void;
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
};

export const Footer: React.FC<FooterProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const onClick = async () => {
    setLoading(true);
    switch (props.state.step) {
      case 0:
        props.setState({ ...props.state, step: props.state.step + 2, prevStep: props.state.step });
        break;
      case 1:
        await createNewSource(props.linkToken, props.state, props.setState);
        break;
      case 2:
        // TODO: validate
        props.setState({ ...props.state, step: props.state.step + 1, prevStep: props.state.step });
        break;
      case 3:
        break;
    }
    setLoading(false);
  };

  return (
    <div className='tw-flex tw-flex-row tw-w-full tw-h-20 tw-min-h-[80px] tw-border-t tw-border-slate-200 tw-mt-auto tw-items-center'>
      <button className='tw-border tw-border-slate-300 tw-font-medium tw-rounded-md tw-w-20 tw-h-10 tw-ml-20' onClick={props.back}>Back</button>
      <button onClick={onClick} className='tw-border tw-text-white tw-font-medium tw-bg-slate-700 tw-rounded-md tw-w-28 tw-h-10 tw-ml-auto tw-mr-20'>{loading ? <Loading light /> : "Continue"}</button>
    </div>
  );
};