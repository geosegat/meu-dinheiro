'use client';

import { I18nProvider } from '@/app/i18n/I18nContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
