import { AtlasInit } from "@coaster/components/atlas/AtlasInit";
import { ErrorBoundary } from "@coaster/components/error/ErrorBoundary";
import { isProd, worksans } from "@coaster/utils/common";
import { HighlightInit } from "@highlight-run/next/client";
import type { Metadata, Viewport } from "next";

import "supplier/app/global.css";

export const metadata: Metadata = {
  title: "Coaster",
  description: "Coaster - Curated adventures",
};

export const viewport: Viewport = {
  themeColor: "#001827",
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
      <html lang="en" className={worksans.className}>
        <body>
          <div id="root" className="tw-w-full tw-h-full tw-flex tw-flex-col">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </body>
      </html>
    </>
  );
}
