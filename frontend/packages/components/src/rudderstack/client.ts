"use client";

import { isProd } from "@coaster/utils/common";
import { RudderAnalytics } from "@rudderstack/analytics-js";

export function trackEvent(eventName: string, eventProperties?: any, contentType?: string) {
  (window.rudderanalytics as RudderAnalytics).track(eventName, eventProperties, {
    integrations: {
      "Facebook Pixel": {
        contentType: contentType ? contentType : "destination",
      },
    },
  });
}

export function getAnonymousID() {
  if (isProd() && (window as any).rudderanalytics) {
    return (window as any).rudderanalytics.getAnonymousId();
  }

  return null;
}
