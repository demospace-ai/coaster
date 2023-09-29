import { Dispatch, SetStateAction, useState } from "react";
import { TimeSlotSchema, TimeSlotSchemaType } from "src/pages/listing/schema";
import { AvailabilityRuleType, AvailabilityRuleTypeType } from "src/rpc/types";
import { z } from "zod";

export const UpdateAvailabilityRuleSchema = z.object({
  name: z.string().min(1),
  type: AvailabilityRuleType,
  start_date: z.date(),
  end_date: z.date(),
  recurring_years: z.array(z.number()),
  recurring_months: z.array(z.number()),
  time_slots: z.array(TimeSlotSchema),
});

export type UpdateAvailabilityRuleSchemaType = z.infer<typeof UpdateAvailabilityRuleSchema>;

export const TimeSlotInputSchema = z.object({ time_slots: z.array(TimeSlotSchema) });
export type TimeSlotInputType = z.infer<typeof TimeSlotInputSchema>;

export const RuleTypeSchema = z.object({ type: AvailabilityRuleType });
export type RuleTypeSchemaType = z.infer<typeof RuleTypeSchema>;

export const DateRangeSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
});
export type DateRangeSchemaType = z.infer<typeof DateRangeSchema>;

export enum NewRuleStep {
  RuleType = "RuleType",
  DateRange = "DateRange",
  SingleDate = "SingleDate",
  Recurring = "Recurring",
  TimeSlots = "TimeSlots",
}

export type NewAvailabilityRuleState = {
  step: NewRuleStep;
  name: string | undefined;
  type: AvailabilityRuleTypeType | undefined;
  start_date: Date | undefined;
  end_date: Date | undefined;
  recurring_years: number[] | undefined;
  recurring_months: number[] | undefined;
  time_slots: TimeSlotSchemaType[] | undefined;
};

export function useStateMachine(onComplete: () => void) {
  const [state, setState] = useState<NewAvailabilityRuleState>({
    step: NewRuleStep.RuleType,
    type: undefined,
    start_date: undefined,
    end_date: undefined,
    recurring_years: undefined,
    recurring_months: undefined,
    time_slots: undefined,
    name: undefined,
  });

  const prevStep = useBack(state, setState);

  const nextStep = useNext(state, setState, onComplete);

  return {
    state,
    setState,
    prevStep,
    nextStep,
  };
}

const useBack = (state: NewAvailabilityRuleState, setState: Dispatch<SetStateAction<NewAvailabilityRuleState>>) => {
  switch (state.step) {
    case NewRuleStep.RuleType:
      return; // no back function means no back button
    case NewRuleStep.SingleDate:
    case NewRuleStep.DateRange:
    case NewRuleStep.Recurring:
      return () => setState((prev) => ({ ...prev, step: NewRuleStep.RuleType }));
    case NewRuleStep.TimeSlots:
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
) => {
  switch (state.step) {
    case NewRuleStep.RuleType:
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
    case NewRuleStep.DateRange:
    case NewRuleStep.Recurring:
      return () => setState((prev) => ({ ...prev, step: NewRuleStep.TimeSlots }));
    case NewRuleStep.TimeSlots:
      return onComplete;
  }
};
