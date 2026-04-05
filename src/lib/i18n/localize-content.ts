import { Language, DEFAULT_LANGUAGE, isValidLanguage } from "./index";

/**
 * Check if a value is a localized object (has language keys like { en: "...", es: "..." })
 */
export function isLocalizedValue(value: unknown): value is Record<Language, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }

  // Check if at least one key is a valid language code
  return keys.some((key) => isValidLanguage(key));
}

/**
 * Get a localized string value from a potentially localized object
 */
export function getLocalizedString(
  value: string | Record<Language, string> | undefined,
  lang: Language,
  fallbackLang: Language = DEFAULT_LANGUAGE
): string {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  // Try requested language
  if (lang in value && value[lang]) {
    return value[lang];
  }

  // Try fallback language
  if (fallbackLang in value && value[fallbackLang]) {
    return value[fallbackLang];
  }

  // Try any available language
  const availableKeys = Object.keys(value).filter(isValidLanguage);
  if (availableKeys.length > 0) {
    return value[availableKeys[0] as Language] || "";
  }

  return "";
}

/**
 * Recursively localize content object, resolving any localized string fields
 */
export function localizeContent<T>(
  content: T,
  lang: Language,
  fallbackLang: Language = DEFAULT_LANGUAGE
): T {
  if (content === null || content === undefined) {
    return content;
  }

  // If it's a primitive, return as-is
  if (typeof content !== "object") {
    return content;
  }

  // Handle arrays
  if (Array.isArray(content)) {
    return content.map((item) => localizeContent(item, lang, fallbackLang)) as T;
  }

  // Check if this object is a localized value
  if (isLocalizedValue(content)) {
    // This is a localized object, extract the value for the requested language
    const localizedContent = content as Record<Language, unknown>;

    // Try requested language
    if (lang in localizedContent && localizedContent[lang] !== undefined) {
      return localizedContent[lang] as T;
    }

    // Try fallback
    if (fallbackLang in localizedContent && localizedContent[fallbackLang] !== undefined) {
      return localizedContent[fallbackLang] as T;
    }

    // Return first available language value
    const firstKey = Object.keys(localizedContent).find(isValidLanguage) as Language | undefined;
    if (firstKey && localizedContent[firstKey] !== undefined) {
      return localizedContent[firstKey] as T;
    }

    // If we couldn't extract any value, return empty string for string types
    // This prevents returning the i18n object itself which would cause React errors
    return "" as T;
  }

  // Regular object - recursively process each property
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content as Record<string, unknown>)) {
    result[key] = localizeContent(value, lang, fallbackLang);
  }

  return result as T;
}

/**
 * Create a localized value from a string and language
 */
export function createLocalizedValue(
  existingValue: string | Record<Language, string> | undefined,
  newValue: string,
  lang: Language
): Record<Language, string> {
  // If existing value is already a localized object, update it
  if (typeof existingValue === "object" && existingValue !== null) {
    return {
      ...existingValue,
      [lang]: newValue,
    };
  }

  // If it was a plain string, convert to localized with default language
  if (typeof existingValue === "string" && existingValue) {
    return {
      [DEFAULT_LANGUAGE]: existingValue,
      [lang]: newValue,
    } as Record<Language, string>;
  }

  // Create new localized value
  return {
    [lang]: newValue,
  } as Record<Language, string>;
}

/**
 * Check if content has translations for a specific language
 */
export function hasTranslation(
  value: string | Record<Language, string> | undefined,
  lang: Language
): boolean {
  if (typeof value === "string") {
    return lang === DEFAULT_LANGUAGE;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  return lang in value && Boolean(value[lang]);
}

/**
 * Get all languages that have translations in a content object
 */
export function getTranslatedLanguages(content: unknown): Language[] {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return [];
  }

  const languages = new Set<Language>();

  function collectLanguages(obj: unknown): void {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(collectLanguages);
      return;
    }

    if (isLocalizedValue(obj)) {
      Object.keys(obj).forEach((key) => {
        if (isValidLanguage(key)) {
          languages.add(key);
        }
      });
    } else {
      Object.values(obj).forEach(collectLanguages);
    }
  }

  collectLanguages(content);
  return Array.from(languages);
}
