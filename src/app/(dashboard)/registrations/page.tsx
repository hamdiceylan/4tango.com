"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  country: string | null;
  registrationStatus: string;
  paymentStatus: string;
  event: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const response = await fetch("/api/registrations");
        if (response.ok) {
          const data = await response.json();
          setRegistrations(data);
        }
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    if (statusFilter !== "all" && reg.registrationStatus.toLowerCase() !== statusFilter) return false;
    if (roleFilter !== "all" && reg.role.toLowerCase() !== roleFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      if (!reg.fullName.toLowerCase().includes(searchLower) &&
          !reg.email.toLowerCase().includes(searchLower) &&
          !reg.event.title.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.registrationStatus === "CONFIRMED").length,
    pending: registrations.filter(r => r.registrationStatus === "REGISTERED").length,
    waitlist: registrations.filter(r => r.registrationStatus === "WAITLIST").length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Registrations</h1>
        <p className="text-gray-500">Manage registrations across all your events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">Waitlist</p>
          <p className="text-2xl font-bold text-gray-600">{stats.waitlist}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="registered">Pending</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Roles</option>
              <option value="leader">Leaders</option>
              <option value="follower">Followers</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-gray-600 font-medium px-6 py-3">Dancer</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Event</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Role</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Country</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Status</th>
              <th className="text-left text-gray-600 font-medium px-6 py-3">Registered</th>
              <th className="text-right text-gray-600 font-medium px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900 font-medium">{reg.fullName}</p>
                    <p className="text-gray-500 text-sm">{reg.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/events/${reg.event.id}`} className="text-rose-500 hover:text-rose-600 hover:underline">
                    {reg.event.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reg.role === "LEADER" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                  }`}>
                    {reg.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{reg.country || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reg.registrationStatus === "CONFIRMED" ? "bg-green-100 text-green-700" :
                    reg.registrationStatus === "REGISTERED" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {reg.registrationStatus === "REGISTERED" ? "Pending" : reg.registrationStatus.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(reg.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" title="Send email">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition" title="More options">
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

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {registrations.length === 0 ? "No registrations yet" : "No registrations found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
