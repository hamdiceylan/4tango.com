import { PhotographersContent, TeamMember } from "@/lib/section-types";

interface PhotographersSectionProps {
  title?: string | null;
  content: PhotographersContent;
}

function PhotographerCard({ member }: { member: TeamMember }) {
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
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
        {member.role && (
          <p className="text-rose-500 text-sm font-medium">{member.role}</p>
        )}
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

export default function PhotographersSection({ title, content }: PhotographersSectionProps) {
  const { members } = content;

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "Photographers"}
        </h2>

        <div className={`grid gap-6 ${
          members.length === 1
            ? "grid-cols-1 max-w-xs mx-auto"
            : members.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {members.map((member, index) => (
            <PhotographerCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
