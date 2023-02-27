import './index.css';

import { ErrorBoundary } from '@highlight-run/react';
import { H } from 'highlight.run';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { App } from 'src/connect/App';
import { isProd } from 'src/utils/env';

// Initialize Highlight tracking for production
if (isProd()) {
  H.init('7e3vw5g1');
}

// do the thing
window.parent.postMessage({});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary showDialog>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </ErrorBoundary>
  </React.StrictMode>
);