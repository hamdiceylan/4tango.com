"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  helpText: string | null;
}

interface CustomFieldValue {
  id: string;
  fieldId: string;
  value: string;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
}

interface Registration {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  country: string | null;
  experience: string | null;
  notes: string | null;
  packageId: string | null;
  registrationStatus: string;
  paymentStatus: string;
  customFieldValues: CustomFieldValue[];
  event: {
    title: string;
    slug: string;
    city: string;
    country: string;
    startAt: string;
    endAt: string;
    logoUrl: string | null;
    formFields: FormField[];
    packages: Package[];
  };
  editability: {
    isReadOnly: boolean;
    isConfirmed: boolean;
    lockedFields: string[] | "all";
  };
}

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Croatia", "Czech Republic", "Denmark", "Finland", "France", "Germany",
  "Greece", "Hungary", "India", "Israel", "Italy", "Japan", "Mexico", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "Slovenia", "South Korea",
  "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom",
  "United States", "Uruguay",
].sort();

export default function EditRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const regId = params.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Editable core fields
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    city: "",
    country: "",
    experience: "",
    notes: "",
    packageId: "",
  });

  // Editable custom fields
  const [customFields, setCustomFields] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    async function fetchRegistration() {
      try {
        const res = await fetch(`/api/dancer/registrations/${regId}`, {
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/dancer/login");
          return;
        }
        if (!res.ok) {
          setError("Registration not found");
          setLoading(false);
          return;
        }
        const data: Registration = await res.json();
        setRegistration(data);

        // Initialize form data
        setFormData({
          fullName: data.fullName || "",
          role: data.role || "",
          city: data.city || "",
          country: data.country || "",
          experience: data.experience || "",
          notes: data.notes || "",
          packageId: data.packageId || "",
        });

        // Initialize custom fields from saved values
        const cfInit: Record<string, string | boolean> = {};
        data.event.formFields.forEach((field) => {
          const saved = data.customFieldValues.find((v) => v.fieldId === field.id);
          if (field.fieldType.toUpperCase() === "CHECKBOX") {
            cfInit[field.id] = saved?.value === "true";
          } else {
            cfInit[field.id] = saved?.value || "";
          }
        });
        setCustomFields(cfInit);
      } catch {
        setError("Failed to load registration");
      } finally {
        setLoading(false);
      }
    }
    fetchRegistration();
  }, [regId, router]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/dancer/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          customFields,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to save changes");
      }
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">{error}</p>
        <Link href="/dancer/registrations" className="text-rose-500 hover:underline mt-4 inline-block">
          Back to registrations
        </Link>
      </div>
    );
  }

  if (!registration) return null;

  const { editability } = registration;
  const isReadOnly = editability.isReadOnly;
  const isLocked = (field: string) => {
    if (isReadOnly) return true;
    if (editability.lockedFields === "all") return true;
    return editability.lockedFields.includes(field);
  };

  const experienceLevels = [
    { value: "1-2", label: "1-2 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "10+", label: "More than 10 years" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/dancer/registrations"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to registrations
      </Link>

      {/* Event header */}
      <div className="flex items-center gap-3 mb-6">
        {registration.event.logoUrl && (
          <img src={registration.event.logoUrl} alt="" className="h-12 w-12 object-contain" />
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{registration.event.title}</h1>
          <p className="text-gray-500 text-sm">Edit your registration details</p>
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-yellow-800 text-sm">This registration is {registration.registrationStatus.toLowerCase()} and cannot be edited.</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-green-800 text-sm">Changes saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Core fields */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

          {editability.isConfirmed && (
            <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Some fields are locked after confirmation. Contact the organizer to change them.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isLocked("fullNameSnapshot")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={registration.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isLocked("roleSnapshot")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="LEADER">Leader</option>
                  <option value="FOLLOWER">Follower</option>
                  <option value="SWITCH">Switch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  disabled={isLocked("experience")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {experienceLevels.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={isLocked("citySnapshot")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={isLocked("countrySnapshot")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {registration.event.packages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                <select
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  disabled={isLocked("packageId")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {registration.event.packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Custom fields */}
        {registration.event.formFields.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              {registration.event.formFields.map((field) => {
                const fieldType = field.fieldType.toUpperCase();
                const isFieldDisabled = isReadOnly;

                return (
                  <div key={field.id}>
                    {fieldType !== "CHECKBOX" && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                    )}

                    {(fieldType === "TEXT" || fieldType === "EMAIL" || fieldType === "TEL") && (
                      <input
                        type={fieldType === "EMAIL" ? "email" : fieldType === "TEL" ? "tel" : "text"}
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        placeholder={field.placeholder || ""}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    )}

                    {fieldType === "URL" && (
                      <input
                        type="url"
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        placeholder={field.placeholder || "https://..."}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    )}

                    {fieldType === "TEXTAREA" && (
                      <textarea
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        placeholder={field.placeholder || ""}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    )}

                    {(fieldType === "SELECT" || fieldType === "DROPDOWN") && (
                      <select
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {Array.isArray(field.options) && field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {fieldType === "RADIO" && (
                      <div className="space-y-2">
                        {Array.isArray(field.options) && field.options.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt.value}
                              checked={customFields[field.id] === opt.value}
                              onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                              disabled={isFieldDisabled}
                              className="text-rose-500 focus:ring-rose-500"
                            />
                            <span className="text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {fieldType === "CHECKBOX" && (
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={customFields[field.id] as boolean || false}
                          onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.checked })}
                          disabled={isFieldDisabled}
                          className="mt-1 text-rose-500 focus:ring-rose-500 rounded"
                        />
                        <span className="text-gray-700 text-sm">{field.label}</span>
                      </label>
                    )}

                    {fieldType === "DATE" && (
                      <input
                        type="date"
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    )}

                    {fieldType === "NUMBER" && (
                      <input
                        type="number"
                        value={customFields[field.id] as string || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [field.id]: e.target.value })}
                        disabled={isFieldDisabled}
                        placeholder={field.placeholder || ""}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                    )}

                    {field.helpText && <p className="text-gray-500 text-xs mt-1">{field.helpText}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={isReadOnly}
            placeholder="Any additional information or special requests..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        {/* Save button */}
        {!isReadOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-rose-500/25"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
