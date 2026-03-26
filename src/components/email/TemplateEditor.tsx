"use client";

import { useState } from "react";

interface Variable {
  name: string;
  description: string;
}

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  htmlContent: string;
  eventId: string | null;
  isActive: boolean;
  variables: Variable[];
}

interface TemplateEditorProps {
  template?: EmailTemplate;
  events: { id: string; title: string }[];
  onSave: (template: EmailTemplate) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_VARIABLES: Variable[] = [
  { name: "dancerName", description: "Full name of the dancer" },
  { name: "dancerEmail", description: "Email address of the dancer" },
  { name: "eventTitle", description: "Title of the event" },
  { name: "eventDates", description: "Event date range" },
  { name: "eventLocation", description: "Event venue and city" },
  { name: "registrationStatus", description: "Current registration status" },
  { name: "paymentStatus", description: "Current payment status" },
  { name: "paymentAmount", description: "Total payment amount" },
  { name: "paymentLink", description: "Link to complete payment" },
  { name: "organizerName", description: "Name of the organizer" },
  { name: "organizerEmail", description: "Contact email of organizer" },
];

export default function TemplateEditor({
  template,
  events,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || "");
  const [eventId, setEventId] = useState<string | null>(template?.eventId || null);
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Insert variable at cursor
  function insertVariable(varName: string) {
    const textarea = document.getElementById("htmlContent") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      htmlContent.substring(0, start) +
      `{{${varName}}}` +
      htmlContent.substring(end);
    setHtmlContent(newContent);

    // Focus and set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + varName.length + 4;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }

  // Generate preview HTML
  function getPreviewHtml() {
    let preview = htmlContent;
    const sampleData: Record<string, string> = {
      dancerName: "Maria Garcia",
      dancerEmail: "maria@example.com",
      eventTitle: "Tango Fusion Festival 2024",
      eventDates: "December 15-17, 2024",
      eventLocation: "Grand Ballroom, Buenos Aires",
      registrationStatus: "Confirmed",
      paymentStatus: "Paid",
      paymentAmount: "€150.00",
      paymentLink: "https://example.com/pay/abc123",
      organizerName: "Tango Events Ltd",
      organizerEmail: "info@tangoevents.com",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    return preview;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject line is required");
      return;
    }
    if (!htmlContent.trim()) {
      setError("Email content is required");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: template?.id,
        name: name.trim(),
        subject: subject.trim(),
        htmlContent,
        eventId,
        isActive,
        variables: DEFAULT_VARIABLES,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template?.id ? "Edit Template" : "Create Template"}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Registration Confirmation"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apply to Event
              </label>
              <select
                value={eventId || ""}
                onChange={(e) => setEventId(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">All Events (Default)</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Your registration is confirmed!"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can use variables like {"{{eventTitle}}"} in the subject
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Content (HTML) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-rose-500 hover:text-rose-600"
                >
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>

              {showPreview ? (
                <div
                  className="w-full min-h-[400px] p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              ) : (
                <textarea
                  id="htmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<p>Hello {{dancerName}},</p>..."
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Variables
              </label>
              <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
                {DEFAULT_VARIABLES.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <code className="text-sm text-rose-600">
                      {`{{${variable.name}}}`}
                    </code>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {variable.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Template is active and can be used for sending emails
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
