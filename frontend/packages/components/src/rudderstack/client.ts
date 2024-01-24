"use client";

import { isProd } from "@coaster/utils/common";
import { RudderAnalytics } from "@rudderstack/analytics-js";

export function trackEvent(eventName: string, eventProperties?: any) {
  (window.rudderanalytics as RudderAnalytics).track(eventName, eventProperties, {
    "Facebook Pixel": {
      contentType: "destination",
    },
  });
}

export function getAnonymousID() {
  if (isProd() && (window as any).rudderanalytics) {
    return (window as any).rudderanalytics.getAnonymousId();
  }

  return null;
}
