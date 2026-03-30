import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">4Tango</span>
          </Link>
          <MobileNav />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm prose prose-gray max-w-none">
          <p className="text-gray-500 mb-8">Last updated: March 25, 2026</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing or using 4Tango (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 mb-4">
            4Tango is a platform that enables tango event organizers to create event pages, collect registrations, manage attendees, and process payments. Dancers can use the platform to discover and register for tango events.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Organizer Accounts</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must be at least 18 years old to create an organizer account</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Dancer Registrations</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>You must provide accurate information when registering for events</li>
            <li>Registration information is shared with event organizers</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Event Organizer Responsibilities</h2>
          <p className="text-gray-600 mb-4">As an event organizer, you agree to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Provide accurate event information</li>
            <li>Honor registrations and payments received through the platform</li>
            <li>Handle attendee data in compliance with applicable privacy laws</li>
            <li>Respond to attendee inquiries in a timely manner</li>
            <li>Comply with all local laws and regulations for your events</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Payments and Fees</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Payment processing is handled by Stripe</li>
            <li>4Tango charges a platform fee as specified in our pricing</li>
            <li>Organizers are responsible for setting their own refund policies</li>
            <li>4Tango is not responsible for disputes between organizers and attendees</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Refunds and Cancellations</h2>
          <p className="text-gray-600 mb-4">
            Refund policies are set by individual event organizers. If an event is cancelled, the organizer is responsible for processing refunds. 4Tango platform fees may not be refundable.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Prohibited Conduct</h2>
          <p className="text-gray-600 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Create fraudulent events or registrations</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Use the Service to distribute spam or malware</li>
            <li>Scrape or collect user data without permission</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            The 4Tango name, logo, and all related content are the property of 4Tango. You retain ownership of content you create on the platform, but grant us a license to display and distribute it as necessary to provide the Service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-4">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, 4TANGO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Termination</h2>
          <p className="text-gray-600 mb-4">
            We may terminate or suspend your account at any time for violations of these terms. You may close your account at any time by contacting us.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          <p className="text-gray-600 mb-4">
            These Terms shall be governed by the laws of the European Union. Any disputes shall be resolved in the courts of the applicable jurisdiction.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact</h2>
          <p className="text-gray-600 mb-4">
            For questions about these Terms, contact us at: <a href="mailto:legal@4tango.com" className="text-rose-500 hover:underline">legal@4tango.com</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">4T</span>
              </div>
              <span className="text-gray-500 text-sm">4Tango</span>
            </div>
            <div className="text-gray-500 text-sm">
              <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
              <span className="mx-2">·</span>
              <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
