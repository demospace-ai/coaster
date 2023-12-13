import { AtlasInit } from "@coaster/components/atlas/AtlasInit";
import { ErrorBoundary } from "@coaster/components/error/ErrorBoundary";
import { RudderInit } from "@coaster/components/rudderstack/RudderInit";
import { isProd, worksans } from "@coaster/utils/common";
import { HighlightInit } from "@highlight-run/next/client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import "consumer/app/global.css";

export const metadata: Metadata = {
  title: "Coaster",
  description: "Coaster - Curated adventures",
  metadataBase: isProd() ? new URL("https://trycoaster.com") : new URL("http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const highlightProjectId = isProd() ? "6glrn57g" : "6gl37zg9";
  const tracingOrigins = isProd() ? ["api.trycoaster.com"] : ["localhost"];

  return (
    <>
      <HighlightInit
        projectId={highlightProjectId}
        serviceName="frontend-app"
        tracingOrigins={tracingOrigins}
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
      />
      <AtlasInit />
      <RudderInit />
      <html lang="en" className={worksans.className}>
        <body>
          <SpeedInsights />
          <div id="root" className="tw-w-full tw-h-full tw-flex tw-flex-col">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </body>
      </html>
    </>
  );
}
