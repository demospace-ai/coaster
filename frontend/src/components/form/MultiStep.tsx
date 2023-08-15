import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactElement, useCallback, useState } from "react";
import { FieldError, UseFormHandleSubmit, useForm } from "react-hook-form";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";
import { ZodEnum, ZodString, z } from "zod";

export const MultiStep: React.FC<MultiStepProps> = ({ initialStepNumber, steps, onComplete }) => {
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(initialStepNumber);

  const isFirstStep = currentStepNumber === 0;
  const isLastStep = currentStepNumber === steps.length - 1;
  const currentStep = steps[currentStepNumber];

  const renderForm = useCallback(currentStep.elementFn, [currentStep]);

  const renderLayout = (
    canContinue: boolean,
    renderStep: () => ReactElement,
    submit?: () => Promise<SubmitResult>,
  ): ReactElement => {
    const nextStep = async () => {
      if (!canContinue) {
        return;
      }

      if (!submit) {
        if (isLastStep) {
          onComplete();
        } else {
          setCurrentStepNumber(currentStepNumber + 1);
        }
        return;
      }

      const result = await submit();
      if (result.success) {
        if (isLastStep) {
          onComplete();
        } else {
          setCurrentStepNumber(currentStepNumber + 1);
        }
      } else {
        // TODO: handle error
      }
    };

    const previousStep = () => {
      if (!isFirstStep) {
        setCurrentStepNumber(currentStepNumber - 1);
      }
    };

    return (
      <div className="tw-w-full">
        <div className="tw-w-full tw-text-left tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-3">
          {currentStep.title}
        </div>
        {currentStep.subtitle && (
          <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-6">{currentStep.subtitle}</div>
        )}
        {renderStep()}
        <div
          id="multistep-footer"
          className={mergeClasses("tw-flex tw-mt-6", isFirstStep ? "tw-justify-end" : "tw-justify-between")}
        >
          <button
            onClick={previousStep}
            className={mergeClasses(
              isFirstStep
                ? "tw-hidden"
                : "tw-flex tw-justify-center tw-py-2 tw-w-24 tw-font-medium tw-border tw-border-solid tw-border-black tw-rounded-3xl ",
            )}
          >
            ←
          </button>
          <button
            onClick={nextStep}
            className={mergeClasses(
              "tw-flex tw-justify-center tw-py-2 tw-w-28 tw-rounded-3xl tw-bg-black tw-text-white tw-font-medium",
              !canContinue && "tw-cursor-not-allowed tw-bg-gray-400",
            )}
          >
            {isLastStep ? "Submit" : "Continue"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderForm({
        id: currentStep.id,
        renderLayout: renderLayout,
      })}
    </>
  );
};

export type MultiStepProps = {
  initialStepNumber: number;
  steps: Step[];
  onComplete: () => void;
};

export type Step = {
  id: string;
  elementFn: (params: StepParams) => ReactElement;
  title: string;
  subtitle?: string;
};

export type SubmitResult = { success: boolean; error?: string }; // TODO: use discriminated union

export type StepParams = {
  id: string;
  renderLayout: (
    canContinue: boolean,
    render: () => ReactElement,
    submit?: () => Promise<SubmitResult>,
  ) => ReactElement;
};

type InputProps = {
  schema: ZodString;
  onChange?: (data: string) => void;
  onSubmit?: (data: string) => Promise<SubmitResult>;
  existingData?: string;
  placeholder?: string;
};

export const InputStep: React.FC<StepParams & InputProps> = ({
  id,
  schema,
  existingData,
  onChange,
  onSubmit,
  renderLayout,
}) => {
  const formSchema = z.object({
    value: schema,
  });
  const {
    handleSubmit,
    clearErrors,
    register,
    formState: { errors, isValid },
  } = useForm<{ value: string }>({
    mode: "onBlur",
    defaultValues: { value: existingData },
    resolver: zodResolver(formSchema),
  });

  return renderLayout(
    isValid,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center">
        <input
          key={id}
          type="text"
          className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
          {...register("value", {
            onChange: () => clearErrors("value"),
          })}
        />
        <ErrorMessage error={errors.value} />
      </div>
    ),
    onSubmit && wrapHandleSubmit(handleSubmit, onSubmit),
  );
};

export const TextAreaStep: React.FC<StepParams & InputProps> = ({
  id,
  schema,
  existingData,
  onChange,
  onSubmit,
  renderLayout,
}) => {
  const formSchema = z.object({
    value: schema,
  });
  const {
    handleSubmit,
    clearErrors,
    register,
    formState: { errors, isValid },
  } = useForm<{ value: string }>({
    mode: "onBlur",
    defaultValues: { value: existingData },
    resolver: zodResolver(formSchema),
  });

  return renderLayout(
    isValid,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center">
        <textarea
          key={id}
          className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
          {...register("value", {
            onChange: () => clearErrors("value"),
          })}
        />
        <ErrorMessage error={errors.value} />
      </div>
    ),
    onSubmit && wrapHandleSubmit(handleSubmit, onSubmit),
  );
};

type SelectorProps = {
  schema: ZodEnum<[string, ...string[]]>;
  onChange?: (data: string) => void;
  onSubmit?: (data: string) => Promise<SubmitResult>;
  existingData?: string;
  placeholder?: string;
};

export const SelectorStep: React.FC<StepParams & SelectorProps> = ({
  id,
  schema,
  existingData,
  onSubmit,
  onChange,
  renderLayout,
}) => {
  type schemaType = z.infer<typeof schema>;
  const [selected, setSelected] = useState<schemaType | null>(existingData || null);
  return renderLayout(
    selected !== null,
    () => (
      <div key={id} className="tw-flex tw-flex-col tw-items-center">
        {schema.options.map((option) => (
          <div
            key={option}
            className={mergeClasses(
              "tw-flex tw-justify-between tw-items-center tw-w-full tw-min-h-[56px] tw-px-4 tw-my-1 tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 sm:hover:tw-border-black tw-cursor-pointer tw-select-none",
              option === selected && "tw-border-black",
            )}
            onClick={async () => {
              if (option === selected) {
                setSelected(null);
              } else {
                setSelected(option);
                if (onChange) {
                  await onChange(option); // only call on change when a valid value is selected
                }
              }
            }}
          >
            {toTitleCase(option)}
            {option === selected ? (
              <CheckCircleIcon className="tw-w-[25px] tw-mr-[-1px]" />
            ) : (
              <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-solid tw-border-gray-300 tw-rounded-3xl" />
            )}
          </div>
        ))}
      </div>
    ),
    onSubmit && wrapSubmit(selected, selected !== null, onSubmit),
  );
};

export const ErrorMessage: React.FC<{ error: FieldError | undefined }> = ({ error }) => {
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
          {error.message}
        </>
      )}
    </div>
  );
};

// Convenience function to ensure a remote caller of onSubmit can await the result of the function
export const wrapHandleSubmit = (
  handleSubmit: UseFormHandleSubmit<{ value: any }>,
  onSubmit: (data: any) => Promise<SubmitResult>,
) => {
  return async () => {
    let result = { success: true };
    await handleSubmit(async (data) => {
      const innerResult = await onSubmit(data.value);
      result = { ...innerResult };
    })();

    return result;
  };
};

export const wrapSubmit = (value: any, isValid: boolean, onSubmit: (data: any) => Promise<SubmitResult>) => {
  return async () => {
    if (isValid) {
      return onSubmit(value);
    } else {
      return { success: false, error: "" };
    }
  };
};
