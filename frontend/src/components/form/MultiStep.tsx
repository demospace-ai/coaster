import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ReactElement, useState } from "react";
import { useLocalStorage } from "src/utils/localStorage";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";
import { ZodEnum, ZodError, ZodString } from "zod";

// TODO: find a way to use react-hook-form and Zod here
// TODO: right now steps must run validation themselves with raw Zod schemas
// TODO: rather than using the react-hook-form + Zod integration for controlled values

// TODO: use react-hook-form to validate the steps, without needing it to store state?
export const MultiStep: React.FC<MultiStepProps> = ({ id, steps, defaultValues }) => {
  const [state, setState] = useLocalStorage<Record<string, any>>(id, defaultValues || {});
  const [currentStepNumber, setCurrentStepNumber] = useLocalStorage<number>(id + "-step", 0);
  const [valid, setValid] = useLocalStorage<Record<string, boolean>>(id + "-valid", {});

  const previousStep = () => {
    setCurrentStepNumber(currentStepNumber - 1);
  };

  const nextStep = () => {
    if (valid[currentStep.id]) {
      setCurrentStepNumber(currentStepNumber + 1);
    }
  };

  const showBack = currentStepNumber > 0;
  const currentStep = steps[currentStepNumber];

  return (
    <div className="tw-w-full">
      <div className="tw-w-full tw-text-left tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-3">{currentStep.title}</div>
      {currentStep.subtitle && (
        <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-6">{currentStep.subtitle}</div>
      )}
      {currentStep.elementFn({
        id: currentStep.id,
        setCanContinue: (update: boolean) => {
          setValid((prev) => ({ ...prev, [currentStep.id]: update }));
        },
        setData: (value: any) => setState((prevState) => ({ ...prevState, [currentStep.id]: value })),
        data: state[currentStep.id],
      })}
      <div
        id="multistep-footer"
        className={mergeClasses("tw-flex tw-mt-6", showBack ? "tw-justify-between" : "tw-justify-end")}
      >
        <button
          onClick={previousStep}
          className={mergeClasses(
            showBack
              ? "tw-flex tw-justify-center tw-py-2 tw-w-24 tw-font-medium tw-border tw-border-solid tw-border-black tw-rounded-3xl "
              : "tw-hidden",
          )}
        >
          ←
        </button>
        <button
          onClick={nextStep}
          className={mergeClasses(
            "tw-flex tw-justify-center tw-py-2 tw-w-28 tw-rounded-3xl tw-bg-black tw-text-white tw-font-medium",
            !valid[currentStep.id] && "tw-cursor-not-allowed tw-bg-gray-400",
          )}
        >
          {currentStepNumber === steps.length - 1 ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export type MultiStepProps = {
  id: string;
  steps: Step[];
  defaultValues?: Record<string, any>;
};

export type Step = {
  id: string;
  elementFn: (params: StepParams) => ReactElement;
  title: string;
  subtitle?: string;
};

export type StepParams = {
  id: string;
  // Save data and canContinue are separate. Each step can and should save it's data to the MultiStep manager on
  // every change in order to benefit from the auto-save feature. However, the step should only set canContinue
  // to true when the data is valid.
  data: any;
  setData: (data: any) => void;
  setCanContinue: (canContinue: boolean) => void;
};

type InputProps = {
  schema: ZodString;
  placeholder?: string;
};

export const InputStep: React.FC<StepParams & InputProps> = ({ id, setCanContinue, setData, data, schema }) => {
  const [error, setError] = useState<ZodError | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setData(value);
    const result = schema.safeParse(value);
    if (result.success) {
      setError(null);
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  };

  const displayError = () => {
    const result = schema.safeParse(data);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <input
        key={id}
        type="text"
        className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
        value={data}
        onChange={handleChange}
        onBlur={displayError}
      />
      <ErrorMessage error={error} />
    </div>
  );
};

export const TextAreaStep: React.FC<StepParams & InputProps> = ({ id, setCanContinue, setData, data, schema }) => {
  const [error, setError] = useState<ZodError | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setData(value);
    const result = schema.safeParse(value);
    if (result.success) {
      setError(null);
      setCanContinue(true);
    } else {
      setError(result.error);
      setCanContinue(false);
    }
  };

  const displayError = () => {
    const result = schema.safeParse(data);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <textarea
        key={id}
        className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
        value={data}
        onChange={handleChange}
        onBlur={displayError}
      />
      <ErrorMessage error={error} />
    </div>
  );
};

type SelectorProps = {
  schema: ZodEnum<[string, ...string[]]>;
  placeholder?: string;
};

export const SelectorStep: React.FC<StepParams & SelectorProps> = ({ id, setCanContinue, setData, data, schema }) => {
  const handleChange = (value: string) => {
    if (value === data) {
      setData(undefined);
      setCanContinue(false);
    } else {
      setData(value);
      setCanContinue(true);
    }
  };
  schema.options[0];

  return (
    <div key={id} className="tw-flex tw-flex-col tw-items-center">
      {schema.options.map((option) => (
        <div
          key={option}
          className={mergeClasses(
            "tw-flex tw-justify-between tw-items-center tw-w-full tw-min-h-[56px] tw-px-4 tw-my-1 tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 sm:hover:tw-border-black tw-cursor-pointer",
            option === data && "tw-border-black",
          )}
          onClick={() => handleChange(option)}
        >
          {toTitleCase(option)}
          {option === data ? (
            <CheckCircleIcon className="tw-w-[25px] tw-mr-[-1px]" />
          ) : (
            <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-solid tw-border-gray-300 tw-rounded-3xl" />
          )}
        </div>
      ))}
    </div>
  );
};

export const ErrorMessage: React.FC<{ error: ZodError | null }> = ({ error }) => {
  return (
    <div
      className={mergeClasses(
        "tw-flex tw-transition-all tw-duration-100 tw-text-red-600 tw-mt-2 tw-w-full tw-text-xs tw-h-0",
        error && "tw-h-2",
      )}
    >
      {error && (
        <>
          <ExclamationCircleIcon className="tw-w-4 tw-h-4 tw-mr-1" />
          {error.errors[0].message}
        </>
      )}
    </div>
  );
};
