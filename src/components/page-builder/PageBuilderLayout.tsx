"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SECTION_TYPES, SectionType, SectionTypeInfo, getDefaultContent } from "@/lib/section-types";
import { Language, DEFAULT_LANGUAGE, LANGUAGE_FLAGS } from "@/lib/i18n";
import { LocalizedInput } from "./LanguageTabs";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import ScheduleEditor from "./editors/ScheduleEditor";
import DjTeamEditor from "./editors/DjTeamEditor";
import GalleryEditor from "./editors/GalleryEditor";
import AccommodationEditor from "./editors/AccommodationEditor";
import ContactEditor from "./editors/ContactEditor";
import CustomTextEditor from "./editors/CustomTextEditor";
import PricingEditor from "./editors/PricingEditor";
import LivePreview from "./LivePreview";
import LanguageSettings from "./LanguageSettings";

interface Section {
  id: string;
  type: SectionType;
  order: number;
  title: string | Record<string, string> | null;
  content: Record<string, unknown>;
  isVisible: boolean;
}

// Helper to get localized string from title
function getLocalizedTitle(
  title: string | Record<string, string> | null | undefined,
  lang: Language
): string {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title[lang] || title["en"] || Object.values(title)[0] || "";
}

interface Event {
  id: string;
  title: string;
  slug: string;
  primaryColor: string | null;
  availableLanguages: Language[];
  defaultLanguage: Language;
}

interface PageBuilderLayoutProps {
  eventId: string;
}

export default function PageBuilderLayout({ eventId }: PageBuilderLayoutProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [titleEditLang, setTitleEditLang] = useState<Language>(DEFAULT_LANGUAGE);

  // Fetch event and sections
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, sectionsRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/sections`),
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent({
            id: eventData.id,
            title: eventData.title,
            slug: eventData.slug,
            primaryColor: eventData.primaryColor,
            availableLanguages: (eventData.availableLanguages || [DEFAULT_LANGUAGE]) as Language[],
            defaultLanguage: (eventData.defaultLanguage || DEFAULT_LANGUAGE) as Language,
          });
        }

        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json();
          setSections(sectionsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

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

    newSections.forEach((section, i) => {
      section.order = i;
    });

    setSections(newSections);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddSection = async (typeInfo: SectionTypeInfo) => {
    try {
      const res = await fetch(`/api/events/${eventId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeInfo.type,
          title: typeInfo.name,
          content: getDefaultContent(typeInfo.type),
          isVisible: true,
        }),
        credentials: "include",
      });

      if (res.ok) {
        const newSection = await res.json();
        setSections([...sections, newSection]);
        setShowAddPanel(false);
        setSelectedSection(newSection);
      }
    } catch (error) {
      console.error("Error adding section:", error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await fetch(`/api/events/${eventId}/sections/${sectionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSections(sections.filter((s) => s.id !== sectionId));
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null);
        }
      }
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleToggleVisibility = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    try {
      const res = await fetch(`/api/events/${eventId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !section.isVisible }),
        credentials: "include",
      });

      if (res.ok) {
        setSections(
          sections.map((s) =>
            s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
          )
        );
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Save section order
      await fetch(`/api/events/${eventId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionIds: sections.map((s) => s.id),
        }),
        credentials: "include",
      });

      // Save selected section content if any
      if (selectedSection) {
        await fetch(`/api/events/${eventId}/sections/${selectedSection.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: selectedSection.title,
            content: selectedSection.content,
          }),
          credentials: "include",
        });
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedSection = useCallback(
    (updates: Partial<Section>) => {
      if (!selectedSection) return;
      const updated = { ...selectedSection, ...updates };
      setSelectedSection(updated);
      setSections(sections.map((s) => (s.id === updated.id ? updated : s)));
      setHasChanges(true);
    },
    [selectedSection, sections]
  );

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

  const renderSectionEditor = () => {
    if (!selectedSection) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = selectedSection.content as any;
    const availableLanguages = event?.availableLanguages || [DEFAULT_LANGUAGE];

    switch (selectedSection.type) {
      case "HERO":
        return (
          <HeroEditor
            content={content as Parameters<typeof HeroEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "ABOUT":
        return (
          <AboutEditor
            content={content as Parameters<typeof AboutEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "SCHEDULE":
        return (
          <ScheduleEditor
            content={content as Parameters<typeof ScheduleEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "DJ_TEAM":
        return (
          <DjTeamEditor
            content={content as Parameters<typeof DjTeamEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "PHOTOGRAPHERS":
        return (
          <DjTeamEditor
            content={content as Parameters<typeof DjTeamEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "ACCOMMODATION":
        return (
          <AccommodationEditor
            content={content as Parameters<typeof AccommodationEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "PRICING":
        return (
          <PricingEditor
            content={content as Parameters<typeof PricingEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
            availableLanguages={availableLanguages}
          />
        );
      case "GALLERY":
        return (
          <GalleryEditor
            content={content as Parameters<typeof GalleryEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
          />
        );
      case "CONTACT":
        return (
          <ContactEditor
            content={content as Parameters<typeof ContactEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
          />
        );
      case "CUSTOM_TEXT":
        return (
          <CustomTextEditor
            content={content as Parameters<typeof CustomTextEditor>[0]["content"]}
            onChange={(c) => updateSelectedSection({ content: c as unknown as Record<string, unknown> })}
          />
        );
      case "CUSTOM_HTML":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
            <textarea
              value={(content.html as string) || ""}
              onChange={(e) => updateSelectedSection({ content: { ...content, html: e.target.value } })}
              placeholder="Enter your HTML code..."
              rows={12}
              className="w-full px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content (JSON)</label>
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateSelectedSection({ content: parsed });
                } catch {
                  // Invalid JSON
                }
              }}
              className="w-full h-64 px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading page builder...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500">Event not found</p>
          <Link href="/events" className="text-rose-500 hover:text-rose-600 mt-2 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Section List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Link
            href={`/events/${event.id}`}
            className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4"
          >
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
                    <svg
                      className="w-5 h-5 text-gray-500 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={getSectionIcon(typeInfo.type)}
                      />
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
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-rose-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={getSectionIcon(section.type)}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getLocalizedTitle(section.title, event?.defaultLanguage || DEFAULT_LANGUAGE) || SECTION_TYPES.find((t) => t.type === section.type)?.name}
                    </p>
                    <p className="text-xs text-gray-500">{section.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(section.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {section.isVisible ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
          {/* Languages Button */}
          <button
            onClick={() => setShowLanguageSettings(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Languages
            {event && event.availableLanguages.length > 1 && (
              <span className="ml-1 text-xs bg-blue-200 px-1.5 py-0.5 rounded">
                {event.availableLanguages.map(l => LANGUAGE_FLAGS[l]).join(' ')}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              showPreview
                ? "bg-rose-100 text-rose-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <Link
            href={`/${event.slug}?preview=true`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open Full Preview
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={saving || !hasChanges}
            className={`w-full px-4 py-2 rounded-lg font-medium transition shadow-lg ${
              hasChanges
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </button>
        </div>
      </div>

      {/* Main Content - Editor or Preview */}
      <div className="flex-1 flex">
        {/* Section Editor */}
        <div className={`flex-1 flex flex-col ${showPreview ? "w-1/2" : ""}`}>
          {selectedSection ? (
            <>
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Edit {SECTION_TYPES.find((t) => t.type === selectedSection.type)?.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {SECTION_TYPES.find((t) => t.type === selectedSection.type)?.description}
                    </p>
                  </div>
                  <button onClick={() => setSelectedSection(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl">
                  {/* Section Title - Localizable */}
                  <div className="mb-6">
                    <LocalizedInput
                      label="Section Title (shown in navigation)"
                      languages={event?.availableLanguages || [DEFAULT_LANGUAGE]}
                      currentLang={titleEditLang}
                      onLangChange={setTitleEditLang}
                      value={selectedSection.title || undefined}
                      onChange={(newTitle) => updateSelectedSection({ title: newTitle as unknown as string })}
                      placeholder="Enter section title..."
                      required={true}
                      helpText="This title appears in the navigation menu and section header"
                    />
                  </div>

                  {/* Section-specific editor */}
                  {renderSectionEditor()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <p className="text-gray-500">Select a section to edit</p>
                <p className="text-gray-400 text-sm mt-1">or add a new section from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="w-1/2 border-l border-gray-200">
            <LivePreview eventSlug={event.slug} />
          </div>
        )}
      </div>

      {/* Language Settings Modal */}
      {showLanguageSettings && event && (
        <LanguageSettings
          availableLanguages={event.availableLanguages}
          defaultLanguage={event.defaultLanguage}
          onUpdate={async (newAvailableLanguages, newDefaultLanguage) => {
            try {
              const res = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  availableLanguages: newAvailableLanguages,
                  defaultLanguage: newDefaultLanguage,
                }),
                credentials: "include",
              });
              if (res.ok) {
                setEvent({
                  ...event,
                  availableLanguages: newAvailableLanguages,
                  defaultLanguage: newDefaultLanguage,
                });
              }
            } catch (error) {
              console.error("Error updating language settings:", error);
            }
          }}
          onClose={() => setShowLanguageSettings(false)}
        />
      )}
    </div>
  );
}
