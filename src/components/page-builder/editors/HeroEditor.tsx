"use client";

import { useState } from "react";
import { HeroContent } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE } from "@/lib/i18n";
import ImageUploader from "../common/ImageUploader";
import { LocalizedInput } from "../LanguageTabs";

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
  availableLanguages?: Language[];
}

export default function HeroEditor({ content, onChange, availableLanguages = [DEFAULT_LANGUAGE] }: HeroEditorProps) {
  // Ensure we have at least one language
  const langs = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  const [editLang, setEditLang] = useState<Language>(langs[0]);

  const updateContent = (updates: Partial<HeroContent>) => {
    onChange({ ...content, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Image
        </label>
        <ImageUploader
          value={content?.backgroundImage}
          onChange={(url) => updateContent({ backgroundImage: url })}
          category="event"
          aspectRatio="video"
          placeholder="Upload a hero background image"
        />
      </div>

      {/* Title - Localized */}
      <LocalizedInput
        label="Title"
        languages={langs}
        currentLang={editLang}
        onLangChange={setEditLang}
        value={content?.title}
        onChange={(title) => updateContent({ title: title as unknown as string })}
        placeholder="Your event title"
      />

      {/* Subtitle - Localized */}
      <LocalizedInput
        label="Subtitle"
        languages={langs}
        currentLang={editLang}
        onLangChange={setEditLang}
        value={content?.subtitle}
        onChange={(subtitle) => updateContent({ subtitle: subtitle as unknown as string })}
        placeholder="A tagline or date for your event"
      />

      {/* CTA Text - Localized */}
      <LocalizedInput
        label="Button Text"
        languages={langs}
        currentLang={editLang}
        onLangChange={setEditLang}
        value={content?.ctaText}
        onChange={(ctaText) => updateContent({ ctaText: ctaText as unknown as string })}
        placeholder="Register Now"
      />

      {/* Overlay */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overlay Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["dark", "light", "none"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => updateContent({ overlay: style })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                content?.overlay === style
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Add a dark or light overlay to improve text readability
        </p>
      </div>
    </div>
  );
}
