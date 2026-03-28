"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface Event {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  status: string;
}

interface EventsContextType {
  events: Event[];
  selectedEventId: string | null;
  selectedEvent: Event | undefined;
  loading: boolean;
  error: string | null;
  selectEvent: (eventId: string) => void;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | null>(null);

// Storage key includes a version to invalidate old cache
const STORAGE_KEY = "selectedEventId_v2";

export function EventsProvider({
  children,
  organizerId
}: {
  children: ReactNode;
  organizerId: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/events", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired, clear storage and let the layout handle redirect
          localStorage.removeItem(STORAGE_KEY);
          setEvents([]);
          return;
        }
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);

      // Validate and set selected event
      const storedKey = localStorage.getItem(STORAGE_KEY);
      let storedData: { eventId: string; organizerId: string } | null = null;

      try {
        if (storedKey) {
          storedData = JSON.parse(storedKey);
        }
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem(STORAGE_KEY);
      }

      // Only use stored event if it belongs to current organizer and exists in events
      if (
        storedData &&
        storedData.organizerId === organizerId &&
        data.find((e: Event) => e.id === storedData!.eventId)
      ) {
        setSelectedEventId(storedData.eventId);
      } else if (data.length > 0) {
        // Select first event and store it
        setSelectedEventId(data[0].id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          eventId: data[0].id,
          organizerId,
        }));
      } else {
        // No events, clear selection
        setSelectedEventId(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eventId,
      organizerId,
    }));
  }, [organizerId]);

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    await fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <EventsContext.Provider
      value={{
        events,
        selectedEventId,
        selectedEvent,
        loading,
        error,
        selectEvent,
        refreshEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
