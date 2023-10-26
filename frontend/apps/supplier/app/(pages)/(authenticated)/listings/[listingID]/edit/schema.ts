import { AvailabilityType, Category } from "@coaster/rpc/common";
import { z } from "zod";

export const CategorySchema = Category;

export const NameSchema = z
  .string()
  .min(4, "Your name must be at least 4 characters long.")
  .max(64, "Your name can be up to 64 characters long.");

export const DescriptionSchema = z
  .string()
  .min(4, "Your description must be at least 4 characters long.")
  .max(1500, "Descriptions can be up to 1500 characters long.");

export const PriceSchema = z
  .number({ invalid_type_error: "The minimum price is $1." })
  .positive()
  .max(100000, "The maximum price is $100,000.");

export const DurationSchema = z
  .number({ invalid_type_error: "The minimum duration is 30 minutes." }) // needed to handle NaN
  .min(30, "The minimum duration is 30 minutes.");

export const MaxGuestsSchema = z
  .number({ invalid_type_error: "The minimum number of guests is 1." }) // needed to handle NaN
  .min(1, "The minimum number of guests is 1.")
  .max(100, "The maximum number of guests is 100.");

export const IncludesSchema = z.array(z.object({ value: z.string().min(1, "Included amenities cannot be empty") }));
export const NotIncludedSchema = z.array(
  z.object({ value: z.string().min(1, "Not included amenities cannot be empty") }),
);

export const AvailabilityTypeSchema = AvailabilityType;

export const TimeSlotSchema = z.object({
  type: z.literal("time_slots"),
  startTime: z.date().optional(),
  dayOfWeek: z.number().min(0).max(6),
  capacity: z.number().min(1).optional(),
});

export type TimeSlotSchemaType = z.infer<typeof TimeSlotSchema>;

export const SingleDayTimeSlotSchema = z.object({
  type: z.literal("single_day_time_slots"),
  startTime: z.date().optional(),
  dayOfWeek: z.number().optional(),
  capacity: z.number().min(1).optional(),
});

export type SingleDayTimeSlotSchemaType = z.infer<typeof SingleDayTimeSlotSchema>;
