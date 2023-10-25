"use client";

import { ErrorBoundary as HighlightErrorBoundary } from "@highlight-run/react";
import { useEffect, useState } from "react";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const uncaught = useCatchGlobalError();
  if (uncaught) {
    throw uncaught;
  }

  return <HighlightErrorBoundary showDialog>{children}</HighlightErrorBoundary>;
}

function useCatchGlobalError() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      setError(e.error);
      return true;
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return error;
}
