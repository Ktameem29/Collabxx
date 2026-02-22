import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#121826',
                color: '#E5E7EB',
                border: '1px solid #1F2937',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#121826' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#121826' } },
              duration: 3500,
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
