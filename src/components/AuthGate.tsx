import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LoginScreen } from './LoginScreen';

interface AuthValue {
  email: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({ email: '', signOut: async () => {} });
export const useAuth = () => useContext(AuthContext);

type AuthState = { status: 'checking' } | { status: 'signedOut'; notice?: string } | { status: 'signedIn'; email: string };

/**
 * Shows the login screen until the server confirms a session, then renders the app.
 * Signing out unmounts the app, so all in-memory documents, notes and chats are discarded.
 */
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ status: 'checking' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (cancelled) return;
        setState(data.authenticated ? { status: 'signedIn', email: data.email } : { status: 'signedOut' });
      })
      .catch(() => !cancelled && setState({ status: 'signedOut' }));
    return () => {
      cancelled = true;
    };
  }, []);

  // If any API call reports 401 (session expired or revoked), return to the login screen.
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const res = await originalFetch(input, init);
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (res.status === 401 && url.includes('/api/') && !url.includes('/api/auth/')) {
        setState({ status: 'signedOut', notice: 'Your session has ended. Please sign in again.' });
      }
      return res;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
    setState({ status: 'signedOut', notice: 'You have been signed out.' });
  }, []);

  if (state.status === 'checking') {
    return (
      <div role="status" className="min-h-screen flex items-center justify-center bg-[#F4F1EA] text-sm text-[#6F6D65]">
        Loading…
      </div>
    );
  }

  if (state.status === 'signedOut') {
    return (
      <LoginScreen
        notice={state.notice}
        onSignedIn={(email) => setState({ status: 'signedIn', email })}
      />
    );
  }

  return <AuthContext.Provider value={{ email: state.email, signOut }}>{children}</AuthContext.Provider>;
};
