import { TimeInput } from "@coaster/components/client";
import {
  AvailabilityRuleType,
  AvailabilityRuleTypeType,
  AvailabilityType,
  AvailabilityTypeType,
} from "@coaster/rpc/common";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { eachDayOfInterval } from "date-fns";
import { FieldArrayWithId } from "react-hook-form";
import { SingleDayTimeSlotSchemaType, TimeSlotSchemaType } from "supplier/app/(pages)/listings/[listingID]/edit/schema";

export const DAY_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type TimeSlotFieldsProps<T extends TimeSlotSchemaType | SingleDayTimeSlotSchemaType> = {
  fields: FieldArrayWithId<{ time_slots: T[] }>[];
  update: (index: number, timeSlot: T) => void;
  append: (timeSlot: T) => void;
  remove: (index: number) => void;
};

export const WeekDayTimeSlotFields: React.FC<TimeSlotFieldsProps<TimeSlotSchemaType>> = ({
  fields,
  append,
  update,
  remove,
}) => {
  const timeSlotMap: Map<number, { timeSlot: TimeSlotSchemaType; index: number; id: string }[]> = new Map();
  fields.map((field, idx) => {
    const existing = timeSlotMap.get(field.dayOfWeek) ?? [];
    existing.push({ timeSlot: field, index: idx, id: field.id });
    timeSlotMap.set(field.dayOfWeek, existing);
  });

  return (
    <>
      {[1, 2, 3, 4, 5, 6, 0].map((i) => {
        const timeSlotFields = timeSlotMap.get(i) ?? [];
        return (
          <div key={i} className="tw-flex-col sm:tw-flex-row tw-flex tw-items-start tw-py-4">
            <div className="tw-flex tw-shrink-0 tw-font-semibold tw-w-24 tw-mb-2 sm:tw-mb-0">{DAY_OF_WEEK[i]}</div>
            <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
              {timeSlotFields.map((field) => {
                if (field.timeSlot.startTime === undefined) {
                  // TODO: this should never happen
                  return;
                }
                return (
                  <div key={field.id} className="tw-flex tw-items-center">
                    <TimeInput
                      date={field.timeSlot.startTime}
                      onDateChange={(date) => {
                        update(field.index, { ...field.timeSlot, startTime: date });
                      }}
                    />
                    <XMarkIcon
                      className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
                      onClick={() => {
                        remove(field.index);
                      }}
                    />
                  </div>
                );
              })}
              <div
                className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
                onClick={() => {
                  append({ type: "time_slots", dayOfWeek: i, startTime: new Date("1970-01-01T10:00") });
                }}
              >
                Add start time
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const SingleDayTimeSlotFields: React.FC<TimeSlotFieldsProps<SingleDayTimeSlotSchemaType>> = ({
  fields,
  append,
  update,
  remove,
}) => {
  return (
    <div className="tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-4">
      {fields.map((field, idx) => {
        if (field.startTime === undefined) {
          // TODO: this should never happen
          return;
        }
        return (
          <div key={field.id} className="tw-flex tw-items-center">
            <TimeInput
              date={field.startTime}
              onDateChange={(date) => {
                update(idx, { ...field, startTime: date });
              }}
            />
            <XMarkIcon
              className="tw-ml-2 tw-h-5 tw-stroke-red-600 tw-cursor-pointer"
              onClick={() => {
                remove(idx);
              }}
            />
          </div>
        );
      })}
      <div
        className="tw-flex tw-items-center tw-font-medium tw-text-blue-600 tw-cursor-pointer"
        onClick={() => {
          append({ type: "single_day_time_slots", startTime: new Date("1970-01-01T10:00") });
        }}
      >
        Add start time
      </div>
    </div>
  );
};

export function getAvailabilityTypeDisplay(value: AvailabilityTypeType) {
  switch (value) {
    case AvailabilityType.Enum.date:
      return "Full day (customer just chooses a date)";
    case AvailabilityType.Enum.datetime:
      return "Date and time (customer chooses a date and time slot)";
    default:
      return "";
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
    default:
      return "";
  }
}

export function getWeekdayOptionsForRange(startDate: Date | undefined, endDate: Date | undefined): number[] {
  let options = [1, 2, 3, 4, 5, 6, 0];
  if (startDate === undefined || endDate === undefined) {
    return options;
  }
  const everyDay = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  if (everyDay.length < 7) {
    // Only let user select days that fall within the range of dates they selected
    options = options.filter((o) => everyDay.some((d) => d.getDay() === o));
  }

  return options;
}
