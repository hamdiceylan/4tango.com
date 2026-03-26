"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ActionMenu from "./ActionMenu";
import ColumnCustomizer, { ColumnConfig } from "./ColumnCustomizer";
import BulkActions from "./BulkActions";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  country: string | null;
  registrationStatus: string;
  paymentStatus: string;
  paymentAmount: number | null;
  event: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  onRefresh: () => void;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "fullName", label: "Dancer", visible: true, order: 0 },
  { id: "event", label: "Event", visible: true, order: 1 },
  { id: "role", label: "Role", visible: true, order: 2 },
  { id: "country", label: "Country", visible: true, order: 3 },
  { id: "registrationStatus", label: "Status", visible: true, order: 4 },
  { id: "paymentStatus", label: "Payment", visible: true, order: 5 },
  { id: "createdAt", label: "Registered", visible: true, order: 6 },
  { id: "city", label: "City", visible: false, order: 7 },
  { id: "email", label: "Email", visible: false, order: 8 },
  { id: "paymentAmount", label: "Amount", visible: false, order: 9 },
];

const STORAGE_KEY = "4tango_registration_columns";

export default function RegistrationTable({
  registrations,
  onRefresh,
}: RegistrationTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load saved column preferences
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setColumns(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Save column preferences
  function handleColumnsChange(newColumns: ColumnConfig[]) {
    setColumns(newColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns));
  }

  // Selection handlers
  function toggleSelectAll() {
    if (selectedIds.size === registrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(registrations.map((r) => r.id)));
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  // Sorting
  function handleSort(columnId: string) {
    if (sortColumn === columnId) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  }

  const sortedRegistrations = [...registrations].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    switch (sortColumn) {
      case "fullName":
        aVal = a.fullName.toLowerCase();
        bVal = b.fullName.toLowerCase();
        break;
      case "event":
        aVal = a.event.title.toLowerCase();
        bVal = b.event.title.toLowerCase();
        break;
      case "role":
        aVal = a.role;
        bVal = b.role;
        break;
      case "country":
        aVal = (a.country || "").toLowerCase();
        bVal = (b.country || "").toLowerCase();
        break;
      case "city":
        aVal = (a.city || "").toLowerCase();
        bVal = (b.city || "").toLowerCase();
        break;
      case "registrationStatus":
        aVal = a.registrationStatus;
        bVal = b.registrationStatus;
        break;
      case "paymentStatus":
        aVal = a.paymentStatus;
        bVal = b.paymentStatus;
        break;
      case "paymentAmount":
        aVal = a.paymentAmount || 0;
        bVal = b.paymentAmount || 0;
        break;
      case "createdAt":
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const visibleColumns = columns
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order);

  function renderCell(reg: Registration, columnId: string) {
    switch (columnId) {
      case "fullName":
        return (
          <div>
            <p className="text-gray-900 font-medium">{reg.fullName}</p>
            <p className="text-gray-500 text-sm">{reg.email}</p>
          </div>
        );
      case "email":
        return <span className="text-gray-700">{reg.email}</span>;
      case "event":
        return (
          <Link
            href={`/events/${reg.event.id}`}
            className="text-rose-500 hover:text-rose-600 hover:underline"
          >
            {reg.event.title}
          </Link>
        );
      case "role":
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              reg.role === "LEADER"
                ? "bg-blue-100 text-blue-700"
                : "bg-pink-100 text-pink-700"
            }`}
          >
            {reg.role}
          </span>
        );
      case "country":
        return <span className="text-gray-600">{reg.country || "-"}</span>;
      case "city":
        return <span className="text-gray-600">{reg.city || "-"}</span>;
      case "registrationStatus":
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              reg.registrationStatus
            )}`}
          >
            {formatStatus(reg.registrationStatus)}
          </span>
        );
      case "paymentStatus":
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
              reg.paymentStatus
            )}`}
          >
            {formatPaymentStatus(reg.paymentStatus)}
          </span>
        );
      case "paymentAmount":
        return (
          <span className="text-gray-600">
            {reg.paymentAmount ? `€${(reg.paymentAmount / 100).toFixed(2)}` : "-"}
          </span>
        );
      case "createdAt":
        return (
          <span className="text-gray-600">
            {new Date(reg.createdAt).toLocaleDateString()}
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      {/* Bulk actions bar */}
      <div className="mb-4">
        <BulkActions
          selectedIds={Array.from(selectedIds)}
          onClearSelection={() => setSelectedIds(new Set())}
          onActionComplete={() => {
            setSelectedIds(new Set());
            onRefresh();
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table header controls */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {registrations.length} registration{registrations.length !== 1 && "s"}
          </div>
          <button
            onClick={() => setShowCustomizer(true)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Customize Columns
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === registrations.length &&
                      registrations.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id)}
                    className="text-left text-gray-600 font-medium px-6 py-3 cursor-pointer hover:text-gray-900"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortColumn === column.id && (
                        <svg
                          className={`w-4 h-4 transition ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    selectedIds.has(reg.id) ? "bg-rose-50" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="px-6 py-4">
                      {renderCell(reg, column.id)}
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <ActionMenu
                      registrationId={reg.id}
                      onActionComplete={onRefresh}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>

      {showCustomizer && (
        <ColumnCustomizer
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case "CONFIRMED":
    case "CHECKED_IN":
      return "bg-green-100 text-green-700";
    case "APPROVED":
      return "bg-blue-100 text-blue-700";
    case "REGISTERED":
    case "PENDING_REVIEW":
      return "bg-yellow-100 text-yellow-700";
    case "WAITLIST":
      return "bg-orange-100 text-orange-700";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "PARTIALLY_PAID":
      return "bg-blue-100 text-blue-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "UNPAID":
      return "bg-gray-100 text-gray-700";
    case "PAYMENT_FAILED":
      return "bg-red-100 text-red-700";
    case "REFUNDED":
    case "REFUND_PENDING":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "REGISTERED":
      return "Pending";
    case "PENDING_REVIEW":
      return "In Review";
    case "CHECKED_IN":
      return "Checked In";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function formatPaymentStatus(status: string): string {
  switch (status) {
    case "PARTIALLY_PAID":
      return "Partial";
    case "PAYMENT_FAILED":
      return "Failed";
    case "REFUND_PENDING":
      return "Refunding";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}
