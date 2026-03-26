import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface RegistrationLookupPageProps {
  params: Promise<{ token: string }>;
}

export default async function RegistrationLookupPage({ params }: RegistrationLookupPageProps) {
  const resolvedParams = await params;
  const { token } = resolvedParams;

  // Find the registration by access token
  const registration = await prisma.registration.findUnique({
    where: { accessToken: token },
    include: {
      event: {
        include: {
          organizer: true,
        },
      },
    },
  });

  if (!registration) {
    notFound();
  }

  const event = registration.event;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate confirmation number
  const confirmationNumber = `4T-${registration.createdAt.getFullYear()}-${registration.id.slice(-6).toUpperCase()}`;

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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Registration</h1>
          <p className="text-gray-600">View your event registration details below.</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="bg-rose-500 text-white p-6">
            <p className="text-rose-100 text-sm mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold font-mono">{confirmationNumber}</p>
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
                  <span>{formatDate(event.startAt)} - {formatDate(event.endAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {event.venueName && `${event.venueName}, `}
                    {event.city}, {event.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Registration Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Your Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="text-gray-900 font-medium">{registration.fullNameSnapshot}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Role</p>
                  <p className="text-gray-900 font-medium">{registration.roleSnapshot}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-gray-900 font-medium">{registration.emailSnapshot}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="text-gray-900 font-medium">
                    {registration.citySnapshot && registration.countrySnapshot
                      ? `${registration.citySnapshot}, ${registration.countrySnapshot}`
                      : registration.countrySnapshot || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Payment & Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Payment & Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Amount</p>
                  <p className="text-gray-900 font-medium">
                    {registration.paymentAmount
                      ? `${(registration.paymentAmount / 100).toFixed(2)} ${event.currency}`
                      : `${(event.priceAmount / 100).toFixed(2)} ${event.currency}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    registration.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                    registration.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {registration.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Registration Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    registration.registrationStatus === "CONFIRMED" ? "bg-green-100 text-green-800" :
                    registration.registrationStatus === "REGISTERED" ? "bg-yellow-100 text-yellow-800" :
                    registration.registrationStatus === "WAITLIST" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {registration.registrationStatus === "REGISTERED" ? "Pending" : registration.registrationStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Registered On</p>
                  <p className="text-gray-900 font-medium">{formatDate(registration.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href={`/${event.slug}`}
            className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            View Event Page
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

        {/* Organizer Contact */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Need to make changes?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Contact the event organizer directly for any modifications or cancellations.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 font-semibold text-sm">
                {event.organizer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{event.organizer.name}</p>
              <a href={`mailto:${event.organizer.email}`} className="text-rose-500 text-sm hover:underline">
                {event.organizer.email}
              </a>
            </div>
          </div>
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
