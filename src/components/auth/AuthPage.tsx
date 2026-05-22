import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { AlertTriangle, Vault, Mail, Lock, Eye, EyeOff, KeyRound, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Add your Supabase URL and anon key in .env.local first.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Add your Supabase URL and anon key in .env.local first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'GitHub login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[linear-gradient(135deg,#0d0f14_0%,#111827_48%,#10201d_100%)]">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-vault-accent/20 border border-vault-accent/30 shadow-glow mb-4">
            <Vault className="w-8 h-8 text-vault-accent" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Vault</h1>
          <p className="text-vault-muted mt-1 text-sm">Your personal knowledge hub</p>
        </div>

        <div className="vault-card p-8">
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-lg border border-vault-warning/30 bg-vault-warning/10 p-3 text-sm text-vault-text flex gap-3">
              <AlertTriangle className="w-4 h-4 text-vault-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Supabase is not configured yet.</p>
                <p className="text-vault-muted mt-1">
                  Add real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in `.env.local`.
                </p>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex bg-vault-surface rounded-lg p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === m
                    ? 'bg-vault-accent text-white shadow-glow-sm'
                    : 'text-vault-muted hover:text-vault-text'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="vault-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  minLength={6}
                  className="vault-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="vault-btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-vault-border" />
            </div>
            <div className="relative flex justify-center text-xs text-vault-muted">
              <span className="bg-vault-card px-2">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg
                       border border-vault-border bg-vault-surface hover:bg-vault-border/50
                       text-vault-text text-sm font-medium transition-all duration-200
                       hover:border-vault-accent/40 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            GitHub
          </button>
        </div>

        <p className="text-center text-xs text-vault-muted mt-6">
          Your data is private and secure. All content is isolated to your account.
        </p>
      </div>
    </div>
  );
};
