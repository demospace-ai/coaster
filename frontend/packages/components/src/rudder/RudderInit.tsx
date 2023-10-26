"use client";

import { isProd } from "@coaster/utils";
import { RudderAnalytics } from "@rudderstack/analytics-js";
import { useEffect } from "react";

export const RudderInit: React.FC<{ writeKey: string; dataPlaneUrl: string }> = ({ writeKey, dataPlaneUrl }) => {
  useEffect(() => {
    if (isProd()) {
      const analytics = new RudderAnalytics();
      analytics.load(writeKey, dataPlaneUrl);
      window.rudderanalytics = analytics;
    }
  }, []);

  return <></>;
};
