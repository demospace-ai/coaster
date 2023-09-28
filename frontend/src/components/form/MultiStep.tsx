import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactElement, useState } from "react";
import { FieldError, FieldValues, UseFormHandleSubmit, UseFormSetValue, useForm } from "react-hook-form";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";
import { ZodEnum, ZodString, z } from "zod";

export const WizardNavButtons: React.FC<{
  submit?: () => Promise<SubmitResult>;
  isLastStep?: boolean;
  canContinue: boolean;
  stepNumber: number;
  setCurrentStepNumber: (stepNumber: number) => void;
}> = ({ submit, canContinue, isLastStep, stepNumber, setCurrentStepNumber }) => {
  const isFirstStep = stepNumber === 0;

  const previousStep = () => {
    if (!isFirstStep) {
      setCurrentStepNumber(stepNumber - 1);
    }
  };

  const nextStep = async () => {
    if (!canContinue) {
      return;
    }

    if (!submit) {
      setCurrentStepNumber(stepNumber + 1);
      return;
    }

    const result = await submit();
    if (result.success) {
      setCurrentStepNumber(stepNumber + 1);
    } else {
      // TODO: handle error
    }
  };

  return (
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
  );
};

export type Step = {
  element: ReactElement;
  title: string;
  subtitle?: string;
};

export type SubmitResult = { success: boolean; error?: string }; // TODO: use discriminated union

export type StepProps<T extends FieldValues> = {
  values: T | undefined;
  stepNumber: number;
  setCurrentStepNumber: (stepNumber: number) => void;
  setValue?: UseFormSetValue<T>;
};

type InputProps = {
  schema: ZodString;
  onChange?: (data: { value: string }) => void;
  onSubmit?: (data: { value: string }) => Promise<SubmitResult>;
  existingData?: string;
  placeholder?: string;
};

export const InputStep = <T extends FieldValues>({
  stepNumber,
  setCurrentStepNumber,
  schema,
  existingData,
  onSubmit,
}: StepProps<T> & InputProps) => {
  const formSchema = z.object({
    value: schema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    handleSubmit,
    clearErrors,
    register,
    formState: { errors, isValid },
  } = useForm<formSchemaType>({
    mode: "onBlur",
    defaultValues: { value: existingData },
    resolver: zodResolver(formSchema),
  });

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
        <input
          type="text"
          className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
          {...register("value", {
            onChange: () => clearErrors("value"),
          })}
        />
        <ErrorMessage error={errors.value} />
      </div>
      <WizardNavButtons
        submit={wrapHandleSubmit(handleSubmit, onSubmit)}
        canContinue={true}
        stepNumber={stepNumber}
        setCurrentStepNumber={setCurrentStepNumber}
      />
    </>
  );
};

export const TextAreaStep = <T extends FieldValues>({
  schema,
  existingData,
  onSubmit,
  stepNumber,
  setCurrentStepNumber,
}: StepProps<T> & InputProps) => {
  const formSchema = z.object({
    value: schema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    handleSubmit,
    clearErrors,
    register,
    formState: { errors, isValid },
  } = useForm<formSchemaType>({
    mode: "onBlur",
    defaultValues: { value: existingData },
    resolver: zodResolver(formSchema),
  });

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
        <textarea
          className="tw-flex tw-py-3 tw-px-3 tw-w-full tw-outline-0 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-base tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-m-[-1px] focus-within:tw-px-[11px] tw-cursor-text"
          {...register("value", {
            onChange: () => clearErrors("value"),
          })}
        />
        <ErrorMessage error={errors.value} />
      </div>
      <WizardNavButtons
        submit={wrapHandleSubmit(handleSubmit, onSubmit)}
        canContinue={true}
        stepNumber={stepNumber}
        setCurrentStepNumber={setCurrentStepNumber}
      />
    </>
  );
};

type SelectorProps = {
  schema: ZodEnum<[string, ...string[]]>;
  onChange?: (data: string) => Promise<SubmitResult>;
  onSubmit?: (data: string) => Promise<SubmitResult>;
  existingData?: string;
  placeholder?: string;
};

export const SelectorStep = <T extends FieldValues>({
  schema,
  existingData,
  stepNumber,
  setCurrentStepNumber,
  onChange,
  onSubmit,
}: StepProps<T> & SelectorProps) => {
  type schemaType = z.infer<typeof schema>;
  const [selected, setSelected] = useState<schemaType | null>(existingData || null);
  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
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
      <WizardNavButtons
        submit={wrapSubmit(selected, selected !== null, onSubmit)}
        canContinue={true}
        stepNumber={stepNumber}
        setCurrentStepNumber={setCurrentStepNumber}
      />
    </>
  );
};

export const ErrorMessage: React.FC<{ error: FieldError | undefined }> = ({ error }) => {
  return (
    <div
      className={mergeClasses(
        "tw-flex tw-transition-all tw-duration-100 tw-text-red-600 tw-mt-1 tw-w-full tw-text-xs tw-h-0",
        error && "tw-h-2 tw-mb-3",
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
export function wrapHandleSubmit<T extends FieldValues>(
  handleSubmit: UseFormHandleSubmit<T>,
  onSubmit: ((data: T) => Promise<SubmitResult>) | undefined,
) {
  return async () => {
    let result = { success: true };
    await handleSubmit(async (data) => {
      if (onSubmit) {
        const innerResult = await onSubmit(data);
        result = { ...innerResult };
      }
    })();

    return result;
  };
}

export const wrapSubmit = (
  value: any,
  isValid: boolean,
  onSubmit: ((data: any) => Promise<SubmitResult>) | undefined,
) => {
  return async () => {
    if (isValid) {
      if (onSubmit) {
        return onSubmit(value);
      } else {
        return { success: true };
      }
    } else {
      return { success: false, error: "" };
    }
  };
};
