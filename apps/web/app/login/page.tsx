import type { Metadata } from 'next';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { LoginForm } from './login-form';

/**
 * /login — page de connexion.
 *
 * - Onglets : Email/Mot de passe + Magic Link.
 * - Mock M3 : validation cote client + redirect /compte.
 * - Phase M4 : branchement Auth.js v5 (providers config + actions serveur).
 */

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Maison 14 pour accéder à vos commandes et favoris.',
  robots: { index: false, follow: true },
};

export default function LoginPage(): React.ReactElement {
  return (
    <div className="bg-ink-50/40">
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Connexion' }]} />

        <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="text-center">
            <h1 className="font-display text-2xl font-medium tracking-tight text-ink-900 sm:text-3xl">
              Bon retour parmi nous
            </h1>
            <p className="mt-2 text-sm text-ink-600">
              Connectez-vous pour suivre vos commandes et retrouver vos favoris.
            </p>
          </header>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-600">
          Pas encore de compte ?{' '}
          <a
            href="/inscription"
            className="font-medium text-accent-700 underline-offset-4 hover:underline"
          >
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
