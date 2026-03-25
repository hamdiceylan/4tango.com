import Link from "next/link";

// Mock event data
const mockEvent = {
  title: "Spring Tango Marathon",
  slug: "spring-tango-marathon-2026",
  startDate: "April 15, 2026",
  endDate: "April 17, 2026",
  city: "Barcelona",
  country: "Spain",
  venueName: "Sala Apolo",
  address: "Carrer Nou de la Rambla, 113",
  organizer: {
    name: "Tango Barcelona",
    email: "info@tangobarcelona.com",
  },
};

const mockRegistration = {
  confirmationNumber: "4T-2026-001234",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: "Leader",
  price: 95,
  currency: "EUR",
  status: "confirmed",
};

export default function ConfirmationPage({ params }: { params: { slug: string } }) {
  // In production, fetch registration by params.slug and confirmation ID
  const event = mockEvent;
  const registration = mockRegistration;
  void params; // Used for routing

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">4Tango</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for registering. We have sent a confirmation email to <span className="font-medium text-gray-900">{registration.email}</span>
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="bg-rose-500 text-white p-6">
            <p className="text-rose-100 text-sm mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold font-mono">{registration.confirmationNumber}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Event Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{event.title}</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{event.startDate} - {event.endDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span>{event.venueName}</span>
                    <span className="text-gray-400 mx-1">·</span>
                    <span>{event.city}, {event.country}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Registration Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Registration Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="text-gray-900 font-medium">{registration.firstName} {registration.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Role</p>
                  <p className="text-gray-900 font-medium">{registration.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-gray-900 font-medium">{registration.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Payment Summary */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Payment Summary</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Registration Fee</span>
                <span className="text-gray-900 font-semibold">{registration.price} {registration.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-rose-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Check Your Email</p>
                <p className="text-gray-600 text-sm">We have sent a confirmation email with all the event details and your ticket.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-rose-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Save the Date</p>
                <p className="text-gray-600 text-sm">Add the event to your calendar. We will send you a reminder before the event.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-rose-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Arrive Ready to Dance</p>
                <p className="text-gray-600 text-sm">Bring your confirmation email or ID to check in at the event.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${event.slug}`}
            className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Event
          </Link>
          <button
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Contact the organizer at{" "}
            <a href={`mailto:${event.organizer.email}`} className="text-rose-500 hover:underline">
              {event.organizer.email}
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">4T</span>
            </div>
            <span className="text-gray-500 text-sm">Powered by 4Tango</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
