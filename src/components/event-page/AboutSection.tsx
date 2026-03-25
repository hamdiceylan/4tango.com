import { AboutContent } from "@/lib/section-types";

interface AboutSectionProps {
  title?: string | null;
  content: AboutContent;
}

export default function AboutSection({ title, content }: AboutSectionProps) {
  const { content: textContent, images } = content;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {title || "About This Event"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Text Content */}
            <div className={images && images.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="prose prose-gray max-w-none">
                {textContent.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-600 mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Images */}
            {images && images.length > 0 && (
              <div className="lg:col-span-1 space-y-4">
                {images.map((image, i) => (
                  <img
                    key={i}
                    src={image}
                    alt={`About image ${i + 1}`}
                    className="w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
