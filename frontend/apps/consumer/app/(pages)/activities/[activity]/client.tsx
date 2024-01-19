"use client";

import { trackEvent } from "@coaster/components/rudderstack/client";
import { CategoryType } from "@coaster/types";
import { useEffect } from "react";

export const TrackActivityView: React.FC<{ activityType: CategoryType }> = ({ activityType }) => {
  useEffect(() => {
    trackEvent("activity_viewed", {
      activity: activityType,
      category: activityType,
      content_name: activityType,
    });
  }, [activityType]);

  return null;
};
