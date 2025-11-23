import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // You need to create this file, but we will rely on tailwind injection

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);