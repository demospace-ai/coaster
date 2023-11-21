"use client";

import { isProd } from "@coaster/utils/common";
import Script from "next/script";

export const AtlasInit = () => {
  if (!isProd()) return null;

  return (
    <>
      <Script id="intercom-settings">
        {`(()=>{"use strict";var t,e={appId:"vn78sbkf0q",v:2,q:[],call:function(){this.q.push(arguments)}};
        window.Atlas=e;var n=document.createElement("script");n.async=!0,n.src="https://app.atlas.so/client-js/atlas.bundle.js";
        var s=document.getElementsByTagName("script")[0];null===(t=s.parentNode)||void 0===t||t.insertBefore(n,s)})();window.Atlas.start()`}
      </Script>
    </>
  );
};
