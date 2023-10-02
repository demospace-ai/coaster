import { XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { DateRangePicker } from "src/components/calendar/DatePicker";
import { Step, StepProps, WizardNavButtons, wrapHandleSubmit, wrapSubmit } from "src/components/form/MultiStep";
import { DropdownInput, RadioInput, TimeInput } from "src/components/input/Input";
import {
  NewAvailabilityRuleState,
  NewRuleStep,
  RecurringOptionsSchema,
  RecurringOptionsSchemaType,
  RuleTypeSchema,
  RuleTypeSchemaType,
  SingleDayTimeSlotInputSchema,
  SingleDayTimeSlotInputType,
  TimeSlotInputSchema,
  TimeSlotInputType,
  UpdateAvailabilityRuleSchema,
  UpdateAvailabilityRuleSchemaType,
  useStateMachine,
} from "src/pages/listing/availability/state";
import { TimeSlotSchemaType } from "src/pages/listing/schema";
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
    case NewRuleStep.SingleDate: {
      throw new Error("Not implemented yet: NewRuleStep.SingleDate case");
    }
    case NewRuleStep.TimeSlots: {
      throw new Error("Not implemented yet: NewRuleStep.TimeSlots case");
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-[320px] sm:tw-w-[480px] md:tw-w-[640px] lg:tw-w-[900px] tw-h-[80vh] sm:tw-h-[70vh] tw-px-8 sm:tw-px-12 tw-pb-10 tw-border-box">
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
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start">
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
      </div>
      <WizardNavButtons canContinue={formState.isValid} nextStep={nextStep} prevStep={prevStep} />
    </div>
  );
};

const SingleDateStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const [selected, setSelected] = useState<Date | undefined>(values?.start_date);
  const [error, setError] = useState<string | undefined>(undefined);
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isValid = Boolean(selected);
  const onSubmit = async (values: Date) => {
    if (values) {
      setValue && setValue((prev) => ({ ...prev, start_date: values }));
      return { success: true };
    } else {
      return { success: false, error: "Please select a date range." };
    }
  };

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow sm:tw-mt-10">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start tw-items-center">
        <DateRangePicker
          mode="single"
          disabled={{ before: new Date() }}
          numberOfMonths={isMobile ? 1 : 2}
          selected={selected}
          onSelect={setSelected}
          className="sm:tw-mb-5"
        />
      </div>
      <FormError message={error} />
      <WizardNavButtons
        canContinue={isValid}
        nextStep={wrapSubmit(isValid, selected, onSubmit, setError, nextStep)}
        prevStep={prevStep}
      />
    </div>
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
    <div className="tw-flex tw-flex-col tw-flex-grow sm:tw-mt-10">
      <div className="tw-flex tw-flex-col tw-flex-grow tw-justify-start tw-items-center">
        <DateRangePicker
          mode="range"
          disabled={{ before: new Date() }}
          numberOfMonths={isMobile ? 1 : 2}
          selected={selectedRange}
          onSelect={setSelectedRange}
          className="sm:tw-mb-5"
        />
      </div>
      <FormError message={error} />
      <WizardNavButtons
        canContinue={isValid}
        nextStep={wrapSubmit(isValid, selectedRange, onSubmit, setError, nextStep)}
        prevStep={prevStep}
      />
    </div>
  );
};

const RecurringStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const {
    control,
    formState: { errors, isValid },
  } = useForm<RecurringOptionsSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(RecurringOptionsSchema),
    defaultValues: {
      recurring_years: values?.recurring_years ?? [],
      recurring_months: values?.recurring_months ?? [],
    },
  });
  console.log(values?.recurring_months);

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden ">
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
      <WizardNavButtons canContinue={isValid} nextStep={nextStep} prevStep={prevStep} />
    </div>
  );
};

const TimeSlotStep: React.FC<StepProps<NewAvailabilityRuleState>> = ({ values, setValue, nextStep, prevStep }) => {
  const { mutate, isLoading } = useCreateAvailabilityRule();
  const { handleSubmit, control, formState, setError } = useForm<TimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(TimeSlotInputSchema),
    defaultValues: {
      time_slots: values?.time_slots,
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control,
    name: "time_slots",
  });
  const { update: updateParent, append: appendParent, remove: removeParent } = useStateArray(setValue, "time_slots");

  const timeSlotMap: Map<number, { timeSlot: TimeSlotSchemaType; index: number; id: string }[]> = new Map();
  fields.map((field, idx) => {
    const existing = timeSlotMap.get(field.dayOfWeek) ?? [];
    existing.push({ timeSlot: field, index: idx, id: field.id });
    timeSlotMap.set(field.dayOfWeek, existing);
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

  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-divide-y tw-flex-grow tw-overflow-y-scroll tw-pr-4 tw-pb-10">
        {[1, 2, 3, 4, 5, 6, 0].map((i) => {
          const timeSlotFields = timeSlotMap.get(i) ?? [];
          return (
            <div key={i} className="tw-flex-col sm:tw-flex-row tw-flex tw-items-start tw-py-4">
              <div className="tw-flex tw-shrink-0 tw-font-semibold tw-w-24 tw-mb-2 sm:tw-mb-0">{dayOfWeek[i]}</div>
              <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
                {timeSlotFields.map((field) => (
                  <div key={field.id} className="tw-flex tw-items-center">
                    <TimeInput
                      date={field.timeSlot.startTime}
                      onDateChange={(date) => {
                        update(field.index, { ...field.timeSlot, startTime: date });
                        updateParent(field.index, { ...field.timeSlot, startTime: date });
                      }}
                    />
                    <XMarkIcon
                      className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
                      onClick={() => {
                        remove(field.index);
                        removeParent(field.index);
                      }}
                    />
                  </div>
                ))}
                <div
                  className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
                  onClick={() => {
                    append({ dayOfWeek: i, startTime: new Date("1970-01-01T10:00") });
                    appendParent({ dayOfWeek: i, startTime: new Date("1970-01-01T10:00") });
                  }}
                >
                  Add start time
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <WizardNavButtons
        isLastStep
        isLoading={isLoading}
        canContinue={formState.isValid}
        nextStep={wrapHandleSubmit(
          handleSubmit,
          createAvailabilityRule,
          (error: string) => setError("time_slots", { message: error }),
          nextStep,
        )}
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
  const { mutate, isLoading } = useCreateAvailabilityRule();
  const { handleSubmit, control, formState, setError } = useForm<SingleDayTimeSlotInputType>({
    mode: "onBlur",
    resolver: zodResolver(SingleDayTimeSlotInputSchema),
    defaultValues: {
      time_slots: values?.time_slots,
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control,
    name: "time_slots",
  });
  const { update: updateParent, append: appendParent, remove: removeParent } = useStateArray(setValue, "time_slots");

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

  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="tw-flex tw-flex-col tw-flex-grow tw-overflow-hidden">
      <div className="tw-divide-y tw-flex-grow tw-overflow-y-scroll tw-pr-4 tw-pb-10">
        <div className="tw-flex-col sm:tw-flex-row tw-flex tw-items-start tw-py-4">
          <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="tw-flex tw-items-center">
                <TimeInput
                  date={field.startTime}
                  onDateChange={(date) => {
                    update(idx, { ...field, startTime: date });
                    updateParent(idx, { ...field, startTime: date });
                  }}
                />
                <XMarkIcon
                  className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
                  onClick={() => {
                    remove(idx);
                    removeParent(idx);
                  }}
                />
              </div>
            ))}
            <div
              className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
              onClick={() => {
                append({ startTime: new Date("1970-01-01T10:00") });
                appendParent({ startTime: new Date("1970-01-01T10:00") });
              }}
            >
              Add start time
            </div>
          </div>
        </div>
      </div>
      <WizardNavButtons
        isLastStep
        isLoading={isLoading}
        canContinue={formState.isValid}
        nextStep={wrapHandleSubmit(
          handleSubmit,
          createAvailabilityRule,
          (error: string) => setError("time_slots", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
      />
    </div>
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

// TODO: figure out the typings for this
function useStateArray<T>(setValue: Dispatch<SetStateAction<T>> | undefined, name: keyof T) {
  if (!setValue) {
    return { update: () => {}, append: () => {}, remove: () => {} };
  }

  const update = (i: number, value: any) =>
    setValue((prev) => {
      const prevArray = prev[name] as any[];
      prevArray[i] = value;
      return { ...prev, [name]: prevArray };
    });

  const append = (value: any) =>
    setValue((prev) => {
      const prevArray = (prev[name] as any[]) ?? [];
      prevArray.push(value);
      console.log(prevArray);
      return { ...prev, [name]: prevArray };
    });

  const remove = (i: number) =>
    setValue((prev) => {
      const prevArray = prev[name] as any[];
      prevArray.splice(i, 1);
      return { ...prev, [name]: prevArray };
    });

  return { update, append, remove };
}
