import { Category } from "@coaster/types";

const lits = [...Object.keys(Category), "daytrips", undefined];
export type FeaturedCategory = (typeof lits)[number];
