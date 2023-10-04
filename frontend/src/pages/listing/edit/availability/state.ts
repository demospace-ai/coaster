import { Dispatch, SetStateAction, useState } from "react";
import {
  SingleDayTimeSlotSchema,
  SingleDayTimeSlotSchemaType,
  TimeSlotSchema,
  TimeSlotSchemaType,
} from "src/pages/listing/schema";
import {
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityType,
  AvailabilityTypeType,
  Listing,
} from "src/rpc/types";
import { z } from "zod";

export const UpdateFixedDateRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType.readonly(),
  start_date: z.date({ required_error: "Please select a date for this rule." }),
  time_slots: z.array(z.union([TimeSlotSchema, SingleDayTimeSlotSchema])),
});
export const UpdateFixedRangeRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType.readonly(),
  date_range: z.object(
    {
      from: z.date(),
      to: z.date(),
    },
    { required_error: "Please select a date range." },
  ),
  time_slots: z.array(z.union([TimeSlotSchema, SingleDayTimeSlotSchema])),
});
export const UpdateRecurringRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType.readonly(),
  recurring_years: z.array(z.number()),
  recurring_months: z.array(z.number()),
  time_slots: z.array(z.union([TimeSlotSchema, SingleDayTimeSlotSchema])),
});

export type UpdateFixedRangeRuleSchema = z.infer<typeof UpdateFixedRangeRuleSchema>;
export type UpdateFixedDateRuleSchema = z.infer<typeof UpdateFixedDateRuleSchema>;
export type UpdateRecurringRuleSchema = z.infer<typeof UpdateRecurringRuleSchema>;

export const TimeSlotInputSchema = z.object({ time_slots: z.array(TimeSlotSchema) });
export type TimeSlotInputType = z.infer<typeof TimeSlotInputSchema>;

export const SingleDayTimeSlotInputSchema = z.object({ time_slots: z.array(SingleDayTimeSlotSchema) });
export type SingleDayTimeSlotInputType = z.infer<typeof SingleDayTimeSlotInputSchema>;

export const RecurringOptionsSchema = z.object({
  recurring_years: z.array(
    z.number().min(new Date().getFullYear(), "Enter a valid year").max(2100, "Enter a valid year"),
  ),
  recurring_months: z.array(z.number().min(1, "Enter a valid month").max(12, "Enter a valid month")),
});
export type RecurringOptionsSchemaType = z.infer<typeof RecurringOptionsSchema>;

export const InitialRuleStepSchema = z.object({
  name: z.string().min(1, "Name must be at least 4 characters").max(100, "Name cannot be longer than 100 characters"),
  type: AvailabilityRuleType,
});
export type InitialRuleStepSchemaType = z.infer<typeof InitialRuleStepSchema>;

export const DateRangeSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
});
export type DateRangeSchemaType = z.infer<typeof DateRangeSchema>;

export enum NewRuleStep {
  InitialRuleStep = "Initial",
  DateRange = "DateRange",
  SingleDate = "SingleDate",
  Recurring = "Recurring",
  TimeSlots = "TimeSlots",
  SingleDayTimeSlots = "SingleDayTimeSlots",
}

export type NewAvailabilityRuleState = {
  listingID: number;
  availabilityType: AvailabilityTypeType;
  step: NewRuleStep;
  name: string | undefined;
  type: AvailabilityRuleTypeType | undefined;
  start_date: Date | undefined;
  end_date: Date | undefined;
  recurring_years: number[] | undefined;
  recurring_months: number[] | undefined;
  time_slots: TimeSlotSchemaType[] | SingleDayTimeSlotSchemaType[] | undefined;
};

export function useStateMachine(onComplete: () => void, listing: Listing) {
  const [state, setState] = useState<NewAvailabilityRuleState>({
    listingID: listing.id,
    availabilityType: listing.availability_type,
    step: NewRuleStep.InitialRuleStep,
    type: undefined,
    start_date: undefined,
    end_date: undefined,
    recurring_years: undefined,
    recurring_months: undefined,
    time_slots: undefined,
    name: undefined,
  });

  const prevStep = useBack(state, setState);
  const nextStep = useNext(state, setState, onComplete, listing.availability_type);

  return {
    state,
    setState,
    prevStep,
    nextStep,
  };
}

const useBack = (state: NewAvailabilityRuleState, setState: Dispatch<SetStateAction<NewAvailabilityRuleState>>) => {
  switch (state.step) {
    case NewRuleStep.InitialRuleStep:
      return; // no back function means no back button
    case NewRuleStep.SingleDate:
    case NewRuleStep.DateRange:
    case NewRuleStep.Recurring:
      return () => setState((prev) => ({ ...prev, step: NewRuleStep.InitialRuleStep }));
    case NewRuleStep.TimeSlots:
    case NewRuleStep.SingleDayTimeSlots:
      return () => {
        switch (state.type) {
          case undefined:
            throw new Error("This should never happen");
          case AvailabilityRuleType.Enum.fixed_date:
            return setState((prev) => ({ ...prev, step: NewRuleStep.SingleDate }));
          case AvailabilityRuleType.Enum.fixed_range:
            return setState((prev) => ({ ...prev, step: NewRuleStep.DateRange }));
          case AvailabilityRuleType.Enum.recurring:
            return setState((prev) => ({ ...prev, step: NewRuleStep.Recurring }));
        }
      };
  }
};

const useNext = (
  state: NewAvailabilityRuleState,
  setState: Dispatch<SetStateAction<NewAvailabilityRuleState>>,
  onComplete: () => void,
  availabilityType: AvailabilityTypeType,
) => {
  const resetState = () =>
    setState((prev) => ({
      listingID: prev.listingID,
      availabilityType: prev.availabilityType,
      step: NewRuleStep.InitialRuleStep,
      type: undefined,
      start_date: undefined,
      end_date: undefined,
      recurring_years: undefined,
      recurring_months: undefined,
      time_slots: undefined,
      name: undefined,
    }));

  const onCompleteWrapped = () => {
    resetState();
    onComplete();
  };

  switch (state.step) {
    case NewRuleStep.InitialRuleStep:
      return () => {
        switch (state.type) {
          case undefined:
            return;
          case AvailabilityRuleType.Enum.fixed_date:
            return setState((prev) => ({ ...prev, step: NewRuleStep.SingleDate }));
          case AvailabilityRuleType.Enum.fixed_range:
            return setState((prev) => ({ ...prev, step: NewRuleStep.DateRange }));
          case AvailabilityRuleType.Enum.recurring:
            return setState((prev) => ({ ...prev, step: NewRuleStep.Recurring }));
        }
      };
    case NewRuleStep.SingleDate:
      if (availabilityType === AvailabilityType.Enum.date) {
        return onCompleteWrapped;
      } else {
        return () => setState((prev) => ({ ...prev, step: NewRuleStep.SingleDayTimeSlots }));
      }
    case NewRuleStep.DateRange:
    case NewRuleStep.Recurring:
      if (availabilityType === AvailabilityType.Enum.date) {
        return onCompleteWrapped;
      } else {
        return () => setState((prev) => ({ ...prev, step: NewRuleStep.TimeSlots }));
      }
    case NewRuleStep.TimeSlots:
    case NewRuleStep.SingleDayTimeSlots:
      return onCompleteWrapped;
  }
};
