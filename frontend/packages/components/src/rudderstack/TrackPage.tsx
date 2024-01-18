"use client";

import { RudderAnalytics } from "@rudderstack/analytics-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TrackPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    (window.rudderanalytics as RudderAnalytics).page();
  }, [pathname, searchParams]);

  return null;
}
