import React, { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext.tsx';

interface AuthViewProps {
  onBackToLanding: () => void;
}

export function AuthView({ onBackToLanding }: AuthViewProps) {
  const { signInGoogle, loginDemo, registerDemo } = useAcademy();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('student@ihr-osint.local');
  const [password, setPassword] = useState('Student@12345');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await loginDemo(email, password);
      } else {
        await registerDemo(email, password, displayName);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const fillSeededAccount = (role: 'student' | 'admin') => {
    setMode('login');
    setError(null);
    if (role === 'student') {
      setEmail('student@ihr-osint.local');
      setPassword('Student@12345');
    } else {
      setEmail('admin@ihr-osint.local');
      setPassword('Admin@12345');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBackToLanding}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                IHR OSINT Academy
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to track Stage A & Stage B progress
              </p>
            </div>
          </div>

          {/* Official Google Sign-In Material Button */}
          <div className="mt-6">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGoogleSignIn()}
              className="gsi-material-button w-full!"
            >
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Continue with Google (Cloud Sync & Docs/Sheets Export)
                </span>
              </div>
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] font-medium text-slate-400 uppercase">
              Or Self-Hosted Local Account
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Seeded Demo Quick-Fill Controls */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillSeededAccount('student')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <UserCheck className="h-3.5 w-3.5 text-sky-500" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => fillSeededAccount('admin')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              <span>Demo Admin</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Bilal Ahmed"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {busy
                ? 'Authenticating...'
                : mode === 'login'
                  ? 'Sign In to Academy'
                  : 'Create Local Account'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {mode === 'login' ? 'Need a fresh student profile?' : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
            >
              {mode === 'login' ? 'Register local user' : 'Back to Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
