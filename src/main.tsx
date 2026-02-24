import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Optional: show a prompt to user to refresh
  },
  onOfflineReady() {
    // Ready to work offline
  },
});

// Capture PWA install prompt globally
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
