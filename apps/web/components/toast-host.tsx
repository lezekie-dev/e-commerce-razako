'use client';

/**
 * Wrapper client pour <ToastProvider>.
 *
 * Pourquoi : `apps/web/app/layout.tsx` est un Server Component (RSC). On ne
 * peut pas y poser directement un hook Zustand ou un Framer Motion. On
 * extrait donc le Provider dans ce client wrapper, qui peut être rendu côté
 * serveur mais s'exécute côté client.
 */

import * as React from 'react';
import { ToastProvider } from '@ecommerce/ui';

export function ToastHost({ children }: { children: React.ReactNode }) {
  return <ToastProvider position="bottom-right">{children}</ToastProvider>;
}
