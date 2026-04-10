"use client";

import { useState, useEffect, useCallback } from "react";
import { useEvents } from "@/contexts/EventsContext";

interface TransferFieldValue {
  id: string;
  fieldId: string;
  value: string;
}

interface TransferFormField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  labels?: Record<string, string> | null;
}

interface TransferRequest {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  event: { id: string; title: string; slug: string };
  fieldValues: TransferFieldValue[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function TransfersPage() {
  const { selectedEventId } = useEvents();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [formFields, setFormFields] = useState<TransferFormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTransfers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEventId) params.set("eventId", selectedEventId);
      const res = await fetch(`/api/transfers?${params}`, { credentials: "include" });
      if (res.ok) setTransfers(await res.json());
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  const fetchFormFields = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      const res = await fetch(`/api/events/${selectedEventId}/transfer-fields`, { credentials: "include" });
      if (res.ok) setFormFields(await res.json());
    } catch (error) {
      console.error("Error fetching transfer fields:", error);
    }
  }, [selectedEventId]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);
  useEffect(() => { fetchFormFields(); }, [fetchFormFields]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (res.ok) fetchTransfers();
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };

  const filtered = transfers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.fullName.toLowerCase().includes(s) && !t.email.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const stats = {
    total: filtered.length,
    pending: filtered.filter((t) => t.status === "PENDING").length,
    confirmed: filtered.filter((t) => t.status === "CONFIRMED").length,
    cancelled: filtered.filter((t) => t.status === "CANCELLED").length,
  };

  const getFieldLabel = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field) return fieldId;
    if (typeof field.label === "string") return field.label;
    if (field.labels) return (field.labels as Record<string, string>).en || field.name;
    return field.name;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transfer Requests</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-lg font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Pending</p>
          <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Confirmed</p>
          <p className="text-lg font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
          <p className="text-gray-400 text-xs">Cancelled</p>
          <p className="text-lg font-bold text-gray-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Email</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
              {formFields.map((f) => (
                <th key={f.id} className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{getFieldLabel(f.id)}</th>
              ))}
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5 + formFields.length} className="px-4 py-8 text-center text-gray-500">No transfer requests</td></tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.fullName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-800"}`}>
                      {t.status}
                    </span>
                  </td>
                  {formFields.map((f) => {
                    const val = t.fieldValues.find((v) => v.fieldId === f.id);
                    return (
                      <td key={f.id} className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={val?.value || ""}>
                        {val?.value === "true" ? "Yes" : val?.value === "false" ? "No" : val?.value || "-"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {t.status === "PENDING" && (
                        <>
                          <button onClick={() => handleStatusChange(t.id, "CONFIRMED")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                            Confirm
                          </button>
                          <button onClick={() => handleStatusChange(t.id, "CANCELLED")}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                            Cancel
                          </button>
                        </>
                      )}
                      {t.status === "CONFIRMED" && (
                        <button onClick={() => handleStatusChange(t.id, "CANCELLED")}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
