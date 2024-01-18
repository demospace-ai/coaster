"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRudderAnalytics } from "../rudderstack/client";

export default function TrackPage() {
  const rudderstack = useRudderAnalytics();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    rudderstack?.page();
  }, [pathname, searchParams]);

  return null;
}
