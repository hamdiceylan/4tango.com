"use client";

import { useState } from "react";

interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export default function BulkActions({
  selectedIds,
  onClearSelection,
  onActionComplete,
}: BulkActionsProps) {
  const [executing, setExecuting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const bulkActions = [
    { id: "approve", label: "Approve", category: "status" },
    { id: "confirm", label: "Confirm", category: "status" },
    { id: "reject", label: "Reject", category: "status" },
    { id: "cancel", label: "Cancel", category: "status" },
    { id: "waitlist", label: "Add to Waitlist", category: "status" },
    { id: "mark-paid", label: "Mark as Paid", category: "payment" },
    { id: "request-payment", label: "Request Payment", category: "payment" },
    { id: "send-reminder", label: "Send Reminder", category: "communication" },
  ];

  async function executeBulkAction(actionId: string) {
    if (!confirm(`Execute "${actionId}" on ${selectedIds.length} registration(s)?`)) {
      return;
    }

    setExecuting(true);
    try {
      const response = await fetch("/api/registrations/bulk-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationIds: selectedIds,
          actionId,
          input: {},
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
    }
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
                      onClick={() => executeBulkAction(action.id)}
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
                      onClick={() => executeBulkAction(action.id)}
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
                      onClick={() => executeBulkAction(action.id)}
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
    </div>
  );
}
