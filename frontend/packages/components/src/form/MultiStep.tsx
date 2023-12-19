"use client";

import { mergeClasses, toTitleCase } from "@coaster/utils/common";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import { Controller, FieldError, FieldValues, UseFormHandleSubmit, useForm } from "react-hook-form";
import { ZodArray, ZodEffects, ZodEnum, ZodString, z } from "zod";
import { FormError } from "../error/FormError";
import { RichTextEditor } from "../input/Input";
import { Loading } from "../loading/Loading";

export const WizardNavButtons: React.FC<{
  className?: string;
  disabled?: boolean;
  nextStep: (() => void) | undefined;
  prevStep: (() => void) | undefined;
  isLastStep?: boolean;
  isLoading?: boolean;
}> = ({ className, disabled, isLastStep, isLoading, nextStep, prevStep }) => {
  return (
    <div
      id="multistep-footer"
      className={mergeClasses(
        "tw-flex tw-mt-6 tw-mb-1",
        !prevStep ? "tw-justify-end" : "tw-justify-between",
        className,
      )}
    >
      <button
        onClick={prevStep}
        className={mergeClasses(
          !prevStep
            ? "tw-hidden"
            : "tw-flex tw-justify-center tw-py-2 tw-w-24 tw-font-medium tw-border tw-border-solid tw-border-black tw-rounded-3xl ",
        )}
      >
        ←
      </button>
      <button
        onClick={() => {
          !disabled && nextStep && nextStep();
        }}
        className={mergeClasses(
          "tw-flex tw-justify-center tw-py-2 tw-w-28 tw-rounded-3xl tw-bg-black tw-border tw-border-solid tw-border-black tw-text-white tw-font-medium",
          disabled && "tw-cursor-not-allowed tw-bg-gray-400 tw-border-gray-400",
        )}
      >
        {isLoading ? <Loading /> : isLastStep ? "Submit" : "Continue"}
      </button>
    </div>
  );
};

export type Step = {
  element: ReactElement;
  title?: ReactElement | string;
  subtitle?: string;
};

export type SubmitResult = { success: boolean; error?: string }; // TODO: use discriminated union

export type StepProps<T extends FieldValues | undefined = undefined> = {
  setValue?: Dispatch<SetStateAction<T>>;
  nextStep: (() => void) | undefined;
  prevStep: (() => void) | undefined;
} & (T extends undefined ? { values?: never } : { values: T });

type InputProps = {
  schema: ZodEffects<ZodString> | ZodString;
  onChange?: (data: { value: string }) => void;
  onSubmit?: (data: { value: string }) => Promise<SubmitResult>;
  existingData?: string;
  placeholder?: string;
};

export const InputStep = <T extends FieldValues | undefined>({
  schema,
  existingData,
  onSubmit,
  nextStep,
  prevStep,
}: StepProps<T> & InputProps) => {
  const formSchema = z.object({
    value: schema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    handleSubmit,
    clearErrors,
    register,
    setError,
    formState: { errors },
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
        nextStep={wrapHandleSubmit(
          handleSubmit,
          onSubmit,
          (error: string) => setError("value", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
      />
    </>
  );
};

export const TextAreaStep = <T extends FieldValues | undefined>({
  schema,
  existingData,
  onSubmit,
  nextStep,
  prevStep,
}: StepProps<T> & InputProps) => {
  const formSchema = z.object({
    value: schema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    handleSubmit,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<formSchemaType>({
    mode: "onBlur",
    defaultValues: { value: existingData ?? "" },
    resolver: zodResolver(formSchema),
  });

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              setValue={(e) => {
                field.onChange(e);
                clearErrors();
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <ErrorMessage error={errors.value} />
      </div>
      <WizardNavButtons
        nextStep={wrapHandleSubmit(
          handleSubmit,
          onSubmit,
          (error: string) => setError("value", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
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

export const SelectorStep = <T extends FieldValues | undefined>({
  schema,
  existingData,
  onChange,
  onSubmit,
  nextStep,
  prevStep,
}: StepProps<T> & SelectorProps) => {
  type schemaType = z.infer<typeof schema>;
  const [error, setError] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<schemaType | undefined>(existingData || undefined);

  const onSubmitWrapper = async () => {
    if (selected !== undefined) {
      if (onSubmit) {
        const result = await onSubmit(selected);
        if (result.success) {
          nextStep && nextStep();
        } else {
          setError(result.error);
        }
      } else {
        nextStep && nextStep();
      }
    } else {
      setError("Please select an option.");
    }
  };

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
                setSelected(undefined);
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
      <FormError message={error} />
      <WizardNavButtons nextStep={onSubmitWrapper} prevStep={prevStep} />
    </>
  );
};

type MultiSelectorProps = {
  schema: ZodArray<ZodEnum<[string, ...string[]]>>;
  onChange?: (data: string[]) => Promise<SubmitResult>;
  onSubmit?: (data: string[]) => Promise<SubmitResult>;
  existingData?: string[];
  placeholder?: string;
  getDisplayName?: (option: string) => string;
};

export const MultiSelectorStep = <T extends FieldValues | undefined>({
  schema,
  existingData,
  onChange,
  onSubmit,
  nextStep,
  prevStep,
  getDisplayName,
}: StepProps<T> & MultiSelectorProps) => {
  type schemaType = z.infer<typeof schema>;
  const [error, setError] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<schemaType>(existingData || []);

  const onSubmitWrapper = async () => {
    if (selected !== undefined) {
      if (onSubmit) {
        const result = await onSubmit(selected);
        if (result.success) {
          nextStep && nextStep();
        } else {
          setError(result.error);
        }
      } else {
        nextStep && nextStep();
      }
    } else {
      setError("Please select an option.");
    }
  };

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
        {schema.element.options.map((option) => (
          <div
            key={option}
            className={mergeClasses(
              "tw-flex tw-justify-between tw-items-center tw-w-full tw-min-h-[56px] tw-px-4 tw-my-1 tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 sm:hover:tw-border-black tw-cursor-pointer tw-select-none",
              selected.includes(option) && "tw-border-black",
            )}
            onClick={async () => {
              if (selected.includes(option)) {
                setSelected([...selected.filter((item) => item !== option)]);
              } else {
                setSelected([...selected, option]);
                if (onChange) {
                  await onChange([...selected, option]); // only call on change when a valid value is selected
                }
              }
            }}
          >
            {getDisplayName ? getDisplayName(option) : option}
            {selected.includes(option) ? (
              <CheckCircleIcon className="tw-w-[25px] tw-mr-[-1px]" />
            ) : (
              <div className="tw-w-5 tw-h-5 tw-border-2 tw-border-solid tw-border-gray-300 tw-rounded-3xl" />
            )}
          </div>
        ))}
      </div>
      <FormError message={error} />
      <WizardNavButtons nextStep={onSubmitWrapper} prevStep={prevStep} />
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

export function wrapHandleSubmit<T extends FieldValues>(
  handleSubmit: UseFormHandleSubmit<T>,
  onSubmit: ((values: T) => Promise<SubmitResult>) | undefined,
  setError: (error: string) => void,
  nextStep?: () => void,
) {
  return handleSubmit(async (values: T) => {
    if (onSubmit) {
      const result = await onSubmit(values);
      if (result.success) {
        nextStep && nextStep();
      } else {
        setError(result.error ? result.error : "Something went wrong.");
      }
    } else {
      nextStep && nextStep();
    }
  });
}
