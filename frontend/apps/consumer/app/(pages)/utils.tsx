import { Category } from "@coaster/types";

const categories = [...Object.keys(Category), "daytrips", undefined];
export type FeaturedCategory = (typeof categories)[number];
