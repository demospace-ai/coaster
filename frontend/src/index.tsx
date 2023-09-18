import "src/index.css";

import { H } from "highlight.run";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "src/app/App";
import { rudderanalytics } from "src/app/rudder";
import { createStore } from "src/root/model";
import { isProd } from "src/utils/env";

const store = createStore();

if (isProd()) {
  rudderanalytics.load("2Va8vvJ85DejVV7jncdVenC6smB", "https://trycoasterlyoh.dataplane.rudderstack.com");
  H.init("7e3vw5g1", {
    tracingOrigins: ["localhost", "api.trycoaster.com"],
    networkRecording: {
      enabled: true,
      recordHeadersAndBody: true,
      networkHeadersToRedact: ["X-LINK-TOKEN"],
      networkBodyKeysToRedact: ["link_token"],
    },
  });
} else {
  H.init("6gl37zg9", {
    tracingOrigins: ["localhost"],
    networkRecording: {
      enabled: true,
      recordHeadersAndBody: true,
      networkHeadersToRedact: ["X-LINK-TOKEN"],
      networkBodyKeysToRedact: ["link_token"],
    },
  });
}

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
