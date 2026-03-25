"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Sol de Invierno event data
const mockEvent = {
  id: "1",
  title: "Sol de Invierno Tango Marathon",
  slug: "sol-de-invierno-2025",
  startDate: "7 November 2025",
  endDate: "11 November 2025",
  city: "Antalya",
  country: "Turkey",
  venueName: "Mukarnas Resort & Spa",
};

const packages = [
  { id: "pkg1", name: "DOUBLE ROOM - 4 Nights", price: 420, currency: "EUR" },
  { id: "pkg2", name: "DOUBLE ROOM - 3 Nights", price: 360, currency: "EUR" },
  { id: "pkg3", name: "SINGLE ROOM - 4 Nights", price: 675, currency: "EUR" },
  { id: "pkg4", name: "SINGLE ROOM - 3 Nights", price: 570, currency: "EUR" },
];

const experienceLevels = [
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "More than 10 years" },
];

export default function RegisterPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("package") || "";

  const event = mockEvent;
  void params;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    // Tango Info
    role: "",
    experience: "",
    // Package & Dates
    packageId: preselectedPackage,
    checkInDate: "",
    checkOutDate: "",
    // Additional Info
    airportTransfer: false,
    previousMarathons: "",
    facebookUrl: "",
    photoConsent: false,
    // Terms
    agreeToTerms: false,
  });

  const selectedPackage = packages.find(p => p.id === formData.packageId);

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

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.role) newErrors.role = "Please select your dance role";
      if (!formData.experience) newErrors.experience = "Please select your experience level";
    }

    if (currentStep === 2) {
      if (!formData.packageId) newErrors.packageId = "Please select a package";
      if (!formData.checkInDate) newErrors.checkInDate = "Please select check-in date";
      if (!formData.checkOutDate) newErrors.checkOutDate = "Please select check-out date";
    }

    if (currentStep === 3) {
      if (!formData.photoConsent) newErrors.photoConsent = "Photo consent is required";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep(1)) setStep(2);
      return;
    }

    if (step === 2) {
      if (validateStep(2)) setStep(3);
      return;
    }

    if (!validateStep(3)) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/${event.slug}/confirmation`);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Header */}
      <header className="bg-[#0d0d1a] border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/${event.slug}`} className="text-white/60 hover:text-[#d4a853] transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to event
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Event Summary */}
        <div className="bg-[#2a2a3e] p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-4">
            <img
              src="https://www.inviernotangomarathon.com/assets/images/logo.png"
              alt="Sol de Invierno"
              className="h-14 w-auto flex-shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-lg font-light text-white tracking-wider">{event.title.toUpperCase()}</h1>
              <div className="flex items-center gap-3 text-white/50 text-sm mt-1">
                <span>{event.startDate} - {event.endDate}</span>
                <span>•</span>
                <span>{event.city}, {event.country}</span>
              </div>
            </div>
            {selectedPackage && (
              <div className="text-right">
                <p className="text-2xl font-light text-[#d4a853]">€{selectedPackage.price}</p>
                <p className="text-white/50 text-sm">per person</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 flex items-center justify-center font-light transition ${
                step >= s ? "bg-[#d4a853] text-[#1a1a2e]" : "bg-white/10 text-white/50"
              }`}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-px mx-2 ${step > s ? "bg-[#d4a853]" : "bg-white/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-center gap-8 mb-8 text-sm">
          <span className={step === 1 ? "text-[#d4a853]" : "text-white/50"}>Personal Info</span>
          <span className={step === 2 ? "text-[#d4a853]" : "text-white/50"}>Package & Dates</span>
          <span className={step === 3 ? "text-[#d4a853]" : "text-white/50"}>Final Details</span>
        </div>

        {/* Form */}
        <div className="bg-[#2a2a3e] p-8 border border-white/10">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-light text-white mb-6 tracking-wider">PERSONAL INFORMATION</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white focus:outline-none focus:border-[#d4a853] ${errors.firstName ? "border-red-500" : "border-white/20"}`}
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white focus:outline-none focus:border-[#d4a853] ${errors.lastName ? "border-red-500" : "border-white/20"}`}
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white placeholder-white/30 focus:outline-none focus:border-[#d4a853] ${errors.email ? "border-red-500" : "border-white/20"}`}
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Dance Role *</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["leader", "follower"].map((role) => (
                      <label
                        key={role}
                        className={`relative flex items-center justify-center p-4 border cursor-pointer transition ${
                          formData.role === role ? "border-[#d4a853] bg-[#d4a853]/10" : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formData.role === role}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className={`font-medium capitalize ${formData.role === role ? "text-[#d4a853]" : "text-white/70"}`}>
                          {role}
                        </span>
                        {formData.role === role && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#d4a853] flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#1a1a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Years Dancing Tango *</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white focus:outline-none focus:border-[#d4a853] ${errors.experience ? "border-red-500" : "border-white/20"}`}
                  >
                    <option value="" className="bg-[#1a1a2e]">Select your experience</option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value} className="bg-[#1a1a2e]">{level.label}</option>
                    ))}
                  </select>
                  {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Package & Dates */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-light text-white mb-6 tracking-wider">PACKAGE & DATES</h2>

                <div>
                  <label className="block text-sm text-white/70 mb-3">Select Package *</label>
                  <div className="grid grid-cols-1 gap-3">
                    {packages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className={`relative flex items-center justify-between p-4 border cursor-pointer transition ${
                          formData.packageId === pkg.id ? "border-[#d4a853] bg-[#d4a853]/10" : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="packageId"
                            value={pkg.id}
                            checked={formData.packageId === pkg.id}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                            formData.packageId === pkg.id ? "border-[#d4a853]" : "border-white/40"
                          }`}>
                            {formData.packageId === pkg.id && (
                              <div className="w-3 h-3 bg-[#d4a853]" />
                            )}
                          </div>
                          <span className={`font-medium ${formData.packageId === pkg.id ? "text-[#d4a853]" : "text-white/80"}`}>
                            {pkg.name}
                          </span>
                        </div>
                        <span className="font-medium text-[#d4a853]">€{pkg.price}</span>
                      </label>
                    ))}
                  </div>
                  {errors.packageId && <p className="text-red-400 text-sm mt-1">{errors.packageId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Check-in Date *</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white focus:outline-none focus:border-[#d4a853] ${errors.checkInDate ? "border-red-500" : "border-white/20"}`}
                    />
                    {errors.checkInDate && <p className="text-red-400 text-sm mt-1">{errors.checkInDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Check-out Date *</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1a1a2e] border text-white focus:outline-none focus:border-[#d4a853] ${errors.checkOutDate ? "border-red-500" : "border-white/20"}`}
                    />
                    {errors.checkOutDate && <p className="text-red-400 text-sm mt-1">{errors.checkOutDate}</p>}
                  </div>
                </div>

                <div className="bg-[#1a1a2e] border border-white/20 p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="airportTransfer"
                      checked={formData.airportTransfer}
                      onChange={handleChange}
                      className="w-5 h-5 bg-[#1a1a2e] border-white/40 text-[#d4a853] focus:ring-[#d4a853]"
                    />
                    <div>
                      <span className="font-medium text-white/90">I need airport transfer from Antalya Airport</span>
                      <p className="text-white/50 text-sm">Transfer can be arranged for an additional fee</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Final Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-light text-white mb-6 tracking-wider">FINAL DETAILS</h2>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Last 3 Marathons You Attended
                  </label>
                  <textarea
                    name="previousMarathons"
                    value={formData.previousMarathons}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Limerick Tango Marathon 2024, Abrazos Berlin 2024..."
                    className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#d4a853] resize-none"
                  />
                  <p className="text-white/50 text-sm mt-1">This helps us understand your marathon experience</p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Facebook Profile URL
                  </label>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourprofile"
                    className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#d4a853]"
                  />
                  <p className="text-white/50 text-sm mt-1">Your Facebook profile helps us verify your identity</p>
                </div>

                <div className={`bg-[#1a1a2e] border p-4 ${errors.photoConsent ? "border-red-500" : "border-white/20"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="photoConsent"
                      checked={formData.photoConsent}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 bg-[#1a1a2e] border-white/40 text-[#d4a853] focus:ring-[#d4a853]"
                    />
                    <span className="text-white/80">
                      I consent to being photographed during the event and having photos shared on social media and promotional materials. *
                    </span>
                  </label>
                  {errors.photoConsent && <p className="text-red-400 text-sm mt-2">{errors.photoConsent}</p>}
                </div>

                <div className={`bg-[#1a1a2e] border p-4 ${errors.agreeToTerms ? "border-red-500" : "border-white/20"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 bg-[#1a1a2e] border-white/40 text-[#d4a853] focus:ring-[#d4a853]"
                    />
                    <span className="text-white/80">
                      I agree to the <Link href="/terms" className="text-[#d4a853] hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-[#d4a853] hover:underline">Privacy Policy</Link>. I understand that a €100 deposit is required to secure my spot. *
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-400 text-sm mt-2">{errors.agreeToTerms}</p>}
                </div>

                {/* Order Summary */}
                {selectedPackage && (
                  <div className="bg-[#d4a853]/10 border border-[#d4a853]/30 p-6">
                    <h3 className="font-medium text-white mb-4 tracking-wider">ORDER SUMMARY</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">{selectedPackage.name}</span>
                        <span className="font-medium text-white">€{selectedPackage.price}</span>
                      </div>
                      <div className="border-t border-[#d4a853]/30 pt-3 mt-3">
                        <div className="flex justify-between text-base">
                          <span className="font-medium text-white">Total</span>
                          <span className="font-bold text-[#d4a853]">€{selectedPackage.price}</span>
                        </div>
                        <p className="text-white/50 text-xs mt-1">€100 deposit due now, balance due 30 days before event</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-white/60 hover:text-white transition font-medium"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#d4a853] hover:bg-[#c49843] disabled:bg-[#d4a853]/50 text-[#1a1a2e] px-8 py-3 font-semibold transition flex items-center gap-2 tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    PROCESSING...
                  </>
                ) : step < 3 ? (
                  <>
                    CONTINUE
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                ) : (
                  <>
                    COMPLETE REGISTRATION
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure payment via Stripe</span>
        </div>
      </div>
    </div>
  );
}
