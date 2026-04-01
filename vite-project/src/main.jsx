import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f1f2e',
          color: '#f4f4f4',
          borderRadius: '10px',
          border: '1px solid #64ffda33',
        },
        success: { iconTheme: { primary: '#64ffda', secondary: '#1f1f2e' } },
        error: { iconTheme: { primary: '#ff4d6d', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);
