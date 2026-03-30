"use client";

import { useState } from "react";
import { DjTeamContent, TeamMember } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE, LANGUAGE_FLAGS } from "@/lib/i18n";
import { SectionBackground } from "@/lib/colors";
import ImageUploader from "../common/ImageUploader";
import SectionStylePicker from "./SectionStylePicker";

interface DjTeamEditorProps {
  content: DjTeamContent;
  onChange: (content: DjTeamContent) => void;
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

export default function DjTeamEditor({
  content,
  onChange,
  availableLanguages = [DEFAULT_LANGUAGE],
}: DjTeamEditorProps) {
  // Ensure we have at least one language
  const langs = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  const [editLang, setEditLang] = useState<Language>(langs[0]);

  // Ensure members array exists
  const members = content?.members || [];

  const addMember = () => {
    const newMember: TeamMember = {
      name: "",
      photo: "",
      bio: "",
      country: "",
    };
    onChange({ ...content, members: [...members, newMember] });
  };

  const updateMember = (index: number, updates: Partial<TeamMember>) => {
    const newMembers = members.map((member, i) =>
      i === index ? { ...member, ...updates } : member
    );
    onChange({ ...content, members: newMembers });
  };

  const removeMember = (index: number) => {
    onChange({ ...content, members: members.filter((_, i) => i !== index) });
  };

  const moveMember = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= members.length) return;

    const newMembers = [...members];
    [newMembers[index], newMembers[newIndex]] = [newMembers[newIndex], newMembers[index]];
    onChange({ ...content, members: newMembers });
  };

  return (
    <div className="space-y-6">
      {/* Section Background */}
      <SectionStylePicker
        value={content?.background || "dark"}
        onChange={(bg: SectionBackground) => onChange({ ...content, background: bg })}
      />

      {/* Language Tabs - only show if multiple languages */}
      {langs.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-medium text-blue-800">Editing language (for bio):</span>
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

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">DJs</label>
        <button
          type="button"
          onClick={addMember}
          className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add DJ
        </button>
      </div>

      {members.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-gray-500 text-sm">No DJs added yet. Click &quot;Add DJ&quot; to showcase your music team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex gap-4">
                {/* Photo */}
                <div className="w-24 flex-shrink-0">
                  <ImageUploader
                    value={member.photo || ""}
                    onChange={(url) => updateMember(index, { photo: url })}
                    category="team"
                    aspectRatio="square"
                    placeholder="Photo"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={typeof member.name === "string" ? member.name : ""}
                        onChange={(e) => updateMember(index, { name: e.target.value })}
                        placeholder="DJ Name"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                      <input
                        type="text"
                        value={member.country || ""}
                        onChange={(e) => updateMember(index, { country: e.target.value })}
                        placeholder="Argentina"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Bio
                      {langs.length > 1 && (
                        <span className="ml-1 text-blue-500">({LANGUAGE_FLAGS[editLang]})</span>
                      )}
                    </label>
                    <textarea
                      value={getLocalizedValue(member.bio, editLang)}
                      onChange={(e) =>
                        updateMember(index, {
                          bio: langs.length > 1
                            ? setLocalizedValue(member.bio, e.target.value, editLang) as unknown as string
                            : e.target.value,
                        })
                      }
                      placeholder="Short bio..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveMember(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMember(index, "down")}
                    disabled={index === members.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
