import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

export const locales = { 'pt-BR': ptBR, 'en-US': enUS } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = 'pt-BR';

type TranslationObject = Record<string, string | Record<string, string | Record<string, string>>>;

export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = locales[locale];

  for (const k of keys) {
    if (value === undefined || value === null) return key;
    value = value[k];
  }

  if (typeof value !== 'string') return key;

  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
      params[paramKey] !== undefined ? String(params[paramKey]) : `{{${paramKey}}}`
    );
  }

  return value;
}
