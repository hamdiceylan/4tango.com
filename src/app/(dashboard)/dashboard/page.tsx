import Link from "next/link";

// Mock data - in production this would come from the database
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
  },
];

const stats = [
  { label: "Total Events", value: "3", change: "+1 this month" },
  { label: "Total Registrations", value: "172", change: "+23 this week" },
  { label: "Revenue", value: "12,450 EUR", change: "+2,100 EUR this week" },
  { label: "Dancers in Database", value: "156", change: "+18 new" },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is an overview of your events.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-green-600 text-sm">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
          <Link
            href="/events/new"
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-rose-500/25"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </Link>
        </div>

        <div className="grid gap-4">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{event.registrations}</span>
                      <span className="text-gray-500 text-sm ml-1">/ {event.capacity} registrations</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-green-600">{event.paid}</span>
                      <span className="text-gray-500 text-sm ml-1">paid</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <Link
                    href={`/events/${event.id}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                  >
                    Manage
                  </Link>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                    title="Copy public link"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                    title="More options"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/events/new"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-rose-300 transition group shadow-sm"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-200 transition">
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Create New Event</h3>
            <p className="text-gray-500 text-sm">Set up a new tango event</p>
          </Link>

          <Link
            href="/registrations"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition group shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">View All Registrations</h3>
            <p className="text-gray-500 text-sm">Manage your attendees</p>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition group shadow-sm"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Account Settings</h3>
            <p className="text-gray-500 text-sm">Manage your profile and billing</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
