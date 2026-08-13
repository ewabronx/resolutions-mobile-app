import { useState } from 'react';
import { LockKeyhole, Mail, User, Sparkles } from 'lucide-react';
import { getCurrentUser, loginUser, registerUser } from '../lib/api';
import { useAppStore } from '../store';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuthSession = useAppStore((state) => state.setAuthSession);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authResponse = mode === 'login'
        ? await loginUser(email.trim(), password)
        : await registerUser(email.trim(), password, fullName.trim() || undefined);

      const user = await getCurrentUser(authResponse.access_token);
      setAuthSession(authResponse.access_token, user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nie udało się zalogować');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_rgba(19,15,27,0.95)_40%,_rgba(3,7,18,1)_100%)] px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 p-2 text-slate-950 shadow-lg shadow-cyan-500/30">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Resolutions</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Twoje cele</h1>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
          >
            Zaloguj
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-violet-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
          >
            Rejestracja
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm text-slate-300">
                <User size={14} /> Imię i nazwisko
              </span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
                placeholder="np. Ewa Nowak"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm text-slate-300">
              <Mail size={14} /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="twoj@email.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm text-slate-300">
              <LockKeyhole size={14} /> Hasło
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="minimum 8 znaków"
              minLength={8}
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Przetwarzanie...' : mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </div>
  );
}
