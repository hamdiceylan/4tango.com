"use client";

import { SECTION_BACKGROUNDS, SectionBackground } from "@/lib/colors";

interface SectionStylePickerProps {
  value: SectionBackground;
  onChange: (value: SectionBackground) => void;
}

export default function SectionStylePicker({ value, onChange }: SectionStylePickerProps) {
  const selectedBg = SECTION_BACKGROUNDS.find((bg) => bg.value === value) || SECTION_BACKGROUNDS[0];

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      <div
        className={`w-6 h-6 rounded border border-gray-300 flex-shrink-0 ${
          value === "light" ? "bg-white" :
          value === "light-alt" ? "bg-gray-200" :
          value === "dark" ? "bg-gray-900" :
          value === "primary" ? "bg-rose-500" :
          "bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900"
        }`}
      />
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-0.5">Background</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SectionBackground)}
          className="w-full text-sm font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
        >
          {SECTION_BACKGROUNDS.map((bg) => (
            <option key={bg.value} value={bg.value}>
              {bg.label} - {bg.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
