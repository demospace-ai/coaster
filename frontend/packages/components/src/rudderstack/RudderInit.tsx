"use client";

import { isProd } from "@coaster/utils/common";
import Script from "next/script";
import { useEffect } from "react";

export const RudderInit = () => {
  useEffect(() => {
    if (!isProd()) return;

    const initialize = async () => {
      const { RudderAnalytics } = await import("@rudderstack/analytics-js");
      const analyticsInstance = new RudderAnalytics();

      analyticsInstance.load("2Va8vvJ85DejVV7jncdVenC6smB", "https://trycoasterlyoh.dataplane.rudderstack.com", {
        plugins: ["BeaconQueue", "DeviceModeDestinations", "NativeDestinationQueue", "StorageEncryption", "XhrQueue"],
      });

      window.rudderanalytics = analyticsInstance;
    };

    initialize().catch((e) => console.log(e));
  }, []);

  return (
    <Script id="bufferEvents">
      {`
            window.rudderanalytics = [];
            var methods = [
              'load',
              'page',
              'track',
              'identify',
              'alias',
              'group',
              'ready',
              'reset',
              'getAnonymousId',
              'setAnonymousId',
              'getUserId',
              'getUserTraits',
              'getGroupId',
              'getGroupTraits',
              'startSession',
              'endSession',
              'getSessionId',
            ];
            for (var i = 0; i < methods.length; i++) {
              var method = methods[i];
              window.rudderanalytics[method] = (function (methodName) {
                return function () {
                  window.rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)));
                };
              })(method);
            }
        `}
    </Script>
  );
};
