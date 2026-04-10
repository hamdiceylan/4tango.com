"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FIELD_TYPES, FieldType, FieldTypeInfo, generateFieldName, FieldValidation, ConditionalRule } from "@/lib/field-types";
import FieldEditorPanel from "@/components/form-builder/FieldEditorPanel";

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
  labels?: Record<string, string> | null;
  placeholders?: Record<string, string> | null;
  helpTexts?: Record<string, string> | null;
  isDefault?: boolean;
  isMandatory?: boolean;
}

interface Event {
  id: string;
  title: string;
  slug: string;
}

// Transfer form default mandatory fields (displayed in builder but not editable/deletable)
const defaultFields: FormField[] = [
  { id: "default_1", name: "firstName", label: "First Name", fieldType: "TEXT" as FieldType, isRequired: true, order: -4, isDefault: true, isMandatory: true },
  { id: "default_2", name: "lastName", label: "Last Name", fieldType: "TEXT" as FieldType, isRequired: true, order: -3, isDefault: true, isMandatory: true },
  { id: "default_3", name: "email", label: "Email", fieldType: "EMAIL" as FieldType, isRequired: true, order: -2, isDefault: true, isMandatory: true },
  { id: "default_4", name: "phone", label: "Phone Number", fieldType: "TEL" as FieldType, isRequired: false, order: -1, isDefault: true, isMandatory: false },
];

export default function TransferBuilderPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, fieldsRes] = await Promise.all([
          fetch(`/api/events/${params.id}`, { credentials: "include" }),
          fetch(`/api/events/${params.id}/transfer-fields`, { credentials: "include" }),
        ]);
        if (eventRes.ok) {
          const data = await eventRes.json();
          setEvent({ id: data.id, title: data.title, slug: data.slug });
        }
        if (fieldsRes.ok) setCustomFields(await fieldsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFields = [...customFields];
    const dragged = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, dragged);
    newFields.forEach((f, i) => { f.order = i; });
    setCustomFields(newFields);
    setDraggedIndex(index);
    setHasChanges(true);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const handleAddField = async (typeInfo: FieldTypeInfo) => {
    try {
      const res = await fetch(`/api/events/${params.id}/transfer-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldType: typeInfo.type,
          name: generateFieldName(typeInfo.name),
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
    if (!confirm("Delete this field?")) return;
    try {
      const res = await fetch(`/api/events/${params.id}/transfer-fields/${fieldId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setCustomFields(customFields.filter((f) => f.id !== fieldId));
        if (selectedField?.id === fieldId) setSelectedField(null);
      }
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await fetch(`/api/events/${params.id}/transfer-fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldIds: customFields.map((f) => f.id) }),
        credentials: "include",
      });
      for (const field of customFields) {
        await fetch(`/api/events/${params.id}/transfer-fields/${field.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: field.label, placeholder: field.placeholder, helpText: field.helpText,
            isRequired: field.isRequired, options: field.options, validation: field.validation,
            conditionalOn: field.conditionalOn, labels: field.labels, placeholders: field.placeholders, helpTexts: field.helpTexts,
          }),
          credentials: "include",
        });
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedField = useCallback((updates: Partial<FormField>) => {
    if (!selectedField) return;
    const updated = { ...selectedField, ...updates };
    setSelectedField(updated);
    setCustomFields(customFields.map((f) => (f.id === updated.id ? updated : f)));
    setHasChanges(true);
  }, [selectedField, customFields]);

  const getFieldIcon = (type: FieldType): string => {
    const icons: Record<string, string> = {
      TEXT: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      DATE: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      CHECKBOX: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      SELECT: "M19 9l-7 7-7-7",
      RADIO: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      TEXTAREA: "M4 6h16M4 12h16M4 18h7",
    };
    return icons[type] || icons.TEXT;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) return <div className="flex h-screen items-center justify-center"><p className="text-gray-500">Event not found</p></div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Transfer Builder</h1>
          <p className="text-gray-500 text-sm">{event.title}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fields</h2>
            <button onClick={() => setShowAddPanel(!showAddPanel)} className="text-rose-500 hover:text-rose-600 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {showAddPanel && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Add Field</p>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((t) => (
                  <button key={t.type} onClick={() => handleAddField(t)}
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition">
                    <svg className="w-5 h-5 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getFieldIcon(t.type)} />
                    </svg>
                    <span className="text-xs text-gray-700 truncate w-full text-center">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* Default mandatory fields */}
            {defaultFields.map((field) => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedField?.id === field.id ? "border-rose-500 ring-2 ring-rose-500/20 bg-white" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-amber-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-amber-100">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getFieldIcon(field.fieldType)} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{field.label}</p>
                    <p className="text-xs text-gray-500">
                      {field.fieldType} {field.isRequired && <span className="text-rose-500">*</span>} <span className="bg-amber-100 text-amber-700 px-1 rounded text-xs">Mandatory</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom fields */}
            {customFields.map((field, index) => (
              <div key={field.id} draggable onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}
                onClick={() => setSelectedField(field)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedField?.id === field.id ? "border-rose-500 ring-2 ring-rose-500/20 bg-white" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}>
                <div className="flex items-center gap-3">
                  <div className="cursor-grab text-gray-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{field.label}</p>
                    <p className="text-xs text-gray-500">{field.fieldType} {field.isRequired && <span className="text-rose-500">*</span>}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }} className="p-1 text-gray-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {customFields.length === 0 && !showAddPanel && (
              <p className="text-gray-400 text-sm text-center py-4">No fields yet. Click + to add.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href={`/en/${event.slug}/transfer`} target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
            Open Transfer Form
          </Link>
          <button onClick={handleSaveChanges} disabled={saving || !hasChanges}
            className={`w-full px-4 py-2 rounded-lg font-medium transition shadow-lg ${
              hasChanges ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25" : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}>
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedField ? (
          <FieldEditorPanel field={selectedField} allFields={[...defaultFields, ...customFields]} onUpdate={updateSelectedField} onClose={() => setSelectedField(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500">Select a field to edit</p>
              <p className="text-gray-400 text-sm mt-1">or add a new field from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
