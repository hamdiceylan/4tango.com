import { ScheduleContent, ScheduleDay } from "@/lib/section-types";

interface ScheduleSectionProps {
  title?: string | null;
  content: ScheduleContent;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function ScheduleDayCard({ day }: { day: ScheduleDay }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="bg-rose-500 text-white px-6 py-4">
        <h3 className="text-lg font-semibold">{day.label}</h3>
        <p className="text-rose-100 text-sm">{formatDate(day.date)}</p>
      </div>

      {/* Schedule Items */}
      <div className="p-4 space-y-3">
        {day.items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex-shrink-0 w-28">
              <span className="text-gray-500 text-sm font-medium">{item.time}</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{item.title}</p>
              {item.description && (
                <p className="text-gray-500 text-sm mt-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
        {day.items.length === 0 && (
          <p className="text-gray-500 text-center py-4">No events scheduled</p>
        )}
      </div>
    </div>
  );
}

export default function ScheduleSection({ title, content }: ScheduleSectionProps) {
  const { days } = content;

  if (!days || days.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "Schedule"}
        </h2>

        <div className={`grid gap-6 ${
          days.length === 1
            ? "grid-cols-1 max-w-md mx-auto"
            : days.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {days.map((day, index) => (
            <ScheduleDayCard key={index} day={day} />
          ))}
        </div>
      </div>
    </section>
  );
}
