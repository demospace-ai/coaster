import { CheckIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Loading } from 'src/components/loading/Loading';
import { NewSourceConfiguration } from 'src/connect/Connection';
import { FinalizeSync } from 'src/connect/Finalize';
import { ObjectSetup } from 'src/connect/Object';
import { Sources } from 'src/connect/Sources';
import { createNewSource, createNewSync, INITIAL_SETUP_STATE, SetupSyncState, SyncSetupStep, validateObjectSetup } from 'src/connect/state';
import { WarehouseSelector } from 'src/connect/Warehouse';
import { FabraMessage, MessageType } from 'src/message/message';
import { useObject } from 'src/rpc/data';

let needsInit = true;

export const App: React.FC = () => {
  // TODO: figure out how to prevent Redux from being used in this app
  const [state, setState] = useState<SetupSyncState>(INITIAL_SETUP_STATE);
  const [linkToken, setLinkToken] = useState<string | undefined>(undefined);
  const { object } = useObject(state.object?.id, linkToken);
  useEffect(() => {
    // Recommended way to run one-time initialization: https://beta.reactjs.org/learn/you-might-not-need-an-effect#initializing-the-application
    if (needsInit) {
      window.addEventListener("message", (message: MessageEvent<FabraMessage>) => {
        switch (message.data.messageType) {
          case MessageType.LinkToken:
            setLinkToken(message.data.linkToken);
        }
      });
      window.parent.postMessage({ messageType: MessageType.IFrameReady }, '*');
      needsInit = false;
    }
  }, []);

  // Setup the initial values for the field mappings
  useEffect(() => {
    const fieldMappings = object ? object.object_fields.filter(objectField => !objectField.omit).map(objectField => {
      return {
        source_column: undefined,
        destination_field_id: objectField.id,
      };
    }) : [];
    setState(s => {
      return {
        ...s,
        fieldMappings: fieldMappings,
      };
    });
  }, [object]);

  const close = () => {
    window.parent.postMessage({ messageType: MessageType.Close });
  };
  const back = () => {
    let prevStep = state.step - 1;
    if (state.skippedSourceSetup && state.step === SyncSetupStep.Object) {
      prevStep = SyncSetupStep.Initial;
    }

    setState({ ...state, step: prevStep });
  };

  if (!linkToken) {
    return (<Loading />);
  }

  // TODO: pull all child state out to a reducer or redux store here so state isn't lost on navigation
  return (
    <div className='tw-fixed tw-bg-[rgb(0,0,0,0.2)] tw-w-full tw-h-full'>
      <div id="fabra-connect" className='tw-fixed tw-bg-white tw-flex tw-flex-col tw-w-[70%] tw-h-[75%] tw-top-[50%] tw-left-1/2 -tw-translate-y-1/2 -tw-translate-x-1/2 tw-rounded-lg tw-shadow-modal tw-items-center'>
        <Header close={close} state={state} />
        <AppContent linkToken={linkToken} state={state} setState={setState} />
        <Footer back={back} linkToken={linkToken} state={state} setState={setState} close={close} />
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
  const ref = useRef<HTMLDivElement>(null);
  // Scroll to the top on step change
  React.useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [props.state.step]);

  let content: React.ReactNode;
  switch (props.state.step) {
    case SyncSetupStep.Initial:
      content = <Sources linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.Warehouse:
      content = <WarehouseSelector linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.Connection:
      content = <NewSourceConfiguration linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.Object:
      content = <ObjectSetup linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.Finalize:
      content = <FinalizeSync linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    default:
      // TODO: should never happen
      break;
  }

  return (
    <div ref={ref} className='tw-overflow-auto tw-w-full tw-h-full tw-flex tw-justify-center tw-pt-10 tw-bg-transparent'>
      {content}
    </div>
  );
};

const Header: React.FC<{ close: () => void; state: SetupSyncState; }> = ({ close, state }) => {
  return (
    <div className='tw-flex tw-flex-row tw-items-center tw-w-full tw-h-20 tw-min-h-[80px] tw-border-b tw-border-slate-200'>
      <div className='tw-flex tw-flex-row tw-gap-10 tw-justify-center tw-items-center tw-w-full'>
        <StepBreadcrumb step={1} content="Select source" active={state.step <= SyncSetupStep.Warehouse} complete={state.step > SyncSetupStep.Warehouse} />
        <StepBreadcrumb step={2} content="Connect source" active={state.step === SyncSetupStep.Connection} complete={state.step > SyncSetupStep.Connection} />
        <StepBreadcrumb step={3} content="Define model" active={state.step === SyncSetupStep.Object} complete={state.step > SyncSetupStep.Object} />
        <StepBreadcrumb step={4} content="Finalize sync" active={state.step === SyncSetupStep.Finalize} complete={state.step > SyncSetupStep.Finalize} />
      </div>
      <button className="tw-absolute tw-flex tw-items-center t tw-right-10 tw-border-none tw-cursor-pointer tw-p-0" onClick={close}>
        <svg className='tw-h-6 tw-fill-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
          <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" />
        </svg>
      </button>
    </div >
  );
};

const StepBreadcrumb: React.FC<{ content: string, step: number; active: boolean; complete: boolean; }> = ({ step, content, active, complete }) => {
  return (
    <div className='tw-flex tw-flex-row tw-justify-center tw-items-center tw-select-none'>
      <div className={classNames('tw-bg-slate-200 tw-rounded-md tw-h-[18px] tw-w-[18px] tw-flex tw-justify-center tw-items-center tw-text-[10px]', active && 'tw-bg-blue-100 tw-text-blue-700', complete && 'tw-bg-green-100 tw-text-green-800')}>{complete ? <CheckIcon className='tw-h-3' /> : step}</div>
      <span className={classNames('tw-font-medium tw-pl-2', active && 'tw-text-blue-700')}>{content}</span>
    </div>
  );
};

type FooterProps = {
  back: () => void;
  linkToken: string;
  state: SetupSyncState;
  setState: (state: SetupSyncState) => void;
  close: () => void;
};

export const Footer: React.FC<FooterProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  let onClick = () => { };
  let continueText: string = "Continue";
  switch (props.state.step) {
    case SyncSetupStep.Initial:
      break;
    case SyncSetupStep.Warehouse:
      break;
    case SyncSetupStep.Connection:
      onClick = async () => {
        setLoading(true);
        await createNewSource(props.linkToken, props.state, props.setState);
        setLoading(false);
      };
      break;
    case SyncSetupStep.Object:
      onClick = () => {
        if (validateObjectSetup(props.state)) {
          props.setState({ ...props.state, step: props.state.step + 1 });
        }
      };
      break;
    case SyncSetupStep.Finalize:
      if (props.state.syncCreated) {
        continueText = "Done";
        onClick = props.close;
      } else {
        continueText = "Create Sync";
        onClick = async () => {
          setLoading(true);
          await createNewSync(props.linkToken, props.state, props.setState);
          setLoading(false);
        };
      }
      break;
  }
  const continueButton: React.ReactElement = <button onClick={onClick} className='tw-border tw-text-white tw-font-medium tw-bg-slate-700 tw-rounded-md tw-w-32 tw-h-10 tw-ml-auto tw-select-none'>{loading ? <Loading light /> : continueText}</button>;
  const showContinue = props.state.step > SyncSetupStep.Warehouse;

  return (
    <div className='tw-flex tw-flex-row tw-w-full tw-h-20 tw-min-h-[80px] tw-border-t tw-border-slate-200 tw-mt-auto tw-items-center tw-px-28'>
      {props.state.step > SyncSetupStep.Initial && <button className='tw-border tw-border-slate-300 tw-font-medium tw-rounded-md tw-w-32 tw-h-10 tw-select-none' onClick={props.back}>Back</button>}
      {showContinue && continueButton}
    </div>
  );
};
