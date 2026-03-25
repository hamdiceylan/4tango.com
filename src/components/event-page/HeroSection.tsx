import Link from "next/link";
import { HeroContent } from "@/lib/section-types";

interface HeroSectionProps {
  content: HeroContent;
  eventSlug: string;
  primaryColor?: string;
}

export default function HeroSection({ content, eventSlug, primaryColor = "#f43f5e" }: HeroSectionProps) {
  const { backgroundImage, title, subtitle, ctaText = "Register Now", overlay = "dark" } = content;

  const overlayClasses = {
    dark: "bg-black/50",
    light: "bg-white/30",
    none: "",
  };

  return (
    <div
      className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: !backgroundImage ? primaryColor : undefined,
      }}
    >
      {/* Overlay */}
      {overlay !== "none" && backgroundImage && (
        <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <Link
            href={`/${eventSlug}/register`}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition hover:bg-gray-100 shadow-lg"
          >
            {ctaText}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
