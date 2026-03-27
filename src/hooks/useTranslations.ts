"use client";

import { useState, useEffect, useCallback } from "react";
import { Language, TranslationNamespace, loadTranslations, t as translate } from "@/lib/i18n";

interface UseTranslationsResult {
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Record<string, string>;
  loading: boolean;
}

/**
 * Hook for loading and using static UI translations from locale files
 *
 * @param lang - The language to load translations for
 * @param namespace - The translation namespace (common, landing, registration, validation)
 * @returns Translation function and loading state
 *
 * @example
 * const { t, loading } = useTranslations('es', 'common');
 * return <button>{t('buttons.submit')}</button>;
 */
export function useTranslations(
  lang: Language,
  namespace: TranslationNamespace
): UseTranslationsResult {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const loaded = await loadTranslations(lang, namespace);
        if (mounted) {
          setTranslations(loaded);
        }
      } catch (error) {
        console.error(`Failed to load translations for ${lang}/${namespace}:`, error);
        if (mounted) {
          setTranslations({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [lang, namespace]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translate(translations, key, params);
    },
    [translations]
  );

  return { t, translations, loading };
}

/**
 * Hook for loading multiple translation namespaces at once
 */
export function useMultipleTranslations(
  lang: Language,
  namespaces: TranslationNamespace[]
): {
  t: (key: string, params?: Record<string, string | number>) => string;
  loading: boolean;
} {
  const [allTranslations, setAllTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      try {
        const results = await Promise.all(
          namespaces.map((ns) => loadTranslations(lang, ns))
        );
        if (mounted) {
          // Merge all translations, namespaces loaded later override earlier ones
          const merged = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          setAllTranslations(merged);
        }
      } catch (error) {
        console.error(`Failed to load translations for ${lang}:`, error);
        if (mounted) {
          setAllTranslations({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAll();

    return () => {
      mounted = false;
    };
  }, [lang, namespaces.join(",")]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translate(allTranslations, key, params);
    },
    [allTranslations]
  );

  return { t, loading };
}

export default useTranslations;
