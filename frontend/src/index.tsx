import './index.css';

import { ErrorBoundary } from '@highlight-run/react';
import { H } from 'highlight.run';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { App } from 'src/app/App';
import { createStore } from 'src/root/model';
import { isProd } from 'src/utils/env';

const store = createStore();

// Initialize Highlight tracking for production
if (isProd()) {
  H.init('7e3vw5g1');
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary showDialog>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);