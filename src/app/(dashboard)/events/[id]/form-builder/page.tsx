"use client";

import Link from "next/link";
import { useState } from "react";
import { FIELD_TYPES, FieldType, FieldTypeInfo, generateFieldName } from "@/lib/field-types";

// Mock event data
const mockEvent = {
  id: "1",
  title: "Spring Tango Marathon",
  slug: "spring-tango-marathon-2026",
};

// Default fields that are always present
const defaultFields = [
  { id: "default_1", name: "firstName", label: "First Name", fieldType: "TEXT" as FieldType, isRequired: true, isDefault: true },
  { id: "default_2", name: "lastName", label: "Last Name", fieldType: "TEXT" as FieldType, isRequired: true, isDefault: true },
  { id: "default_3", name: "email", label: "Email", fieldType: "EMAIL" as FieldType, isRequired: true, isDefault: true },
  { id: "default_4", name: "role", label: "Dance Role", fieldType: "RADIO" as FieldType, isRequired: true, isDefault: true },
];

// Mock custom fields
const mockCustomFields = [
  {
    id: "f1",
    name: "experience",
    label: "Experience Level",
    fieldType: "SELECT" as FieldType,
    placeholder: "Select your level",
    helpText: null,
    isRequired: true,
    order: 0,
    options: [
      { value: "beginner", label: "Beginner (0-2 years)" },
      { value: "intermediate", label: "Intermediate (2-5 years)" },
      { value: "advanced", label: "Advanced (5+ years)" },
    ],
  },
  {
    id: "f2",
    name: "check_in_date",
    label: "Check-in Date",
    fieldType: "DATE" as FieldType,
    placeholder: null,
    helpText: "When will you arrive at the hotel?",
    isRequired: false,
    order: 1,
    options: null,
  },
  {
    id: "f3",
    name: "airport_transfer",
    label: "Airport Transfer",
    fieldType: "CHECKBOX" as FieldType,
    placeholder: null,
    helpText: "Do you need airport transfer? (+30 EUR)",
    isRequired: false,
    order: 2,
    options: null,
  },
];

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
}

export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const [customFields, setCustomFields] = useState<FormField[]>(mockCustomFields);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  void params;

  const event = mockEvent;
  const allFields = [...defaultFields, ...customFields];

  const handleDragStart = (index: number) => {
    // Only allow dragging custom fields (offset by default fields count)
    const customIndex = index - defaultFields.length;
    if (customIndex >= 0) {
      setDraggedIndex(customIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const customIndex = index - defaultFields.length;
    if (draggedIndex === null || customIndex < 0 || draggedIndex === customIndex) return;

    const newFields = [...customFields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(customIndex, 0, draggedField);

    // Update order values
    newFields.forEach((field, i) => {
      field.order = i;
    });

    setCustomFields(newFields);
    setDraggedIndex(customIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddField = (typeInfo: FieldTypeInfo) => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      name: generateFieldName(`new_${typeInfo.name.toLowerCase()}`),
      label: typeInfo.name,
      fieldType: typeInfo.type,
      placeholder: typeInfo.defaultPlaceholder,
      helpText: null,
      isRequired: false,
      order: customFields.length,
      options: typeInfo.hasOptions ? [{ value: "option_1", label: "Option 1" }] : null,
    };

    setCustomFields([...customFields, newField]);
    setShowAddPanel(false);
    setSelectedField(newField);
  };

  const handleDeleteField = (fieldId: string) => {
    setCustomFields(customFields.filter((f) => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleUpdateField = (updatedField: FormField) => {
    setCustomFields(customFields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    setSelectedField(updatedField);
  };

  const getFieldIcon = (type: FieldType): string => {
    const icons: Record<FieldType, string> = {
      TEXT: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      EMAIL: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      TEL: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      NUMBER: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
      DATE: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      DATETIME: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      SELECT: "M8 9l4-4 4 4m0 6l-4 4-4-4",
      RADIO: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      CHECKBOX: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      TEXTAREA: "M4 6h16M4 12h16M4 18h7",
      URL: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      FILE: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
    };
    return icons[type];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Field List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href={`/events/${event.id}`} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Event
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500 text-sm">{event.title}</p>
        </div>

        {/* Fields List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Default Fields */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Default Fields</h2>
            <div className="space-y-2">
              {defaultFields.map((field) => (
                <div
                  key={field.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getFieldIcon(field.fieldType)} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {field.label}
                        {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                      </p>
                      <p className="text-xs text-gray-400">{field.fieldType}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Custom Fields</h2>
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="text-rose-500 hover:text-rose-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Add Field Panel */}
          {showAddPanel && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Add Field</p>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((typeInfo) => (
                  <button
                    key={typeInfo.type}
                    onClick={() => handleAddField(typeInfo)}
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition text-left"
                  >
                    <svg className="w-5 h-5 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getFieldIcon(typeInfo.type)} />
                    </svg>
                    <span className="text-xs text-gray-700 truncate w-full text-center">{typeInfo.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Field Items */}
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(index + defaultFields.length)}
                onDragOver={(e) => handleDragOver(e, index + defaultFields.length)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedField(field)}
                className={`p-3 bg-white rounded-lg border cursor-pointer transition ${
                  selectedField?.id === field.id
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Icon */}
                  <div className="w-8 h-8 bg-rose-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getFieldIcon(field.fieldType)} />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {field.label}
                      {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-500">{field.fieldType}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete field"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {customFields.length === 0 && !showAddPanel && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No custom fields yet</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Add your first field
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href={`/${event.slug}/register`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview Form
          </Link>
          <button className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition shadow-lg shadow-rose-500/25">
            Save Changes
          </button>
        </div>
      </div>

      {/* Right Panel - Field Editor */}
      <div className="flex-1 flex flex-col">
        {selectedField && !selectedField.isDefault ? (
          <>
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit {FIELD_TYPES.find(t => t.type === selectedField.fieldType)?.name} Field
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {FIELD_TYPES.find(t => t.type === selectedField.fieldType)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedField(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl space-y-6">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) =>
                      handleUpdateField({ ...selectedField, label: e.target.value })
                    }
                    placeholder="Field label"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Field Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={(e) =>
                      handleUpdateField({ ...selectedField, name: e.target.value.toLowerCase().replace(/\s/g, '_') })
                    }
                    placeholder="field_name"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-gray-500 text-sm mt-1">Used internally to identify the field</p>
                </div>

                {/* Placeholder */}
                {(selectedField.fieldType === "TEXT" || selectedField.fieldType === "EMAIL" ||
                  selectedField.fieldType === "TEL" || selectedField.fieldType === "URL" ||
                  selectedField.fieldType === "TEXTAREA" || selectedField.fieldType === "NUMBER") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={selectedField.placeholder || ""}
                      onChange={(e) =>
                        handleUpdateField({ ...selectedField, placeholder: e.target.value })
                      }
                      placeholder="Enter placeholder text..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}

                {/* Help Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Help Text
                  </label>
                  <input
                    type="text"
                    value={selectedField.helpText || ""}
                    onChange={(e) =>
                      handleUpdateField({ ...selectedField, helpText: e.target.value })
                    }
                    placeholder="Additional help text shown below the field"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Required */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Required</p>
                    <p className="text-gray-500 text-sm">Make this field mandatory</p>
                  </div>
                  <button
                    onClick={() => handleUpdateField({ ...selectedField, isRequired: !selectedField.isRequired })}
                    className={`relative w-12 h-6 rounded-full transition ${
                      selectedField.isRequired ? "bg-rose-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                        selectedField.isRequired ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Options (for SELECT and RADIO) */}
                {(selectedField.fieldType === "SELECT" || selectedField.fieldType === "RADIO") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {(selectedField.options || []).map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...(selectedField.options || [])];
                              newOptions[index] = { ...newOptions[index], label: e.target.value };
                              handleUpdateField({ ...selectedField, options: newOptions });
                            }}
                            placeholder="Option label"
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                          <button
                            onClick={() => {
                              const newOptions = (selectedField.options || []).filter((_, i) => i !== index);
                              handleUpdateField({ ...selectedField, options: newOptions });
                            }}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOptions = [...(selectedField.options || []), { value: `option_${Date.now()}`, label: "New Option" }];
                          handleUpdateField({ ...selectedField, options: newOptions });
                        }}
                        className="text-rose-500 hover:text-rose-600 text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-gray-500">Select a custom field to edit</p>
              <p className="text-gray-400 text-sm mt-1">or add a new field from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
