import { Button } from "@coaster/components/button/Button";
import { DateRangePicker } from "@coaster/components/dates/DatePicker";
import { correctTime, correctToUTC, tryCorrectFromUTC } from "@coaster/components/dates/utils";
import { FormError } from "@coaster/components/error/FormError";
import { DropdownInput, Input } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { useNotificationContext, useUpdateAvailabilityRule } from "@coaster/rpc/client";
import {
  AvailabilityRule,
  AvailabilityRuleType,
  AvailabilityRuleUpdates,
  AvailabilityType,
  AvailabilityTypeType,
  Listing,
} from "@coaster/types";
import { Mutation } from "@coaster/utils/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactElement } from "react";
import { Controller, FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import {
  UpdateFixedDateRuleSchema,
  UpdateFixedRangeRuleSchema,
  UpdateRecurringRuleSchema,
} from "supplier/app/(pages)/listings/[listingID]/edit/availability/state";
import {
  DAY_OF_WEEK,
  SingleDayTimeSlotFields,
  WeekDayTimeSlotFields,
  getWeekdayOptionsForRange,
} from "supplier/app/(pages)/listings/[listingID]/edit/availability/utils";
import { SingleDayTimeSlotSchemaType, TimeSlotSchemaType } from "supplier/app/(pages)/listings/[listingID]/edit/schema";

export const ExistingRuleForm: React.FC<{
  listing: Listing;
  existingRule: AvailabilityRule;
  closeModal: () => void;
}> = ({ listing, existingRule, closeModal }) => {
  const { showNotification } = useNotificationContext();
  const updateAvailability = useUpdateAvailabilityRule(listing.id, existingRule.id, {
    onSuccess: () => {
      closeModal();
      showNotification("success", "Successfully updated rule");
    },
  });

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
  updateAvailability: Mutation<AvailabilityRuleUpdates>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const { showNotification } = useNotificationContext();
  const {
    control,
    watch,
    handleSubmit,
    register,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateFixedDateRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateFixedDateRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      start_date: tryCorrectFromUTC(existingRule.start_date),
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "single_day_time_slots",
        startTime: ts.start_time ? ts.start_time : undefined,
        dayOfWeek: ts.day_of_week ? ts.day_of_week : undefined,
        capacity: ts.capacity ? ts.capacity : undefined,
      })),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const onSubmit = async (values: UpdateFixedDateRuleSchema) => {
    if (!isDirty) {
      showNotification("error", "No changes made");
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.start_date) {
      payload.start_date = correctToUTC(values.start_date);
    }

    if (dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: correctTime(ts.startTime),
        capacity: ts.capacity,
      }));
    }

    updateAvailability.mutate(payload);
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-auto tw-pb-10 tw-mb-4">
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
            <FormError message={errors.time_slots?.message} className="tw-mt-1" />
          </>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
        <FormError message={updateAvailability.error?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        {updateAvailability.isLoading ? <Loading light/> : "Submit"}
      </Button>
    </form>
  );
};

const FixedRangeRuleUpdateForm: React.FC<{
  availabilityType: AvailabilityTypeType;
  existingRule: AvailabilityRule;
  updateAvailability: Mutation<AvailabilityRuleUpdates>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const { showNotification } = useNotificationContext();
  const {
    control,
    watch,
    handleSubmit,
    register,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateFixedRangeRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateFixedRangeRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      date_range: {
        from: tryCorrectFromUTC(existingRule.start_date),
        to: tryCorrectFromUTC(existingRule.end_date),
      },
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "time_slots",
        dayOfWeek: ts.day_of_week,
        startTime: ts.start_time ? ts.start_time : undefined,
        capacity: ts.capacity ? ts.capacity : undefined,
      })),
      recurring_days: existingRule.time_slots.map((ts) => ts.day_of_week),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const options = getWeekdayOptionsForRange(watch("date_range").from, watch("date_range").to);

  const onSubmit = async (values: UpdateFixedRangeRuleSchema) => {
    if (!isDirty) {
      showNotification("error", "No changes made");
      return;
    }

    const payload = {} as AvailabilityRuleUpdates;
    if (dirtyFields.name) {
      payload.name = values.name;
    }

    if (dirtyFields.date_range) {
      payload.start_date = correctToUTC(values.date_range.from);
      payload.end_date = correctToUTC(values.date_range.to);
    }

    if (availabilityType === AvailabilityType.Enum.datetime && dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: correctTime(ts.startTime),
        capacity: ts.capacity,
      }));
    }

    if (availabilityType === AvailabilityType.Enum.date && dirtyFields.recurring_days) {
      // Must send empty time slot for full day listings
      if (values.recurring_days.length == 0) {
        // Empty array means every day is available
        payload.time_slots = options.map((i) => ({
          day_of_week: i,
        }));
      } else {
        payload.time_slots = values.recurring_days.map((i) => ({
          day_of_week: i,
        }));
      }
    }

    updateAvailability.mutate(payload);
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-auto tw-pb-10 tw-mb-4">
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
                defaultMonth={watch("date_range").from}
                disabled={{ before: new Date() }}
                selected={watch("date_range")}
                onSelect={(e) => {
                  field.onChange(e ? e : {});
                }}
                className="sm:tw-mb-5"
              />
            )}
          />
        </div>
        <FormError message={errors.date_range?.from?.message} />
        <FormError className="tw-mb-3" message={errors.date_range?.to?.message} />
        {availabilityType === AvailabilityType.Enum.datetime ? (
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
            <FormError message={errors.time_slots?.message} className="tw-mt-1" />
          </>
        ) : (
          // Let the user select which days of the week to repeat on for full day listings
          <div className="tw-flex tw-flex-col tw-w-full tw-mt-1">
            <div className="tw-text-lg tw-font-medium tw-mb-1">Affected days of the week</div>
            <div className="tw-mb-4">Select which days of the week this availability rule applies to.</div>
            <Controller
              name="recurring_days"
              control={control}
              render={({ field }) => (
                <DropdownInput
                  multiple
                  options={options}
                  {...field}
                  onChange={field.onChange}
                  className="tw-mb-5 tw-w-64 sm:tw-w-80"
                  getElementForDisplay={(value) => {
                    if (Array.isArray(value)) {
                      if (value.length === 0) {
                        return "Every day";
                      }
                      const sorted = value.sort((a, b) => a - b);
                      if (sorted[0] == 0) {
                        sorted.shift();
                        sorted.push(0);
                      }
                      return sorted.map((v: number) => DAY_OF_WEEK[v]).join(", ");
                    }
                    return DAY_OF_WEEK[value];
                  }}
                />
              )}
            />
            <FormError message={errors.recurring_days?.message} className="tw-mt-1" />
          </div>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
        <FormError message={updateAvailability.error?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        {updateAvailability.isLoading ? <Loading light /> : "Submit"}
      </Button>
    </form>
  );
};

const RecurringRuleUpdateForm: React.FC<{
  availabilityType: AvailabilityTypeType;
  existingRule: AvailabilityRule;
  updateAvailability: Mutation<AvailabilityRuleUpdates>;
}> = ({ availabilityType, existingRule, updateAvailability }) => {
  const { showNotification } = useNotificationContext();
  const {
    control,
    watch,
    handleSubmit,
    register,
    formState: { isDirty, dirtyFields, errors },
  } = useForm<UpdateRecurringRuleSchema>({
    mode: "onBlur",
    resolver: zodResolver(UpdateRecurringRuleSchema),
    defaultValues: {
      name: existingRule.name,
      type: existingRule.type,
      recurring_years: existingRule.recurring_years ?? [],
      recurring_months: existingRule.recurring_months ?? [],
      time_slots: existingRule.time_slots.map((ts) => ({
        type: "time_slots",
        dayOfWeek: ts.day_of_week,
        startTime: ts.start_time ? ts.start_time : undefined,
        capacity: ts.capacity ? ts.capacity : undefined,
      })),
      recurring_days: existingRule.time_slots.map((ts) => ts.day_of_week),
    },
  });
  const { fields, update, append, remove } = useFieldArray({
    control: control,
    name: "time_slots",
  });

  const onSubmit = async (values: UpdateRecurringRuleSchema) => {
    if (!isDirty) {
      showNotification("error", "No changes made");
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

    if (availabilityType === AvailabilityType.Enum.datetime && dirtyFields.time_slots) {
      payload.time_slots = values.time_slots.map((ts) => ({
        day_of_week: ts.dayOfWeek,
        start_time: correctTime(ts.startTime),
        capacity: ts.capacity,
      }));
    }

    if (availabilityType === AvailabilityType.Enum.date && dirtyFields.recurring_days) {
      // Must send empty time slot for full day listings
      if (values.recurring_days.length == 0) {
        // Empty array means every day is available
        payload.time_slots = Array.from(Array(7)).map((_, i) => ({
          day_of_week: i,
        }));
      } else {
        payload.time_slots = values.recurring_days.map((i) => ({
          day_of_week: i,
        }));
      }
    }

    updateAvailability.mutate(payload);
  };

  return (
    <form
      className="tw-flex tw-flex-col tw-flex-grow tw-items-center tw-overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="tw-flex tw-flex-col tw-w-full tw-flex-grow tw-overflow-y-auto tw-pb-10 tw-mb-4">
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
            />
          )}
        />
        {availabilityType === AvailabilityType.Enum.datetime ? (
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
        ) : (
          // Let the user select which days of the week to repeat on for full day listings
          <div className="tw-flex tw-flex-col tw-w-full tw-mt-1">
            <div className="tw-text-lg tw-font-medium tw-mb-1">Affected days of the week</div>
            <div className="tw-mb-4">Select which days of the week this availability rule applies to.</div>
            <Controller
              name="recurring_days"
              control={control}
              render={({ field }) => (
                <DropdownInput
                  multiple
                  options={[1, 2, 3, 4, 5, 6, 0]}
                  {...field}
                  onChange={field.onChange}
                  className="tw-mb-5 tw-w-64 sm:tw-w-80"
                  getElementForDisplay={(value) => {
                    if (Array.isArray(value)) {
                      if (value.length === 0) {
                        return "Every day";
                      }
                      const sorted = value.sort((a, b) => a - b);
                      if (sorted[0] == 0) {
                        sorted.shift();
                        sorted.push(0);
                      }
                      return sorted.map((v: number) => DAY_OF_WEEK[v]).join(", ");
                    }
                    return DAY_OF_WEEK[value];
                  }}
                />
              )}
            />
            <FormError message={errors.recurring_days?.message} className="tw-mt-1" />
          </div>
        )}
        <FormError message={errors.root?.message} className="tw-mt-1" />
        <FormError message={updateAvailability.error?.message} className="tw-mt-1" />
      </div>
      <Button className="tw-mt-3 tw-w-48 tw-py-2" type="submit">
        {updateAvailability.isLoading ? <Loading light /> : "Submit"}
      </Button>
    </form>
  );
};
