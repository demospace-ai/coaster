import { CheckIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router-dom";
import { useDestinations, useObjects } from "src/rpc/data";

export const Home: React.FC = () => {
  const setupStep =
    "tw-py-3 tw-px-4 tw-text-base tw-font-medium tw-bg-white tw-border tw-border-slate-100 tw-rounded-lg tw-flex tw-items-center tw-mb-5 tw-cursor-pointer tw-shadow-md hover:tw-bg-slate-100";
  const stepNumber =
    "tw-h-6 tw-w-6 tw-text-sm tw-rounded-full tw-border-2 tw-border-slate-400 tw-flex tw-justify-center tw-items-center tw-mr-2 tw-bg-white";

  const { destinations } = useDestinations();
  const { objects } = useObjects();

  const destinationCreated = destinations && destinations.length > 0;
  const objectCreated = objects && objects.length > 0;

  return (
    <div className="tw-h-full tw-py-7 tw-px-10">
      <div className="tw-m-auto tw-max-w-lg">
        <div className="tw-flex tw-flex-col tw-mb-5 tw-justify-end tw-font-bold tw-text-2xl">Welcome to Fabra!</div>
        <div className="tw-mb-4">
          Follow these steps to provide Fabra with information about your data warehouse and define the data objects
          customers will send. <br />
          <br />
          Then, you can preview what it all looks like to the end customer.
        </div>
        <div className="tw-flex tw-flex-col tw-mb-5 tw-justify-end tw-font-bold tw-text-lg tw-h-[29px]">
          Setup Checklist
        </div>
        <NavLink className={classNames(setupStep, destinationCreated && "tw-line-through")} to="/destinations">
          <div className={stepNumber}>
            {destinationCreated ? <CheckIcon className="tw-m-0.5 tw-w-full tw-stroke-2" /> : 1}
          </div>
          Connect your data warehouse as a destination
        </NavLink>
        <NavLink className={classNames(setupStep, objectCreated && "tw-line-through")} to="/objects">
          <div className={stepNumber}>
            {objectCreated ? <CheckIcon className="tw-m-0.5 tw-w-full  tw-stroke-2" /> : 2}
          </div>
          Define objects that customers can send to you
        </NavLink>
        <a className={setupStep} href="https://docs.fabra.io/guides/fabra-connect" target="_blank" rel="noreferrer">
          <div className={stepNumber}>3</div>
          Add the Fabra Connect frontend component to your application
        </a>
        {/* Remove until there's a real notifications tab, otherwise customer clicks on it and it doesn't do anything. Bad experience. */}
        {/* <div className={setupStep}>
        <div className={stepNumber}>4</div>
        (Optional) Setup Slack or email notifications for any issues
      </div> */}
      </div>
    </div>
  );
};
