"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/cognito/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email,
          password,
          fullName,
          organizationName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Move to verification step
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
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
          code: verificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Auto-login after verification
      const loginRes = await fetch("/api/auth/cognito/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signin",
          email,
          password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        router.push(loginData.redirect || "/dashboard");
      } else {
        // Verification succeeded but login failed - redirect to login page
        router.push("/login?verified=true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

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

      setError("Verification code resent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-2xl">4Tango</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          {step === "signup" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Create your account
              </h1>
              <p className="text-gray-500 text-center mb-6">
                Start managing your tango events today
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your organization or event name"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must include uppercase, lowercase, and numbers
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Verify your email
              </h1>
              <p className="text-gray-500 text-center mb-6">
                We sent a verification code to <strong>{email}</strong>
              </p>

              {error && (
                <div className={`mb-6 p-4 rounded-xl ${error.includes("resent") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}>
                  <p className={`text-sm ${error.includes("resent") ? "text-green-600" : "text-red-600"}`}>{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
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

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full text-rose-500 hover:text-rose-600 py-2 font-medium transition"
                >
                  Resend code
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-rose-500 hover:text-rose-600 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
