import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { DateRangePicker, correctToUTC } from "src/components/calendar/DatePicker";
import { Step, StepProps, WizardNavButtons } from "src/components/form/MultiStep";
import { DropdownInput, Input, RadioInput } from "src/components/input/Input";
import { useShowToast } from "src/components/notifications/Notifications";
import {
  SingleDayTimeSlotFields,
  WeekDayTimeSlotFields,
  getAvailabilityRuleTypeDisplay,
} from "src/pages/listing/edit/availability/AvailabilityRules";
import {
  InitialRuleStepSchema,
  InitialRuleStepSchemaType,
  NewAvailabilityRuleState,
  NewRuleStep,
  RecurringOptionsSchema,
  RecurringOptionsSchemaType,
  SingleDayTimeSlotInputSchema,
  SingleDayTimeSlotInputType,
  TimeSlotInputSchema,
  TimeSlotInputType,
  useStateArray,
  useStateMachine,
} from "src/pages/listing/edit/availability/state";
import { SingleDayTimeSlotSchemaType, TimeSlotSchemaType } from "src/pages/listing/schema";
import { useCreateAvailabilityRule } from "src/rpc/data";
import {
  AvailabilityRuleInput,
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityType,
  Listing,
} from "src/rpc/types";

export const NewRuleForm: React.FC<{ closeModal: () => void; listing: Listing }> = ({ closeModal, listing }) => {
  const { state, setState, nextStep, prevStep } = useStateMachine(closeModal, listing);

  let currentStep: Step;
  switch (state.step) {
    case NewRuleStep.InitialRuleStep:
      currentStep = {
        title: "Setup the basics for your new availability rule.",
        element: <InitialRuleStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.SingleDate:
      currentStep = {
        title: "Select a single date for the rule.",
        element: <SingleDateStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.DateRange:
      currentStep = {
        title: "Select a date range for the rule.",
        element: <DateRangeStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.Recurring:
      currentStep = {
        element: <RecurringStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.TimeSlots:
      currentStep = {
        title: "Setup time slots for this rule.",
        element: <TimeSlotStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
    case NewRuleStep.SingleDayTimeSlots:
      currentStep = {
        title: "Setup time slots for this rule.",
        element: <SingleDayTimeSlotStep nextStep={nextStep} prevStep={prevStep} values={state} setValue={setState} />,
      };
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-[320px] sm:tw-w-[480px] md:tw-w-[640px] lg:tw-w-[900px] tw-h-[80vh] sm:tw-h-[70vh] 4xl:tw-h-[65vh] tw-px-8 sm:tw-px-12 tw-pb-10 tw-border-box">
      <div className="tw-text-left tw-w-full tw-text-2xl tw-font-semibold tw-mb-2">New Availability Rule</div>
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-hidden">
        {currentStep.title && <div className="tw-w-full tw-text-left tw-text-xl tw-mb-4">{currentStep.title}</div>}
        {currentStep.subtitle && (
          <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-4">{currentStep.subtitle}</div>
        )}
        {currentStep.element}
      </div>
    </div>
  );
};

const InitialRuleStep = ({ values, setValue, nextStep, prevStep }: StepProps<NewAvailabilityRuleState>) => {
  const { handleSubmit, control, register, watch, formState } = useForm<InitialRuleStepSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(InitialRuleStepSchema),
    defaultValues: {
      name: values?.name,
      type: values?.type,
    },
  });

  const type = watch("type");
  const { onChange: onNameChange, ...nameProps } = register("name");

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start tw-overflow-y-scroll tw-pb-16">
        <div className="tw-text-lg tw-font-medium tw-mb-4">Provide a name for this rule</div>
        <Input
          {...nameProps}
          onChange={(e) => {
            onNameChange(e);
            setValue && setValue((prev) => ({ ...prev, name: e.target.value }));
          }}
          value={watch("name")}
          className="tw-w-full sm:tw-w-80"
          placeholder="E.g. 2020 Summer Availability"
        />
        <FormError message={formState.errors.name?.message} />
        <div className="tw-text-lg tw-font-medium tw-mt-5 tw-mb-4">What kind of rule do you want to create?</div>
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
        <FormError message={formState.errors.type?.message} />
        <FormError message={formState.errors.root?.message} />
      </div>
      <WizardNavButtons
        nextStep={handleSubmit(() => {
          nextStep && nextStep();
        })}
        prevStep={prevStep}
      />
    </div>
  );
};

const SingleDateStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const [selected, setSelected] = useState<Date | undefined>(values.start_date);
  const [error, setError] = useState<string | undefined>(undefined);
  const showToast = useShowToast();
  const createAvailabilityRule = useCreateAvailabilityRule(values.listingID, {
    onSuccess: () => {
      showToast("success", "Successfully created rule");
      nextStep && nextStep();
    },
  });

  const onSubmit = async () => {
    if (!values) {
      return setError("Something went wrong.");
    }

    if (!selected) {
      return setError("Please select a date.");
    }

    if (values.availabilityType === AvailabilityType.Enum.datetime) {
      setValue && setValue((prev) => ({ ...prev, start_date: selected }));
      return nextStep && nextStep();
    } else {
      const payload = {} as AvailabilityRuleInput;

      if (!values.name) {
        return setError("Make sure you've provided a name for your rule.");
      }

      if (!values.type) {
        return setError("Make sure you've selected a rule type.");
      }

      payload.name = values.name;
      payload.type = values.type;
      payload.start_date = correctToUTC(selected);

      // must send empty time slot for full day listings
      payload.time_slots = [{}];

      createAvailabilityRule.mutate(payload);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow sm:tw-mt-10">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start tw-items-center">
        <DateRangePicker
          mode="single"
          disabled={{ before: new Date() }}
          selected={selected}
          onSelect={setSelected}
          className="sm:tw-mb-5"
        />
      </div>
      <FormError message={error} />
      <FormError message={createAvailabilityRule.error?.message} />
      <WizardNavButtons
        nextStep={onSubmit}
        prevStep={prevStep}
        isLoading={createAvailabilityRule.isLoading}
        isLastStep={values?.availabilityType === AvailabilityType.Enum.date}
      />
    </div>
  );
};

const DateRangeStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const initialValue =
    values?.start_date && values?.end_date ? { from: values.start_date, to: values.end_date } : undefined;
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const showToast = useShowToast();
  const createAvailabilityRule = useCreateAvailabilityRule(values.listingID, {
    onSuccess: () => {
      showToast("success", "Successfully created rule");
      nextStep && nextStep();
    },
  });

  const onSubmit = async () => {
    if (!values) {
      return setError("Something went wrong.");
    }

    if (!selectedRange || !selectedRange.from || !selectedRange.to) {
      return setError("Please select a date range.");
    }

    if (values.availabilityType === AvailabilityType.Enum.datetime) {
      setValue && setValue((prev) => ({ ...prev, start_date: selectedRange.from }));
      setValue && setValue((prev) => ({ ...prev, end_date: selectedRange.to }));
      return nextStep && nextStep();
    } else {
      const payload = {} as AvailabilityRuleInput;

      if (!values.name) {
        return setError("Make sure you've provided a name for your rule.");
      }

      if (!values.type) {
        return setError("Make sure you've selected a rule type.");
      }

      payload.name = values.name;
      payload.type = values.type;
      payload.start_date = correctToUTC(selectedRange.from);
      payload.end_date = correctToUTC(selectedRange.to);

      // TODO: let user choose which days of the week to repeat on
      payload.time_slots = [{}]; // must send empty time slot for full day listings

      createAvailabilityRule.mutate(payload);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow sm:tw-mt-10 tw-overflow-hidden">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start tw-items-center tw-overflow-y-scroll tw-pb-16">
        <DateRangePicker
          mode="range"
          disabled={{ before: new Date() }}
          selected={selectedRange}
          onSelect={setSelectedRange}
          className="sm:tw-mb-5"
        />
      </div>
      <FormError message={error} />
      <FormError message={createAvailabilityRule.error?.message} />
      <WizardNavButtons
        nextStep={onSubmit}
        prevStep={prevStep}
        isLoading={createAvailabilityRule.isLoading}
        isLastStep={values?.availabilityType === AvailabilityType.Enum.date}
      />
    </div>
  );
};

const RecurringStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const {
    control,
    formState: { errors },
  } = useForm<RecurringOptionsSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(RecurringOptionsSchema),
    defaultValues: {
      recurring_years: values?.recurring_years ?? [],
      recurring_months: values?.recurring_months ?? [],
    },
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const showToast = useShowToast();
  const createAvailabilityRule = useCreateAvailabilityRule(values.listingID, {
    onSuccess: () => {
      showToast("success", "Successfully created rule");
      nextStep && nextStep();
    },
  });

  const onSubmit = async () => {
    if (!values) {
      return setError("Something went wrong.");
    }

    if (values.availabilityType === AvailabilityType.Enum.datetime) {
      return nextStep && nextStep();
    } else {
      const payload = {} as AvailabilityRuleInput;

      if (!values.name) {
        return setError("Make sure you've provided a name for your rule.");
      }

      if (!values.type) {
        return setError("Make sure you've selected a rule type.");
      }

      payload.name = values.name;
      payload.type = values.type;
      payload.recurring_years = values.recurring_years ?? [];
      payload.recurring_months = values.recurring_months ?? [];

      // TODO: let user choose which days of the week to repeat on
      payload.time_slots = [{}]; // must send empty time slot for full day listings

      createAvailabilityRule.mutate(payload);
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start">
        <div className="tw-text-lg tw-font-medium tw-mb-1">Affected years</div>
        <div className="tw-mb-4">Select which year(s) this availability rule applies to.</div>
        <Controller
          name="recurring_years"
          control={control}
          render={({ field }) => (
            <DropdownInput
              multiple
              closeOnSelect={false}
              options={Array.from(Array(10)).map((_, i) => new Date().getFullYear() + i)}
              {...field}
              onChange={(value) => {
                field.onChange(value);
                setValue && setValue((prev) => ({ ...prev, recurring_years: value }));
              }}
              className="tw-mb-5 tw-w-64 sm:tw-w-80"
              getElementForDisplay={(value) => {
                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    return "Every year";
                  }
                  return value.join(", ");
                }
                return value;
              }}
              placeholder={"Select years to repeat on"}
            />
          )}
        />
        <div className="tw-text-lg tw-font-medium tw-mb-1">Affected months</div>
        <div className="tw-mb-4">Select which month(s) this availability rule applies to.</div>
        <Controller
          name="recurring_months"
          control={control}
          render={({ field }) => (
            <DropdownInput
              multiple
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
              {...field}
              onChange={(value) => {
                field.onChange(value);
                setValue && setValue((prev) => ({ ...prev, recurring_months: value }));
              }}
              className="tw-mb-5 tw-w-64 sm:tw-w-80"
              getElementForDisplay={(value) => {
                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    return "Every month";
                  }
                  return value
                    .map((v: number) => new Date(2010, v - 1, 1).toLocaleString("default", { month: "long" }))
                    .join(", ");
                }
                return new Date(2010, value - 1, 1).toLocaleString("default", { month: "long" });
              }}
              placeholder={"Select months to repeat on"}
            />
          )}
        />
      </div>
      <FormError message={errors.recurring_months?.message} />
      <FormError message={error} />
      <FormError message={createAvailabilityRule.error?.message} />
      <WizardNavButtons
        nextStep={onSubmit}
        prevStep={prevStep}
        isLoading={createAvailabilityRule.isLoading}
        isLastStep={values?.availabilityType === AvailabilityType.Enum.date}
      />
    </div>
  );
};

const TimeSlotStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const showToast = useShowToast();
  const createAvailabilityRule = useCreateAvailabilityRule(values.listingID, {
    onSuccess: () => {
      showToast("success", "Successfully created rule");
      nextStep && nextStep();
    },
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const { handleSubmit, control } = useForm<TimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(TimeSlotInputSchema),
    defaultValues: {
      time_slots: values?.time_slots as TimeSlotSchemaType[],
    },
  });
  const {
    fields,
    update: updateField,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: "time_slots",
  });
  const { update: updateParent, append: appendParent, remove: removeParent } = useStateArray(setValue, "time_slots");
  const update = (index: number, timeSlot: TimeSlotSchemaType) => {
    updateField(index, timeSlot);
    updateParent(index, timeSlot);
  };
  const append = (timeSlot: TimeSlotSchemaType) => {
    appendField(timeSlot);
    appendParent(timeSlot);
  };
  const remove = (index: number) => {
    removeField(index);
    removeParent(index);
  };

  const onSubmit = async () => {
    const payload = {} as AvailabilityRuleInput;
    if (!values) {
      return setError("Something went wrong.");
    }

    if (!values.name) {
      return setError("Make sure you've provided a name for your rule.");
    }

    if (!values.type) {
      return setError("Make sure you've selected a rule type.");
    }

    if (!values.time_slots) {
      return setError("Please select at least one time slot.");
    }

    payload.name = values.name;
    payload.type = values.type;

    switch (values.type) {
      case AvailabilityRuleType.Enum.fixed_date:
        return setError("Something went wrong.");
      case AvailabilityRuleType.Enum.fixed_range:
        payload.start_date = correctToUTC(values.start_date);
        payload.end_date = correctToUTC(values.end_date);
        break;
      case AvailabilityRuleType.Enum.recurring:
        payload.recurring_years = values.recurring_years;
        payload.recurring_months = values.recurring_months;
        break;
    }

    payload.time_slots = values.time_slots.map((ts) => ({
      day_of_week: ts.dayOfWeek,
      start_time: ts.startTime,
      capacity: ts.capacity,
    }));

    createAvailabilityRule.mutate(payload);
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-divide-y tw-flex-grow tw-overflow-y-scroll tw-pr-4 tw-pb-10">
        <WeekDayTimeSlotFields fields={fields} update={update} append={append} remove={remove} />
      </div>
      <FormError message={error} />
      <FormError message={createAvailabilityRule.error?.message} />
      <WizardNavButtons
        isLastStep
        isLoading={createAvailabilityRule.isLoading}
        nextStep={handleSubmit(onSubmit)}
        prevStep={prevStep}
      />
    </div>
  );
};

const SingleDayTimeSlotStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({
  values,
  setValue,
  nextStep,
  prevStep,
}) => {
  const showToast = useShowToast();
  const createAvailabilityRule = useCreateAvailabilityRule(values.listingID, {
    onSuccess: () => {
      showToast("success", "Successfully created rule");
      nextStep && nextStep();
    },
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const { handleSubmit, control } = useForm<SingleDayTimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(SingleDayTimeSlotInputSchema),
    defaultValues: {
      time_slots: values?.time_slots as SingleDayTimeSlotSchemaType[],
    },
  });
  const {
    fields,
    update: updateField,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: "time_slots",
  });
  const { update: updateParent, append: appendParent, remove: removeParent } = useStateArray(setValue, "time_slots");
  const update = (index: number, timeSlot: SingleDayTimeSlotSchemaType) => {
    updateField(index, timeSlot);
    updateParent(index, timeSlot);
  };
  const append = (timeSlot: SingleDayTimeSlotSchemaType) => {
    appendField(timeSlot);
    appendParent(timeSlot);
  };
  const remove = (index: number) => {
    removeField(index);
    removeParent(index);
  };

  const onSubmit = async () => {
    const payload = {} as AvailabilityRuleInput;
    if (!values) {
      return setError("Something went wrong.");
    }

    if (!values.name) {
      return setError("Make sure you've provided a name for your rule.");
    }

    if (!values.type) {
      return setError("Make sure you've selected a rule type.");
    }

    if (!values.time_slots) {
      return setError("Please select at least one time slot.");
    }

    payload.name = values.name;
    payload.type = values.type;

    switch (values.type) {
      case AvailabilityRuleType.Enum.fixed_date:
        payload.start_date = correctToUTC(values.start_date);
        break;
      case AvailabilityRuleType.Enum.fixed_range:
      case AvailabilityRuleType.Enum.recurring:
        return setError("Something went wrong.");
    }

    payload.time_slots = values.time_slots.map((ts) => ({
      day_of_week: ts.dayOfWeek,
      start_time: ts.startTime,
      capacity: ts.capacity,
    }));

    createAvailabilityRule.mutate(payload);
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-flex-grow tw-overflow-y-scroll tw-pr-4 tw-pb-10">
        <div className="tw-flex-col sm:tw-flex-row tw-flex tw-items-start tw-py-4">
          <SingleDayTimeSlotFields fields={fields} update={update} append={append} remove={remove} />
        </div>
      </div>
      <FormError message={createAvailabilityRule.error?.message} />
      <FormError message={error} />
      <WizardNavButtons
        isLastStep
        isLoading={createAvailabilityRule.isLoading}
        nextStep={handleSubmit(onSubmit)}
        prevStep={prevStep}
      />
    </div>
  );
};

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
