"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-2xl">4Tango</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 mb-6">
            We sent a magic link to<br />
            <span className="text-gray-900 font-medium">{email}</span>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600 text-sm">Click the link in the email to sign in. The link will expire in 10 minutes.</p>
          </div>

        </div>

        <div className="mt-8">
          <p className="text-gray-500 text-sm mb-4">
            Did not receive the email?{" "}
            <button className="text-rose-500 hover:text-rose-600 font-medium transition">Resend</button>
          </p>
          <Link href="/login" className="text-gray-500 text-sm hover:text-gray-700 transition">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-rose-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
