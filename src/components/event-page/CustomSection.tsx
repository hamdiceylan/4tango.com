import { CustomTextContent, CustomHtmlContent } from "@/lib/section-types";

interface CustomTextSectionProps {
  title?: string | null;
  content: CustomTextContent;
}

interface CustomHtmlSectionProps {
  title?: string | null;
  content: CustomHtmlContent;
}

export function CustomTextSection({ title, content }: CustomTextSectionProps) {
  const { content: textContent } = content;

  if (!textContent) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            {textContent.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-600 mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CustomHtmlSection({ title, content }: CustomHtmlSectionProps) {
  const { html } = content;

  if (!html) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
