"use client";

import { DjTeamContent, TeamMember } from "@/lib/section-types";
import ImageUploader from "../common/ImageUploader";

interface DjTeamEditorProps {
  content: DjTeamContent;
  onChange: (content: DjTeamContent) => void;
}

export default function DjTeamEditor({ content, onChange }: DjTeamEditorProps) {
  const addMember = () => {
    const newMember: TeamMember = {
      name: "",
      photo: "",
      bio: "",
      country: "",
    };
    onChange({ ...content, members: [...content.members, newMember] });
  };

  const updateMember = (index: number, updates: Partial<TeamMember>) => {
    const newMembers = content.members.map((member, i) =>
      i === index ? { ...member, ...updates } : member
    );
    onChange({ ...content, members: newMembers });
  };

  const removeMember = (index: number) => {
    onChange({ ...content, members: content.members.filter((_, i) => i !== index) });
  };

  const moveMember = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.members.length) return;

    const newMembers = [...content.members];
    [newMembers[index], newMembers[newIndex]] = [newMembers[newIndex], newMembers[index]];
    onChange({ ...content, members: newMembers });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">DJs</label>
        <button
          type="button"
          onClick={addMember}
          className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add DJ
        </button>
      </div>

      {content.members.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p className="text-gray-500 text-sm">No DJs added yet. Click &quot;Add DJ&quot; to showcase your music team.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.members.map((member, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex gap-4">
                {/* Photo */}
                <div className="w-24 flex-shrink-0">
                  <ImageUploader
                    value={member.photo}
                    onChange={(url) => updateMember(index, { photo: url })}
                    category="team"
                    aspectRatio="square"
                    placeholder="Photo"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(index, { name: e.target.value })}
                        placeholder="DJ Name"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                      <input
                        type="text"
                        value={member.country || ""}
                        onChange={(e) => updateMember(index, { country: e.target.value })}
                        placeholder="Argentina"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                    <textarea
                      value={member.bio || ""}
                      onChange={(e) => updateMember(index, { bio: e.target.value })}
                      placeholder="Short bio..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveMember(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMember(index, "down")}
                    disabled={index === content.members.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
