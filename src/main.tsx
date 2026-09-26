import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PreferencesProvider } from './context/PreferencesContext';
import { AuthGate } from './components/AuthGate';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </PreferencesProvider>
  </StrictMode>,
);
