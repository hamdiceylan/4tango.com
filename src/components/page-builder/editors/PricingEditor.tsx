"use client";

import { useState } from "react";
import { PricingContent } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE, LANGUAGE_FLAGS } from "@/lib/i18n";
import RichTextEditor from "../common/RichTextEditor";

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
  availableLanguages?: Language[];
}

// Helper to get localized string value
function getLocalizedValue(
  value: string | Record<string, string> | undefined,
  lang: Language
): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return value[lang] || value["en"] || Object.values(value)[0] || "";
}

// Helper to set localized string value
function setLocalizedValue(
  currentValue: string | Record<string, string> | undefined,
  newText: string,
  lang: Language,
  multiLang: boolean
): string | Record<string, string> {
  if (!multiLang) {
    return newText;
  }
  if (typeof currentValue === "string") {
    return { en: currentValue, [lang]: newText };
  }
  const current = currentValue || {};
  return { ...current, [lang]: newText };
}

export default function PricingEditor({
  content,
  onChange,
  availableLanguages = [DEFAULT_LANGUAGE],
}: PricingEditorProps) {
  // Ensure we have at least one language
  const langs = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  const multiLang = langs.length > 1;
  const [editLang, setEditLang] = useState<Language>(langs[0]);

  return (
    <div className="space-y-6">
      {/* Language Tabs - only show if multiple languages */}
      {multiLang && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-medium text-blue-800">Editing language:</span>
          </div>
          <div className="flex items-center gap-1">
            {langs.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setEditLang(lang)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition ${
                  lang === editLang
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-blue-100"
                }`}
              >
                <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show Packages Toggle */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="showPackages"
          checked={content?.showPackages || false}
          onChange={(e) => onChange({ ...content, showPackages: e.target.checked })}
          className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
        />
        <div>
          <label htmlFor="showPackages" className="text-sm font-medium text-gray-700">
            Show pricing packages
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Display the packages you have created in the Packages section
          </p>
        </div>
      </div>

      {/* Custom Content - Localized */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Information
          {multiLang && (
            <span className="ml-1 text-blue-500 text-xs">({LANGUAGE_FLAGS[editLang]})</span>
          )}
        </label>
        <RichTextEditor
          value={getLocalizedValue(content?.customContent, editLang)}
          onChange={(value) =>
            onChange({
              ...content,
              customContent: setLocalizedValue(content?.customContent, value, editLang, multiLang) as string,
            })
          }
          placeholder="Add any extra pricing details, early bird info, or payment terms..."
          rows={6}
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Manage packages separately</p>
            <p className="text-sm text-blue-600 mt-1">
              To add or edit pricing packages, go to the event settings and manage packages there.
              They will automatically display in this section when enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
