"use server";

import { trackEvent } from "@coaster/components/rudderstack/server-events";
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
        content: `You will be provided with a search query, and your task is to select the 0-3 of the most relevant activities from this list: ${categories}. Always respond in the format ["activity1", "activity2", "activity3"]. Only suggest activities from the list. If you are unsure, choose 0-3 of the most likely from the list. Never respond in any format other than an array of 0-3 activities.`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  try {
    if (!completion.choices || completion.choices.length === 0) {
      return [];
    }

    const parsed = JSON.parse(completion.choices[0].message.content ?? "[]");
    return parsed;
  } catch (e) {
    return [];
  }
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

export async function requestTrip(email: string, description: string) {
  const data = new URLSearchParams({
    "entry.2054719272": description,
    emailAddress: email,
    fvv: "1",
    pageHistory: "0",
  });
  const response = await fetch(
    "https://docs.google.com/forms/d/e/1FAIpQLSeJr4DPmCWteU423_zg9RNkYVCEyJBWVHSM6Tino6nqnesupg/formResponse",
    {
      body: data,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  trackEvent("Trip Request", {
    email,
  });
}
