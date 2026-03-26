"use client";

import { useState } from "react";
import { FieldType, FIELD_TYPES, FieldValidation, ConditionalRule, isMandatoryField } from "@/lib/field-types";
import OptionsEditor from "./OptionsEditor";
import ValidationEditor from "./ValidationEditor";

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
  validation?: FieldValidation | null;
  conditionalOn?: ConditionalRule | null;
  isDefault?: boolean;
  isMandatory?: boolean;
}

interface FieldEditorPanelProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

type Tab = "basic" | "validation" | "conditional";

export default function FieldEditorPanel({
  field,
  allFields,
  onUpdate,
  onClose,
}: FieldEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const isMandatory = field.isMandatory || isMandatoryField(field.name);
  const fieldTypeInfo = FIELD_TYPES.find((t) => t.type === field.fieldType);

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: "Basic" },
    { id: "validation", label: "Validation" },
    { id: "conditional", label: "Conditional" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit {field.label}
            </h2>
            {isMandatory && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mandatory
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {fieldTypeInfo?.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isMandatory && activeTab === "basic" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  This field is mandatory
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Mandatory fields feed the centralized dancer database and cannot be deleted or made optional.
                  You can only customize the label and help text.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "basic" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value || null })}
                placeholder="Enter placeholder text..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help Text
              </label>
              <input
                type="text"
                value={field.helpText || ""}
                onChange={(e) => onUpdate({ helpText: e.target.value || null })}
                placeholder="Additional help text shown below the field..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={field.isRequired}
                onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                disabled={isMandatory}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500 disabled:opacity-50"
              />
              <label htmlFor="required" className="text-sm font-medium text-gray-700">
                Required field
                {isMandatory && (
                  <span className="text-gray-500 ml-1">(always required)</span>
                )}
              </label>
            </div>

            {fieldTypeInfo?.hasOptions && (
              <OptionsEditor
                options={field.options || []}
                onChange={(options) => onUpdate({ options })}
                disabled={isMandatory}
              />
            )}
          </div>
        )}

        {activeTab === "validation" && (
          <ValidationEditor
            fieldType={field.fieldType}
            validation={field.validation || {}}
            onChange={(validation) => onUpdate({ validation })}
          />
        )}

        {activeTab === "conditional" && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Conditional Display</h3>
              <p className="text-sm text-gray-600 mb-4">
                Show this field only when another field has a specific value.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show when
                  </label>
                  <select
                    value={field.conditionalOn?.fieldName || ""}
                    onChange={(e) =>
                      onUpdate({
                        conditionalOn: e.target.value
                          ? {
                              fieldName: e.target.value,
                              operator: field.conditionalOn?.operator || "notEmpty",
                              value: field.conditionalOn?.value,
                            }
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Always show (no condition)</option>
                    {allFields
                      .filter((f) => f.id !== field.id)
                      .map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.label}
                        </option>
                      ))}
                  </select>
                </div>

                {field.conditionalOn?.fieldName && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <select
                        value={field.conditionalOn.operator || "notEmpty"}
                        onChange={(e) =>
                          onUpdate({
                            conditionalOn: {
                              ...field.conditionalOn!,
                              operator: e.target.value as ConditionalRule["operator"],
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="notEmpty">Is not empty</option>
                        <option value="equals">Equals</option>
                        <option value="notEquals">Does not equal</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>

                    {field.conditionalOn.operator !== "notEmpty" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Value
                        </label>
                        <input
                          type="text"
                          value={String(field.conditionalOn.value || "")}
                          onChange={(e) =>
                            onUpdate({
                              conditionalOn: {
                                ...field.conditionalOn!,
                                value: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
