"use client";

import { trackEvent } from "@coaster/components/rudderstack/client";
import { Tag } from "@coaster/types";
import { useEffect } from "react";

export const TrackTagView: React.FC<{ tag: Tag }> = ({ tag }) => {
  useEffect(() => {
    trackEvent("Product List Viewed", {
      list_id: tag.title,
      tag: tag.title,
      category: tag.title,
      content_name: tag.title,
    });
  }, [tag]);

  return null;
};
