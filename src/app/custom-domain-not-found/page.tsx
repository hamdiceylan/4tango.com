import Link from 'next/link';

export default function CustomDomainNotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Configured</h1>

        <p className="text-gray-600 mb-6">
          This domain is not currently connected to an event on 4Tango.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-medium text-gray-900 mb-2">Are you an event organizer?</h2>
          <p className="text-sm text-gray-600">
            If you&apos;re trying to connect this domain to your event, please check:
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>Your DNS settings are correctly configured</li>
            <li>The domain has been verified in your event settings</li>
            <li>The domain connection is active</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="https://4tango.com"
            className="block w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            Go to 4Tango
          </Link>
          <Link
            href="https://4tango.com/login"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
          >
            Organizer Login
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Powered by{' '}
        <Link href="https://4tango.com" className="text-rose-500 hover:underline">
          4Tango
        </Link>
      </p>
    </div>
  );
}
