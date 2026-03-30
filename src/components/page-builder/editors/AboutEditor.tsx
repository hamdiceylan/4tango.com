"use client";

import { useState } from "react";
import { AboutContent } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE, LANGUAGE_FLAGS } from "@/lib/i18n";
import { SectionBackground } from "@/lib/colors";
import RichTextEditor from "../common/RichTextEditor";
import ImageUploader from "../common/ImageUploader";
import SectionStylePicker from "./SectionStylePicker";

interface AboutEditorProps {
  content: AboutContent;
  onChange: (content: AboutContent) => void;
  availableLanguages?: Language[];
}

// Helper to get localized string value
function getLocalizedValue(
  value: string | Record<string, string> | undefined,
  lang: Language
): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  // It's an object with language keys
  return value[lang] || value["en"] || Object.values(value)[0] || "";
}

// Helper to set localized string value
function setLocalizedValue(
  currentValue: string | Record<string, string> | undefined,
  newText: string,
  lang: Language
): Record<string, string> {
  if (typeof currentValue === "string") {
    // Convert plain string to localized object
    return { en: currentValue, [lang]: newText };
  }
  const current = currentValue || {};
  return { ...current, [lang]: newText };
}

// Helper to check if value has translation for a language
function hasTranslation(value: string | Record<string, string> | undefined, lang: Language): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") {
    return lang === "en" && Boolean(value);
  }
  return Boolean(value[lang]);
}

export default function AboutEditor({ content, onChange, availableLanguages = [DEFAULT_LANGUAGE] }: AboutEditorProps) {
  // Ensure we have at least one language
  const langs = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  const [editLang, setEditLang] = useState<Language>(langs[0]);

  // Ensure images array exists
  const images = content?.images || [];

  const addImage = () => {
    onChange({ ...content, images: [...images, ""] });
  };

  const updateImage = (index: number, url: string) => {
    const newImages = images.map((img, i) => (i === index ? url : img));
    onChange({ ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({ ...content, images: images.filter((_, i) => i !== index) });
  };

  // Get current content value for selected language
  const getCurrentContent = (): string => {
    return getLocalizedValue(content?.content, editLang);
  };

  const updateLocalizedContent = (newText: string) => {
    if (langs.length > 1) {
      // Multi-language mode - save as localized object
      const newContent = setLocalizedValue(content?.content, newText, editLang);
      onChange({
        ...content,
        content: newContent as unknown as string,
      });
    } else {
      // Single language mode - save as plain string
      onChange({
        ...content,
        content: newText,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Background */}
      <SectionStylePicker
        value={content?.background || "light"}
        onChange={(bg: SectionBackground) => onChange({ ...content, background: bg })}
      />

      {/* Content - Localized */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>

        {/* Language tabs - only show if multiple languages */}
        {langs.length > 1 && (
          <div className="flex items-center gap-1 mb-2">
            {langs.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setEditLang(lang)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition ${
                  lang === editLang
                    ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                {hasTranslation(content?.content, lang) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        <RichTextEditor
          value={getCurrentContent()}
          onChange={updateLocalizedContent}
          placeholder="Tell attendees about your event..."
          rows={8}
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Images (optional)</label>
          <button
            type="button"
            onClick={addImage}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <ImageUploader
                  value={image}
                  onChange={(url) => updateImage(index, url)}
                  category="event"
                  aspectRatio="video"
                  placeholder="Upload image"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Add images to accompany your event description.</p>
        )}
      </div>
    </div>
  );
}
