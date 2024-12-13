import { ApolloProvider } from '@apollo/client';
import { EuiThemeProvider } from '@elastic/eui';
import React from 'react';
import ReactDOM from 'react-dom/client';
import client from './apolloClient';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <EuiThemeProvider colorMode='dark'>
        <div className='app-container'>
          <App />
        </div>
      </EuiThemeProvider>
    </ApolloProvider>
  </React.StrictMode>
);
