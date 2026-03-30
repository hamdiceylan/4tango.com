"use client";

import { useState } from "react";
import { AccommodationContent } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE, LANGUAGE_FLAGS } from "@/lib/i18n";
import { SectionBackground } from "@/lib/colors";
import RichTextEditor from "../common/RichTextEditor";
import ImageUploader from "../common/ImageUploader";
import SectionStylePicker from "./SectionStylePicker";

interface AccommodationEditorProps {
  content: AccommodationContent;
  onChange: (content: AccommodationContent) => void;
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

export default function AccommodationEditor({
  content,
  onChange,
  availableLanguages = [DEFAULT_LANGUAGE],
}: AccommodationEditorProps) {
  // Ensure we have at least one language
  const langs = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  const multiLang = langs.length > 1;
  const [editLang, setEditLang] = useState<Language>(langs[0]);

  // Ensure arrays exist
  const features = content?.features || [];
  const images = content?.images || [];

  const updateFeature = (index: number, value: string) => {
    const newFeatures = features.map((f, i) => (i === index ? value : f));
    onChange({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onChange({ ...content, features: [...features, ""] });
  };

  const removeFeature = (index: number) => {
    onChange({ ...content, features: features.filter((_, i) => i !== index) });
  };

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

  return (
    <div className="space-y-6">
      {/* Section Background */}
      <SectionStylePicker
        value={content?.background || "light"}
        onChange={(bg: SectionBackground) => onChange({ ...content, background: bg })}
      />

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

      {/* Title - Localized */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hotel/Venue Name
          {multiLang && (
            <span className="ml-1 text-blue-500 text-xs">({LANGUAGE_FLAGS[editLang]})</span>
          )}
        </label>
        <input
          type="text"
          value={getLocalizedValue(content?.title, editLang)}
          onChange={(e) =>
            onChange({
              ...content,
              title: setLocalizedValue(content?.title, e.target.value, editLang, multiLang) as string,
            })
          }
          placeholder="Hotel Arts Barcelona"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Description - Localized */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
          {multiLang && (
            <span className="ml-1 text-blue-500 text-xs">({LANGUAGE_FLAGS[editLang]})</span>
          )}
        </label>
        <RichTextEditor
          value={getLocalizedValue(content?.description, editLang)}
          onChange={(value) =>
            onChange({
              ...content,
              description: setLocalizedValue(content?.description, value, editLang, multiLang) as string,
            })
          }
          placeholder="Describe the accommodation..."
          rows={4}
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Images</label>
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
          <p className="text-sm text-gray-500">Add images of the accommodation.</p>
        )}
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Features</label>
          <button
            type="button"
            onClick={addFeature}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature || ""}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="e.g., Free WiFi, Pool, Breakfast included"
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={content?.address || ""}
          onChange={(e) => onChange({ ...content, address: e.target.value })}
          placeholder="123 Main Street, Barcelona, Spain"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Map URL</label>
          <input
            type="url"
            value={content?.mapUrl || ""}
            onChange={(e) => onChange({ ...content, mapUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Booking URL</label>
          <input
            type="url"
            value={content?.bookingUrl || ""}
            onChange={(e) => onChange({ ...content, bookingUrl: e.target.value })}
            placeholder="https://booking.com/..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
    </div>
  );
}
