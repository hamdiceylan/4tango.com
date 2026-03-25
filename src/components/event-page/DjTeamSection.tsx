import { DjTeamContent, TeamMember } from "@/lib/section-types";

interface DjTeamSectionProps {
  title?: string | null;
  content: DjTeamContent;
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-center">
      {/* Photo */}
      {member.photo ? (
        <div className="aspect-square overflow-hidden">
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-rose-100 flex items-center justify-center">
          <span className="text-4xl font-bold text-rose-500">
            {member.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
        {member.country && (
          <p className="text-gray-500 text-sm">{member.country}</p>
        )}
        {member.bio && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

export default function DjTeamSection({ title, content }: DjTeamSectionProps) {
  const { members } = content;

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "DJs"}
        </h2>

        <div className={`grid gap-6 ${
          members.length === 1
            ? "grid-cols-1 max-w-xs mx-auto"
            : members.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
              : members.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}>
          {members.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
