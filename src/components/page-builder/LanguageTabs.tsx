"use client";

import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES, DEFAULT_LANGUAGE } from "@/lib/i18n";

interface LanguageTabsProps {
  languages: Language[];
  currentLang: Language;
  onChange: (lang: Language) => void;
  showAddButton?: boolean;
  onAddLanguage?: () => void;
  className?: string;
}

export default function LanguageTabs({
  languages,
  currentLang,
  onChange,
  showAddButton = false,
  onAddLanguage,
  className = "",
}: LanguageTabsProps) {
  // Don't render if only one language and no add button
  if (languages.length <= 1 && !showAddButton) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 mb-2 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition ${
            lang === currentLang
              ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
          <span className="hidden sm:inline">{LANGUAGE_NAMES[lang]}</span>
        </button>
      ))}
      {showAddButton && onAddLanguage && (
        <button
          type="button"
          onClick={onAddLanguage}
          className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-100 rounded-md transition"
          title="Add language"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface LocalizedInputProps {
  label: string;
  languages: Language[];
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  value: string | Record<string, string> | undefined;
  onChange: (newValue: Record<string, string>) => void;
  placeholder?: string;
  type?: "text" | "textarea";
  rows?: number;
  required?: boolean;
  helpText?: string;
}

/**
 * A combined input component with language tabs above it
 */
export function LocalizedInput({
  label,
  languages,
  currentLang,
  onLangChange,
  value,
  onChange,
  placeholder = "",
  type = "text",
  rows = 3,
  required = false,
  helpText,
}: LocalizedInputProps) {
  // Ensure we have valid languages array
  const langs = languages.length > 0 ? languages : [DEFAULT_LANGUAGE];
  const activeLang = langs.includes(currentLang) ? currentLang : langs[0];

  // Get the current value for the selected language
  const getCurrentValue = (): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") {
      // Plain string - show for all languages in single-lang mode, or only for 'en'
      return langs.length === 1 ? value : (activeLang === "en" ? value : "");
    }
    // Localized object
    return value[activeLang] || value["en"] || "";
  };

  const handleChange = (newText: string) => {
    if (langs.length === 1) {
      // Single language mode - still use localized format for consistency
      onChange({ [langs[0]]: newText });
    } else {
      // Multi-language mode
      const currentValues: Record<string, string> =
        typeof value === "string"
          ? { en: value }
          : value || {};

      onChange({
        ...currentValues,
        [activeLang]: newText,
      });
    }
  };

  const hasTranslation = (lang: Language): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") {
      return lang === "en" && Boolean(value);
    }
    return Boolean(value[lang]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      </div>

      {/* Language tabs with indicator - only show if multiple languages */}
      {langs.length > 1 && (
        <div className="flex items-center gap-1 mb-2">
          {langs.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLangChange(lang)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition ${
                lang === activeLang
                  ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              {hasTranslation(lang) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input field */}
      {type === "textarea" ? (
        <textarea
          value={getCurrentValue()}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={getCurrentValue()}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
        />
      )}

      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}
