import { NextRequest } from "next/server";
import OpenAI from "openai";

const CATEGORIES = [
  "surfing",
  "fishing",
  "skiing",
  "hiking",
  "kitesurf",
  "climbing",
  "cycling",
  "diving",
  "wingfoil",
  "sup",
  "camping",
  "boating",
  "kayaking",
  "windsurf",
  "yoga",
  "wakeboard",
  "snorkeling",
  "buggying",
  "snowmobile",
  "safari",
  "hunting",
];

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  organization: "org-ZY8vsOXtNV5Od1pbPFmjcLeR",
});

export async function GET(req: NextRequest) {
  const encodedQuery = req.nextUrl.searchParams.get("query");
  if (!encodedQuery) {
    return Response.json({ categories: [] });
  }

  const query = decodeURI(encodedQuery);

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You will be provided with a search query, and your task is to select the 3 most relevant activities from this list: ${CATEGORIES.join(
          ", ",
        )}. Simply respond in the format ["activity1", "activity2", "activity3"].`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    model: "gpt-4",
  });

  return Response.json({ categories: JSON.parse(completion.choices[0].message.content ?? "[]") });
}
