import { ErrorBoundary, RudderInit } from "@coaster/components/client";
import { UserProvider } from "@coaster/components/server";
import { isProd, worksans } from "@coaster/utils";
import { HighlightInit } from "@highlight-run/next/client";
import "consumer/app/global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaster",
  description: "Coaster - Curated adventures",
  themeColor: "#001827",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
          urlBlocklist: [],
        }}
      />
      <RudderInit
        writeKey="2Va8vvJ85DejVV7jncdVenC6smB"
        dataPlaneUrl="https://trycoasterlyoh.dataplane.rudderstack.com"
      />
      <html lang="en" className={worksans.className}>
        <body>
          <div id="root" className="tw-w-full tw-h-full tw-flex tw-flex-col">
            <ErrorBoundary>
              <UserProvider>{children}</UserProvider>
            </ErrorBoundary>
          </div>
        </body>
      </html>
    </>
  );
}
