"use server";

import { trackEventServer } from "@coaster/components/rudderstack/server";

export async function contactUs(email: string, message: string, anonymousID: string) {
  const data = new URLSearchParams({
    "entry.1466576165": message,
    emailAddress: email,
    fvv: "1",
    pageHistory: "0",
  });

  await fetch(
    "https://docs.google.com/forms/d/e/1FAIpQLSeWksG4kNvPKtmrkQdnv5VvpMx9WVb8SZSTpwfx1q_45q_OLA/formResponse",
    {
      body: data,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  trackEventServer(anonymousID, "help_requested", {
    email,
  });
}
