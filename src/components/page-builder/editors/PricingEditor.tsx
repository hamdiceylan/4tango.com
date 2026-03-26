"use client";

import { PricingContent } from "@/lib/section-types";
import RichTextEditor from "../common/RichTextEditor";

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
}

export default function PricingEditor({ content, onChange }: PricingEditorProps) {
  return (
    <div className="space-y-6">
      {/* Show Packages Toggle */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="showPackages"
          checked={content.showPackages || false}
          onChange={(e) => onChange({ ...content, showPackages: e.target.checked })}
          className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
        />
        <div>
          <label htmlFor="showPackages" className="text-sm font-medium text-gray-700">
            Show pricing packages
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Display the packages you have created in the Packages section
          </p>
        </div>
      </div>

      {/* Custom Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Information
        </label>
        <RichTextEditor
          value={content.customContent || ""}
          onChange={(value) => onChange({ ...content, customContent: value })}
          placeholder="Add any extra pricing details, early bird info, or payment terms..."
          rows={6}
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Manage packages separately</p>
            <p className="text-sm text-blue-600 mt-1">
              To add or edit pricing packages, go to the event settings and manage packages there.
              They will automatically display in this section when enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
