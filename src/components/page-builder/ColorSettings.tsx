"use client";

import { useState } from "react";
import { DEFAULT_COLORS, COLOR_TEMPLATES, isValidHexColor, getContrastingTextColor } from "@/lib/colors";

interface ColorSettingsProps {
  primaryColor: string;
  secondaryColor: string;
  darkColor: string;
  onUpdate: (colors: { primaryColor: string; secondaryColor: string; darkColor: string }) => Promise<void>;
  onClose: () => void;
}

interface ColorPickerProps {
  label: string;
  description: string;
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, description, value, defaultValue, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const isDefault = value.toLowerCase() === defaultValue.toLowerCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (isValidHexColor(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="relative">
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={handleColorPickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#000000"
            className={`w-24 px-2 py-1 text-sm font-mono border rounded ${
              isValidHexColor(inputValue) ? "border-gray-200" : "border-red-300"
            } focus:outline-none focus:ring-2 focus:ring-rose-500`}
          />
          {isDefault && (
            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">Default</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ColorSettings({
  primaryColor,
  secondaryColor,
  darkColor,
  onUpdate,
  onClose,
}: ColorSettingsProps) {
  const [colors, setColors] = useState({
    primaryColor,
    secondaryColor,
    darkColor,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(colors);
      onClose();
    } catch (error) {
      console.error("Error saving colors:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors({
      primaryColor: DEFAULT_COLORS.primary,
      secondaryColor: DEFAULT_COLORS.secondary,
      darkColor: DEFAULT_COLORS.dark,
    });
  };

  const hasChanges =
    colors.primaryColor !== primaryColor ||
    colors.secondaryColor !== secondaryColor ||
    colors.darkColor !== darkColor;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Theme Colors</h2>
            <p className="text-sm text-gray-500">Customize your event page colors</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Color Templates */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Templates</p>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => setColors({
                  primaryColor: template.colors.primary,
                  secondaryColor: template.colors.secondary,
                  darkColor: template.colors.dark,
                })}
                className="group relative flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-gray-400 transition"
                title={template.name}
              >
                <div className="flex gap-0.5 mb-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: template.colors.dark }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 truncate w-full text-center">
                  {template.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="p-4 space-y-4">
          <ColorPicker
            label="Primary Color"
            description="Buttons, links, active tabs, CTA elements"
            value={colors.primaryColor}
            defaultValue={DEFAULT_COLORS.primary}
            onChange={(value) => setColors({ ...colors, primaryColor: value })}
          />

          <ColorPicker
            label="Secondary Color"
            description="DJ Team & Photographers accents, decorative elements"
            value={colors.secondaryColor}
            defaultValue={DEFAULT_COLORS.secondary}
            onChange={(value) => setColors({ ...colors, secondaryColor: value })}
          />

          <ColorPicker
            label="Dark Background"
            description="DJ Team, Photographers, and Footer backgrounds"
            value={colors.darkColor}
            defaultValue={DEFAULT_COLORS.dark}
            onChange={(value) => setColors({ ...colors, darkColor: value })}
          />
        </div>

        {/* Preview */}
        <div className="px-4 pb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
          <div
            className="rounded-lg p-4 flex items-center justify-between"
            style={{ backgroundColor: colors.darkColor }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: colors.secondaryColor }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: colors.darkColor,
                    color: colors.secondaryColor,
                  }}
                >
                  DJ
                </div>
              </div>
              <span
                className="text-sm"
                style={{ color: colors.secondaryColor }}
              >
                Sample DJ Name
              </span>
            </div>
            <button
              className="px-4 py-2 rounded text-sm font-medium"
              style={{
                backgroundColor: colors.primaryColor,
                color: getContrastingTextColor(colors.primaryColor),
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                hasChanges
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save Colors"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
