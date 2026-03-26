"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/cognito/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Verification successful, go to login
      router.push("/login?message=Email verified! Please sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/cognito/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend",
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setMessage("Verification code sent! Check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Verify your email</h1>
          <p className="text-gray-500 text-center mb-6">
            We sent a verification code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                autoComplete="one-time-code"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition text-center text-2xl tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Did not receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-rose-500 hover:text-rose-600 font-medium transition disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
