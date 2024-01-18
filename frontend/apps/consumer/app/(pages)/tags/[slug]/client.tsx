"use client";

import { useTrackEvent } from "@coaster/components/rudderstack/client";
import { Tag } from "@coaster/types";
import { useEffect } from "react";

export const TrackTagView: React.FC<{ tag: Tag }> = ({ tag }) => {
  const trackEvent = useTrackEvent();

  useEffect(() => {
    trackEvent("tag_viewed", {
      tag: tag.title,
      category: tag,
      content_name: tag,
    });
  }, []);

  return null;
};
