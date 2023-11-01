"use client";

import { isProd } from "@coaster/utils/common";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export const IntercomInit = () => {
  if (!isProd()) return null;
  const pathname = usePathname();
  const pathTokens = pathname ? pathname.split("/") : [];
  const path = pathTokens[1];
  const isNew = pathTokens[2] === "new";
  const isEdit = pathTokens[3] === "edit";
  const hasMobileFooter = path === "listings" && !isNew && !isEdit;

  useEffect(() => {
    if (window.document.getElementById("intercom-mobile-style") !== null) {
      return;
    }

    if (hasMobileFooter) {
      const style = window.document.createElement("style");
      style.id = "intercom-mobile-style";
      style.innerHTML = `
      @media screen and (min-width: 640px) {
        .intercom-launcher {
          bottom: 88px !important;
        }
      }
    `;

      window.document.head.appendChild(style);
    }
  }, [hasMobileFooter]);

  return (
    <>
      <Script id="intercom-settings">
        {`window.intercomSettings = {
          api_base: "https://api-iam.intercom.io",
          app_id: "pdc06iv8",
        };`}
      </Script>
      <Script id="intercom-init" strategy="lazyOnload">
        {
          // eslint-disable-next-line @typescript-eslint/quotes
          `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/pdc06iv8';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`
        }
      </Script>
    </>
  );
};
