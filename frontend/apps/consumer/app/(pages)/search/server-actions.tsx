"use server";

import { GeneratedCategory, GeneratedCategoryType, GeneratedListing } from "@coaster/types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  organization: "org-ZY8vsOXtNV5Od1pbPFmjcLeR",
});

async function getGeneratedCategories(query: string): Promise<GeneratedCategoryType[]> {
  const categories = Object.keys(GeneratedCategory.Values).join(", ");
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You will be provided with a search query, and your task is to select the 1-3 of the most relevant activities from this list: ${categories}. Always respond in the format ["activity1", "activity2", "activity3"]. Only suggest activitie from the list. If you are unsure, choose 1-3 of the most likely from the list. Never respond in any format other than an array of 1-3 activities.`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-4",
  });

  return JSON.parse(completion.choices[0].message.content ?? "[]");
}

async function getPlaceFromQuery(query: string): Promise<string> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.append("input", query);
  url.searchParams.append("types", "(regions)");
  url.searchParams.append("key", process.env.NODE_MAPS_API_KEY ?? "");

  const response = await fetch(url);
  const result = await response.json();
  return result.predictions && result.predictions.length > 0 ? result.predictions[0].description : "Anywhere";
}

export async function getGeneratedListings(query: string): Promise<GeneratedListing[]> {
  const categories = await getGeneratedCategories(query);
  const place = await getPlaceFromQuery(query);

  return categories.map((category) => ({
    category,
    place,
  }));
}
