import React, { RefObject, useRef, useState } from 'react';
import { Loading } from 'src/components/loading/Loading';
import { NewSourceConfiguration } from 'src/connect/Connection';
import { WarehouseSelector } from 'src/connect/Warehouses';
import { ConnectionType, Source } from 'src/rpc/api';

export type SetupStep = {
  continue: () => Promise<void>;
};

export const App: React.FC = () => {
  // TODO: figure out how to prevent Redux from being used in this app
  const [step, setStep] = useState<number>(0);
  const stepRef = useRef<SetupStep>(null);
  return (
    <div className='tw-fixed tw-bg-[rgb(0,0,0,0.2)] tw-w-full tw-h-full'>
      <div className='tw-fixed tw-bg-white tw-flex tw-flex-col tw-w-[70%] tw-h-[70%] tw-top-[48%] tw-left-1/2 -tw-translate-y-1/2 -tw-translate-x-1/2 tw-rounded-lg tw-shadow-modal tw-items-center'>
        <Header />
        <AppContent step={step} setStep={setStep} stepRef={stepRef} />
        {step > 0 && <Footer back={() => setStep(step - 1)} stepRef={stepRef} />}
      </div>
    </div>
  );
};

type AppContentProps = {
  step: number;
  setStep: (step: number) => void;
  stepRef: RefObject<SetupStep>;
};

const AppContent: React.FC<AppContentProps> = props => {
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const endCustomerId = 1; // TODO
  const nextStep = () => { props.setStep(props.step + 1); };
  const previousStep = () => { props.setStep(props.step - 1); };
  const close = () => { };

  let content: React.ReactNode;
  switch (props.step) {
    case 0:
      content = <WarehouseSelector setConnectionType={setConnectionType} nextStep={nextStep} previousStep={close} />;
      break;
    case 1:
      content = <NewSourceConfiguration ref={props.stepRef} connectionType={connectionType!} endCustomerId={endCustomerId} nextStep={nextStep} previousStep={previousStep} setSource={setSource} />;
      break;
    case 2:
      content = <div />;
      break;
    default:
      content = <div />;
      break;
  }

  return (
    <div className='tw-overflow-auto tw-w-full tw-flex tw-justify-center tw-py-10 tw-bg-transparent'>
      {content}
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <div className='tw-flex tw-flex-row tw-items-center tw-w-full tw-h-20 tw-min-h-[80px] tw-border-b tw-border-slate-200'>
      <button className="tw-flex tw-items-center t tw-mr-10 tw-ml-auto tw-border-none tw-cursor-pointer tw-p-0" onClick={() => { }}>
        <svg className='tw-h-6 tw-fill-slate-500' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
          <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" />
        </svg>
      </button>
    </div >
  );
};

type FooterProps = {
  back: () => void;
  stepRef?: RefObject<SetupStep>;
};
export const Footer: React.FC<FooterProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const onClick = async () => {
    if (props.stepRef?.current) {
      setLoading(true);
      await props.stepRef.current.continue();
      setLoading(false);
    }
  };

  return (
    <div className='tw-flex tw-flex-row tw-w-full tw-h-20 tw-min-h-[80px] tw-border-t tw-border-slate-200 tw-mt-auto tw-items-center'>
      <button className='tw-border tw-border-slate-300 tw-font-medium tw-rounded-md tw-w-20 tw-h-10 tw-ml-20' onClick={props.back}>Back</button>
      {props.stepRef && <button onClick={onClick} className='tw-border tw-text-white tw-font-medium tw-bg-slate-700 tw-rounded-md tw-w-28 tw-h-10 tw-ml-auto tw-mr-20'>{loading ? <Loading light /> : "Continue"}</button>}
    </div>
  );
};