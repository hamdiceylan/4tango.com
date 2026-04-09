"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  registrationStatus: string;
  paymentStatus: string;
  accessToken: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    city: string;
    country: string;
    startAt: string;
    endAt: string;
    logoUrl: string | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: "bg-yellow-100 text-yellow-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  WAITLIST: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  CHECKED_IN: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  REGISTERED: "Pending Review",
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  CONFIRMED: "Confirmed",
  WAITLIST: "Waitlist",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  CHECKED_IN: "Checked In",
};

export default function DancerRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dancerName, setDancerName] = useState("");

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await fetch("/api/dancer/registrations", {
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/dancer/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
          if (data.length > 0) {
            setDancerName(data[0].fullName);
          }
        }
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/dancer/auth/logout", { method: "POST", credentials: "include" });
    router.push("/dancer/login");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Registrations</h1>
          {dancerName && <p className="text-gray-500 text-sm">{dancerName}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Sign out
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <p className="text-gray-500">No registrations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const isEditable = !["REJECTED", "CANCELLED"].includes(reg.registrationStatus);
            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {reg.event.logoUrl && (
                      <img
                        src={reg.event.logoUrl}
                        alt={reg.event.title}
                        className="h-12 w-12 object-contain flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900">{reg.event.title}</h2>
                      <p className="text-gray-500 text-sm">
                        {reg.event.city}, {reg.event.country} &middot; {formatDate(reg.event.startAt)} - {formatDate(reg.event.endAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[reg.registrationStatus] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[reg.registrationStatus] || reg.registrationStatus}
                        </span>
                        <span className="text-gray-400 text-xs">&middot;</span>
                        <span className="text-gray-500 text-xs">
                          Registered {formatDate(reg.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {isEditable && (
                        <Link
                          href={`/dancer/registrations/${reg.id}/edit`}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition"
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/registration/${reg.accessToken}`}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
