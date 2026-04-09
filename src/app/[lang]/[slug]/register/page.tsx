"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Language } from "@/lib/i18n";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { getRegistrationTranslations } from "@/lib/i18n/registration-translations";

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
  options: (string | { label: string; value: string })[] | null;
  placeholder: string | null;
  helpText: string | null;
  order: number;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  priceAmount: number;
  currency: string;
  primaryColor?: string | null;
  logoUrl?: string | null;
  formFields: FormField[];
  packages: Package[];
  organizer: {
    name: string;
  };
  availableLanguages?: string[];
  defaultLanguage?: string;
}

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Croatia", "Czech Republic", "Denmark", "Finland", "France", "Germany",
  "Greece", "Hungary", "India", "Israel", "Italy", "Japan", "Mexico", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "Slovenia", "South Korea",
  "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom",
  "United States", "Uruguay"
].sort();

export default function RegisterPage() {
  const params = useParams();
  const lang = params.lang as string;
  const slug = params.slug as string;
  const router = useRouter();

  // Get translations for current language
  const t = getRegistrationTranslations(lang);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Core fields (always present)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    experience: "",
    city: "",
    country: "",
    packageId: "",
    comments: "",
    agreeToTerms: false,
  });

  // Custom fields (dynamic)
  const [customFields, setCustomFields] = useState<Record<string, string | boolean>>({});

  // Experience levels with translations
  const experienceLevels = [
    { value: "1-2", label: t.exp1to2 },
    { value: "3-5", label: t.exp3to5 },
    { value: "6-10", label: t.exp6to10 },
    { value: "10+", label: t.exp10plus },
  ];

  // Dance roles with translations
  const danceRoles = [
    { value: "LEADER", label: t.leader, color: "blue" },
    { value: "FOLLOWER", label: t.follower, color: "pink" },
    { value: "SWITCH", label: t.switch, color: "purple" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event data with language for localized content
        const eventRes = await fetch(`/api/public/events/${slug}?lang=${lang}`);
        if (!eventRes.ok) {
          throw new Error("Event not found");
        }
        const eventData = await eventRes.json();
        setEvent(eventData);

        // Initialize custom fields
        const initialCustomFields: Record<string, string | boolean> = {};
        eventData.formFields?.forEach((field: FormField) => {
          if (field.fieldType.toUpperCase() === "CHECKBOX") {
            initialCustomFields[field.id] = false;
          } else {
            initialCustomFields[field.id] = "";
          }
        });
        setCustomFields(initialCustomFields);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, lang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setCustomFields({ ...customFields, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t.firstNameRequired;
    if (!formData.lastName.trim()) newErrors.lastName = t.lastNameRequired;
    if (!formData.email.trim()) newErrors.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }
    if (!formData.role) newErrors.role = t.roleRequired;
    if (!formData.country) newErrors.country = t.countryRequired;
    if (!formData.city.trim()) newErrors.city = t.cityRequired;
    if (!formData.experience) newErrors.experience = t.experienceRequired;
    if (event?.packages && event.packages.length > 0 && !formData.packageId) {
      newErrors.packageId = t.packageRequired;
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = t.termsRequired;

    // Validate required custom fields
    event?.formFields?.forEach((field) => {
      if (field.isRequired && !customFields[field.id]) {
        newErrors[field.id] = `${field.label} ${t.fieldRequired}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          experience: formData.experience,
          city: formData.city,
          country: formData.country,
          packageId: formData.packageId || undefined,
          comments: formData.comments,
          customFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to confirmation page
      router.push(`/registration/${data.accessToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : lang, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Event not found"}</p>
          <Link href={`/${lang}`} className="text-rose-500 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  // Theme color
  const primaryColor = event.primaryColor || "#f43f5e";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Event Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className={`flex ${event.logoUrl ? 'items-center gap-4' : 'flex-col'} flex-1`}>
              {event.logoUrl && (
                <img
                  src={event.logoUrl}
                  alt={event.title}
                  className="h-16 w-16 object-contain flex-shrink-0"
                />
              )}
              <div className={event.logoUrl ? '' : 'text-center'}>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.title}</h1>
                <p className="text-gray-500">
                  {event.city}, {event.country} &middot; {formatDate(event.startAt)} - {formatDate(event.endAt)}
                </p>
              </div>
            </div>
            {(event.availableLanguages?.length ?? 0) > 1 && (
              <LanguageSelector
                currentLang={lang as Language}
                availableLanguages={(event.availableLanguages || [lang]) as Language[]}
                slug={`${event.slug}/register`}
                variant="compact"
                className="[&_button]:bg-gray-100 [&_button]:border-gray-200 [&_button]:hover:bg-gray-200 [&_svg]:text-gray-500"
              />
            )}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Personal & Tango Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.personalInfo}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.firstName} <span className="text-rose-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.firstName ? "border-red-300" : "border-gray-200"}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.lastName} <span className="text-rose-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.lastName ? "border-red-300" : "border-gray-200"}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.email} <span className="text-rose-500">{t.required}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.email ? "border-red-300" : "border-gray-200"}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.city} <span className="text-rose-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.city ? "border-red-300" : "border-gray-200"}`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.country} <span className="text-rose-500">{t.required}</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.country ? "border-red-300" : "border-gray-200"}`}
                >
                  <option value="">{t.selectCountry}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.danceRole} <span className="text-rose-500">{t.required}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {danceRoles.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
                      formData.role === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.experienceLevel} <span className="text-rose-500">{t.required}</span>
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.experience ? "border-red-300" : "border-gray-200"}`}
              >
                <option value="">{t.selectExperience}</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
          </div>

          {/* Packages (if any) */}
          {event.packages && event.packages.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t.selectPackage} <span className="text-rose-500">{t.required}</span>
              </h2>
              {errors.packageId && <p className="text-red-500 text-xs mb-3">{errors.packageId}</p>}
              <div className="space-y-3">
                {event.packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.packageId === pkg.id
                        ? ""
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={formData.packageId === pkg.id ? {
                      borderColor: primaryColor,
                      backgroundColor: `${primaryColor}10`,
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="packageId"
                        value={pkg.id}
                        checked={formData.packageId === pkg.id}
                        onChange={handleChange}
                        className="accent-current"
                        style={{ accentColor: primaryColor }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        {pkg.description && <p className="text-gray-500 text-sm">{pkg.description}</p>}
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {(pkg.price / 100).toFixed(0)} {pkg.currency}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields (if any) */}
          {event.formFields && event.formFields.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.additionalInfo}</h2>
              <div className="space-y-4">
                {event.formFields.map((field) => {
                  const fieldType = field.fieldType.toUpperCase();
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.isRequired && <span className="text-rose-500">{t.required}</span>}
                      </label>

                      {(fieldType === "TEXT" || fieldType === "EMAIL" || fieldType === "TEL" || fieldType === "PHONE") && (
                        <input
                          type={fieldType === "EMAIL" ? "email" : (fieldType === "TEL" || fieldType === "PHONE") ? "tel" : "text"}
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        />
                      )}

                      {fieldType === "URL" && (
                        <input
                          type="url"
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || "https://..."}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        />
                      )}

                      {fieldType === "TEXTAREA" && (
                        <textarea
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          rows={3}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        />
                      )}

                      {(fieldType === "SELECT" || fieldType === "DROPDOWN") && (
                        <select
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        >
                          <option value="">{field.placeholder || "Select..."}</option>
                          {Array.isArray(field.options) && field.options.map((opt: string | { label: string; value: string }) => {
                            const optValue = typeof opt === "string" ? opt : opt.value;
                            const optLabel = typeof opt === "string" ? opt : opt.label;
                            return <option key={optValue} value={optValue}>{optLabel}</option>;
                          })}
                        </select>
                      )}

                      {fieldType === "RADIO" && (
                        <div className="space-y-2">
                          {Array.isArray(field.options) && field.options.map((opt: string | { label: string; value: string }) => {
                            const optValue = typeof opt === "string" ? opt : opt.value;
                            const optLabel = typeof opt === "string" ? opt : opt.label;
                            return (
                              <label key={optValue} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={optValue}
                                  checked={customFields[field.id] === optValue}
                                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                                  className="text-rose-500 focus:ring-rose-500"
                                />
                                <span className="text-gray-700">{optLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {fieldType === "CHECKBOX" && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={customFields[field.id] as boolean || false}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
                            className="text-rose-500 focus:ring-rose-500 rounded"
                          />
                          <span className="text-gray-700">{field.placeholder || field.label}</span>
                        </label>
                      )}

                      {fieldType === "DATE" && (
                        <input
                          type="date"
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        />
                      )}

                      {fieldType === "NUMBER" && (
                        <input
                          type="number"
                          value={customFields[field.id] as string || ""}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}
                        />
                      )}

                      {field.helpText && <p className="text-gray-500 text-xs mt-1">{field.helpText}</p>}
                      {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.comments}</h2>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder={t.commentsPlaceholder}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Terms & Submit */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 text-rose-500 focus:ring-rose-500 rounded"
              />
              <span className="text-gray-700 text-sm">
                {t.termsText} <span className="text-rose-500">{t.required}</span>
              </span>
            </label>
            {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full text-white py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 15px -3px ${primaryColor}40`,
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.submitting}
                </>
              ) : (
                t.register
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          {t.poweredBy} <Link href={`/${lang}`} className="hover:underline" style={{ color: primaryColor }}>4Tango</Link>
        </p>
      </div>
    </div>
  );
}
