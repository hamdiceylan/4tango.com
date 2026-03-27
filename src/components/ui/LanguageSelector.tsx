"use client";

import Link from "next/link";
import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLang: Language;
  availableLanguages: Language[];
  slug: string;
  variant?: "flags" | "dropdown";
  className?: string;
}

export default function LanguageSelector({
  currentLang,
  availableLanguages,
  slug,
  variant = "flags",
  className = "",
}: LanguageSelectorProps) {
  if (availableLanguages.length <= 1) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLang}
          onChange={(e) => {
            window.location.href = `/${e.target.value}/${slug}`;
          }}
          className="appearance-none bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 pr-8 rounded-lg text-sm font-medium cursor-pointer border border-white/20 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang} className="text-gray-900">
              {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  // Default: flags variant
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {availableLanguages.map((lang) => (
        <Link
          key={lang}
          href={`/${lang}/${slug}`}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-lg transition ${
            lang === currentLang
              ? "bg-white/20 ring-2 ring-white/40"
              : "hover:bg-white/10"
          }`}
          title={LANGUAGE_NAMES[lang]}
        >
          {LANGUAGE_FLAGS[lang]}
        </Link>
      ))}
    </div>
  );
}
