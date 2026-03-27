"use client";

import { useState } from "react";
import {
  Language,
  SUPPORTED_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
} from "@/lib/i18n";

interface LanguageSettingsProps {
  availableLanguages: Language[];
  defaultLanguage: Language;
  onUpdate: (availableLanguages: Language[], defaultLanguage: Language) => void;
  onClose: () => void;
}

export default function LanguageSettings({
  availableLanguages,
  defaultLanguage,
  onUpdate,
  onClose,
}: LanguageSettingsProps) {
  const [selected, setSelected] = useState<Language[]>(availableLanguages);
  const [defaultLang, setDefaultLang] = useState<Language>(defaultLanguage);
  const [copyFrom, setCopyFrom] = useState<Language | "">("");
  const [copyTo, setCopyTo] = useState<Language | "">("");
  const [saving, setSaving] = useState(false);

  const toggleLanguage = (lang: Language) => {
    if (selected.includes(lang)) {
      // Can't remove the default language
      if (lang === defaultLang) return;
      setSelected(selected.filter((l) => l !== lang));
    } else {
      setSelected([...selected, lang]);
    }
  };

  const handleSetDefault = (lang: Language) => {
    if (!selected.includes(lang)) {
      setSelected([...selected, lang]);
    }
    setDefaultLang(lang);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(selected, defaultLang);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCopyContent = () => {
    if (copyFrom && copyTo && copyFrom !== copyTo) {
      // This would trigger a content copy action
      // For now, we'll just show an alert - the actual implementation
      // would need to recursively copy all localized content
      alert(`Copy content from ${LANGUAGE_NAMES[copyFrom]} to ${LANGUAGE_NAMES[copyTo]}.\n\nThis feature will copy all text content from one language to another. You can then edit the copied content.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Language Settings</h2>
            <p className="text-sm text-gray-500">Configure available languages for your event page</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Available Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Languages
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${
                    selected.includes(lang)
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${lang === defaultLang ? "ring-2 ring-rose-300" : ""}`}
                >
                  <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">{LANGUAGE_NAMES[lang]}</p>
                    {lang === defaultLang && (
                      <p className="text-xs text-rose-600">Default</p>
                    )}
                  </div>
                  {selected.includes(lang) && (
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click to enable/disable languages. The default language cannot be disabled.
            </p>
          </div>

          {/* Default Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Language
            </label>
            <select
              value={defaultLang}
              onChange={(e) => handleSetDefault(e.target.value as Language)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {selected.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This language will be used when a visitor&apos;s preferred language is not available.
            </p>
          </div>

          {/* Copy Content */}
          {selected.length > 1 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy Content Between Languages
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={copyFrom}
                  onChange={(e) => setCopyFrom(e.target.value as Language)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">From...</option>
                  {selected.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                    </option>
                  ))}
                </select>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <select
                  value={copyTo}
                  onChange={(e) => setCopyTo(e.target.value as Language)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">To...</option>
                  {selected.filter((l) => l !== copyFrom).map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCopyContent}
                  disabled={!copyFrom || !copyTo}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Copy all text content from one language to another. Useful for starting translations.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg font-medium transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
