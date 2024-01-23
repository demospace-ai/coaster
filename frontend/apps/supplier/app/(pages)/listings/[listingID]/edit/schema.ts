import { AvailabilityType, Category } from "@coaster/types";
import { generateJSON, generateText } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";

export const CategoriesSchema = z.array(Category).min(1, "Must have at least one category.");

export const NameSchema = z
  .string()
  .min(4, "Your listing's name must be at least 4 characters long.")
  .max(64, "Your listing's name can be up to 64 characters long.");

export const DescriptionSchema = z.string().superRefine((data, ctx) => {
  const json = generateText(generateJSON(data, [StarterKit]), [StarterKit]);
  if (json.length < 4) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Your description must be at least 4 characters long." });
  }
  if (json.length > 15_000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Descriptions can be up to 15,000 characters long." });
  }
});

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

export const IncludesSchema = z.array(
  z.object({
    value: z
      .string()
      .min(1, "Included amenities cannot be empty")
      .max(256, "Maximum length for included amenity is 256 characters."),
  }),
);

export const NotIncludedSchema = z.array(
  z.object({
    value: z
      .string()
      .min(1, "Not included amenities cannot be empty")
      .max(256, "Maximum length for not included item is 256 characters."),
  }),
);

export const NewItineraryStepSchema = z.object({
  title: z
    .string()
    .min(1, "Itinerary step title cannot be empty")
    .max(256, "Maximum length for not itinerary step title is 256 characters."),
  description: z
    .string()
    .min(1, "Itinerary step description cannot be empty")
    .max(15_000, "Maximum length for not itinerary step description is 15,000 characters."),
  step_label: z
    .string()
    .min(1, "Itinerary step label cannot be empty")
    .max(64, "Maximum length for not itinerary step label is 64 characters."),
});

export const ExistingItineraryStepSchema = z.object({
  id: z.number().readonly(),
  title: z
    .string()
    .min(1, "Itinerary step title cannot be empty")
    .max(256, "Maximum length for not itinerary step title is 256 characters."),
  description: z
    .string()
    .min(1, "Itinerary step description cannot be empty")
    .max(15_000, "Maximum length for not itinerary step description is 15,000 characters."),
  step_label: z
    .string()
    .min(1, "Itinerary step label cannot be empty")
    .max(64, "Maximum length for not itinerary step label is 64 characters."),
});

export type ExistingItineraryStepSchemaType = z.infer<typeof ExistingItineraryStepSchema>;

export const ItinerarySchema = z.array(z.union([NewItineraryStepSchema, ExistingItineraryStepSchema]));

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
