"use client";

import { useState } from "react";
import type { OrganizerRole } from "@prisma/client";
import { ROLE_DISPLAY_NAMES, canManageRole, getAssignableRoles } from "@/lib/permissions";

interface Member {
  id: string;
  email: string;
  fullName: string;
  role: OrganizerRole;
  createdAt: string;
}

interface MemberRowProps {
  member: Member;
  currentUserId: string;
  currentUserRole: OrganizerRole;
  onUpdate: () => void;
}

export default function MemberRow({
  member,
  currentUserId,
  currentUserRole,
  onUpdate,
}: MemberRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrganizerRole>(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isCurrentUser = member.id === currentUserId;
  const canManage = canManageRole(currentUserRole, member.role) && !isCurrentUser;
  const assignableRoles = getAssignableRoles(currentUserRole);

  const handleUpdateRole = async () => {
    if (selectedRole === member.role) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/team/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating role:", error);
      alert(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/team/members/${member.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      onUpdate();
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDelete(false);
    }
  };

  const getRoleBadgeColor = (role: OrganizerRole) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-700";
      case "ADMIN":
        return "bg-blue-100 text-blue-700";
      case "SITE_MANAGER":
        return "bg-green-100 text-green-700";
      case "FINANCE_MANAGER":
        return "bg-yellow-100 text-yellow-700";
      case "REGISTRATION_MANAGER":
        return "bg-orange-100 text-orange-700";
      case "VIEWER":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-rose-600 font-medium">
            {member.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{member.fullName}</p>
            {isCurrentUser && (
              <span className="text-xs text-gray-400">(you)</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as OrganizerRole)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
            >
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_DISPLAY_NAMES[r]}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateRole}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 disabled:bg-rose-300"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedRole(member.role);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                member.role
              )}`}
            >
              {ROLE_DISPLAY_NAMES[member.role]}
            </span>

            {canManage && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Edit role"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove member"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Team Member
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <strong>{member.fullName}</strong> from your team? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300"
              >
                {isSubmitting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
