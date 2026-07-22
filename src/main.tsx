import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import EmbedApp from './EmbedApp.tsx';
import './index.css';

const mode = new URLSearchParams(window.location.search).get('mode');
const RootComponent = mode === 'widget' || mode === 'settings' ? EmbedApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
