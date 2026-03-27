// Internationalization (i18n) library

export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr', 'it', 'pl', 'tr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Espaol',
  de: 'Deutsch',
  fr: 'Francais',
  it: 'Italiano',
  pl: 'Polski',
  tr: 'Turkce',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  pl: '🇵🇱',
  tr: '🇹🇷',
};

// Namespace types
export type TranslationNamespace = 'common' | 'landing' | 'registration' | 'validation';

// Cache for loaded translations
const translationCache: Record<string, Record<string, string>> = {};

// Load translations for a specific language and namespace
export async function loadTranslations(
  lang: Language,
  namespace: TranslationNamespace
): Promise<Record<string, string>> {
  const cacheKey = `${lang}:${namespace}`;

  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Dynamic import of translation file
    const translations = await import(`@/locales/${lang}/${namespace}.json`);
    translationCache[cacheKey] = translations.default || translations;
    return translationCache[cacheKey];
  } catch {
    console.warn(`Failed to load translations for ${lang}/${namespace}, falling back to English`);

    if (lang !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE, namespace);
    }

    return {};
  }
}

// Get all translations for a language
export async function getTranslations(
  lang: Language | string,
  namespace: TranslationNamespace
): Promise<Record<string, string>> {
  const validLang = isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  return loadTranslations(validLang, namespace);
}

// Simple translation function (sync, requires pre-loaded translations)
export function t(
  translations: Record<string, string>,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = translations[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
  }

  return text;
}

// Check if a language is supported
export function isValidLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

// Parse language from Accept-Language header
export function parseAcceptLanguage(header: string | null): Language {
  if (!header) return DEFAULT_LANGUAGE;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
  const languages = header
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code
        quality: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported language
  for (const { code } of languages) {
    if (isValidLanguage(code)) {
      return code;
    }
  }

  return DEFAULT_LANGUAGE;
}

// Get localized content from a JSON field (e.g., EventPageSection.content)
export function getLocalizedContent<T>(
  content: Record<string, T> | T,
  lang: Language,
  fallbackLang: Language = DEFAULT_LANGUAGE
): T {
  // If content is not an object with language keys, return as-is
  if (typeof content !== 'object' || content === null || Array.isArray(content)) {
    return content as T;
  }

  // Check if content has language keys
  const contentObj = content as Record<string, T>;

  // Try requested language first
  if (lang in contentObj) {
    return contentObj[lang];
  }

  // Try fallback language
  if (fallbackLang in contentObj) {
    return contentObj[fallbackLang];
  }

  // Return first available language or the content itself
  const keys = Object.keys(contentObj);
  if (keys.length > 0 && isValidLanguage(keys[0])) {
    return contentObj[keys[0]];
  }

  return content as T;
}

// Build localized URL
export function buildLocalizedUrl(path: string, lang: Language): string {
  // Remove leading slash and any existing language prefix
  const cleanPath = path.replace(/^\//, '').replace(/^(en|es|de|fr|it|pl|tr)\//, '');
  return `/${lang}/${cleanPath}`;
}

// Get alternate language URLs for SEO
export function getAlternateUrls(
  baseUrl: string,
  path: string,
  availableLanguages: Language[] = SUPPORTED_LANGUAGES.slice()
): Record<Language, string> {
  const alternates: Partial<Record<Language, string>> = {};

  availableLanguages.forEach((lang) => {
    const cleanPath = path.replace(/^\//, '').replace(/^(en|es|de|fr|it|pl|tr)\//, '');
    alternates[lang] = `${baseUrl}/${lang}/${cleanPath}`;
  });

  return alternates as Record<Language, string>;
}
