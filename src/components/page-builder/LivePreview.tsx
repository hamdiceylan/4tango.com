"use client";

import { useState, useEffect } from "react";

interface LivePreviewProps {
  eventSlug: string;
}

export default function LivePreview({ eventSlug }: LivePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const previewUrl = `/${eventSlug}?preview=true`;

  // Refresh preview
  const refreshPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Auto-refresh when content changes (debounced)
  useEffect(() => {
    const interval = setInterval(() => {
      setIframeKey((prev) => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-sm text-gray-500 ml-2">Live Preview</span>
        </div>
        <button
          onClick={refreshPreview}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          title="Refresh preview"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-hidden">
        <iframe
          key={iframeKey}
          src={previewUrl}
          className="w-full h-full border-0"
          title="Page Preview"
        />
      </div>
    </div>
  );
}
