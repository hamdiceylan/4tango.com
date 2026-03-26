"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingData {
  eventTitle: string;
  eventDescription: string;
  city: string;
  country: string;
  venueName: string;
  startDate: string;
  endDate: string;
  currency: string;
  priceAmount: string;
  capacityLimit: string;
}

const STEPS = [
  { id: 1, name: "Welcome", description: "Get started with 4Tango" },
  { id: 2, name: "Event Basics", description: "Name and describe your event" },
  { id: 3, name: "Date & Location", description: "When and where" },
  { id: 4, name: "Review", description: "Confirm and create" },
];

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Croatia", "Czech Republic", "Denmark", "Finland", "France", "Germany",
  "Greece", "Hungary", "India", "Israel", "Italy", "Japan", "Mexico", "Netherlands",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "Slovenia", "South Korea",
  "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom",
  "United States", "Uruguay"
].sort();

const CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
];

export default function OnboardingWizard({ userName }: { userName: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [data, setData] = useState<OnboardingData>({
    eventTitle: "",
    eventDescription: "",
    city: "",
    country: "",
    venueName: "",
    startDate: "",
    endDate: "",
    currency: "EUR",
    priceAmount: "",
    capacityLimit: "",
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return data.eventTitle.trim().length > 0;
      case 3:
        return data.city && data.country && data.startDate && data.endDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the event
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.eventTitle,
          description: data.eventDescription,
          city: data.city,
          country: data.country,
          venueName: data.venueName,
          startAt: new Date(data.startDate).toISOString(),
          endAt: new Date(data.endDate).toISOString(),
          currency: data.currency,
          priceAmount: data.priceAmount ? Math.round(parseFloat(data.priceAmount) * 100) : 0,
          capacityLimit: data.capacityLimit ? parseInt(data.capacityLimit) : null,
          status: "DRAFT",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      const event = await response.json();

      // Mark onboarding as completed
      await fetch("/api/auth/onboarding-complete", {
        method: "POST",
      });

      // Redirect to the event page
      router.push(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-8">
        <div className="mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold">4T</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome, {userName.split(" ")[0]}!</h2>
          <p className="text-gray-500 text-sm mt-1">Let us set up your first event</p>
        </div>

        <nav className="space-y-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                step.id === currentStep
                  ? "bg-rose-50"
                  : step.id < currentStep
                  ? "bg-green-50"
                  : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.id < currentStep
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-rose-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${step.id === currentStep ? "text-rose-600" : "text-gray-900"}`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your First Event</h1>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                In just a few steps, you will have your tango event ready to accept registrations.
              </p>
              <div className="grid grid-cols-3 gap-6 text-left max-w-lg mx-auto">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Custom Pages</h3>
                  <p className="text-xs text-gray-500 mt-1">Beautiful event pages</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Easy Registration</h3>
                  <p className="text-xs text-gray-500 mt-1">Custom forms</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Dancer Database</h3>
                  <p className="text-xs text-gray-500 mt-1">Know your community</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Event Basics */}
          {currentStep === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Basics</h1>
              <p className="text-gray-500 mb-8">Give your event a name and description.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.eventTitle}
                    onChange={(e) => updateData({ eventTitle: e.target.value })}
                    placeholder="e.g., Spring Tango Marathon 2026"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={data.eventDescription}
                    onChange={(e) => updateData({ eventDescription: e.target.value })}
                    placeholder="Tell dancers what makes your event special..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={data.currency}
                      onChange={(e) => updateData({ currency: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ({CURRENCIES.find(c => c.code === data.currency)?.symbol || "€"})
                    </label>
                    <input
                      type="number"
                      value={data.priceAmount}
                      onChange={(e) => updateData({ priceAmount: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity Limit
                  </label>
                  <input
                    type="number"
                    value={data.capacityLimit}
                    onChange={(e) => updateData({ capacityLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date & Location */}
          {currentStep === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Date & Location</h1>
              <p className="text-gray-500 mb-8">When and where will your event take place?</p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={data.startDate}
                      onChange={(e) => updateData({ startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={data.endDate}
                      onChange={(e) => updateData({ endDate: e.target.value })}
                      min={data.startDate}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.city}
                      onChange={(e) => updateData({ city: e.target.value })}
                      placeholder="e.g., Barcelona"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={data.country}
                      onChange={(e) => updateData({ country: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={data.venueName}
                    onChange={(e) => updateData({ venueName: e.target.value })}
                    placeholder="e.g., Hotel Arts Barcelona"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Event</h1>
              <p className="text-gray-500 mb-8">Make sure everything looks good before creating your event.</p>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">{data.eventTitle || "Untitled Event"}</h2>
                  {data.eventDescription && (
                    <p className="text-gray-500 mt-2">{data.eventDescription}</p>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium text-gray-900">
                        {data.startDate && data.endDate
                          ? `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {data.city && data.country ? `${data.city}, ${data.country}` : "Not set"}
                        {data.venueName && <span className="text-gray-500"> ({data.venueName})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium text-gray-900">
                        {data.priceAmount
                          ? `${CURRENCIES.find(c => c.code === data.currency)?.symbol}${data.priceAmount}`
                          : "Free"}
                      </p>
                    </div>
                  </div>

                  {data.capacityLimit && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium text-gray-900">{data.capacityLimit} dancers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                Your event will be created as a draft. You can customize the page, add a schedule, and publish when ready.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition shadow-lg shadow-rose-500/25 disabled:shadow-none"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold rounded-xl transition shadow-lg shadow-rose-500/25 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
