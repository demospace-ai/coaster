"use server";

import { trackEventServer } from "@coaster/components/rudderstack/server";

export async function requestTrip(email: string, description: string, anonymousID: string) {
  const data = new URLSearchParams({
    "entry.2054719272": description,
    emailAddress: email,
    fvv: "1",
    pageHistory: "0",
  });

  await fetch(
    "https://docs.google.com/forms/d/e/1FAIpQLSeJr4DPmCWteU423_zg9RNkYVCEyJBWVHSM6Tino6nqnesupg/formResponse",
    {
      body: data,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  trackEventServer(anonymousID, "Trip requested", {
    email,
  });
}
