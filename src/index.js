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
    <GoogleOAuthProvider clientId="113245644939-rh7vnarrmn2gjm2lsfntmac1ouuspnp5.apps.googleusercontent.com">
        <AppWrapper /> {/* This component already includes Router */}

      </GoogleOAuthProvider>;
    </LoginProvider>
  </React.StrictMode>
);
