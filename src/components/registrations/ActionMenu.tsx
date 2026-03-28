"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  inputFields?: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: string;
  }[];
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface ActionMenuProps {
  registrationId: string;
  onActionComplete?: () => void;
}

export default function ActionMenu({ registrationId, onActionComplete }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position and fetch actions
  useEffect(() => {
    if (isOpen && actions.length === 0) {
      fetchActions();
    }
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 300;

      setDropdownPosition({
        top: openUpward ? rect.top - 4 : rect.bottom + 4,
        left: rect.right - 256, // 256px = w-64 dropdown width
        openUpward,
      });
    }
  }, [isOpen]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSelectedAction(null);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  async function fetchActions() {
    setLoading(true);
    try {
      const response = await fetch(`/api/registrations/${registrationId}/actions/list`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setActions(data.actions);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleActionSelect(action: ActionDefinition) {
    if (action.inputFields && action.inputFields.length > 0) {
      // Initialize form with defaults
      const defaults: Record<string, string> = {};
      action.inputFields.forEach((field) => {
        if (field.defaultValue) {
          defaults[field.name] = field.defaultValue;
        }
      });
      setFormData(defaults);
      setSelectedAction(action);
    } else if (action.requiresConfirmation) {
      // Show confirmation
      if (confirm(action.confirmationMessage || `Execute ${action.name}?`)) {
        executeAction(action.id, {});
      }
    } else {
      // Execute immediately
      executeAction(action.id, {});
    }
  }

  async function executeAction(actionId: string, input: Record<string, string>) {
    setExecuting(true);
    try {
      const response = await fetch(`/api/registrations/${registrationId}/actions/${actionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOpen(false);
        setSelectedAction(null);
        setFormData({});
        onActionComplete?.();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Error executing action:", error);
      alert("Failed to execute action");
    } finally {
      setExecuting(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAction) return;

    if (selectedAction.requiresConfirmation) {
      if (!confirm(selectedAction.confirmationMessage || `Execute ${selectedAction.name}?`)) {
        return;
      }
    }

    executeAction(selectedAction.id, formData);
  }

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionDefinition[]>);

  const categoryLabels: Record<string, string> = {
    status: "Status",
    payment: "Payment",
    communication: "Communication",
  };

  const dropdownContent = isOpen && typeof document !== "undefined" ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
      style={{
        top: dropdownPosition.openUpward ? "auto" : dropdownPosition.top,
        bottom: dropdownPosition.openUpward ? window.innerHeight - dropdownPosition.top : "auto",
        left: dropdownPosition.left,
      }}
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : selectedAction ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{selectedAction.name}</h3>
            <button
              onClick={() => {
                setSelectedAction(null);
                setFormData({});
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleFormSubmit}>
            {selectedAction.inputFields?.map((field) => (
              <div key={field.name} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={3}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={executing}
              className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {executing ? "Executing..." : selectedAction.name}
            </button>
          </form>
        </div>
      ) : (
        <div className="py-2">
          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category}>
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                {categoryLabels[category] || category}
              </div>
              {categoryActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionSelect(action)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>{action.name}</span>
                </button>
              ))}
            </div>
          ))}
          {actions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No actions available</div>
          )}
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
        title="Actions"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {dropdownContent}
    </div>
  );
}
