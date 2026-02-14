'use client';

import { I18nProvider } from '@/app/i18n/I18nContext';
import { SessionProvider } from 'next-auth/react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>{children}</I18nProvider>
    </SessionProvider>
  );
}
