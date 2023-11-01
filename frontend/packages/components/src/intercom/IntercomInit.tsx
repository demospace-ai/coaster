"use client";

import { isProd } from "@coaster/utils/common";
import Script from "next/script";
import { useCallback } from "react";

export const IntercomInit = () => {
  if (!isProd()) return null;
  const onIntercomLoaded = useCallback(() => {
    const { innerWidth } = window;
    const isMobile = innerWidth < 768;
    (window as any).Intercom("boot", {
      api_base: "https://api-iam.intercom.io",
      app_id: "pdc06iv8",
      hide_default_launcher: isMobile,
    });
  }, []);

  return (
    <>
      <Script id="intercom-settings">
        {`window.intercomSettings = {
          api_base: "https://api-iam.intercom.io",
          app_id: "pdc06iv8",
          hide_default_launcher: true,
        };`}
      </Script>
      <Script src="https://widget.intercom.io/widget/pdc06iv8" strategy="lazyOnload" onLoad={onIntercomLoaded} />
    </>
  );
};
