import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { ColorModeProvider } from './shared/context/ColorModeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ColorModeProvider>
  </React.StrictMode>,
);
