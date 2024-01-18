"use client";

import { isProd } from "@coaster/utils/common";
import { RudderAnalytics } from "@rudderstack/analytics-js";
import { useEffect, useState } from "react";

export const useRudderAnalytics = () => {
  const [analytics, setAnalytics] = useState<RudderAnalytics>();

  useEffect(() => {
    if (!isProd()) return;

    if (!analytics) {
      const initialize = async () => {
        const { RudderAnalytics } = await import("@rudderstack/analytics-js");
        const analyticsInstance = new RudderAnalytics();

        analyticsInstance.load("2Va8vvJ85DejVV7jncdVenC6smB", "https://trycoasterlyoh.dataplane.rudderstack.com", {
          plugins: ["BeaconQueue", "DeviceModeDestinations", "NativeDestinationQueue", "StorageEncryption", "XhrQueue"],
        });

        window.rudderanalytics = analyticsInstance;
        setAnalytics(analyticsInstance);
      };

      initialize().catch((e) => console.log(e));
    }
  }, [analytics]);

  return analytics;
};

export function useTrackEvent() {
  const rudderstack = useRudderAnalytics();

  return (eventName: string, eventProperties?: any) => {
    rudderstack?.track(eventName, eventProperties);
  };
}

export function getAnonymousID() {
  if (isProd() && (window as any).rudderanalytics) {
    return (window as any).rudderanalytics.getAnonymousId();
  }

  return null;
}
