import { CheckIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "src/components/button/Button";
import { Loading } from "src/components/loading/Loading";
import { NewSourceConfiguration } from "src/connect/Connection";
import { FinalizeSync } from "src/connect/Finalize";
import { ObjectSetup } from "src/connect/Object";
import { Sources } from "src/connect/Sources";
import { createNewSource, createNewSync, INITIAL_SETUP_STATE, SetupSyncState, SyncSetupStep, validateObjectSetup } from "src/connect/state";
import { WarehouseSelector } from "src/connect/Warehouse";
import { useObject } from "src/rpc/data";

export const NewSync: React.FC<{ linkToken: string, close: () => void; }> = ({ linkToken, close }) => {
  const [state, setState] = useState<SetupSyncState>(INITIAL_SETUP_STATE);
  const [prevObject, setPrevObject] = useState<Object | undefined>(undefined);
  const { object } = useObject(state.object?.id, linkToken);
  const navigate = useNavigate();

  // Setup the initial values for the field mappings
  if (object && object !== prevObject) {
    setPrevObject(object);
    const fieldMappings = object ? object.object_fields.filter(objectField => !objectField.omit).map(objectField => {
      return {
        source_field: undefined,
        destination_field_id: objectField.id,
      };
    }) : [];
    setState(s => {
      return {
        ...s,
        fieldMappings: fieldMappings,
      };
    });
  }

  const back = () => {
    if (state.step === SyncSetupStep.ExistingSources) {
      return navigate("/");
    }

    if (state.step === SyncSetupStep.ChooseSourceType && state.skippedSourceSelection) {
      return navigate("/");
    }

    let prevStep = state.step - 1;
    if (state.skippedSourceSetup && state.step === SyncSetupStep.ChooseData) {
      prevStep = SyncSetupStep.ExistingSources;
    }

    setState({ ...state, step: prevStep });
  };

  return (
    <>
      <Header close={close} state={state} />
      <AppContent linkToken={linkToken} state={state} setState={setState} />
      <Footer back={back} linkToken={linkToken} state={state} setState={setState} close={close} />
    </>
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
    case SyncSetupStep.ExistingSources:
      content = <Sources linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.ChooseSourceType:
      content = <WarehouseSelector linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.ConnectionDetails:
      content = <NewSourceConfiguration linkToken={props.linkToken} state={props.state} setState={props.setState} />;
      break;
    case SyncSetupStep.ChooseData:
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
    <div ref={ref} className="tw-overflow-auto tw-w-full tw-h-full tw-flex tw-justify-center tw-pt-10 tw-bg-transparent">
      {content}
    </div>
  );
};

const Header: React.FC<{ close: () => void; state: SetupSyncState; }> = ({ close, state }) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-w-full tw-h-20 tw-min-h-[80px] tw-border-b tw-border-slate-200">
      <div className="tw-flex tw-flex-row tw-gap-10 tw-justify-center tw-items-center tw-w-full">
        <StepBreadcrumb step={1} content="Select source" active={state.step <= SyncSetupStep.ChooseSourceType} complete={state.step > SyncSetupStep.ChooseSourceType} />
        <StepBreadcrumb step={2} content="Connect source" active={state.step === SyncSetupStep.ConnectionDetails} complete={state.step > SyncSetupStep.ConnectionDetails} />
        <StepBreadcrumb step={3} content="Define model" active={state.step === SyncSetupStep.ChooseData} complete={state.step > SyncSetupStep.ChooseData} />
        <StepBreadcrumb step={4} content="Finalize sync" active={state.step === SyncSetupStep.Finalize} complete={state.step > SyncSetupStep.Finalize} />
      </div>
      <button className="tw-absolute tw-flex tw-items-center t tw-right-10 tw-border-none tw-cursor-pointer tw-p-0" onClick={close}>
        <svg className="tw-h-6 tw-fill-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
          <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" />
        </svg>
      </button>
    </div >
  );
};

const StepBreadcrumb: React.FC<{ content: string, step: number; active: boolean; complete: boolean; }> = ({ step, content, active, complete }) => {
  return (
    <div className="tw-flex tw-flex-row tw-justify-center tw-items-center tw-select-none">
      <div
        className={classNames(
          "tw-rounded-md tw-h-[18px] tw-w-[18px] tw-flex tw-justify-center tw-items-center tw-text-[10px]",
          !active && !complete && "tw-bg-slate-200 tw-text-slate-900",
          active && "tw-bg-primary tw-text-primary-text",
          complete && "tw-bg-green-100 tw-text-green-800"
        )}>
        {complete ? <CheckIcon className="tw-h-3" /> : step}
      </div>
      <span className={classNames("tw-font-medium tw-pl-2", active && "tw-text-primary")}>{content}</span>
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
    case SyncSetupStep.ExistingSources:
      break;
    case SyncSetupStep.ChooseSourceType:
      break;
    case SyncSetupStep.ConnectionDetails:
      onClick = async () => {
        setLoading(true);
        await createNewSource(props.linkToken, props.state, props.setState);
        setLoading(false);
      };
      break;
    case SyncSetupStep.ChooseData:
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
  const showContinue = props.state.step > SyncSetupStep.ChooseSourceType;

  return (
    <div className="tw-flex tw-flex-row tw-w-full tw-h-20 tw-min-h-[80px] tw-border-t tw-border-slate-200 tw-mt-auto tw-items-center tw-px-20">
      <button className="tw-border tw-border-slate-300 tw-font-medium tw-rounded-md tw-w-32 tw-h-10 tw-select-none hover:tw-bg-slate-100" onClick={props.back}>Back</button>
      {showContinue && (
        <Button onClick={onClick} className="tw-border tw-w-36 tw-h-10 tw-ml-auto tw-select-none">
          {loading ? <Loading light /> : continueText}
        </Button>
      )}
    </div>
  );
};