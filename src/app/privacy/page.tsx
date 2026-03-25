import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">4Tango</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm prose prose-gray max-w-none">
          <p className="text-gray-500 mb-8">Last updated: March 25, 2026</p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            4Tango (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">For Event Organizers</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Name and email address</li>
            <li>Organization name</li>
            <li>Payment information (processed securely via Stripe)</li>
            <li>Event details you create</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">For Dancers (Event Registrants)</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Name and email address</li>
            <li>Dance role preference (leader/follower/switch)</li>
            <li>City and country</li>
            <li>Any additional information provided during registration</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">We use the collected information to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process event registrations and payments</li>
            <li>Send confirmation emails and event updates</li>
            <li>Enable organizers to manage their events and attendees</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Sharing</h2>
          <p className="text-gray-600 mb-4">
            We share your registration information with the event organizer for the event you register for. We do not sell your personal information to third parties.
          </p>
          <p className="text-gray-600 mb-4">We may share information with:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Event organizers (for registrations to their events)</li>
            <li>Payment processors (Stripe) for transaction processing</li>
            <li>Service providers who assist in operating our platform</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights (GDPR)</h2>
          <p className="text-gray-600 mb-4">If you are in the European Economic Area, you have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Cookies</h2>
          <p className="text-gray-600 mb-4">
            We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </p>
          <p className="text-gray-600 mb-4">
            Email: <a href="mailto:privacy@4tango.com" className="text-rose-500 hover:underline">privacy@4tango.com</a>
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
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
              <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
              <span className="mx-2">·</span>
              <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
