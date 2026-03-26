"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

interface Filter {
  id: string;
  column: string;
  operator: string;
  value: string;
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

const COLUMN_FILTER_CONFIG: Record<string, { type: "text" | "select" | "date" | "number"; options?: { value: string; label: string }[] }> = {
  fullName: { type: "text" },
  email: { type: "text" },
  event: { type: "text" },
  city: { type: "text" },
  country: { type: "text" },
  role: {
    type: "select",
    options: [
      { value: "LEADER", label: "Leader" },
      { value: "FOLLOWER", label: "Follower" },
    ],
  },
  registrationStatus: {
    type: "select",
    options: [
      { value: "REGISTERED", label: "Pending" },
      { value: "PENDING_REVIEW", label: "In Review" },
      { value: "APPROVED", label: "Approved" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "WAITLIST", label: "Waitlist" },
      { value: "REJECTED", label: "Rejected" },
      { value: "CANCELLED", label: "Cancelled" },
      { value: "CHECKED_IN", label: "Checked In" },
    ],
  },
  paymentStatus: {
    type: "select",
    options: [
      { value: "UNPAID", label: "Unpaid" },
      { value: "PENDING", label: "Pending" },
      { value: "PAID", label: "Paid" },
      { value: "PARTIALLY_PAID", label: "Partial" },
      { value: "PAYMENT_FAILED", label: "Failed" },
      { value: "REFUNDED", label: "Refunded" },
      { value: "REFUND_PENDING", label: "Refunding" },
    ],
  },
  createdAt: { type: "date" },
  paymentAmount: { type: "number" },
};

const STORAGE_KEY = "4tango_registration_columns";
const FILTER_STORAGE_KEY = "4tango_registration_filters";

export default function RegistrationTable({
  registrations,
  onRefresh,
}: RegistrationTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Load saved column preferences and filters
  useEffect(() => {
    const savedColumns = localStorage.getItem(STORAGE_KEY);
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch {
        // Use defaults
      }
    }
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
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

  // Filter management
  function addFilter(column: string) {
    const config = COLUMN_FILTER_CONFIG[column];
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      column,
      operator: config?.type === "select" ? "equals" : "contains",
      value: "",
    };
    const updated = [...filters, newFilter];
    setFilters(updated);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
    setShowFilterDropdown(false);
  }

  function updateFilter(id: string, updates: Partial<Filter>) {
    const updated = filters.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFilters(updated);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
  }

  function removeFilter(id: string) {
    const updated = filters.filter((f) => f.id !== id);
    setFilters(updated);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
  }

  function clearAllFilters() {
    setFilters([]);
    localStorage.removeItem(FILTER_STORAGE_KEY);
  }

  // Get unique values for a column (for text autocomplete)
  function getUniqueValues(column: string): string[] {
    const values = new Set<string>();
    registrations.forEach((reg) => {
      let val = "";
      switch (column) {
        case "fullName": val = reg.fullName; break;
        case "email": val = reg.email; break;
        case "event": val = reg.event.title; break;
        case "city": val = reg.city || ""; break;
        case "country": val = reg.country || ""; break;
        default: break;
      }
      if (val) values.add(val);
    });
    return Array.from(values).sort();
  }

  // Apply filters to registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      return filters.every((filter) => {
        if (!filter.value) return true;

        let fieldValue = "";
        switch (filter.column) {
          case "fullName": fieldValue = reg.fullName; break;
          case "email": fieldValue = reg.email; break;
          case "event": fieldValue = reg.event.title; break;
          case "city": fieldValue = reg.city || ""; break;
          case "country": fieldValue = reg.country || ""; break;
          case "role": fieldValue = reg.role; break;
          case "registrationStatus": fieldValue = reg.registrationStatus; break;
          case "paymentStatus": fieldValue = reg.paymentStatus; break;
          case "createdAt": fieldValue = reg.createdAt; break;
          case "paymentAmount": fieldValue = String(reg.paymentAmount || 0); break;
          default: return true;
        }

        const config = COLUMN_FILTER_CONFIG[filter.column];

        if (config?.type === "select") {
          return fieldValue === filter.value;
        }

        if (config?.type === "date") {
          const regDate = new Date(fieldValue).toISOString().split("T")[0];
          if (filter.operator === "equals") return regDate === filter.value;
          if (filter.operator === "before") return regDate < filter.value;
          if (filter.operator === "after") return regDate > filter.value;
          return true;
        }

        if (config?.type === "number") {
          const numValue = parseFloat(fieldValue) / 100; // Convert cents to euros
          const filterNum = parseFloat(filter.value);
          if (isNaN(filterNum)) return true;
          if (filter.operator === "equals") return numValue === filterNum;
          if (filter.operator === "greater") return numValue > filterNum;
          if (filter.operator === "less") return numValue < filterNum;
          return true;
        }

        // Text filter
        const searchValue = filter.value.toLowerCase();
        if (filter.operator === "contains") {
          return fieldValue.toLowerCase().includes(searchValue);
        }
        if (filter.operator === "equals") {
          return fieldValue.toLowerCase() === searchValue;
        }
        if (filter.operator === "starts") {
          return fieldValue.toLowerCase().startsWith(searchValue);
        }
        return true;
      });
    });
  }, [registrations, filters]);

  // Selection handlers
  function toggleSelectAll() {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));
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

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Table header controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">
              {filteredRegistrations.length === registrations.length
                ? `${registrations.length} registration${registrations.length !== 1 ? "s" : ""}`
                : `${filteredRegistrations.length} of ${registrations.length} registrations`}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Add Filter
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 max-h-64 overflow-y-auto">
                    {DEFAULT_COLUMNS.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => addFilter(col.id)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCustomizer(true)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Columns
              </button>
            </div>
          </div>

          {/* Active filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {filters.map((filter) => {
                const col = DEFAULT_COLUMNS.find((c) => c.id === filter.column);
                const config = COLUMN_FILTER_CONFIG[filter.column];

                return (
                  <div
                    key={filter.id}
                    className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-sm"
                  >
                    <span className="text-gray-600 font-medium">{col?.label}:</span>

                    {config?.type === "select" ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="bg-transparent border-none text-gray-900 text-sm focus:outline-none focus:ring-0 py-0"
                      >
                        <option value="">Any</option>
                        {config.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : config?.type === "date" ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-600 text-sm focus:outline-none focus:ring-0 py-0"
                        >
                          <option value="equals">on</option>
                          <option value="before">before</option>
                          <option value="after">after</option>
                        </select>
                        <input
                          type="date"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="bg-transparent border-none text-gray-900 text-sm focus:outline-none focus:ring-0 py-0"
                        />
                      </div>
                    ) : config?.type === "number" ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-600 text-sm focus:outline-none focus:ring-0 py-0"
                        >
                          <option value="equals">=</option>
                          <option value="greater">&gt;</option>
                          <option value="less">&lt;</option>
                        </select>
                        <input
                          type="number"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="0"
                          className="bg-transparent border-none text-gray-900 text-sm focus:outline-none focus:ring-0 py-0 w-20"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-600 text-sm focus:outline-none focus:ring-0 py-0"
                        >
                          <option value="contains">contains</option>
                          <option value="equals">equals</option>
                          <option value="starts">starts with</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="Search..."
                          list={`filter-${filter.id}-options`}
                          className="bg-transparent border-none text-gray-900 text-sm focus:outline-none focus:ring-0 py-0 w-32"
                        />
                        <datalist id={`filter-${filter.id}-options`}>
                          {getUniqueValues(filter.column).slice(0, 10).map((val) => (
                            <option key={val} value={val} />
                          ))}
                        </datalist>
                      </div>
                    )}

                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === filteredRegistrations.length &&
                      filteredRegistrations.length > 0
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

        {sortedRegistrations.length === 0 && (
          <div className="text-center py-12">
            {filters.length > 0 ? (
              <>
                <p className="text-gray-500">No registrations match your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 text-sm text-rose-500 hover:text-rose-600"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <p className="text-gray-500">No registrations found</p>
            )}
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
