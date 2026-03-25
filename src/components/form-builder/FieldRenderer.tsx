"use client";

import { FieldType, EventFormField, ConditionalRule } from "@/lib/field-types";

interface FieldRendererProps {
  field: EventFormField;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: string | null;
  formValues?: Record<string, string | boolean>; // For conditional logic
}

function shouldShowField(
  conditionalOn: ConditionalRule | null,
  formValues?: Record<string, string | boolean>
): boolean {
  if (!conditionalOn || !formValues) return true;

  const dependentValue = formValues[conditionalOn.fieldName];
  const operator = conditionalOn.operator || 'equals';

  switch (operator) {
    case 'equals':
      return dependentValue === conditionalOn.value;
    case 'notEquals':
      return dependentValue !== conditionalOn.value;
    case 'contains':
      return typeof dependentValue === 'string' &&
             typeof conditionalOn.value === 'string' &&
             dependentValue.includes(conditionalOn.value);
    case 'notEmpty':
      return dependentValue !== '' && dependentValue !== false && dependentValue !== undefined;
    default:
      return true;
  }
}

export default function FieldRenderer({
  field,
  value,
  onChange,
  error,
  formValues,
}: FieldRendererProps) {
  // Check conditional visibility
  if (!shouldShowField(field.conditionalOn, formValues)) {
    return null;
  }

  const inputClasses = `w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
    error ? "border-red-500" : "border-gray-200"
  }`;

  const renderField = () => {
    switch (field.fieldType) {
      case "TEXT":
      case "EMAIL":
      case "TEL":
      case "URL":
        return (
          <input
            type={field.fieldType.toLowerCase()}
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            className={inputClasses}
          />
        );

      case "NUMBER":
        return (
          <input
            type="number"
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputClasses}
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            min={field.validation?.minDate}
            max={field.validation?.maxDate}
            className={inputClasses}
          />
        );

      case "DATETIME":
        return (
          <input
            type="datetime-local"
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            className={inputClasses}
          />
        );

      case "SELECT":
        return (
          <select
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            className={inputClasses}
          >
            <option value="">{field.placeholder || "Select an option..."}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition ${
                  value === option.value
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.isRequired}
                  className="sr-only"
                />
                <span
                  className={`font-medium ${
                    value === option.value ? "text-rose-600" : "text-gray-900"
                  }`}
                >
                  {option.label}
                </span>
                {value === option.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              required={field.isRequired}
              className="w-5 h-5 mt-0.5 text-rose-500 bg-white border-gray-300 rounded focus:ring-rose-500"
            />
            <span className="text-gray-600 text-sm">
              {field.label}
              {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
            </span>
          </label>
        );

      case "TEXTAREA":
        return (
          <textarea
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            required={field.isRequired}
            rows={4}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            className={`${inputClasses} resize-none`}
          />
        );

      case "FILE":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-rose-500 transition cursor-pointer">
            <input
              type="file"
              name={field.name}
              onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
              required={field.isRequired}
              accept={field.validation?.acceptedFileTypes?.join(",")}
              className="hidden"
              id={`file-${field.id}`}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-500 text-sm">
                {value ? (value as string) : "Click to upload or drag and drop"}
              </p>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Checkbox has its own label rendering
  if (field.fieldType === "CHECKBOX") {
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        {renderField()}
        {field.helpText && (
          <p className="text-gray-500 text-sm mt-2 ml-8">{field.helpText}</p>
        )}
        {error && <p className="text-red-500 text-sm mt-2 ml-8">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.helpText && (
        <p className="text-gray-500 text-sm mt-1">{field.helpText}</p>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
