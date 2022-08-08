import './index.css';

import { ErrorBoundary } from '@highlight-run/react';
import { H } from 'highlight.run';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { App } from 'src/app/App';
import { createStore } from 'src/root/model';

const store = createStore();

H.init('7e3vw5g1');

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary showDialog>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
