"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Event {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  status: string;
  capacityLimit: number | null;
  registrationCount: number;
  coverImageUrl: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter !== "all" && event.status.toLowerCase() !== filter) return false;
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (startAt: string, endAt: string) => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("en-US", options);
    }
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", options)}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-gray-500">Manage all your tango events</p>
        </div>
        <Link
          href="/events/new"
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 rounded-xl font-medium transition capitalize ${
                filter === status
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-gray-600 font-medium px-6 py-4">Event</th>
              <th className="text-left text-gray-600 font-medium px-6 py-4">Date</th>
              <th className="text-left text-gray-600 font-medium px-6 py-4">Status</th>
              <th className="text-left text-gray-600 font-medium px-6 py-4">Registrations</th>
              <th className="text-right text-gray-600 font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 font-medium">{event.title}</p>
                    <p className="text-gray-500 text-sm">{event.city}, {event.country}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{formatDate(event.startAt, event.endAt)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : event.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-900">{event.registrationCount}</span>
                  {event.capacityLimit && (
                    <span className="text-gray-500"> / {event.capacityLimit}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/${event.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
            <Link
              href="/events/new"
              className="text-rose-500 hover:text-rose-600 font-medium mt-2 inline-block"
            >
              Create your first event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
