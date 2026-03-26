"use client";

import { HeroContent } from "@/lib/section-types";
import ImageUploader from "../common/ImageUploader";

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

export default function HeroEditor({ content, onChange }: HeroEditorProps) {
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
          value={content.backgroundImage}
          onChange={(url) => updateContent({ backgroundImage: url })}
          category="event"
          aspectRatio="video"
          placeholder="Upload a hero background image"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="Your event title"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={content.subtitle || ""}
          onChange={(e) => updateContent({ subtitle: e.target.value })}
          placeholder="A tagline or date for your event"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
        />
      </div>

      {/* CTA Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Text
        </label>
        <input
          type="text"
          value={content.ctaText || ""}
          onChange={(e) => updateContent({ ctaText: e.target.value })}
          placeholder="Register Now"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
        />
      </div>

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
                content.overlay === style
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
