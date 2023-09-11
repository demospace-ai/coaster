import { Category } from "src/rpc/types";
import { z } from "zod";

export const CategorySchema = Category;

export const NameSchema = z
  .string()
  .nonempty("A name is required.")
  .min(4, "Your name must be at least 4 characters long.")
  .max(64, "Your name can be up to 64 characters long.");

export const DescriptionSchema = z
  .string()
  .nonempty("A description is required.")
  .min(4, "Your description must be at least 4 characters long.")
  .max(1500, "Descriptions can be up to 1500 characters long.");

export const PriceSchema = z.number().positive().max(100000, "The maximum price is $100,000.");

export const DurationSchema = z
  .number({ invalid_type_error: "The minimum duration is 30 minutes." }) // needed to handle NaN
  .min(30, "The minimum duration is 30 minutes.");

export const MaxGuestsSchema = z
  .number({ invalid_type_error: "The minimum duration is 30 minutes." }) // needed to handle NaN
  .min(1, "The minimum number of guests is 1.")
  .max(100, "The maximum number of guests is 100.");

export const IncludesSchema = z.array(z.object({ value: z.string().nonempty("Included amenities cannot be empty") }));
