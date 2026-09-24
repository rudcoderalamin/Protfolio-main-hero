import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Dynamically set and refresh browser favicon to the user photo
(() => {
  if (typeof window === 'undefined') return;
  const photoUrl = '/Profile-Photo.png';
  const setFavicon = () => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = photoUrl;
  };
  setFavicon();
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
