"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { OrganizerRole } from "@prisma/client";
import { hasPermission, getAssignableRoles, ROLE_DISPLAY_NAMES } from "@/lib/permissions";
import MemberRow from "@/components/team/MemberRow";
import InviteMemberModal from "@/components/team/InviteMemberModal";

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: OrganizerRole;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: OrganizerRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

interface UserData {
  id: string;
  role: OrganizerRole;
}

export default function TeamSettingsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch user profile to get role
      const profileRes = await fetch("/api/auth/profile");
      if (!profileRes.ok) {
        router.push("/login");
        return;
      }
      const profileData = await profileRes.json();
      setUser({ id: profileData.id, role: profileData.role });

      // Check permission
      if (!hasPermission(profileData.role, "org:team:view")) {
        router.push("/dashboard");
        return;
      }

      // Fetch members and invitations in parallel
      const [membersRes, invitationsRes] = await Promise.all([
        fetch("/api/team/members"),
        fetch("/api/team/invitations"),
      ]);

      if (membersRes.ok) {
        setMembers(await membersRes.json());
      }

      if (invitationsRes.ok) {
        setInvitations(await invitationsRes.json());
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelInvitation = async (id: string) => {
    try {
      const res = await fetch(`/api/team/invitations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== id));
      }
    } catch (error) {
      console.error("Error cancelling invitation:", error);
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const res = await fetch(`/api/team/invitations/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canInvite = hasPermission(user.role, "org:team:invite");
  const assignableRoles = getAssignableRoles(user.role);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500 mt-1">
          Manage team members and their access levels
        </p>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Team Members ({members.length})
          </h2>
          {canInvite && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        <div>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              currentUserId={user.id}
              currentUserRole={user.role}
              onUpdate={fetchData}
            />
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Pending Invitations ({invitations.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {invitation.email}
                    </p>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {ROLE_DISPLAY_NAMES[invitation.role]}
                    </span>
                    {invitation.isExpired && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Invited by {invitation.invitedBy} &middot;{" "}
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResendInvitation(invitation.id)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          assignableRoles={assignableRoles}
          onClose={() => setShowInviteModal(false)}
          onInvite={fetchData}
        />
      )}
    </div>
  );
}
