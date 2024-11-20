import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  process.env.NODE_ENV === 'development' ? (
      <App />
    ) : (
      // 生产环境
      <React.StrictMode>
        <App />
      </React.StrictMode>
  )
);
