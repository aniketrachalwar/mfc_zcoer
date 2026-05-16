import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext';
import { ProgressionProvider } from './lib/ProgressionContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProgressionProvider>
        <App />
      </ProgressionProvider>
    </AuthProvider>
  </StrictMode>,
);
