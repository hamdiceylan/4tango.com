"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-500 mb-2">
          We sent a magic link to
        </p>
        {email && (
          <p className="font-medium text-gray-900 mb-4">{email}</p>
        )}
        <p className="text-gray-500 text-sm">
          Click the link in the email to access your registrations. The link expires in 15 minutes.
        </p>
        <Link
          href="/dancer/login"
          className="inline-block mt-6 text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
