"use client";

import { FieldType, isMandatoryField } from "@/lib/field-types";

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  order: number;
  options?: { value: string; label: string }[] | null;
  isDefault?: boolean;
  isMandatory?: boolean;
}

interface FormPreviewProps {
  fields: FormField[];
  eventTitle: string;
}

export default function FormPreview({ fields, eventTitle }: FormPreviewProps) {
  return (
    <div className="bg-gray-100 h-full overflow-auto">
      <div className="max-w-xl mx-auto p-6">
        {/* Event header */}
        <div className="bg-rose-500 rounded-t-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{eventTitle}</h1>
          <p className="text-rose-100">Registration Form</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                {(field.isMandatory || isMandatoryField(field.name)) && (
                  <span className="ml-2 text-xs text-amber-600">(mandatory)</span>
                )}
              </label>

              {renderFieldInput(field)}

              {field.helpText && (
                <p className="text-xs text-gray-500">{field.helpText}</p>
              )}
            </div>
          ))}

          <button
            type="button"
            className="w-full mt-6 px-6 py-3 bg-rose-500 text-white font-medium rounded-lg opacity-50 cursor-not-allowed"
            disabled
          >
            Submit Registration
          </button>

          <p className="text-center text-xs text-gray-500">
            This is a preview. Form is not functional.
          </p>
        </div>
      </div>
    </div>
  );
}

function renderFieldInput(field: FormField) {
  const baseInputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500";

  switch (field.fieldType) {
    case "TEXT":
    case "EMAIL":
    case "TEL":
    case "URL":
      return (
        <input
          type="text"
          placeholder={field.placeholder || ""}
          disabled
          className={baseInputClass}
        />
      );

    case "NUMBER":
      return (
        <input
          type="number"
          placeholder={field.placeholder || ""}
          disabled
          className={baseInputClass}
        />
      );

    case "DATE":
      return (
        <input
          type="date"
          disabled
          className={baseInputClass}
        />
      );

    case "DATETIME":
      return (
        <input
          type="datetime-local"
          disabled
          className={baseInputClass}
        />
      );

    case "SELECT":
      return (
        <select disabled className={baseInputClass}>
          <option value="">{field.placeholder || "Select an option..."}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "RADIO":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-gray-600"
            >
              <input
                type="radio"
                name={field.name}
                disabled
                className="w-4 h-4 text-rose-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );

    case "CHECKBOX":
      return (
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            disabled
            className="w-4 h-4 text-rose-500 rounded"
          />
          {field.placeholder || "Yes"}
        </label>
      );

    case "TEXTAREA":
      return (
        <textarea
          placeholder={field.placeholder || ""}
          disabled
          rows={3}
          className={baseInputClass}
        />
      );

    case "FILE":
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm">Click to upload or drag and drop</p>
        </div>
      );

    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder || ""}
          disabled
          className={baseInputClass}
        />
      );
  }
}
