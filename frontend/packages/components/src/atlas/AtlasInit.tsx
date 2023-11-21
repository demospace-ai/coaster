"use client";

import { useIsMobile } from "@coaster/utils/client";
import { isProd } from "@coaster/utils/common";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    Atlas:
      | {
          appId: string;
          v: number;
          q: unknown[];
          call: (...args: unknown[]) => void;
        }
      | undefined;
  }
}

export const AtlasInit = () => {
  const isMobile = useIsMobile();
  if (!isProd()) return null;

  useEffect(function atlasSnippetEntry() {
    if (typeof window.Atlas === "object") return;
    console.log(isMobile);

    window.Atlas = {
      appId: "vn78sbkf0q",
      v: 2,
      q: [
        [
          "start",
          {
            chat: {
              hideBubble: isMobile,
            },
          },
        ],
      ],
      call: function () {
        this.q?.push(arguments);
      },
    };
  }, []);

  return <Script id="atlas-bundle" src="https://app.atlas.so/client-js/atlas.bundle.js" strategy="lazyOnload" />;
};
