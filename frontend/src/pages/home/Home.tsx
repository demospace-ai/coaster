import { CheckIcon } from "@heroicons/react/24/outline";
import React from "react";
import { NavLink } from "react-router-dom";
import { useDestinations, useObjects } from "src/rpc/data";

export const Home: React.FC = () => {
  const setupStep = "tw-py-3 tw-px-4 tw-text-lg tw-font-medium tw-bg-white tw-border tw-border-slate-100 tw-rounded-lg tw-flex tw-items-center tw-mb-5 tw-cursor-pointer tw-shadow-md hover:tw-bg-slate-100";
  const stepNumber = "tw-h-8 tw-w-8 tw-rounded-full tw-border-2 tw-border-slate-400 tw-flex tw-justify-center tw-items-center tw-mr-2 tw-bg-white";

  const { destinations } = useDestinations();
  const { objects } = useObjects();

  const destinationCreated = destinations && destinations.length > 0;
  const objectCreated = objects && objects.length > 0;

  return (
    <div className="tw-h-full tw-py-8 tw-px-10">
      <div className="tw-text-2xl tw-font-bold tw-text-slate-700 tw-mb-5">
        Setup Checklist
      </div>
      <NavLink className={setupStep} to='/destinations'>
        <div className={stepNumber}>{destinationCreated ? <CheckIcon className="tw-m-1 tw-stroke-2" /> : 1}</div>
        Connect your data warehouse as a destination
      </NavLink>
      <NavLink className={setupStep} to='/objects'>
        <div className={stepNumber}>{objectCreated ? <CheckIcon className="tw-m-1 tw-stroke-2" /> : 2}</div>
        Define objects that customers can send to you
      </NavLink>
      <a className={setupStep} href="https://docs.fabra.io/guides/fabra-connect" target="_blank" rel="noreferrer">
        <div className={stepNumber}>3</div>
        Add the Fabra Connect frontend component to your application
      </a>
      <div className={setupStep}>
        <div className={stepNumber}>4</div>
        (Optional) Setup Slack or email notifications for any issues
      </div>
    </div >
  );
};