"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import ActionMenu from "./ActionMenu";
import ColumnCustomizer, { ColumnConfig } from "./ColumnCustomizer";
import BulkActions from "./BulkActions";

interface CustomFieldValue {
  id: string;
  fieldId: string;
  value: string;
}

interface FormField {
  id: string;
  name: string;
  label: string | Record<string, string>; // Can be i18n object from API
  fieldType: string;
  options?: { value: string; label: string }[] | null;
  labels?: Record<string, string> | null; // i18n labels
}

// Helper to extract string label from field (handles i18n objects)
function getFieldLabel(field: FormField): string {
  // If label is a string, use it
  if (typeof field.label === 'string' && field.label) {
    return field.label;
  }
  // If label is an object, extract English or first available
  if (field.label && typeof field.label === 'object') {
    const labelObj = field.label as Record<string, string>;
    return labelObj.en || Object.values(labelObj)[0] || field.name;
  }
  // Try i18n labels field
  if (field.labels && typeof field.labels === 'object') {
    return field.labels.en || Object.values(field.labels)[0] || field.name;
  }
  // Fallback to name
  return field.name;
}

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
  dancerId?: string;
  dancerProfilePictureUrl?: string | null;
  customFieldValues?: CustomFieldValue[];
}

interface RegistrationTableProps {
  registrations: Registration[];
  onRefresh: () => void;
  hideEventColumn?: boolean;
  formFields?: FormField[];
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
const PAGE_SIZE_KEY = "4tango_registration_page_size";
const PAGE_SIZES = [25, 50, 100, 200];

export default function RegistrationTable({
  registrations,
  onRefresh,
  hideEventColumn = false,
  formFields = [],
}: RegistrationTableProps) {
  // Create dynamic columns including custom fields
  const allColumns = useMemo(() => {
    const customFieldColumns: ColumnConfig[] = formFields.map((field, index) => ({
      id: `custom_${field.id}`,
      label: getFieldLabel(field),
      visible: true, // Custom fields visible by default
      order: DEFAULT_COLUMNS.length + index,
    }));
    return [...DEFAULT_COLUMNS, ...customFieldColumns];
  }, [formFields]);

  const [columns, setColumns] = useState<ColumnConfig[]>(allColumns);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Update columns when formFields change
  useEffect(() => {
    setColumns((prev) => {
      // Keep saved preferences for existing columns, add new custom field columns
      const savedColumnMap = new Map(prev.map(c => [c.id, c]));
      return allColumns.map(col => {
        const saved = savedColumnMap.get(col.id);
        if (saved) {
          return { ...col, visible: saved.visible, order: saved.order };
        }
        return col;
      });
    });
  }, [allColumns]);

  // Load saved column preferences, filters, and page size
  useEffect(() => {
    const savedColumns = localStorage.getItem(STORAGE_KEY);
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns) as ColumnConfig[];
        // Merge saved preferences with current columns (including custom fields)
        setColumns((prev) => {
          const savedMap = new Map(parsed.map(c => [c.id, c]));
          return prev.map(col => {
            const saved = savedMap.get(col.id);
            if (saved) {
              return { ...col, visible: saved.visible, order: saved.order };
            }
            return col;
          });
        });
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
    const savedPageSize = localStorage.getItem(PAGE_SIZE_KEY);
    if (savedPageSize) {
      const size = parseInt(savedPageSize, 10);
      if (PAGE_SIZES.includes(size)) {
        setPageSize(size);
      }
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
          default:
            // Handle custom fields
            if (filter.column.startsWith("custom_")) {
              const fieldId = filter.column.replace("custom_", "");
              const customValue = reg.customFieldValues?.find(v => v.fieldId === fieldId);
              fieldValue = customValue?.value || "";
            } else {
              return true;
            }
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
  // Selection handlers - defined as regular functions, used after paginatedRegistrations is calculated
  function toggleSelectAll() {
    const pageIds = paginatedRegistrations.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      // Deselect all on current page
      const newSelected = new Set(selectedIds);
      pageIds.forEach((id) => newSelected.delete(id));
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const newSelected = new Set(selectedIds);
      pageIds.forEach((id) => newSelected.add(id));
      setSelectedIds(newSelected);
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

  // Pagination
  const totalPages = Math.ceil(sortedRegistrations.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRegistrations = sortedRegistrations.slice(startIndex, endIndex);

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setCurrentPage(1);
    localStorage.setItem(PAGE_SIZE_KEY, String(newSize));
  }

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  // Check if all items on current page are selected
  const allPageSelected = paginatedRegistrations.length > 0 &&
    paginatedRegistrations.every((r) => selectedIds.has(r.id));

  const visibleColumns = columns
    .filter((c) => c.visible)
    .filter((c) => !(hideEventColumn && c.id === "event"))
    .sort((a, b) => a.order - b.order);

  function renderCell(reg: Registration, columnId: string) {
    switch (columnId) {
      case "fullName":
        return (
          <div className="flex items-center gap-2">
            {/* Profile picture */}
            {reg.dancerProfilePictureUrl ? (
              <img
                src={reg.dancerProfilePictureUrl}
                alt={reg.fullName}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-500">
                  {reg.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              {reg.dancerId ? (
                <Link
                  href={`/registrations/dancer/${reg.dancerId}`}
                  className="text-gray-900 text-sm font-medium hover:text-rose-500 truncate block"
                >
                  {reg.fullName}
                </Link>
              ) : (
                <span className="text-gray-900 text-sm font-medium truncate block">{reg.fullName}</span>
              )}
            </div>
          </div>
        );
      case "email":
        return <span className="text-gray-600 text-sm truncate">{reg.email}</span>;
      case "event":
        return (
          <Link
            href={`/events/${reg.event.id}`}
            className="text-rose-500 hover:text-rose-600 text-sm truncate block max-w-[150px]"
          >
            {reg.event.title}
          </Link>
        );
      case "role":
        return (
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
              reg.role === "LEADER"
                ? "bg-blue-50 text-blue-600"
                : "bg-pink-50 text-pink-600"
            }`}
          >
            {reg.role === "LEADER" ? "L" : "F"}
          </span>
        );
      case "country":
        return <span className="text-gray-600 text-sm">{reg.country || "-"}</span>;
      case "city":
        return <span className="text-gray-600 text-sm">{reg.city || "-"}</span>;
      case "registrationStatus":
        return (
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(
              reg.registrationStatus
            )}`}
          >
            {formatStatusShort(reg.registrationStatus)}
          </span>
        );
      case "paymentStatus":
        return (
          <span
            className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
              reg.paymentStatus
            )}`}
          >
            {formatPaymentStatusShort(reg.paymentStatus)}
          </span>
        );
      case "paymentAmount":
        return (
          <span className="text-gray-600 text-sm">
            {reg.paymentAmount ? `€${(reg.paymentAmount / 100).toFixed(0)}` : "-"}
          </span>
        );
      case "createdAt":
        return (
          <span className="text-gray-500 text-xs">
            {new Date(reg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
          </span>
        );
      default:
        // Handle custom fields
        if (columnId.startsWith("custom_")) {
          const fieldId = columnId.replace("custom_", "");
          const fieldValue = reg.customFieldValues?.find(v => v.fieldId === fieldId);
          const field = formFields.find(f => f.id === fieldId);

          if (!fieldValue?.value) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          // Handle checkbox fields (show Yes/No)
          if (field?.fieldType === "CHECKBOX") {
            return (
              <span className={`text-sm ${fieldValue.value === "true" ? "text-green-600" : "text-gray-600"}`}>
                {fieldValue.value === "true" ? "Yes" : "No"}
              </span>
            );
          }

          // Handle select/radio fields (show label instead of value)
          if ((field?.fieldType === "SELECT" || field?.fieldType === "RADIO") && Array.isArray(field.options)) {
            const option = field.options.find(o => o.value === fieldValue.value);
            return <span className="text-gray-600 text-sm">{option?.label || fieldValue.value}</span>;
          }

          // Default text display
          return <span className="text-gray-600 text-sm truncate max-w-[150px]" title={fieldValue.value}>{fieldValue.value}</span>;
        }
        return null;
    }
  }

  return (
    <div>
      {/* Bulk actions bar */}
      <div className="mb-2">
        <BulkActions
          selectedIds={Array.from(selectedIds)}
          onClearSelection={() => setSelectedIds(new Set())}
          onActionComplete={() => {
            setSelectedIds(new Set());
            onRefresh();
          }}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Table header controls */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filteredRegistrations.length === registrations.length
                ? `${registrations.length} total`
                : `${filteredRegistrations.length}/${registrations.length}`}
            </div>
            <div className="flex items-center gap-1">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                  title="Add filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 max-h-64 overflow-y-auto">
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => addFilter(col.id)}
                        className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100"
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCustomizer(true)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                title="Customize columns"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Cols
              </button>
            </div>
          </div>

          {/* Active filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mt-2">
              {filters.map((filter) => {
                const col = columns.find((c) => c.id === filter.column);
                const config = COLUMN_FILTER_CONFIG[filter.column];

                return (
                  <div
                    key={filter.id}
                    className="flex items-center gap-0.5 bg-gray-100 rounded px-1.5 py-0.5 text-xs"
                  >
                    <span className="text-gray-500">{col?.label}:</span>

                    {config?.type === "select" ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="bg-transparent border-none text-gray-700 text-xs focus:outline-none focus:ring-0 py-0 pr-4"
                      >
                        <option value="">Any</option>
                        {config.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : config?.type === "date" ? (
                      <div className="flex items-center gap-0.5">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-500 text-xs focus:outline-none focus:ring-0 py-0"
                        >
                          <option value="equals">on</option>
                          <option value="before">&lt;</option>
                          <option value="after">&gt;</option>
                        </select>
                        <input
                          type="date"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="bg-transparent border-none text-gray-700 text-xs focus:outline-none focus:ring-0 py-0 w-28"
                        />
                      </div>
                    ) : config?.type === "number" ? (
                      <div className="flex items-center gap-0.5">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-500 text-xs focus:outline-none focus:ring-0 py-0"
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
                          className="bg-transparent border-none text-gray-700 text-xs focus:outline-none focus:ring-0 py-0 w-14"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                          className="bg-transparent border-none text-gray-500 text-xs focus:outline-none focus:ring-0 py-0"
                        >
                          <option value="contains">~</option>
                          <option value="equals">=</option>
                          <option value="starts">^</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="..."
                          list={`filter-${filter.id}-options`}
                          className="bg-transparent border-none text-gray-700 text-xs focus:outline-none focus:ring-0 py-0 w-24"
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
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-8 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id)}
                    className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-3 py-2 cursor-pointer hover:text-gray-700 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-0.5">
                      {column.label}
                      {sortColumn === column.id && (
                        <svg
                          className={`w-3 h-3 transition ${
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
                <th className="w-8 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${
                    selectedIds.has(reg.id) ? "bg-rose-50/50" : ""
                  }`}
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-3.5 h-3.5 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="px-3 py-1.5">
                      {renderCell(reg, column.id)}
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
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
          <div className="text-center py-8">
            {filters.length > 0 ? (
              <>
                <p className="text-gray-500 text-sm">No registrations match filters</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-1 text-xs text-rose-500 hover:text-rose-600"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No registrations</p>
            )}
          </div>
        )}

        {/* Pagination */}
        {sortedRegistrations.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">
                {startIndex + 1}-{Math.min(endIndex, sortedRegistrations.length)} of {sortedRegistrations.length}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border-none bg-transparent text-gray-700 text-xs focus:outline-none focus:ring-0 py-0 pr-6 cursor-pointer"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="First page"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-2 text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next page"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Last page"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
                </svg>
              </button>
            </div>
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

function formatStatusShort(status: string): string {
  switch (status) {
    case "REGISTERED":
      return "Pend";
    case "PENDING_REVIEW":
      return "Review";
    case "APPROVED":
      return "Appr";
    case "CONFIRMED":
      return "Conf";
    case "WAITLIST":
      return "Wait";
    case "REJECTED":
      return "Rej";
    case "CANCELLED":
      return "Canc";
    case "CHECKED_IN":
      return "In";
    default:
      return status.slice(0, 4);
  }
}

function formatPaymentStatusShort(status: string): string {
  switch (status) {
    case "UNPAID":
      return "Unpd";
    case "PENDING":
      return "Pend";
    case "PAID":
      return "Paid";
    case "PARTIALLY_PAID":
      return "Part";
    case "PAYMENT_FAILED":
      return "Fail";
    case "REFUNDED":
      return "Ref";
    case "REFUND_PENDING":
      return "Refg";
    default:
      return status.slice(0, 4);
  }
}
