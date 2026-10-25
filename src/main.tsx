import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { initEarlyProfilePrefetch } from './utils/profilePrefetch';

// Automatically register service worker with auto-update
registerSW({ immediate: true });

// Trigger instantaneous prefetch of public profile if visiting a profile URL
initEarlyProfilePrefetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
