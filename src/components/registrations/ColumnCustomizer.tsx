"use client";

import { useState } from "react";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface ColumnCustomizerProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  onClose: () => void;
}

export default function ColumnCustomizer({
  columns,
  onColumnsChange,
  onClose,
}: ColumnCustomizerProps) {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(
    [...columns].sort((a, b) => a.order - b.order)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function toggleColumn(columnId: string) {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...localColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    // Update order values
    newColumns.forEach((col, i) => {
      col.order = i;
    });

    setLocalColumns(newColumns);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleSave() {
    onColumnsChange(localColumns);
    onClose();
  }

  function handleReset() {
    const defaultColumns: ColumnConfig[] = [
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
    setLocalColumns(defaultColumns);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Customize Columns</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <p className="text-sm text-gray-500 mb-4">
            Drag to reorder columns. Toggle visibility with checkboxes.
          </p>

          <div className="space-y-1">
            {localColumns.map((column, index) => (
              <div
                key={column.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-move ${
                  draggedIndex === index
                    ? "bg-rose-50 border border-rose-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumn(column.id)}
                    className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500"
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset to default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
