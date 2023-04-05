import "./index.css";

import { ErrorBoundary } from "@highlight-run/react";
import { H } from "highlight.run";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { App } from "src/app/App";
import { rudderanalytics } from "src/app/rudder";
import { createStore } from "src/root/model";
import { isProd } from "src/utils/env";

const store = createStore();

if (isProd()) {
  rudderanalytics.load("2DuH7iesuV4TtpwMqRvXqQttOvm", "https://fabranickbele.dataplane.rudderstack.com");
  H.init("7e3vw5g1");
}

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary showDialog>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);