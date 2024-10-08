import { AtlasInit } from "@coaster/components/atlas/AtlasInit";
import { ErrorBoundary } from "@coaster/components/error/ErrorBoundary";
import { HighlightInit } from "@coaster/components/highlight/HighlightInit";
import { RudderInit } from "@coaster/components/rudderstack/RudderInit";
import { heading, isProd, worksans } from "@coaster/utils/common";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import "consumer/app/global.css";
import dynamic from "next/dynamic";

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

const TrackPage = dynamic(() => import("@coaster/components/rudderstack/TrackPage"), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HighlightInit />
      <AtlasInit />
      <RudderInit />
      <html lang="en" className={`${worksans.className} ${heading.variable}`}>
        <body>
          <TrackPage />
          <SpeedInsights />
          <div id="root" className="tw-w-full tw-h-full tw-flex tw-flex-col">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </body>
      </html>
    </>
  );
}
