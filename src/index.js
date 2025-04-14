import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWrapper from './App';
import { LoginProvider } from './context/LoginContext'; // Import LoginProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoginProvider> {/* Wrap your app with LoginProvider */}
    <GoogleOAuthProvider clientId="980939869376-24ab4iahare9t3g6ko06m7iefbr2gbtg.apps.googleusercontent.com">
        <AppWrapper /> {/* This component already includes Router */}

      </GoogleOAuthProvider>;
    </LoginProvider>
  </React.StrictMode>
);
