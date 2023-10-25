import { isProd, worksans } from "@coaster/utils";
import { HighlightInit } from "@highlight-run/next/client";
import type { Metadata } from "next";

import { UserProvider } from "@coaster/components/server";
import "consumer/app/global.css";

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
      <html lang="en" className={worksans.className}>
        <body>
          <div id="root" className="tw-w-full tw-h-full tw-flex tw-flex-col">
            <UserProvider>{children}</UserProvider>
          </div>
        </body>
      </html>
    </>
  );
}
