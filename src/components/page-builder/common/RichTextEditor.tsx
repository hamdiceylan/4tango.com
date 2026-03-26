"use client";

import { useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  rows = 6,
  className = "",
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  // Simple markdown to HTML converter
  const renderMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-rose-500 hover:underline" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = document.getElementById("rich-text-input") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition"
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition"
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h4m-2 0v12m-4 0h8" transform="skewX(-10)" />
          </svg>
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertMarkdown("# ", "")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition text-sm font-bold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("## ", "")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition text-sm font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("### ", "")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition text-sm font-bold"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) insertMarkdown("[", `](${url})`);
          }}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition"
          title="Link"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-2 py-1 text-sm rounded transition ${
            isPreview ? "bg-rose-100 text-rose-600" : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="p-4 bg-white border border-t-0 border-gray-200 rounded-b-lg prose prose-sm max-w-none"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<span class="text-gray-400">Nothing to preview</span>' }}
        />
      ) : (
        <textarea
          id="rich-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition resize-none font-mono text-sm"
        />
      )}

      <p className="text-xs text-gray-400 mt-1">
        Supports basic Markdown: **bold**, *italic*, # headings, [links](url)
      </p>
    </div>
  );
}
