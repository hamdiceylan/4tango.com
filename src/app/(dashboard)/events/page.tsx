"use client";

import Link from "next/link";
import { useState } from "react";

// Mock data
const mockEvents = [
  {
    id: "1",
    title: "Spring Tango Marathon",
    slug: "spring-tango-marathon-2026",
    date: "Apr 15-17, 2026",
    location: "Barcelona, Spain",
    status: "published",
    registrations: 127,
    paid: 98,
    capacity: 150,
    price: 95,
    currency: "EUR",
  },
  {
    id: "2",
    title: "Summer Milonga Night",
    slug: "summer-milonga-2026",
    date: "Jun 20, 2026",
    location: "Madrid, Spain",
    status: "draft",
    registrations: 0,
    paid: 0,
    capacity: 80,
    price: 25,
    currency: "EUR",
  },
  {
    id: "3",
    title: "Autumn Tango Festival",
    slug: "autumn-tango-festival-2026",
    date: "Oct 10-12, 2026",
    location: "Lisbon, Portugal",
    status: "published",
    registrations: 45,
    paid: 32,
    capacity: 100,
    price: 120,
    currency: "EUR",
  },
];

export default function EventsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEvents = mockEvents.filter((event) => {
    if (filter !== "all" && event.status !== filter) return false;
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
              <th className="text-left text-gray-600 font-medium px-6 py-4">Revenue</th>
              <th className="text-right text-gray-600 font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 font-medium">{event.title}</p>
                    <p className="text-gray-500 text-sm">{event.location}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{event.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-900">{event.registrations}</span>
                  <span className="text-gray-500"> / {event.capacity}</span>
                  <span className="text-green-600 ml-2">({event.paid} paid)</span>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {(event.paid * event.price).toLocaleString()} {event.currency}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                    >
                      Manage
                    </Link>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
