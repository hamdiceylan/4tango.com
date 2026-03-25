import Link from "next/link";

export default function PaymentSuccessPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Amount Paid</span>
            <span className="text-2xl font-bold text-gray-900">95 EUR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Confirmed</span>
          </div>
        </div>

        <Link
          href={`/${params.slug}/confirmation`}
          className="inline-flex items-center justify-center gap-2 w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-rose-500/25"
        >
          View Registration Details
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          A receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
}
