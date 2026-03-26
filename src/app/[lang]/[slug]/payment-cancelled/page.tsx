import Link from "next/link";

interface PaymentCancelledPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export default async function PaymentCancelledPage({ params }: PaymentCancelledPageProps) {
  const { lang, slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was not completed. No charges have been made to your account.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <p className="text-gray-600 text-sm">
            If you experienced any issues during checkout, please try again or contact us for assistance.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/${lang}/${slug}/register`}
            className="inline-flex items-center justify-center gap-2 w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-rose-500/25"
          >
            Try Again
          </Link>

          <Link
            href={`/${lang}/${slug}`}
            className="inline-flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
          >
            Back to Event
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Need help? <Link href="/contact" className="text-rose-500 hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}
