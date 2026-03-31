"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { OrganizerRole } from "@prisma/client";
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from "@/lib/permissions";

interface InvitationData {
  email: string;
  role: OrganizerRole;
  status: string;
  isValid: boolean;
  organizer: {
    name: string;
    logoUrl: string | null;
  };
  invitedBy: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/team/accept-invite?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid invitation");
          return;
        }

        setInvitation(data);
      } catch {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/team/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fullName: fullName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation?.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invitation {invitation?.status === "EXPIRED" ? "Expired" : "Used"}
          </h1>
          <p className="text-gray-600 mb-6">
            {invitation?.status === "EXPIRED"
              ? "This invitation has expired. Please request a new invitation from the organizer."
              : "This invitation has already been used."}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        {invitation.organizer.logoUrl && (
          <img
            src={invitation.organizer.logoUrl}
            alt={invitation.organizer.name}
            className="h-12 mx-auto mb-6"
          />
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join {invitation.organizer.name}
          </h1>
          <p className="text-gray-600">
            {invitation.invitedBy} has invited you to join as a{" "}
            <span className="font-medium">{ROLE_DISPLAY_NAMES[invitation.role]}</span>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Role permissions:</p>
          <p className="text-gray-700">{ROLE_DESCRIPTIONS[invitation.role]}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAccept}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={invitation.email}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isAccepting}
            className="w-full px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-rose-300 transition font-medium"
          >
            {isAccepting ? "Accepting..." : "Accept Invitation"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          By accepting, you agree to our{" "}
          <Link href="/terms" className="text-rose-500 hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
