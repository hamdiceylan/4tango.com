"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FIELD_TYPES, FieldType, FieldTypeInfo, generateFieldName, MANDATORY_FIELDS, FieldValidation, ConditionalRule } from "@/lib/field-types";
import FieldEditorPanel from "@/components/form-builder/FieldEditorPanel";
import FormPreview from "@/components/form-builder/FormPreview";

// Default fields that are always present (mandatory fields from centralized dancer DB)
const defaultFields = MANDATORY_FIELDS.map((f, i) => ({
  id: `default_${i + 1}`,
  name: f.name,
  label: f.label,
  fieldType: f.type,
  isRequired: f.isRequired,
  isDefault: true,
  isMandatory: f.isMandatory,
  order: -(MANDATORY_FIELDS.length - i),
  options: f.options || null,
}));

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

interface Event {
  id: string;
  title: string;
  slug: string;
}

export default function FormBuilderPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch event and form fields
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, fieldsRes] = await Promise.all([
          fetch(`/api/events/${params.id}`),
          fetch(`/api/events/${params.id}/form-fields`)
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent({
            id: eventData.id,
            title: eventData.title,
            slug: eventData.slug,
          });
        }

        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json();
          setCustomFields(fieldsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const allFields = [...defaultFields, ...customFields];

  const handleDragStart = (index: number) => {
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

    newFields.forEach((field, i) => {
      field.order = i;
    });

    setCustomFields(newFields);
    setDraggedIndex(customIndex);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddField = async (typeInfo: FieldTypeInfo) => {
    const fieldName = generateFieldName(typeInfo.name);

    try {
      const res = await fetch(`/api/events/${params.id}/form-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldType: typeInfo.type,
          name: fieldName,
          label: typeInfo.name,
          placeholder: typeInfo.defaultPlaceholder || null,
          isRequired: false,
          options: typeInfo.hasOptions ? [{ value: "option1", label: "Option 1" }] : null,
        }),
        credentials: "include",
      });

      if (res.ok) {
        const newField = await res.json();
        setCustomFields([...customFields, newField]);
        setShowAddPanel(false);
        setSelectedField(newField);
      }
    } catch (error) {
      console.error("Error adding field:", error);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field?.isDefault || field?.isMandatory) return;

    if (!confirm("Are you sure you want to delete this field?")) return;

    try {
      const res = await fetch(`/api/events/${params.id}/form-fields/${fieldId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCustomFields(customFields.filter((f) => f.id !== fieldId));
        if (selectedField?.id === fieldId) {
          setSelectedField(null);
        }
      }
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const handleToggleRequired = async (fieldId: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!field || field.isDefault || field.isMandatory) return;

    try {
      const res = await fetch(`/api/events/${params.id}/form-fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRequired: !field.isRequired }),
        credentials: "include",
      });

      if (res.ok) {
        setCustomFields(
          customFields.map((f) =>
            f.id === fieldId ? { ...f, isRequired: !f.isRequired } : f
          )
        );
      }
    } catch (error) {
      console.error("Error toggling required:", error);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Save field order
      await fetch(`/api/events/${params.id}/form-fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldIds: customFields.map(f => f.id),
        }),
        credentials: "include",
      });

      // Save selected field if any
      if (selectedField && !selectedField.isDefault) {
        await fetch(`/api/events/${params.id}/form-fields/${selectedField.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: selectedField.label,
            placeholder: selectedField.placeholder,
            helpText: selectedField.helpText,
            isRequired: selectedField.isRequired,
            options: selectedField.options,
            validation: selectedField.validation,
            conditionalOn: selectedField.conditionalOn,
          }),
          credentials: "include",
        });
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedField = useCallback((updates: Partial<FormField>) => {
    if (!selectedField) return;

    // Don't allow editing mandatory fields' required status
    if (selectedField.isMandatory && updates.isRequired !== undefined) {
      updates.isRequired = true;
    }

    const updated = { ...selectedField, ...updates };
    setSelectedField(updated);

    // Update in custom fields if it's a custom field
    if (!selectedField.isDefault) {
      setCustomFields(customFields.map(f => f.id === updated.id ? updated : f));
    }

    setHasChanges(true);
  }, [selectedField, customFields]);

  const getFieldIcon = (type: FieldType): string => {
    const icons: Record<FieldType, string> = {
      TEXT: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      EMAIL: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      TEL: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      NUMBER: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
      DATE: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      DATETIME: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      SELECT: "M19 9l-7 7-7-7",
      RADIO: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      CHECKBOX: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      TEXTAREA: "M4 6h16M4 12h16M4 18h7",
      URL: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      FILE: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    };
    return icons[type] || icons.TEXT;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading form builder...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500">Event not found</p>
          <Link href="/events" className="text-rose-500 hover:text-rose-600 mt-2 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Field List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
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

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fields</h2>
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="text-rose-500 hover:text-rose-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

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

          <div className="space-y-2">
            {allFields.map((field, index) => (
              <div
                key={field.id}
                draggable={!field.isDefault && !field.isMandatory}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedField(field)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedField?.id === field.id
                    ? "border-rose-500 ring-2 ring-rose-500/20 bg-white"
                    : field.isDefault || field.isMandatory
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {!field.isDefault && !field.isMandatory && (
                    <div className="cursor-grab text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  )}
                  {(field.isDefault || field.isMandatory) && (
                    <div className="text-amber-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${field.isDefault || field.isMandatory ? "bg-amber-100" : "bg-rose-100"}`}>
                    <svg className={`w-4 h-4 ${field.isDefault || field.isMandatory ? "text-amber-600" : "text-rose-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getFieldIcon(field.fieldType)} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{field.label}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {field.fieldType}
                      {field.isRequired && <span className="text-rose-500">*</span>}
                      {(field.isDefault || field.isMandatory) && <span className="bg-amber-100 text-amber-700 px-1 rounded text-xs">Mandatory</span>}
                    </p>
                  </div>
                  {!field.isDefault && !field.isMandatory && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleRequired(field.id); }}
                        className={`p-1 ${field.isRequired ? "text-rose-500" : "text-gray-400"} hover:text-rose-600`}
                        title={field.isRequired ? "Required" : "Optional"}
                      >
                        <span className="text-sm font-bold">*</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              showPreview
                ? "bg-rose-100 text-rose-700"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
          <Link
            href={`/${event.slug}/register`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Form
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={saving || !hasChanges}
            className={`w-full px-4 py-2 rounded-lg font-medium transition shadow-lg ${
              hasChanges
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor Panel or Placeholder */}
        <div className={`flex-1 flex flex-col ${showPreview ? "w-1/2" : ""}`}>
          {selectedField ? (
            <FieldEditorPanel
              field={selectedField}
              allFields={allFields}
              onUpdate={updateSelectedField}
              onClose={() => setSelectedField(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Select a field to edit</p>
                <p className="text-gray-400 text-sm mt-1">or add a new field from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-200">
            <FormPreview fields={allFields} eventTitle={event.title} />
          </div>
        )}
      </div>
    </div>
  );
}
