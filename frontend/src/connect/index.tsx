import './../index.css';

import { ErrorBoundary } from '@highlight-run/react';
import { H } from 'highlight.run';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConnectApp } from 'src/connect/ConnectApp';
import { isProd } from 'src/utils/env';

// Initialize Highlight tracking for production
if (isProd()) {
  H.init('7e3vw5g1');
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary showDialog>
      <BrowserRouter>
        <ConnectApp />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);