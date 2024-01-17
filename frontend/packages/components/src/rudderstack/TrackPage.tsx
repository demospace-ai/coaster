"use client";

import { isProd } from "@coaster/utils/common";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TrackPage() {
  if (!isProd()) return null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if ((window as any).rudderanalytics) {
      (window as any).rudderanalytics.page();
    }
  }, [pathname, searchParams]);

  return null;
}
