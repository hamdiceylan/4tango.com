"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Language } from "@/lib/i18n";

interface DancerProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  city: string | null;
  country: string | null;
  profilePictureUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  socialLinks: { instagram?: string; facebook?: string } | null;
  preferences: { emailNotifications?: boolean } | null;
  createdAt: string;
}

interface Registration {
  id: string;
  accessToken: string;
  registrationStatus: string;
  paymentStatus: string;
  paymentAmount: number | null;
  roleSnapshot: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    city: string;
    country: string;
    startAt: string;
    endAt: string;
    coverImageUrl: string | null;
    status: string;
    organizerName: string;
  };
}

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Croatia", "Czech Republic", "Denmark", "Finland", "France", "Germany",
  "Greece", "Hungary", "India", "Israel", "Italy", "Japan", "Mexico", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "Slovenia", "South Korea",
  "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom",
  "United States", "Uruguay"
].sort();

export default function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<DancerProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "registrations" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "",
    city: "",
    country: "",
    bio: "",
    phoneNumber: "",
    websiteUrl: "",
    instagram: "",
    facebook: "",
    emailNotifications: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, registrationsRes] = await Promise.all([
          fetch("/api/dancer/profile"),
          fetch("/api/dancer/registrations"),
        ]);

        if (!profileRes.ok) {
          router.push("/login");
          return;
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        // Initialize edit form
        setEditForm({
          fullName: profileData.fullName || "",
          role: profileData.role || "",
          city: profileData.city || "",
          country: profileData.country || "",
          bio: profileData.bio || "",
          phoneNumber: profileData.phoneNumber || "",
          websiteUrl: profileData.websiteUrl || "",
          instagram: profileData.socialLinks?.instagram || "",
          facebook: profileData.socialLinks?.facebook || "",
          emailNotifications: profileData.preferences?.emailNotifications ?? true,
        });

        if (registrationsRes.ok) {
          const registrationsData = await registrationsRes.json();
          setRegistrations(registrationsData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/dancer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName,
          role: editForm.role,
          city: editForm.city || null,
          country: editForm.country || null,
          bio: editForm.bio || null,
          phoneNumber: editForm.phoneNumber || null,
          websiteUrl: editForm.websiteUrl || null,
          socialLinks: {
            instagram: editForm.instagram || undefined,
            facebook: editForm.facebook || undefined,
          },
          preferences: {
            emailNotifications: editForm.emailNotifications,
          },
        }),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "CHECKED_IN":
        return "bg-green-100 text-green-700";
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "REGISTERED":
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-700";
      case "WAITLIST":
        return "bg-orange-100 text-orange-700";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-gray-500 hover:text-rose-500 transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <Link
            href="/api/auth/logout"
            className="text-gray-500 hover:text-red-500 transition text-sm"
          >
            Sign out
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-rose-600 text-2xl font-bold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-gray-500">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  profile.role === "LEADER" ? "bg-blue-100 text-blue-700" :
                  profile.role === "FOLLOWER" ? "bg-pink-100 text-pink-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {profile.role}
                </span>
                {profile.city && profile.country && (
                  <span className="text-gray-500 text-sm">
                    {profile.city}, {profile.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { id: "profile" as const, label: "Profile" },
            { id: "registrations" as const, label: `Registrations (${registrations.length})` },
            { id: "settings" as const, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-rose-300 transition"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dance Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="LEADER">Leader</option>
                      <option value="FOLLOWER">Follower</option>
                      <option value="SWITCH">Switch</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={editForm.websiteUrl}
                      onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                      placeholder="https://"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                      placeholder="@username"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="text"
                      value={editForm.facebook}
                      onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                      placeholder="facebook.com/..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dance Role</p>
                    <p className="text-gray-900">{profile.role}</p>
                  </div>
                </div>
                {(profile.city || profile.country) && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900">
                      {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "registrations" && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                <p className="text-gray-500">You haven't registered for any events yet.</p>
                <Link
                  href={`/${lang}`}
                  className="mt-4 inline-block px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {reg.event.coverImageUrl ? (
                        <img
                          src={reg.event.coverImageUrl}
                          alt={reg.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{reg.event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {reg.event.city}, {reg.event.country} &middot;{" "}
                        {formatDate(reg.event.startAt)} - {formatDate(reg.event.endAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(reg.registrationStatus)}`}>
                          {reg.registrationStatus.replace("_", " ")}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Registered {formatDate(reg.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/registration/${reg.accessToken}`}
                      className="px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notifications</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editForm.emailNotifications}
                    onChange={(e) => {
                      setEditForm({ ...editForm, emailNotifications: e.target.checked });
                      // Auto-save notification preferences
                      fetch("/api/dancer/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          preferences: { emailNotifications: e.target.checked },
                        }),
                      });
                    }}
                    className="text-rose-500 focus:ring-rose-500 rounded"
                  />
                  <span className="text-gray-700">Receive email notifications about event updates</span>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-red-600 mb-3">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                      fetch("/api/dancer/profile", { method: "DELETE" }).then(() => {
                        router.push("/");
                      });
                    }
                  }}
                  className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
