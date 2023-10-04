import { zodResolver } from "@hookform/resolvers/zod";
import { ReactElement } from "react";
import { Controller, FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { Button } from "src/components/button/Button";
import { DateRangePicker } from "src/components/calendar/DatePicker";
import { SubmitResult } from "src/components/form/MultiStep";
import { DropdownInput, Input } from "src/components/input/Input";
import { SingleDayTimeSlotFields, WeekDayTimeSlotFields } from "src/pages/listing/edit/availability/AvailabilityRules";
import {
  UpdateFixedDateRuleSchema,
  UpdateFixedRangeRuleSchema,
  UpdateRecurringRuleSchema,
} from "src/pages/listing/edit/availability/state";
import { SingleDayTimeSlotSchemaType, TimeSlotSchemaType } from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { UpdateAvailabilityRule } from "src/rpc/api";
import {
  AvailabilityRule,
  AvailabilityRuleType,
  AvailabilityRuleUpdates,
  AvailabilityType,
  AvailabilityTypeType,
  Listing,
} from "src/rpc/types";
import { forceErrorMessage } from "src/utils/errors";

export const ExistingRuleForm: React.FC<{
  listing: Listing;
  existingRule: AvailabilityRule;
  closeModal: () => void;
}> = ({ listing, existingRule, closeModal }) => {
  const updateAvailability = async (payload: AvailabilityRuleUpdates) => {
    try {
      await sendRequest(UpdateAvailabilityRule, {
        pathParams: { listingID: listing.id, availabilityRuleID: existingRule.id },
        payload,
      });
      // TODO: show toast?
      closeModal();
      return { success: true };
    } catch (e) {
      return { success: false, error: forceErrorMessage(e) };
    }
  };

  var existingRuleForm: ReactElement;
  switch (existingRule.type) {
    case AvailabilityRuleType.Enum.fixed_date:
      existingRuleForm = (
        <FixedDateRuleUpdateForm
          availabilityType={listing.availability_type}
          existingRule={existingRule}
          updateAvailability={updateAvailability}
        />
      );
      break;
    case AvailabilityRuleType.Enum.fixed_range:
      existingRuleForm = (
        <FixedRangeRuleUpdateForm
          availabilityType={listing.availability_type}
          existingRule={existingRule}
          updateAvailability={updateAvailability}
        />
      );
      break;
    case AvailabilityRuleType.Enum.recurring:
      existingRuleForm = (
        <RecurringRuleUpdateForm
          availabilityType={listing.availability_type}
          existingRule={existingRule}
          updateAvailability={updateAvailability}
        />
      );
      break;
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-[320px] sm:tw-w-[480px] md:tw-w-[640px] lg:tw-w-[900px] tw-h-[80vh] sm:tw-h-[70vh] 4xl:tw-h-[65vh] tw-px-8 sm:tw-px-12 tw-pb-10 tw-border-box">
      <div className="tw-text-left tw-w-full tw-text-2xl tw-font-semibold tw-mb-2">Update Availability Rule</div>
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-hidden">{existingRuleForm}</div>
    </div>
  );
};

const FixedDateRuleUpdateForm: React.FC<{
  availabilityType: AvailabilityTypeType;
  existingRule: AvailabilityRule;
  updateAvailability: (payload: AvailabilityRuleUpdates) => Promise<SubmitResult>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const {
    control,
    watch,
    handleSubmit,
    register,
    setValue,
    setError,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateFixedDateRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateFixedDateRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      start_date: existingRule.start_date,
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "single_day_time_slots",
        startTime: ts.start_time,
        capacity: ts.capacity,
      })),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const onSubmit = async (values: UpdateFixedDateRuleSchema) => {
    if (!isDirty) {
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.start_date) {
      payload.start_date = values.start_date;
    }

    if (dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: ts.startTime,
        capacity: ts.capacity,
      }));
    }

    const result = await updateAvailability(payload);
    if (!result.success) {
      return setError("root", { message: result.error });
    }
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-scroll tw-pb-10 tw-mb-4">
        <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Rule Name</div>
        <Input
          {...register("name")}
          value={watch("name")}
          className="tw-w-full sm:tw-w-80"
          placeholder="E.g. 2020 Summer Availability"
        />
        <FormError message={errors.name?.message} />
        <div className="tw-text-lg tw-font-semibold tw-mb-3 tw-mt-8">Single Date</div>
        <div className="tw-flex tw-flex-col tw-justify-start tw-items-center sm:tw-items-start">
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <DateRangePicker
                mode="single"
                defaultMonth={watch("start_date")}
                disabled={{ before: new Date() }}
                selected={watch("start_date")}
                onSelect={field.onChange}
                className="sm:tw-mb-5"
              />
            )}
          />
        </div>
        <FormError message={errors.start_date?.message} />
        {availabilityType === AvailabilityType.Enum.datetime && (
          <>
            <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Time Slots</div>
            <SingleDayTimeSlotFields
              fields={fields as FieldArrayWithId<{ time_slots: SingleDayTimeSlotSchemaType[] }, "time_slots", "id">[]}
              update={update}
              append={append}
              remove={remove}
            />
          </>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        Submit
      </Button>
    </form>
  );
};

const FixedRangeRuleUpdateForm: React.FC<{
  availabilityType: AvailabilityTypeType;
  existingRule: AvailabilityRule;
  updateAvailability: (payload: AvailabilityRuleUpdates) => Promise<SubmitResult>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const {
    control,
    watch,
    handleSubmit,
    register,
    setError,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateFixedRangeRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateFixedRangeRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      date_range: {
        from: existingRule.start_date,
        to: existingRule.end_date,
      },
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "time_slots",
        dayOfWeek: ts.day_of_week,
        startTime: ts.start_time,
        capacity: ts.capacity,
      })),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const onSubmit = async (values: UpdateFixedRangeRuleSchema) => {
    if (!isDirty) {
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.date_range) {
      payload.start_date = values.date_range.from;
      payload.end_date = values.date_range.to;
    }

    if (dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: ts.startTime,
        capacity: ts.capacity,
      }));
    }

    const result = await updateAvailability(payload);
    if (!result.success) {
      return setError("root", { message: result.error });
    }
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-scroll tw-pb-10 tw-mb-4">
        <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Rule Name</div>
        <Input
          {...register("name")}
          value={watch("name")}
          className="tw-w-full sm:tw-w-80"
          placeholder="E.g. 2020 Summer Availability"
        />
        <FormError message={errors.name?.message} />
        <div className="tw-text-lg tw-font-semibold tw-mb-3 tw-mt-8">Date Range</div>
        <div className="tw-flex tw-flex-col tw-justify-start tw-items-center sm:tw-items-start">
          <Controller
            name="date_range"
            control={control}
            render={({ field }) => (
              <DateRangePicker
                mode="range"
                defaultMonth={watch("date_range.from")}
                disabled={{ before: new Date() }}
                selected={watch("date_range")}
                onSelect={field.onChange}
                className="sm:tw-mb-5"
              />
            )}
          />
        </div>
        <FormError message={errors.date_range?.message} />
        {availabilityType === AvailabilityType.Enum.datetime && (
          <>
            <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Time Slots</div>
            <div className="tw-divide-y">
              <WeekDayTimeSlotFields
                fields={fields as FieldArrayWithId<{ time_slots: TimeSlotSchemaType[] }, "time_slots", "id">[]}
                update={update}
                append={append}
                remove={remove}
              />
            </div>
          </>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        Submit
      </Button>
    </form>
  );
};

const RecurringRuleUpdateForm: React.FC<{
  availabilityType: AvailabilityTypeType;
  existingRule: AvailabilityRule;
  updateAvailability: (payload: AvailabilityRuleUpdates) => Promise<SubmitResult>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const {
    control,
    watch,
    handleSubmit,
    register,
    setError,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateRecurringRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateRecurringRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      recurring_years: existingRule.recurring_years,
      recurring_months: existingRule.recurring_months,
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "time_slots",
        dayOfWeek: ts.day_of_week,
        startTime: ts.start_time,
        capacity: ts.capacity,
      })),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const onSubmit = async (values: UpdateRecurringRuleSchema) => {
    if (!isDirty) {
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.recurring_years) {
      payload.recurring_years = values.recurring_years;
    }

    if (dirtyFields.recurring_months) {
      payload.recurring_months = values.recurring_months;
    }

    if (dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: ts.startTime,
        capacity: ts.capacity,
      }));
    }

    const result = await updateAvailability(payload);
    if (!result.success) {
      return setError("root", { message: result.error });
    }
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-scroll tw-pb-10 tw-mb-4">
        <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Rule Name</div>
        <Input
          {...register("name")}
          value={watch("name")}
          className="tw-w-full sm:tw-w-80"
          placeholder="E.g. 2020 Summer Availability"
        />
        <FormError message={errors.name?.message} />
        <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-6">Affected years</div>
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
        <div className="tw-text-lg tw-font-semibold tw-mb-1">Affected months</div>
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
        {availabilityType === AvailabilityType.Enum.datetime && (
          <>
            <div className="tw-text-lg tw-font-semibold tw-mb-1 tw-mt-5">Time Slots</div>
            <div className="tw-divide-y">
              <WeekDayTimeSlotFields
                fields={fields as FieldArrayWithId<{ time_slots: TimeSlotSchemaType[] }, "time_slots", "id">[]}
                update={update}
                append={append}
                remove={remove}
              />
            </div>
          </>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        Submit
      </Button>
    </form>
  );
};
