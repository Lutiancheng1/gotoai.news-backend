// admin/src/App.tsx
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { routes } from './routes';
import '@ant-design/cssinjs';
import './App.css'
const AppRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;