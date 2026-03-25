"use client";

import Link from "next/link";
import { useState } from "react";
import { SECTION_TYPES, SectionType, SectionTypeInfo, getDefaultContent } from "@/lib/section-types";

// Mock event data
const mockEvent = {
  id: "1",
  title: "Spring Tango Marathon",
  slug: "spring-tango-marathon-2026",
  primaryColor: "#f43f5e",
};

// Mock sections data
const mockSections = [
  {
    id: "s1",
    type: "HERO" as SectionType,
    order: 0,
    title: null,
    content: {
      title: "Spring Tango Marathon",
      subtitle: "Three days of non-stop tango in the heart of Barcelona",
      ctaText: "Register Now",
      overlay: "dark",
    },
    isVisible: true,
  },
  {
    id: "s2",
    type: "ABOUT" as SectionType,
    order: 1,
    title: "About This Event",
    content: {
      content: "Join us for an unforgettable tango experience!",
      images: [],
    },
    isVisible: true,
  },
  {
    id: "s3",
    type: "SCHEDULE" as SectionType,
    order: 2,
    title: "Schedule",
    content: {
      days: [
        {
          date: "2026-04-15",
          label: "Friday",
          items: [{ time: "18:00 - 06:00", title: "Opening Milonga" }],
        },
      ],
    },
    isVisible: true,
  },
];

interface Section {
  id: string;
  type: SectionType;
  order: number;
  title: string | null;
  content: Record<string, unknown>;
  isVisible: boolean;
}

export default function PageBuilderPage({ params }: { params: { id: string } }) {
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  void params;

  const event = mockEvent;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);

    // Update order values
    newSections.forEach((section, i) => {
      section.order = i;
    });

    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // In production, call API to save new order
  };

  const handleAddSection = (typeInfo: SectionTypeInfo) => {
    const newSection: Section = {
      id: `s${Date.now()}`,
      type: typeInfo.type,
      order: sections.length,
      title: typeInfo.name,
      content: getDefaultContent(typeInfo.type) as Record<string, unknown>,
      isVisible: true,
    };

    setSections([...sections, newSection]);
    setShowAddPanel(false);
    setSelectedSection(newSection);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const handleToggleVisibility = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
      )
    );
  };

  const getSectionIcon = (type: SectionType): string => {
    const icons: Record<SectionType, string> = {
      HERO: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      ABOUT: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      SCHEDULE: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      ACCOMMODATION: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      DJ_TEAM: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
      PHOTOGRAPHERS: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
      PRICING: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      GALLERY: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      CONTACT: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      CUSTOM_TEXT: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      CUSTOM_HTML: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    };
    return icons[type] || icons.CUSTOM_TEXT;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Section List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href={`/events/${event.id}`} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Event
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Page Builder</h1>
          <p className="text-gray-500 text-sm">{event.title}</p>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sections</h2>
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="text-rose-500 hover:text-rose-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Add Section Panel */}
          {showAddPanel && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Add Section</p>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_TYPES.map((typeInfo) => (
                  <button
                    key={typeInfo.type}
                    onClick={() => handleAddSection(typeInfo)}
                    className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-200 hover:border-rose-500 hover:bg-rose-50 transition text-left"
                  >
                    <svg className="w-5 h-5 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getSectionIcon(typeInfo.type)} />
                    </svg>
                    <span className="text-xs text-gray-700 truncate w-full text-center">{typeInfo.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section Items */}
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedSection(section)}
                className={`p-3 bg-white rounded-lg border cursor-pointer transition ${
                  selectedSection?.id === section.id
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-gray-200 hover:border-gray-300"
                } ${!section.isVisible ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Icon */}
                  <div className="w-8 h-8 bg-rose-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSectionIcon(section.type)} />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {section.title || SECTION_TYPES.find(t => t.type === section.type)?.name}
                    </p>
                    <p className="text-xs text-gray-500">{section.type}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(section.id); }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={section.isVisible ? "Hide section" : "Show section"}
                    >
                      {section.isVisible ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete section"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sections.length === 0 && !showAddPanel && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No sections yet</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                Add your first section
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href={`/${event.slug}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Preview Page
          </Link>
          <button className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition shadow-lg shadow-rose-500/25">
            Save Changes
          </button>
        </div>
      </div>

      {/* Right Panel - Section Editor */}
      <div className="flex-1 flex flex-col">
        {selectedSection ? (
          <>
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit {SECTION_TYPES.find(t => t.type === selectedSection.type)?.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {SECTION_TYPES.find(t => t.type === selectedSection.type)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSection(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl">
                {/* Section Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={selectedSection.title || ""}
                    onChange={(e) =>
                      setSelectedSection({ ...selectedSection, title: e.target.value })
                    }
                    placeholder="Enter section title..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Section-specific fields would go here */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">
                    Section-specific editor fields for {selectedSection.type} would appear here.
                    This includes:
                  </p>
                  <ul className="mt-2 text-gray-500 text-sm list-disc list-inside">
                    {selectedSection.type === "HERO" && (
                      <>
                        <li>Background image upload</li>
                        <li>Hero title and subtitle</li>
                        <li>CTA button text</li>
                        <li>Overlay style</li>
                      </>
                    )}
                    {selectedSection.type === "ABOUT" && (
                      <>
                        <li>Rich text content editor</li>
                        <li>Image gallery</li>
                      </>
                    )}
                    {selectedSection.type === "SCHEDULE" && (
                      <>
                        <li>Day management</li>
                        <li>Time slots editor</li>
                      </>
                    )}
                    {selectedSection.type === "DJ_TEAM" && (
                      <>
                        <li>Team member list</li>
                        <li>Photo uploads</li>
                        <li>Bio editor</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Raw content display for debugging */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (JSON)
                  </label>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedSection.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-gray-500">Select a section to edit</p>
              <p className="text-gray-400 text-sm mt-1">or add a new section from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
