"use client";

import { CustomTextContent } from "@/lib/section-types";
import RichTextEditor from "../common/RichTextEditor";

interface CustomTextEditorProps {
  content: CustomTextContent;
  onChange: (content: CustomTextContent) => void;
}

export default function CustomTextEditor({ content, onChange }: CustomTextEditorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
      <RichTextEditor
        value={content.content || ""}
        onChange={(value) => onChange({ ...content, content: value })}
        placeholder="Enter your custom content here..."
        rows={12}
      />
      <p className="text-xs text-gray-500 mt-2">
        Use this section for any custom content like terms, rules, or additional information.
      </p>
    </div>
  );
}
