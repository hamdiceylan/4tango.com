"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Language } from "@/lib/i18n";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { getRegistrationTranslations } from "@/lib/i18n/registration-translations";

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  helpText: string | null;
  conditionalOn?: { fieldName: string; operator: string; value?: string } | null;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  primaryColor?: string | null;
  logoUrl?: string | null;
  formFields: FormField[];
  organizer: { name: string };
  availableLanguages?: string[];
}

export default function TransferPage() {
  const params = useParams();
  const lang = params.lang as string;
  const slug = params.slug as string;
  const t = getRegistrationTranslations(lang);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [customFields, setCustomFields] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/public/events/${slug}/transfer?lang=${lang}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setEvent(data);
        const init: Record<string, string | boolean> = {};
        data.formFields?.forEach((f: FormField) => {
          init[f.id] = f.fieldType.toUpperCase() === "CHECKBOX" ? false : "";
        });
        setCustomFields(init);
      } catch {
        setError("Transfer form not available");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, lang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setCustomFields({ ...customFields, [fieldId]: value });
    if (errors[fieldId]) setErrors({ ...errors, [fieldId]: "" });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = t.firstNameRequired;
    if (!formData.lastName.trim()) newErrors.lastName = t.lastNameRequired;
    if (!formData.email.trim()) newErrors.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.emailInvalid;

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
      const res = await fetch(`/api/public/events/${slug}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, customFields }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : lang, {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!event) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Request Submitted!</h1>
            <p className="text-gray-500">Thank you! The organizer will review your request and get in touch with you.</p>
            <Link href={`/${lang}/${slug}`} className="inline-block mt-6 text-rose-500 hover:underline text-sm">
              Back to event page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = event.primaryColor || "#f43f5e";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Event Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className={`flex ${event.logoUrl ? "items-center gap-4" : "flex-col"} flex-1`}>
              {event.logoUrl && (
                <img src={event.logoUrl} alt={event.title} className="h-16 w-16 object-contain flex-shrink-0" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.title}</h1>
                <p className="text-gray-500">
                  {event.city}, {event.country} &middot; {formatDate(event.startAt)} - {formatDate(event.endAt)}
                </p>
                <p className="text-rose-500 text-sm font-medium mt-1">Transfer Request</p>
              </div>
            </div>
            {(event.availableLanguages?.length ?? 0) > 1 && (
              <LanguageSelector
                currentLang={lang as Language}
                availableLanguages={(event.availableLanguages || [lang]) as Language[]}
                slug={`${event.slug}/transfer`}
                variant="compact"
                className="[&_button]:bg-gray-100 [&_button]:border-gray-200 [&_button]:hover:bg-gray-200 [&_svg]:text-gray-500"
              />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.personalInfo}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.firstName} <span className="text-rose-500">{t.required}</span>
                </label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.firstName ? "border-red-300" : "border-gray-200"}`} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.lastName} <span className="text-rose-500">{t.required}</span>
                </label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.lastName ? "border-red-300" : "border-gray-200"}`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.email} <span className="text-rose-500">{t.required}</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors.email ? "border-red-300" : "border-gray-200"}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+90 555 123 4567"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
            </div>
          </div>

          {/* Custom Fields */}
          {event.formFields && event.formFields.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h2>
              <div className="space-y-4">
                {event.formFields.map((field) => {
                  const fieldType = field.fieldType.toUpperCase();

                  // Conditional display
                  if (field.conditionalOn?.fieldName) {
                    const rule = field.conditionalOn;
                    const depField = event.formFields.find((f) => f.name === rule.fieldName);
                    const depValue = depField ? customFields[depField.id] : undefined;
                    const op = rule.operator || "notEmpty";
                    let show = true;
                    if (op === "equals") show = String(depValue) === rule.value;
                    else if (op === "notEquals") show = String(depValue) !== rule.value;
                    else if (op === "notEmpty") show = depValue !== "" && depValue !== false && depValue !== undefined;
                    if (!show) return null;
                  }

                  return (
                    <div key={field.id}>
                      {fieldType !== "CHECKBOX" && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.isRequired && <span className="text-rose-500">{t.required}</span>}
                        </label>
                      )}

                      {(fieldType === "TEXT" || fieldType === "EMAIL" || fieldType === "TEL") && (
                        <input type={fieldType === "EMAIL" ? "email" : fieldType === "TEL" ? "tel" : "text"}
                          value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`} />
                      )}

                      {fieldType === "TEXTAREA" && (
                        <textarea value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""} rows={3}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`} />
                      )}

                      {fieldType === "DATE" && (
                        <input type="date" value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`} />
                      )}

                      {fieldType === "SELECT" && (
                        <select value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`}>
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
                              <input type="radio" name={field.id} value={opt.value}
                                checked={customFields[field.id] === opt.value}
                                onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                                className="text-rose-500 focus:ring-rose-500" />
                              <span className="text-gray-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {fieldType === "CHECKBOX" && (
                        <label className="flex items-start gap-2">
                          <input type="checkbox" checked={customFields[field.id] as boolean || false}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
                            className="mt-1 text-rose-500 focus:ring-rose-500 rounded" />
                          <span className="text-gray-700 text-sm">
                            {field.label} {field.isRequired && <span className="text-rose-500">{t.required}</span>}
                          </span>
                        </label>
                      )}

                      {fieldType === "NUMBER" && (
                        <input type="number" value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`} />
                      )}

                      {fieldType === "URL" && (
                        <input type="url" value={customFields[field.id] as string || ""} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || "https://..."}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${errors[field.id] ? "border-red-300" : "border-gray-200"}`} />
                      )}

                      {field.helpText && <p className="text-gray-500 text-xs mt-1">{field.helpText}</p>}
                      {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isSubmitting}
            className="w-full text-white py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}>
            {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          {t.poweredBy} <Link href={`/${lang}`} className="hover:underline" style={{ color: primaryColor }}>4Tango</Link>
        </p>
      </div>
    </div>
  );
}
