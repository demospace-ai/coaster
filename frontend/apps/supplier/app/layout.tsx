import { AtlasInit } from "@coaster/components/atlas/AtlasInit";
import { ErrorBoundary } from "@coaster/components/error/ErrorBoundary";
import { HighlightInit } from "@coaster/components/highlight/HighlightInit";
import { worksans } from "@coaster/utils/common";
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
  return (
    <>
      <HighlightInit />
      <AtlasInit />
      <html lang="en" className={worksans.className}>
        <body>
          <div id="root" className="tw-flex tw-h-full tw-w-full tw-flex-col">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </body>
      </html>
    </>
  );
}
