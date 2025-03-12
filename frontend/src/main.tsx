import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import store from './redux/store';
import { Provider } from 'react-redux';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <Provider store={store}>
    <App />
  </Provider>
  </StrictMode>,
)


// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import App from './App';
// import store from './redux/store';
// import './index.scss';
// import './i18n/i18n'; // Import i18n configuration

