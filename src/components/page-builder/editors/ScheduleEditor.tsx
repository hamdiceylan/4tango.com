"use client";

import { useState } from "react";
import { ScheduleContent, ScheduleDay, ScheduleItem } from "@/lib/section-types";

interface ScheduleEditorProps {
  content: ScheduleContent;
  onChange: (content: ScheduleContent) => void;
}

export default function ScheduleEditor({ content, onChange }: ScheduleEditorProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    content.days.length > 0 ? 0 : null
  );

  const addDay = () => {
    const newDay: ScheduleDay = {
      date: new Date().toISOString().split("T")[0],
      label: `Day ${content.days.length + 1}`,
      items: [],
    };
    const newDays = [...content.days, newDay];
    onChange({ ...content, days: newDays });
    setSelectedDayIndex(newDays.length - 1);
  };

  const updateDay = (index: number, updates: Partial<ScheduleDay>) => {
    const newDays = content.days.map((day, i) =>
      i === index ? { ...day, ...updates } : day
    );
    onChange({ ...content, days: newDays });
  };

  const removeDay = (index: number) => {
    const newDays = content.days.filter((_, i) => i !== index);
    onChange({ ...content, days: newDays });
    if (selectedDayIndex === index) {
      setSelectedDayIndex(newDays.length > 0 ? 0 : null);
    } else if (selectedDayIndex !== null && selectedDayIndex > index) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const addItem = (dayIndex: number) => {
    const newItem: ScheduleItem = {
      time: "20:00 - 02:00",
      title: "New Activity",
      description: "",
    };
    const newDays = content.days.map((day, i) =>
      i === dayIndex ? { ...day, items: [...day.items, newItem] } : day
    );
    onChange({ ...content, days: newDays });
  };

  const updateItem = (dayIndex: number, itemIndex: number, updates: Partial<ScheduleItem>) => {
    const newDays = content.days.map((day, i) =>
      i === dayIndex
        ? {
            ...day,
            items: day.items.map((item, j) =>
              j === itemIndex ? { ...item, ...updates } : item
            ),
          }
        : day
    );
    onChange({ ...content, days: newDays });
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    const newDays = content.days.map((day, i) =>
      i === dayIndex
        ? { ...day, items: day.items.filter((_, j) => j !== itemIndex) }
        : day
    );
    onChange({ ...content, days: newDays });
  };

  const selectedDay = selectedDayIndex !== null ? content.days[selectedDayIndex] : null;

  return (
    <div className="space-y-6">
      {/* Days List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Days</label>
          <button
            type="button"
            onClick={addDay}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Day
          </button>
        </div>

        {content.days.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500 text-sm">No days added yet. Click &quot;Add Day&quot; to create your schedule.</p>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {content.days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedDayIndex(index)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  selectedDayIndex === index
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{day.label || `Day ${index + 1}`}</span>
                <span className="text-xs opacity-75">({day.items.length})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Day Editor */}
      {selectedDay && selectedDayIndex !== null && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedDay.label}
                  onChange={(e) => updateDay(selectedDayIndex, { label: e.target.value })}
                  placeholder="e.g., Thursday"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDay.date}
                  onChange={(e) => updateDay(selectedDayIndex, { date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeDay(selectedDayIndex)}
              className="mt-3 text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Day
            </button>
          </div>

          {/* Schedule Items */}
          <div className="p-4 space-y-3">
            {selectedDay.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateItem(selectedDayIndex, itemIndex, { time: e.target.value })}
                      placeholder="18:00 - 06:00"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(selectedDayIndex, itemIndex, { title: e.target.value })}
                      placeholder="Milonga"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) => updateItem(selectedDayIndex, itemIndex, { description: e.target.value })}
                      placeholder="Optional description"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(selectedDayIndex, itemIndex)}
                    className="mt-5 p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addItem(selectedDayIndex)}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-rose-500 hover:text-rose-500 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
