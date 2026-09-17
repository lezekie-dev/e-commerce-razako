'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { Button, Input, cn } from '@ecommerce/ui';

/**
 * LoginForm — formulaire de connexion (mock M3, Auth.js v5 branchera Phase M4).
 *
 * Onglets :
 * - Email + mot de passe (validation Zod minimale cote client)
 * - Magic Link via email (mock : toast + redirect)
 *
 * Erreurs affichees sous chaque champ (role=alert).
 */

type Mode = 'password' | 'magic-link';

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [magicSent, setMagicSent] = React.useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email.trim()) {
      setError('Veuillez renseigner votre email.');
      return;
    }
    if (!password) {
      setError('Veuillez renseigner votre mot de passe.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Format d’email invalide.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    router.push('/compte');
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Format d’email invalide.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setMagicSent(true);
  };

  return (
    <div>
      <div role="tablist" className="flex gap-1 rounded-full bg-ink-100 p-1 text-sm">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          onClick={() => {
            setMode('password');
            setError(null);
            setMagicSent(false);
          }}
          className={cn(
            'flex-1 rounded-full px-3 py-2 font-medium transition-colors',
            mode === 'password'
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-600 hover:text-ink-900',
          )}
          data-testid="tab-password"
        >
          <Lock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Email + mot de passe
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'magic-link'}
          onClick={() => {
            setMode('magic-link');
            setError(null);
            setMagicSent(false);
          }}
          className={cn(
            'flex-1 rounded-full px-3 py-2 font-medium transition-colors',
            mode === 'magic-link'
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-600 hover:text-ink-900',
          )}
          data-testid="tab-magic-link"
        >
          <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Magic Link
        </button>
      </div>

      {magicSent && mode === 'magic-link' ? (
        <div
          className="mt-6 rounded-2xl border border-success-500 bg-success-50 p-4 text-sm"
          role="status"
          data-testid="magic-sent"
        >
          <p className="font-medium text-success-700">Lien magique envoyé !</p>
          <p className="mt-1 text-ink-600">
            Vérifiez votre boîte mail à <strong>{email}</strong>. Le lien expire dans 15 minutes.
          </p>
        </div>
      ) : mode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink-800">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@maison14.fr"
                className="pl-9"
                data-testid="login-email"
                invalid={!!error && (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-ink-800">
                Mot de passe
              </label>
              <a href="/mot-de-passe-oublie" className="text-xs text-accent-700 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              data-testid="login-password"
              invalid={!!error && !password}
            />
          </div>

          {error ? (
            <p className="text-xs text-danger-600" role="alert" data-testid="login-error">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            disabled={submitting}
            data-testid="login-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Connexion…</span>
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="magic-email" className="mb-1.5 block text-sm font-medium text-ink-800">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <Input
                id="magic-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@maison14.fr"
                className="pl-9"
                data-testid="magic-email"
                invalid={!!error}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              Nous vous enverrons un lien sécurisé pour vous connecter sans mot de passe.
            </p>
          </div>

          {error ? (
            <p className="text-xs text-danger-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            disabled={submitting}
            data-testid="magic-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Envoi…</span>
              </>
            ) : (
              'Recevoir mon lien magique'
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-ink-500">
        En vous connectant, vous acceptez nos{' '}
        <a href="/legal/cgu" className="underline-offset-4 hover:underline">CGU</a> et notre{' '}
        <a href="/legal/privacy" className="underline-offset-4 hover:underline">politique de confidentialité</a>.
      </p>
    </div>
  );
}
