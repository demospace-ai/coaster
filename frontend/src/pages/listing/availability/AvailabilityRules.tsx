import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { DateRangePicker } from "src/components/calendar/DatePicker";
import { Step, StepProps, WizardNavButtons, wrapHandleSubmit, wrapSubmit } from "src/components/form/MultiStep";
import { RadioInput, TimeInput } from "src/components/input/Input";
import {
  NewAvailabilityRuleState,
  NewRuleStep,
  RuleTypeSchema,
  RuleTypeSchemaType,
  TimeSlotInputSchema,
  TimeSlotInputType,
  UpdateAvailabilityRuleSchema,
  UpdateAvailabilityRuleSchemaType,
  useStateMachine,
} from "src/pages/listing/availability/state";
import { useCreateAvailabilityRule, useUpdateAvailabilityRule } from "src/rpc/data";
import {
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityRuleUpdates,
  AvailabilityType,
  AvailabilityTypeType,
} from "src/rpc/types";
import useWindowDimensions from "src/utils/window";

export const NewRuleForm: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const { state, setState, nextStep, prevStep } = useStateMachine(closeModal);

  let currentStep: Step;
  switch (state.step) {
    case NewRuleStep.RuleType:
      currentStep = {
        title: "What kind of rule do you want to create?",
        element: <RuleTypeStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.DateRange:
      currentStep = {
        title: "Select a date range for the rule.",
        element: <DateRangeStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.TimeSlots:
      currentStep = {
        title: "Setup time slots for this rule.",
        element: <TimeSlotStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.SingleDate: {
      throw new Error("Not implemented yet: NewRuleStep.SingleDate case");
    }
    case NewRuleStep.Recurring: {
      throw new Error("Not implemented yet: NewRuleStep.Recurring case");
    }
    case NewRuleStep.TimeSlots: {
      throw new Error("Not implemented yet: NewRuleStep.TimeSlots case");
    }
  }

  return (
    <div className="tw-w-[320px] sm:tw-w-[640px] md:tw-w-[800px] tw-max-h-[50%] tw-px-8 sm:tw-px-12 tw-pb-10 tw-overflow-scroll">
      <div className="tw-text-left tw-w-full tw-text-2xl sm:tw-text-3xl tw-font-semibold tw-mb-3">
        New Availability Rule
      </div>
      <div className="tw-w-full">
        <div className="tw-w-full tw-text-left tw-text-lg sm:tw-text-xl tw-font-medium tw-mb-3">
          {currentStep.title}
        </div>
        {currentStep.subtitle && (
          <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-6">{currentStep.subtitle}</div>
        )}
        {currentStep.element}
      </div>
    </div>
  );
};

const RuleTypeStep = ({ values, setValue, nextStep, prevStep }: StepProps<NewAvailabilityRuleState>) => {
  const { control, watch, formState } = useForm<RuleTypeSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(RuleTypeSchema),
    defaultValues: {
      type: values?.type,
    },
  });

  const type = watch("type");
  return (
    <>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <RadioInput
            options={AvailabilityRuleType.options}
            getElementForDisplay={getAvailabilityRuleTypeDisplay}
            getElementForDetail={getAvailabilityRuleTypeDetail}
            {...field}
            onChange={(value) => {
              field.onChange(value);
              setValue && setValue((prev) => ({ ...prev, type: value }));
            }}
            value={type ? type : ""}
          />
        )}
      />
      <FormError message={formState.errors.root?.message} />
      <WizardNavButtons canContinue={formState.isValid} nextStep={nextStep} prevStep={prevStep} />
    </>
  );
};

const DateRangeStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const initialValue =
    values?.start_date && values?.end_date ? { from: values.start_date, to: values.end_date } : undefined;
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isValid = Boolean(selectedRange && selectedRange.from && selectedRange.to);
  const onSubmit = async (values: DateRange) => {
    if (values && values.from && values.to) {
      setValue && setValue((prev) => ({ ...prev, start_date: values.from }));
      setValue && setValue((prev) => ({ ...prev, end_date: values.to }));
      return { success: true };
    } else {
      return { success: false, error: "Please select a date range." };
    }
  };

  return (
    <>
      <div className="tw-flex tw-justify-center">
        <DateRangePicker
          mode="range"
          disabled={{ before: new Date() }}
          numberOfMonths={isMobile ? 1 : 2}
          selected={selectedRange}
          onSelect={setSelectedRange}
          className="tw-mb-5"
        />
      </div>
      <FormError message={error} />
      <WizardNavButtons
        canContinue={isValid}
        nextStep={wrapSubmit(isValid, selectedRange, onSubmit, setError, nextStep)}
        prevStep={prevStep}
      />
    </>
  );
};

const TimeSlotStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const { mutate, isLoading } = useCreateAvailabilityRule();
  const { handleSubmit, control, formState, setError } = useForm<TimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(TimeSlotInputSchema),
  });
  const { fields } = useFieldArray({
    control,
    name: "time_slots",
  });

  const createAvailabilityRule = async () => {
    const payload = {} as AvailabilityRuleInput;
    // TODO

    try {
      await mutate(payload);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Something went wrong." };
    }
  };

  return (
    <>
      <TimeInput value={""} className="tw-mb-5" />
      <WizardNavButtons
        canContinue={formState.isValid}
        nextStep={wrapHandleSubmit(
          handleSubmit,
          createAvailabilityRule,
          (error: string) => setError("time_slots", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
      />
    </>
  );
};

export const ExistingRuleForm: React.FC<{ existingRule: AvailabilityRule; closeModal: () => void }> = ({
  existingRule,
  closeModal,
}) => {
  const { mutate, isLoading } = useUpdateAvailabilityRule(existingRule.id);
  const { handleSubmit, register, watch, formState, getFieldState } = useForm<UpdateAvailabilityRuleSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(UpdateAvailabilityRuleSchema),
    defaultValues: {
      name: existingRule?.name,
      type: existingRule?.type,
      start_date: existingRule?.start_date,
      end_date: existingRule?.end_date,
      recurring_years: existingRule?.recurring_years,
      recurring_months: existingRule?.recurring_months,
      time_slots: existingRule?.time_slots,
    },
  });

  const updateAvailability = async (values: UpdateAvailabilityRuleSchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    formState.dirtyFields.name && (payload.name = values.name);
    // TODO

    try {
      await mutate(payload);
      // TODO: show toast?
      closeModal();
    } catch (e) {
      //TODO
    }
  };

  return (
    <form
      className="tw-w-[320px] sm:tw-w-[640px] tw-max-h-[50%] tw-px-8 sm:tw-px-12 tw-pb-10 tw-overflow-scroll"
      onSubmit={handleSubmit(updateAvailability)}
    >
      <div className="tw-text-center tw-w-full tw-text-xl tw-font-semibold tw-mb-5">Update Availability Rule</div>
    </form>
  );
};

export function getAvailabilityTypeDisplay(value: AvailabilityTypeType) {
  switch (value) {
    case AvailabilityType.Enum.date:
      return "Full day (customer just chooses a date)";
    case AvailabilityType.Enum.datetime:
      return "Date and time (customer chooses a date and time slot)";
  }
}

export function getAvailabilityRuleTypeDisplay(value: AvailabilityRuleTypeType) {
  switch (value) {
    case AvailabilityRuleType.Enum.fixed_date:
      return "Single Date";
    case AvailabilityRuleType.Enum.fixed_range:
      return "Fixed Range";
    case AvailabilityRuleType.Enum.recurring:
      return "Recurring";
  }
}

function getAvailabilityRuleTypeDetail(value: AvailabilityRuleTypeType) {
  switch (value) {
    case AvailabilityRuleType.Enum.fixed_date:
      return "Create a rule that applies to a single date";
    case AvailabilityRuleType.Enum.fixed_range:
      return "Create a rule that applies to a range of dates";
    case AvailabilityRuleType.Enum.recurring:
      return "Create a rule that applies to a recurring set of dates";
  }
}
