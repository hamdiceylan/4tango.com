"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUploader from "@/components/page-builder/common/ImageUploader";

interface EventData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  city: string;
  country: string;
  venueName: string | null;
  address: string | null;
  startAt: string;
  endAt: string;
  currency: string;
  priceAmount: number;
  capacityLimit: number | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  contactEmail: string | null;
  status: string;
  djs: string[];
}

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    shortDescription: "",
    description: "",
    coverImageUrl: "",
    logoUrl: "",
    city: "",
    country: "",
    venueName: "",
    address: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    currency: "EUR",
    price: "",
    capacity: "",
    registrationOpens: "",
    registrationCloses: "",
    status: "DRAFT",
    djs: "",
    contactEmail: "",
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`, { credentials: "include" });
        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }
        const event: EventData = await res.json();

        // Parse dates
        const startAt = new Date(event.startAt);
        const endAt = new Date(event.endAt);
        const regOpens = event.registrationOpensAt ? new Date(event.registrationOpensAt) : null;
        const regCloses = event.registrationClosesAt ? new Date(event.registrationClosesAt) : null;

        setFormData({
          id: event.id,
          title: event.title,
          shortDescription: event.shortDescription || "",
          description: event.description || "",
          coverImageUrl: event.coverImageUrl || "",
          logoUrl: event.logoUrl || "",
          city: event.city,
          country: event.country,
          venueName: event.venueName || "",
          address: event.address || "",
          startDate: startAt.toISOString().split("T")[0],
          startTime: startAt.toTimeString().slice(0, 5),
          endDate: endAt.toISOString().split("T")[0],
          endTime: endAt.toTimeString().slice(0, 5),
          currency: event.currency,
          price: event.priceAmount ? (event.priceAmount / 100).toString() : "",
          capacity: event.capacityLimit?.toString() || "",
          registrationOpens: regOpens ? regOpens.toISOString().split("T")[0] : "",
          registrationCloses: regCloses ? regCloses.toISOString().split("T")[0] : "",
          status: event.status,
          djs: event.djs?.join(", ") || "",
          contactEmail: event.contactEmail || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Combine date and time
      const startAt = formData.startTime
        ? `${formData.startDate}T${formData.startTime}:00`
        : `${formData.startDate}T00:00:00`;
      const endAt = formData.endTime
        ? `${formData.endDate}T${formData.endTime}:00`
        : `${formData.endDate}T23:59:59`;

      const response = await fetch(`/api/events/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription || null,
          description: formData.description || null,
          city: formData.city,
          country: formData.country,
          venueName: formData.venueName || null,
          address: formData.address || null,
          startAt,
          endAt,
          priceAmount: formData.price ? Math.round(parseFloat(formData.price) * 100) : 0,
          currency: formData.currency,
          capacityLimit: formData.capacity ? parseInt(formData.capacity) : null,
          registrationOpensAt: formData.registrationOpens ? `${formData.registrationOpens}T00:00:00` : null,
          registrationClosesAt: formData.registrationCloses ? `${formData.registrationCloses}T23:59:59` : null,
          status: formData.status,
          djs: formData.djs ? formData.djs.split(",").map(dj => dj.trim()).filter(Boolean) : [],
          coverImageUrl: formData.coverImageUrl || null,
          logoUrl: formData.logoUrl || null,
          contactEmail: formData.contactEmail || null,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event");
      }

      router.push(`/events/${formData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/events/${formData.id}`} className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DJs / Artists</label>
              <input
                type="text"
                name="djs"
                value={formData.djs}
                onChange={handleChange}
                placeholder="DJ Name 1, DJ Name 2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">Separate multiple names with commas</p>
            </div>
          </div>
        </div>

        {/* Event Images */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Logo</label>
              <ImageUploader
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                category="event"
                aspectRatio="square"
                placeholder="Upload event logo"
              />
              <p className="text-gray-500 text-sm mt-2">Square image, displayed in navigation and forms</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <ImageUploader
                value={formData.coverImageUrl}
                onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
                category="event"
                aspectRatio="video"
                placeholder="Upload cover image"
              />
              <p className="text-gray-500 text-sm mt-2">16:9 aspect ratio, used as hero background</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
              <input
                type="text"
                name="venueName"
                value={formData.venueName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Settings</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email for Notifications</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="Email to receive registration notifications"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">If empty, notifications go to your account email.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Opens</label>
              <input
                type="date"
                name="registrationOpens"
                value={formData.registrationOpens}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Closes</label>
              <input
                type="date"
                name="registrationCloses"
                value={formData.registrationCloses}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Capacity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Publish Status</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={formData.status === "DRAFT"}
                onChange={handleChange}
                className="w-5 h-5 text-rose-500 focus:ring-rose-500"
              />
              <div>
                <p className="text-gray-900 font-medium">Draft</p>
                <p className="text-gray-500 text-sm">Hidden from public</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="PUBLISHED"
                checked={formData.status === "PUBLISHED"}
                onChange={handleChange}
                className="w-5 h-5 text-rose-500 focus:ring-rose-500"
              />
              <div>
                <p className="text-gray-900 font-medium">Published</p>
                <p className="text-gray-500 text-sm">Visible and accepting registrations</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="CLOSED"
                checked={formData.status === "CLOSED"}
                onChange={handleChange}
                className="w-5 h-5 text-rose-500 focus:ring-rose-500"
              />
              <div>
                <p className="text-gray-900 font-medium">Closed</p>
                <p className="text-gray-500 text-sm">Visible but not accepting registrations</p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-500/25"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <Link href={`/events/${formData.id}`} className="px-8 py-3 text-gray-500 hover:text-gray-900 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
