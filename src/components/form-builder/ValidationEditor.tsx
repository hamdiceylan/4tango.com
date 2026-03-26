"use client";

import { FieldType, FieldValidation } from "@/lib/field-types";

interface ValidationEditorProps {
  fieldType: FieldType;
  validation: FieldValidation;
  onChange: (validation: FieldValidation) => void;
}

export default function ValidationEditor({
  fieldType,
  validation,
  onChange,
}: ValidationEditorProps) {
  function updateValidation(updates: Partial<FieldValidation>) {
    onChange({ ...validation, ...updates });
  }

  // Show relevant validation options based on field type
  const showStringValidation = ["TEXT", "TEXTAREA", "EMAIL", "URL", "TEL"].includes(fieldType);
  const showNumberValidation = fieldType === "NUMBER";
  const showDateValidation = ["DATE", "DATETIME"].includes(fieldType);
  const showFileValidation = fieldType === "FILE";
  const showPatternValidation = ["TEXT", "TEL"].includes(fieldType);

  return (
    <div className="space-y-6 max-w-xl">
      {showStringValidation && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">String Length</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum characters
              </label>
              <input
                type="number"
                min={0}
                value={validation.minLength || ""}
                onChange={(e) =>
                  updateValidation({
                    minLength: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum characters
              </label>
              <input
                type="number"
                min={0}
                value={validation.maxLength || ""}
                onChange={(e) =>
                  updateValidation({
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {showNumberValidation && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Number Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum value
              </label>
              <input
                type="number"
                value={validation.min ?? ""}
                onChange={(e) =>
                  updateValidation({
                    min: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No minimum"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum value
              </label>
              <input
                type="number"
                value={validation.max ?? ""}
                onChange={(e) =>
                  updateValidation({
                    max: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="No maximum"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {showDateValidation && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Date Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Earliest date
              </label>
              <input
                type="date"
                value={validation.minDate || ""}
                onChange={(e) =>
                  updateValidation({
                    minDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latest date
              </label>
              <input
                type="date"
                value={validation.maxDate || ""}
                onChange={(e) =>
                  updateValidation({
                    maxDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {showFileValidation && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">File Restrictions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accepted file types
              </label>
              <input
                type="text"
                value={validation.acceptedFileTypes?.join(", ") || ""}
                onChange={(e) =>
                  updateValidation({
                    acceptedFileTypes: e.target.value
                      ? e.target.value.split(",").map((s) => s.trim())
                      : undefined,
                  })
                }
                placeholder="e.g., image/png, image/jpeg, application/pdf"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated MIME types
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum file size (MB)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={validation.maxFileSize ? validation.maxFileSize / 1048576 : ""}
                onChange={(e) =>
                  updateValidation({
                    maxFileSize: e.target.value
                      ? parseFloat(e.target.value) * 1048576
                      : undefined,
                  })
                }
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {showPatternValidation && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Pattern Validation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular expression pattern
              </label>
              <input
                type="text"
                value={validation.pattern || ""}
                onChange={(e) =>
                  updateValidation({
                    pattern: e.target.value || undefined,
                  })
                }
                placeholder="e.g., ^[A-Za-z]+$"
                className="w-full px-3 py-2 font-mono text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error message
              </label>
              <input
                type="text"
                value={validation.patternMessage || ""}
                onChange={(e) =>
                  updateValidation({
                    patternMessage: e.target.value || undefined,
                  })
                }
                placeholder="Custom error message for invalid format"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {!showStringValidation &&
        !showNumberValidation &&
        !showDateValidation &&
        !showFileValidation &&
        !showPatternValidation && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-500">
              No additional validation options available for this field type.
            </p>
          </div>
        )}
    </div>
  );
}
