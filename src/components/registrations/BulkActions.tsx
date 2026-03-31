"use client";

import { useState, useEffect } from "react";

interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
}

export default function BulkActions({
  selectedIds,
  onClearSelection,
  onActionComplete,
}: BulkActionsProps) {
  const [executing, setExecuting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const bulkActions = [
    { id: "approve", label: "Approve", category: "status" },
    { id: "confirm", label: "Confirm", category: "status" },
    { id: "reject", label: "Reject", category: "status" },
    { id: "cancel", label: "Cancel", category: "status" },
    { id: "waitlist", label: "Add to Waitlist", category: "status" },
    { id: "mark-paid", label: "Mark as Paid", category: "payment" },
    { id: "request-payment", label: "Request Payment", category: "payment" },
    { id: "send-email", label: "Send Email...", category: "communication", hasModal: true },
    { id: "send-payment-reminder", label: "Send Payment Reminder", category: "communication" },
    { id: "send-reminder", label: "Send Event Reminder", category: "communication" },
  ];

  // Fetch templates when email modal opens
  useEffect(() => {
    if (showEmailModal) {
      fetchTemplates();
    }
  }, [showEmailModal]);

  async function fetchTemplates() {
    setLoadingTemplates(true);
    try {
      const response = await fetch("/api/email-templates", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.filter((t: EmailTemplate & { isActive: boolean }) => t.isActive));
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  }

  async function executeBulkAction(actionId: string, input: Record<string, unknown> = {}) {
    setExecuting(true);
    try {
      const response = await fetch("/api/registrations/bulk-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationIds: selectedIds,
          actionId,
          input,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.successful}/${data.total} completed`);
        onClearSelection();
        onActionComplete();
      } else {
        alert(data.error || "Bulk action failed");
      }
    } catch (error) {
      console.error("Error executing bulk action:", error);
      alert("Failed to execute bulk action");
    } finally {
      setExecuting(false);
      setShowActionModal(false);
      setShowEmailModal(false);
    }
  }

  function handleActionClick(actionId: string, hasModal?: boolean) {
    if (hasModal && actionId === "send-email") {
      setShowActionModal(false);
      setShowEmailModal(true);
      setSelectedTemplateId("");
      setCustomSubject("");
      setCustomMessage("");
    } else {
      if (!confirm(`Execute "${actionId}" on ${selectedIds.length} registration(s)?`)) {
        return;
      }
      executeBulkAction(actionId);
    }
  }

  async function handleSendEmail() {
    if (!selectedTemplateId && (!customSubject || !customMessage)) {
      alert("Please select a template or enter a custom subject and message");
      return;
    }

    const input: Record<string, string> = {};
    if (selectedTemplateId) {
      input.templateId = selectedTemplateId;
    } else {
      input.subject = customSubject;
      input.message = customMessage;
    }

    await executeBulkAction("send-email", input);
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-rose-700 font-medium">
          {selectedIds.length} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-rose-600 hover:text-rose-800 underline"
        >
          Clear selection
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowActionModal(!showActionModal)}
            disabled={executing}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {executing ? "Executing..." : "Bulk Actions"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showActionModal && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Status
                </div>
                {bulkActions
                  .filter((a) => a.category === "status")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {action.label}
                    </button>
                  ))}

                <div className="border-t border-gray-100 my-1" />
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Payment
                </div>
                {bulkActions
                  .filter((a) => a.category === "payment")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.id)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {action.label}
                    </button>
                  ))}

                <div className="border-t border-gray-100 my-1" />
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Communication
                </div>
                {bulkActions
                  .filter((a) => a.category === "communication")
                  .map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action.id, action.hasModal)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {action.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Email to {selectedIds.length} Dancer{selectedIds.length > 1 ? "s" : ""}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                {loadingTemplates ? (
                  <div className="text-gray-500 text-sm">Loading templates...</div>
                ) : (
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      if (e.target.value) {
                        setCustomSubject("");
                        setCustomMessage("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- No template (custom message) --</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
                {templates.length === 0 && !loadingTemplates && (
                  <p className="text-sm text-gray-500 mt-1">
                    No templates available. Create templates in Settings &gt; Email Templates.
                  </p>
                )}
              </div>

              {/* Custom Message (shown when no template selected) */}
              {!selectedTemplateId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Your message..."
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                </>
              )}

              {selectedTemplateId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    Template variables like <code className="bg-gray-200 px-1 rounded">{"{{dancerName}}"}</code> will be replaced with each dancer&apos;s information.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={executing}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={executing || (!selectedTemplateId && (!customSubject || !customMessage))}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing ? "Sending..." : `Send to ${selectedIds.length} Dancer${selectedIds.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
