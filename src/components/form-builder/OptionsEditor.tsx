"use client";

import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface OptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
  disabled?: boolean;
}

export default function OptionsEditor({
  options,
  onChange,
  disabled = false,
}: OptionsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function addOption() {
    const newOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
    };
    onChange([...options, newOption]);
  }

  function updateOption(index: number, field: "value" | "label", newValue: string) {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: newValue,
    };
    // Auto-generate value from label if value is empty
    if (field === "label" && !newOptions[index].value) {
      newOptions[index].value = newValue
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .substring(0, 50);
    }
    onChange(newOptions);
  }

  function removeOption(index: number) {
    if (options.length <= 1) return;
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOptions = [...options];
    const draggedOption = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedOption);

    onChange(newOptions);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Options
      </label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div
            key={index}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            {!disabled && (
              <div className="cursor-grab text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            )}
            <input
              type="text"
              value={option.label}
              onChange={(e) => updateOption(index, "label", e.target.value)}
              placeholder="Option label"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
            />
            <input
              type="text"
              value={option.value}
              onChange={(e) => updateOption(index, "value", e.target.value)}
              placeholder="Value"
              disabled={disabled}
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
            />
            {!disabled && options.length > 1 && (
              <button
                onClick={() => removeOption(index)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <button
          onClick={addOption}
          className="mt-2 text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add option
        </button>
      )}
    </div>
  );
}
