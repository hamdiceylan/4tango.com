"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLang: Language;
  availableLanguages: Language[];
  slug: string;
  variant?: "flags" | "dropdown" | "compact";
  className?: string;
}

export default function LanguageSelector({
  currentLang,
  availableLanguages,
  slug,
  variant = "flags",
  className = "",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (availableLanguages.length <= 1) {
    return null;
  }

  // Compact: flag-only dropdown
  if (variant === "compact") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-lg bg-white/10 hover:bg-white/20 transition border border-white/20"
          title={LANGUAGE_NAMES[currentLang]}
        >
          <span>{LANGUAGE_FLAGS[currentLang]}</span>
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
            {availableLanguages.map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/${slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 transition ${
                  lang === currentLang ? "bg-gray-50 font-medium" : ""
                }`}
              >
                <span className="text-lg">{LANGUAGE_FLAGS[lang]}</span>
                <span className="text-gray-700">{LANGUAGE_NAMES[lang]}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
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
