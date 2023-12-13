"use client";

import { isProd } from "@coaster/utils/common";

export function trackEvent(eventName: string, eventProperties?: any) {
  if (isProd() && (window as any).rudderanalytics) {
    (window as any).rudderanalytics.track(eventName, eventProperties);
  }
}

export function getAnonymousID() {
  if (isProd() && (window as any).rudderanalytics) {
    return (window as any).rudderanalytics.getAnonymousId();
  }

  return null;
}
