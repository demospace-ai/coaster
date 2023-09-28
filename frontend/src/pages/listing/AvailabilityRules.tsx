import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Step, StepProps, WizardNavButtons, wrapHandleSubmit } from "src/components/form/MultiStep";
import { RadioInput, TimeInput } from "src/components/input/Input";
import { TimeSlotSchema } from "src/pages/listing/schema";
import { useCreateAvailabilityRule, useUpdateAvailabilityRule } from "src/rpc/data";
import {
  AvailabilityRule,
  AvailabilityRuleInput,
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityType,
  AvailabilityTypeType,
} from "src/rpc/types";
import { z } from "zod";

const NewAvailabilityRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType,
  start_date: z.date(),
  end_date: z.date(),
  recurring_years: z.array(z.number()),
  recurring_months: z.array(z.number()),
  time_slots: z.array(TimeSlotSchema),
});

type NewAvailabilityRuleSchemaType = z.infer<typeof NewAvailabilityRuleSchema>;

export const NewRuleForm: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const { mutate, isLoading } = useCreateAvailabilityRule();
  const { handleSubmit, setValue, watch, formState } = useForm<NewAvailabilityRuleSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(NewAvailabilityRuleSchema),
  });

  const [currentStepNumber, setCurrentStepNumber] = useState<number>(0);
  const steps: Step[] = [
    {
      title: "What kind of rule do you want to create?",
      element: (
        <RuleTypeStep stepNumber={0} values={watch()} setCurrentStepNumber={setCurrentStepNumber} setValue={setValue} />
      ),
    },
    {
      title: "Setup time slots for this rule.",
      element: (
        <TimeSlotStep stepNumber={1} values={watch()} setCurrentStepNumber={setCurrentStepNumber} setValue={setValue} />
      ),
    },
  ];
  const currentStep = steps[currentStepNumber];

  const updateAvailability = async (values: NewAvailabilityRuleSchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload = {} as AvailabilityRuleInput;
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
      <div className="tw-text-center tw-w-full tw-text-3xl tw-font-semibold tw-mb-5">New Availability Rule</div>
      <div className="tw-w-full">
        <div className="tw-w-full tw-text-left tw-text-xl tw-font-medium tw-mb-3">{currentStep.title}</div>
        {currentStep.subtitle && (
          <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-6">{currentStep.subtitle}</div>
        )}
        {currentStep.element}
      </div>
    </form>
  );
};

const RuleTypeSchema = z.object({ type: AvailabilityRuleType });
type RuleTypeSchemaType = z.infer<typeof RuleTypeSchema>;

const RuleTypeStep = ({
  values,
  stepNumber,
  setCurrentStepNumber,
  setValue,
}: StepProps<NewAvailabilityRuleSchemaType>) => {
  const { handleSubmit, control, watch, formState } = useForm<RuleTypeSchemaType>({
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
            value={type ? type : ""}
          />
        )}
      />
      <WizardNavButtons
        submit={wrapHandleSubmit(handleSubmit, async (values) => {
          setValue && setValue("type", values.type);
          return { success: true };
        })}
        canContinue={formState.isValid}
        stepNumber={stepNumber}
        setCurrentStepNumber={setCurrentStepNumber}
      />
    </>
  );
};

const TimeSlotInputSchema = z.object({ time_slots: z.array(TimeSlotSchema) });
type TimeSlotInputType = z.infer<typeof TimeSlotInputSchema>;

const TimeSlotStep: React.FC<StepProps<NewAvailabilityRuleSchemaType>> = ({
  stepNumber,
  setCurrentStepNumber,
  setValue,
}) => {
  const { handleSubmit, control, formState } = useForm<TimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(TimeSlotInputSchema),
  });
  const { fields } = useFieldArray({
    control,
    name: "time_slots",
  });

  return (
    <>
      <TimeInput value={""} className="tw-mb-5" />
      <WizardNavButtons
        submit={wrapHandleSubmit(handleSubmit, async (values) => {
          setValue && setValue("time_slots", values.time_slots);
          return { success: true };
        })}
        canContinue={formState.isValid}
        stepNumber={stepNumber}
        setCurrentStepNumber={setCurrentStepNumber}
      />
    </>
  );
};

const UpdateAvailabilityRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType,
  start_date: z.date(),
  end_date: z.date(),
  recurring_years: z.array(z.number()),
  recurring_months: z.array(z.number()),
  time_slots: z.array(TimeSlotSchema),
});

type UpdateAvailabilityRuleSchemaType = z.infer<typeof UpdateAvailabilityRuleSchema>;

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

    const payload = {} as AvailabilityRuleInput;
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
