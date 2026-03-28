"use client";

import { useState, useEffect, useCallback } from "react";

interface DnsRecord {
  name: string;
  value: string;
}

interface CustomDomainState {
  hostname: string | null;
  status: "NONE" | "PENDING" | "DNS_VERIFIED" | "ACTIVE" | "FAILED" | "DISABLED";
  sslStatus: "NONE" | "PENDING" | "ISSUED" | "FAILED";
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  error: string | null;
  dnsTarget: string;
  isApex: boolean;
  certArn: string | null;
  validationCname: DnsRecord | null;
  subDomainDnsRecord?: DnsRecord | null;
}

interface CustomDomainCardProps {
  eventId: string;
  eventSlug: string;
}

export default function CustomDomainCard({ eventId, eventSlug }: CustomDomainCardProps) {
  const [domain, setDomain] = useState<CustomDomainState | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDomainStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/custom-domain`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setDomain(data);
        if (data.hostname) {
          setInputValue(data.hostname);
        }
      }
    } catch (err) {
      console.error("Error fetching domain status:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDomainStatus();
  }, [fetchDomainStatus]);

  const saveDomain = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a domain");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/custom-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: inputValue.trim() }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save domain");
        return;
      }

      setSuccess("Domain saved! Add the DNS records below, then click Verify.");
      await fetchDomainStatus();
    } catch {
      setError("Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  const checkDns = async () => {
    setChecking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/custom-domain/check-dns`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.verified) {
        setSuccess(data.message || "Certificate verified and domain activated!");
      } else {
        setError(data.error || "Verification failed. Please check your DNS records.");
      }

      await fetchDomainStatus();
    } catch {
      setError("Failed to verify certificate");
    } finally {
      setChecking(false);
    }
  };

  const removeDomain = async () => {
    if (!confirm("Are you sure you want to remove this custom domain?")) {
      return;
    }

    setRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/custom-domain`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to remove domain");
        return;
      }

      setInputValue("");
      setSuccess("Domain removed successfully");
      await fetchDomainStatus();
    } catch {
      setError("Failed to remove domain");
    } finally {
      setRemoving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const getStatusBadge = () => {
    if (!domain || domain.status === "NONE") return null;

    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", label: "Pending Verification" },
      DNS_VERIFIED: { color: "bg-blue-100 text-blue-700", label: "DNS Verified" },
      ACTIVE: { color: "bg-green-100 text-green-700", label: "Active" },
      FAILED: { color: "bg-red-100 text-red-700", label: "Failed" },
      DISABLED: { color: "bg-gray-100 text-gray-700", label: "Disabled" },
    };

    const config = statusConfig[domain.status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Custom Domain</h2>
        {getStatusBadge()}
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Connect your own domain to this event. We handle SSL certificates automatically.
      </p>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Domain Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Domain
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="www.yourdomain.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            disabled={domain?.status === "ACTIVE"}
          />
          {(!domain?.hostname || domain.status !== "ACTIVE") && (
            <button
              onClick={saveDomain}
              disabled={saving || !inputValue.trim()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
        {domain?.isApex && (
          <p className="mt-2 text-amber-600 text-sm">
            Note: Apex domains (without www) may have limited support. We recommend using www.yourdomain.com
          </p>
        )}
      </div>

      {/* DNS Configuration Instructions */}
      {domain?.hostname && domain.status !== "NONE" && domain.status !== "ACTIVE" && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">DNS Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add these two CNAME records to your domain&apos;s DNS settings:
          </p>

          {/* Record 1: SSL Validation */}
          {domain.validationCname && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-medium">1</span>
                <span className="font-medium text-gray-900">SSL Certificate Validation</span>
              </div>
              <div className="ml-8 bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 text-gray-900 font-mono">CNAME</span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs break-all">
                        {domain.validationCname.name}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(domain.validationCname!.name)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      title="Copy"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500">Value:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs break-all">
                        {domain.validationCname.value}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(domain.validationCname!.value)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      title="Copy"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Record 2: Domain Routing */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-medium">2</span>
              <span className="font-medium text-gray-900">Domain Routing</span>
            </div>
            <div className="ml-8 bg-white border border-gray-200 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 text-gray-900 font-mono">CNAME</span>
                </div>
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {domain.subDomainDnsRecord?.name || (domain.hostname.startsWith("www.") ? "www" : domain.hostname.split(".")[0])}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">
                      {domain.subDomainDnsRecord?.value || domain.dnsTarget}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(domain.subDomainDnsRecord?.value || domain.dnsTarget)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    title="Copy"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> DNS changes can take up to 48 hours to propagate, but usually complete within minutes.
              Click &quot;Verify&quot; after adding both records.
            </p>
          </div>
        </div>
      )}

      {/* Verify Button */}
      {domain?.hostname && domain.status === "PENDING" && (
        <div className="mb-4">
          <button
            onClick={checkDns}
            disabled={checking}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {checking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying Certificate...
              </span>
            ) : (
              "Verify"
            )}
          </button>
        </div>
      )}

      {/* Active Domain Info */}
      {domain?.status === "ACTIVE" && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-green-800">Domain is active with SSL!</p>
              <p className="text-sm text-green-700 mt-1">
                Your event is accessible at:{" "}
                <a
                  href={`https://${domain.hostname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  https://{domain.hostname}
                </a>
              </p>
              <p className="text-sm text-green-700 mt-1">
                Fallback URL:{" "}
                <a
                  href={`${window.location.origin}/en/${eventSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {window.location.origin}/en/{eventSlug}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed State */}
      {domain?.status === "FAILED" && domain.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Configuration Error</p>
              <p className="text-sm text-red-700 mt-1">{domain.error}</p>
              <p className="text-sm text-red-700 mt-2">
                Please remove the domain and try again, or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Remove Domain Button */}
      {domain?.hostname && (
        <button
          onClick={removeDomain}
          disabled={removing}
          className="text-red-600 hover:text-red-700 text-sm font-medium transition disabled:opacity-50"
        >
          {removing ? "Removing..." : "Remove custom domain"}
        </button>
      )}

      {/* Help Text */}
      {!domain?.hostname && (
        <div className="mt-4 text-sm text-gray-500">
          <p>
            Enter your domain (e.g., www.yourevent.com) to get started. We&apos;ll automatically
            generate an SSL certificate for your domain.
          </p>
        </div>
      )}
    </div>
  );
}
