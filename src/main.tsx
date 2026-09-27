import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/app';
import '@/styles/index.css';
import { logger } from '@/utils/logger';
import { appConfig } from '@/app/config/app.config';

logger.info(`Starting ${appConfig.name} v${appConfig.version} [${appConfig.environment}]`);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to locate root HTML element (#root).');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
