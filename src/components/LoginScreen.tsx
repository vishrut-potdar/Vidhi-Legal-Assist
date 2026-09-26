import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, Shield } from 'lucide-react';

interface LoginScreenProps {
  onSignedIn: (email: string) => void;
  notice?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignedIn, notice }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Sign in — Vidhi';
    emailRef.current?.focus();
    return () => {
      document.title = 'Vidhi — Plain-Language Legal Assistant';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.message || data.error || (res.status === 429 ? 'Too many attempts. Please wait a minute.' : 'Sign-in failed. Please try again.')
        );
        setPassword('');
        return;
      }
      onSignedIn(data.email);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F1EA] px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1.5">
          <p className="font-serif text-3xl tracking-wider text-[#1C1C19]">VIDHI</p>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C887B]">Legal Intelligence</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="login-title"
          className="bg-[#FCFBF7] border border-[#DDD9CE] rounded-xl shadow-xs p-6 space-y-5"
        >
          <div className="space-y-1">
            <h1 id="login-title" className="font-serif text-xl font-semibold text-[#1C1C19] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C38A2E]" />
              Sign in
            </h1>
            <p className="text-xs text-[#6F6D65]">Access is limited to approved accounts.</p>
          </div>

          {notice && !error && (
            <p role="status" className="text-xs p-2.5 rounded-md bg-[#F3ECD7] border border-[#E6D8B0] text-[#6B5217]">
              {notice}
            </p>
          )}

          {error && (
            <p role="alert" className="text-xs p-2.5 rounded-md bg-[#FAF3F1] border border-[#EADBDA] text-[#8E4A3F]">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-medium text-[#1C1C19]">
              Email
            </label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-2 focus:ring-[#C38A2E]/60"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-medium text-[#1C1C19]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-[#C9C4B7] bg-white text-[#1C1C19] focus:outline-none focus:ring-2 focus:ring-[#C38A2E]/60"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-md bg-[#171714] text-white text-sm font-medium hover:bg-[#2C2B26] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 motion-safe:animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#8C887B] flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#58735C]" />
          Documents stay in this browser tab and are cleared when you sign out.
        </p>
      </div>
    </main>
  );
};
