import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';
import { initEarlyProfilePrefetch } from './utils/profilePrefetch';

// Clean up any legacy stale caches from earlier autoUpdate loops
if (typeof window !== 'undefined' && 'caches' in window) {
  try {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key.includes('workbox-precache')) {
          caches.delete(key).catch(() => {});
        }
      });
    }).catch(() => {});
  } catch (_) {}
}

// Register service worker non-intrusively without forced page reloads
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Non-intrusive: never force page reload while user is interacting
  },
  onOfflineReady() {
    // Ready offline
  },
});

// Trigger instantaneous prefetch of public profile if visiting a profile URL
initEarlyProfilePrefetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
