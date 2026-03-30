"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { type Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from "@/lib/i18n";
import { localizeContent } from "@/lib/i18n/localize-content";
import { SectionBackground } from "@/lib/colors";
import LanguageSelector from "@/components/ui/LanguageSelector";

// Helper to get section background styles
function getSectionBackgroundStyles(
  bg: SectionBackground | undefined,
  colors: { primary: string; secondary: string; dark: string }
): { className: string; style: React.CSSProperties } {
  switch (bg) {
    case "dark":
      return {
        className: "text-white",
        style: { backgroundColor: colors.dark },
      };
    case "primary":
      return {
        className: "text-white",
        style: { backgroundColor: colors.primary },
      };
    case "gradient":
      return {
        className: "text-white",
        style: {
          background: `linear-gradient(135deg, ${colors.dark} 0%, #1e1b4b 50%, ${colors.dark} 100%)`,
        },
      };
    case "light-alt":
      return {
        className: "",
        style: { backgroundColor: "#f9fafb" }, // gray-50
      };
    case "light":
    default:
      return {
        className: "",
        style: { backgroundColor: "#ffffff" },
      };
  }
}

// Types
interface EventData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  city: string;
  country: string;
  venueName: string | null;
  address: string | null;
  startAt: string;
  endAt: string;
  priceAmount: number;
  currency: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  darkColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  defaultLanguage: string;
  availableLanguages: string[];
  organizer: {
    name: string;
    email: string;
  };
  pageSections: PageSection[];
  packages: Package[];
}

interface PageSection {
  id: string;
  type: string;
  order: number;
  title: string | Record<string, string> | null;
  content: Record<string, unknown>;
  isVisible: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number | null;
  order: number;
}

interface EventPageClientProps {
  event: EventData;
  lang: Language;
  isPreview: boolean;
}

// Country flags mapping
const countryFlags: Record<string, string> = {
  Poland: "",
  Italy: "",
  Turkey: "",
  Portugal: "",
  Hungary: "",
  Netherlands: "",
  Russia: "",
  Ukraine: "",
  Germany: "",
  Spain: "",
  France: "",
  Argentina: "",
};

// Default section labels (fallback if no custom title set)
const defaultSectionLabels: Record<Language, Record<string, string>> = {
  en: { about: "ABOUT", program: "PROGRAM", accommodation: "ACCOMMODATION", djTeam: "DJ TEAM", photographers: "PHOTOGRAPHERS", prices: "PRICES", register: "REGISTRATION" },
  es: { about: "ACERCA DE", program: "PROGRAMA", accommodation: "ALOJAMIENTO", djTeam: "DJS", photographers: "FOTÓGRAFOS", prices: "PRECIOS", register: "INSCRIPCIÓN" },
  de: { about: "ÜBER UNS", program: "PROGRAMM", accommodation: "UNTERKUNFT", djTeam: "DJ TEAM", photographers: "FOTOGRAFEN", prices: "PREISE", register: "ANMELDUNG" },
  fr: { about: "À PROPOS", program: "PROGRAMME", accommodation: "HÉBERGEMENT", djTeam: "ÉQUIPE DJ", photographers: "PHOTOGRAPHES", prices: "TARIFS", register: "INSCRIPTION" },
  it: { about: "CHI SIAMO", program: "PROGRAMMA", accommodation: "ALLOGGIO", djTeam: "DJ TEAM", photographers: "FOTOGRAFI", prices: "PREZZI", register: "ISCRIZIONE" },
  pl: { about: "O NAS", program: "PROGRAM", accommodation: "ZAKWATEROWANIE", djTeam: "ZESPÓŁ DJ", photographers: "FOTOGRAFOWIE", prices: "CENY", register: "REJESTRACJA" },
  tr: { about: "HAKKINDA", program: "PROGRAM", accommodation: "KONAKLAMA", djTeam: "DJ EKİBİ", photographers: "FOTOĞRAFÇILAR", prices: "FİYATLAR", register: "KAYIT" },
};

// Helper to get localized section title
function getLocalizedSectionTitle(
  section: PageSection | undefined,
  key: string,
  lang: Language
): string {
  if (!section) return defaultSectionLabels[lang]?.[key] || defaultSectionLabels.en[key] || key.toUpperCase();

  const title = section.title;
  if (!title) return defaultSectionLabels[lang]?.[key] || defaultSectionLabels.en[key] || key.toUpperCase();

  // If title is a string, return it
  if (typeof title === "string") return title.toUpperCase();

  // If title is localized object, get the right language
  const localizedTitle = title[lang] || title["en"] || Object.values(title)[0];
  return localizedTitle ? localizedTitle.toUpperCase() : defaultSectionLabels[lang]?.[key] || key.toUpperCase();
}

// Default hero images
const defaultHeroImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1476673160081-cf065bc4cecf?w=1920&q=80",
];

export default function EventPageClient({ event, lang, isPreview }: EventPageClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [hotelSlide, setHotelSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract section data helpers - apply localization to content
  const getSection = (type: string): PageSection | undefined => {
    const section = event.pageSections.find((s) => s.type === type);
    if (section) {
      // Localize the content based on current language
      return {
        ...section,
        content: localizeContent(section.content, lang, (event.defaultLanguage || "en") as Language),
      };
    }
    return section;
  };

  const heroSection = getSection("HERO");
  const aboutSection = getSection("ABOUT");
  const scheduleSection = getSection("SCHEDULE");
  const accommodationSection = getSection("ACCOMMODATION");
  const djSection = getSection("DJ_TEAM");
  const photographersSection = getSection("PHOTOGRAPHERS");
  const pricingSection = getSection("PRICING");

  // Get hero images from section or use defaults
  // Support both backgroundImages (array) and backgroundImage (single string)
  const heroImages = (() => {
    const content = heroSection?.content;
    if (content?.backgroundImages && Array.isArray(content.backgroundImages)) {
      return content.backgroundImages as string[];
    }
    if (content?.backgroundImage && typeof content.backgroundImage === "string") {
      return [content.backgroundImage];
    }
    return defaultHeroImages;
  })();
  const heroLogo = (heroSection?.content?.logoUrl as string) || event.logoUrl;

  // Auto-advance hero slider
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Format dates
  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);
  const dateRange = `${startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })} - ${endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  // Get schedule data
  const schedule =
    (scheduleSection?.content?.days as Array<{
      label: string;
      day: string;
      date: string;
      items: Array<{ time: string; title: string }>;
    }>) || [];

  // Get accommodation data
  const accommodation = accommodationSection?.content as
    | {
        name?: string;
        rating?: string;
        description?: string;
        features?: string[];
        images?: string[];
        checkIn?: string;
        checkOut?: string;
      }
    | undefined;

  // Get DJ team - support both new 'members' format and old 'djs' format
  const djTeam = (() => {
    const content = djSection?.content;
    // First try new format (members)
    if (content?.members && Array.isArray(content.members) && content.members.length > 0) {
      return content.members as Array<{ name: string; country: string; photo: string }>;
    }
    // Fall back to old format (djs)
    if (content?.djs && Array.isArray(content.djs)) {
      return (content.djs as Array<{ name: string; bio?: string; imageUrl?: string | null }>).map(
        (dj) => ({
          name: dj.name,
          country: "", // old format didn't have country
          photo: dj.imageUrl || "",
        })
      );
    }
    return [];
  })();

  // Get about content
  const aboutContent = (() => {
    const content = aboutSection?.content;
    // Support new 'content' field (localized) or old 'text' field
    if (content?.content && typeof content.content === "string") {
      return content.content;
    }
    if (content?.text && typeof content.text === "string") {
      return content.text;
    }
    return null;
  })();
  const aboutImages = (aboutSection?.content?.images as string[]) || [];

  // Get photographers
  const photographers =
    (photographersSection?.content?.members as Array<{
      name: string;
      country: string;
      photo: string;
    }>) || [];

  // Get pricing note
  const pricingNote = pricingSection?.content?.note as string | undefined;
  const depositNote = pricingSection?.content?.depositNote as string | undefined;

  // Theme colors
  const primaryColor = event.primaryColor || "#f43f5e";
  const secondaryColor = event.secondaryColor || "#d4a853";
  const darkColor = event.darkColor || "#0a0a1a";

  // Navigation links based on available sections - using localized titles
  const navLinks = [
    ...(aboutSection && aboutContent ? [{ href: "#about", label: getLocalizedSectionTitle(aboutSection, "about", lang) }] : []),
    ...(scheduleSection ? [{ href: "#program", label: getLocalizedSectionTitle(scheduleSection, "program", lang) }] : []),
    ...(accommodationSection ? [{ href: "#accommodation", label: getLocalizedSectionTitle(accommodationSection, "accommodation", lang) }] : []),
    ...(djSection && djTeam.length > 0 ? [{ href: "#djs", label: getLocalizedSectionTitle(djSection, "djTeam", lang) }] : []),
    ...(event.packages.length > 0 ? [{ href: "#prices", label: getLocalizedSectionTitle(pricingSection, "prices", lang) }] : []),
    { href: "#register", label: defaultSectionLabels[lang]?.register || "REGISTRATION" },
  ];

  // Register URL with language prefix
  const registerUrl = `/${lang}/${event.slug}/register`;

  // Handle smooth scroll for nav links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
          Preview Mode - This event is not published yet.
          <button
            onClick={() => window.close()}
            className="ml-4 px-3 py-1 bg-black/20 hover:bg-black/30 rounded text-xs font-bold transition"
          >
            Close Preview
          </button>
        </div>
      )}

      {/* Navigation */}
      <header
        className={`fixed left-0 right-0 z-50 backdrop-blur-sm ${isPreview ? "top-10" : "top-0"}`}
        style={{ backgroundColor: `${darkColor}cc` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href={`/${lang}/${event.slug}`} className="flex items-center">
              {heroLogo ? (
                <img src={heroLogo} alt={event.title} className="h-10 w-auto" />
              ) : (
                <span className="text-white font-bold text-xl drop-shadow-md">{event.title}</span>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-white hover:opacity-80 font-medium text-sm tracking-wide transition drop-shadow-md cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Selector - Desktop only */}
              <div className="hidden lg:block">
                <LanguageSelector
                  currentLang={lang}
                  availableLanguages={(event.availableLanguages || [lang]) as Language[]}
                  slug={event.slug}
                  variant="compact"
                />
              </div>

              <button
                className="lg:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen (outside header) */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden fixed left-0 right-0 bottom-0 z-40 flex flex-col overflow-y-auto ${isPreview ? "top-[96px]" : "top-[56px]"}`}
          style={{ backgroundColor: darkColor }}
        >
          <nav className="flex-1 flex flex-col py-6 px-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
                className="text-white hover:bg-white/10 font-medium text-lg tracking-wide transition px-4 py-4 border-b border-white/10"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Language Selector in Mobile Menu */}
          <div className="px-4 py-4 border-t border-white/10">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Language</p>
            <div className="flex flex-wrap gap-2">
              {(event.availableLanguages || [lang]).map((language) => (
                <Link
                  key={language}
                  href={`/${language}/${event.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
                  style={
                    language === lang
                      ? { backgroundColor: `${secondaryColor}33`, color: secondaryColor }
                      : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }
                  }
                >
                  <span className="text-lg">{LANGUAGE_FLAGS[language as Language]}</span>
                  <span>{LANGUAGE_NAMES[language as Language]}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Register CTA */}
          <div className="p-4 border-t border-white/10">
            <Link
              href={registerUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center text-white px-6 py-4 font-bold text-lg tracking-wide transition-all shadow-lg rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              REGISTER NOW
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center">
        {/* Background slider */}
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {heroLogo && (
            <div className="mb-6">
              <img
                src={heroLogo}
                alt={event.title}
                className="h-24 md:h-32 w-auto mx-auto drop-shadow-lg"
              />
            </div>
          )}

          <h1
            className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            {event.title}
          </h1>

          <p
            className="text-white text-lg md:text-xl mb-4 drop-shadow-lg"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            {dateRange} - {event.city}, {event.country}
          </p>

          {event.shortDescription && (
            <p className="text-white/90 text-base md:text-lg mb-8 drop-shadow-lg max-w-2xl mx-auto">
              {event.shortDescription}
            </p>
          )}

          {event.packages.length > 0 && (
            <p
              className="text-white text-lg md:text-xl font-medium mb-8 drop-shadow-lg"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              Starting from{" "}
              <span className="font-bold">
                {Math.min(...event.packages.map((p) => p.price)) / 100}
              </span>{" "}
              per person
            </p>
          )}

          <Link
            href={registerUrl}
            className="inline-block text-white px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-lg rounded-sm border-2"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            REGISTER NOW!
          </Link>
        </div>
      </section>

      {/* About Section */}
      {aboutSection && aboutContent && (() => {
        const aboutBg = getSectionBackgroundStyles(
          aboutSection?.content?.background as SectionBackground,
          { primary: primaryColor, secondary: secondaryColor, dark: darkColor }
        );
        const isDarkBg = ["dark", "primary", "gradient"].includes(aboutSection?.content?.background as string);
        return (
          <section
            id="about"
            className={`py-16 px-4 scroll-mt-16 ${aboutBg.className}`}
            style={aboutBg.style}
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className={`text-2xl md:text-3xl font-normal mb-3 tracking-wide ${isDarkBg ? "text-white" : "text-[#1a1a2e]"}`}>
                  {getLocalizedSectionTitle(aboutSection, "about", lang)}
                </h2>
                <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: isDarkBg ? secondaryColor : primaryColor }}></div>
              </div>

              <div className="prose prose-gray max-w-none text-center">
                <div
                  className={`leading-relaxed ${isDarkBg ? "text-white/80" : "text-gray-600"}`}
                dangerouslySetInnerHTML={{ __html: aboutContent }}
              />
            </div>

            {aboutImages.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {aboutImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`About image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        );
      })()}

      {/* Program Section */}
      {scheduleSection && schedule.length > 0 && (
        <section id="program" className="py-16 px-4 bg-white scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">
                {getLocalizedSectionTitle(scheduleSection, "program", lang)}
              </h2>
              <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: primaryColor }}></div>
            </div>

            {/* Horizontal Tabs */}
            <div className="flex flex-wrap justify-center mb-6 gap-1">
              {schedule.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 md:px-6 py-3 font-semibold text-sm tracking-wide transition-all ${
                    activeTab === index
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } ${index === 0 ? "rounded-l" : ""} ${
                    index === schedule.length - 1 ? "rounded-r" : ""
                  }`}
                  style={activeTab === index ? { backgroundColor: primaryColor } : {}}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="text-center mb-4">
                <p className="font-semibold" style={{ color: primaryColor }}>
                  {schedule[activeTab]?.day}
                </p>
                <p className="text-gray-500 text-sm">{schedule[activeTab]?.date}</p>
              </div>
              <div className="space-y-4">
                {schedule[activeTab]?.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-center gap-4 items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-semibold w-32 text-right" style={{ color: primaryColor }}>
                      {item.time}
                    </span>
                    <span className="text-[#1a1a2e] font-medium w-48">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accommodation Section */}
      {accommodationSection && accommodation && (
        <section id="accommodation" className="py-16 px-4 bg-white scroll-mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a2e] mb-3 tracking-wide">
                {getLocalizedSectionTitle(accommodationSection, "accommodation", lang)}
              </h2>
              {accommodation.rating && (
                <>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        style={{ color: primaryColor }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </>
              )}
              {accommodation.name && (
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-1">{accommodation.name}</h3>
              )}
              {accommodation.rating && (
                <p
                  className="text-sm tracking-wider font-medium"
                  style={{ color: primaryColor }}
                >
                  {accommodation.rating}
                </p>
              )}
            </div>

            {/* Image Carousel */}
            {accommodation.images && accommodation.images.length > 0 && (
              <div className="relative mb-10">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500"
                    style={{ transform: `translateX(-${hotelSlide * 100}%)` }}
                  >
                    {accommodation.images.map((img, i) => (
                      <div key={i} className="w-full flex-shrink-0">
                        <img
                          src={img}
                          alt={`${accommodation.name} ${i + 1}`}
                          className="w-full h-80 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {accommodation.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setHotelSlide(
                          (prev) =>
                            (prev - 1 + accommodation.images!.length) % accommodation.images!.length
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setHotelSlide((prev) => (prev + 1) % accommodation.images!.length)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {accommodation.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHotelSlide(i)}
                          className={`w-2 h-2 rounded-full transition ${
                            hotelSlide === i ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="max-w-3xl mx-auto">
              {accommodation.description && (
                <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
                  {accommodation.description}
                </p>
              )}

              {accommodation.features && accommodation.features.length > 0 && (
                <ul className="text-gray-700 text-sm space-y-1 mb-6">
                  {accommodation.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span style={{ color: primaryColor }}>-</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {(accommodation.checkIn || accommodation.checkOut) && (
                <div className="flex justify-center gap-8 text-gray-600 text-sm">
                  {accommodation.checkIn && (
                    <p>
                      <strong>Check-in time is {accommodation.checkIn}</strong>
                    </p>
                  )}
                  {accommodation.checkOut && (
                    <p>
                      <strong>Check-out time is {accommodation.checkOut}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* DJ Team Section */}
      {djSection && djTeam.length > 0 && (
        <section id="djs" className="relative py-16 px-4 scroll-mt-16 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ backgroundColor: darkColor }}></div>
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `
                radial-gradient(ellipse 80% 50% at 20% 20%, rgba(120, 40, 200, 0.4), transparent),
                radial-gradient(ellipse 60% 40% at 80% 30%, rgba(200, 80, 50, 0.3), transparent),
                radial-gradient(ellipse 50% 60% at 50% 80%, rgba(30, 60, 150, 0.4), transparent)
              `,
              }}
            ></div>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">
                {getLocalizedSectionTitle(djSection, "djTeam", lang)}
              </h2>
              <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {djTeam.map((dj, index) => (
                <div key={index} className="text-center" style={{ width: "180px" }}>
                  <div className="relative mx-auto w-44 h-44 mb-3">
                    <div
                      className="absolute inset-0 rounded-full p-1.5"
                      style={{
                        background: `linear-gradient(to bottom right, ${secondaryColor}, ${secondaryColor}88, ${secondaryColor}dd)`,
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden relative"
                        style={{ backgroundColor: darkColor }}
                      >
                        <img src={dj.photo} alt={dj.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-white text-sm mb-0.5">{dj.name}</h3>
                  <p className="text-xs flex items-center justify-center gap-1" style={{ color: secondaryColor }}>
                    <span>{countryFlags[dj.country] || ""}</span>
                    <span>{dj.country?.toUpperCase()}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photographers Section */}
      {photographersSection && photographers.length > 0 && (
        <section className="relative py-16 px-4 scroll-mt-16 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ backgroundColor: darkColor }}></div>
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `
                radial-gradient(ellipse 70% 50% at 30% 70%, rgba(120, 40, 200, 0.4), transparent),
                radial-gradient(ellipse 50% 40% at 70% 20%, rgba(200, 80, 50, 0.3), transparent)
              `,
              }}
            ></div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">
                {getLocalizedSectionTitle(photographersSection, "photographers", lang)}
              </h2>
              <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {photographers.map((photographer, index) => (
                <div key={index} className="text-center" style={{ width: "180px" }}>
                  <div className="relative mx-auto w-44 h-44 mb-3">
                    <div
                      className="absolute inset-0 rounded-full p-1.5"
                      style={{
                        background: `linear-gradient(to bottom right, ${secondaryColor}, ${secondaryColor}88, ${secondaryColor}dd)`,
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden relative"
                        style={{ backgroundColor: darkColor }}
                      >
                        <img
                          src={photographer.photo}
                          alt={photographer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-white text-sm mb-0.5">{photographer.name}</h3>
                  <p className="text-xs flex items-center justify-center gap-1" style={{ color: secondaryColor }}>
                    <span>{countryFlags[photographer.country] || ""}</span>
                    <span>{photographer.country?.toUpperCase()}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prices Section */}
      {event.packages.length > 0 && (() => {
        const pricingBg = getSectionBackgroundStyles(
          pricingSection?.content?.background as SectionBackground,
          { primary: primaryColor, secondary: secondaryColor, dark: darkColor }
        );
        const isDarkBg = ["dark", "primary", "gradient"].includes(pricingSection?.content?.background as string);
        return (
          <section
            id="prices"
            className={`py-16 px-4 scroll-mt-16 ${pricingBg.className}`}
            style={pricingBg.style}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className={`text-2xl md:text-3xl font-normal mb-3 tracking-wide ${isDarkBg ? "text-white" : "text-[#1a1a2e]"}`}>
                  {getLocalizedSectionTitle(pricingSection, "prices", lang)}
                </h2>
                <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: isDarkBg ? secondaryColor : primaryColor }}></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {event.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`text-center p-6 ${isDarkBg ? "bg-white/10 border border-white/20" : "border border-gray-200 bg-white"}`}
                  >
                    <h3 className={`text-base font-bold mb-1 ${isDarkBg ? "text-white" : "text-[#1a1a2e]"}`}>{pkg.name}</h3>
                    {pkg.description && (
                      <>
                        <div
                          className="w-8 h-px mx-auto mb-3"
                          style={{ backgroundColor: isDarkBg ? secondaryColor : primaryColor }}
                        ></div>
                        <p
                          className="text-xs font-bold tracking-widest mb-3"
                          style={{ color: isDarkBg ? secondaryColor : primaryColor }}
                        >
                          {pkg.description}
                        </p>
                      </>
                    )}
                    <div className="mb-4">
                      <span className={`text-3xl font-bold ${isDarkBg ? "text-white" : "text-[#1a1a2e]"}`}>{pkg.price / 100}</span>
                      <span className={`text-xs block mt-1 ${isDarkBg ? "text-white/60" : "text-gray-500"}`}>per person</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-8 text-center text-sm ${isDarkBg ? "text-white/70" : "text-gray-600"}`}>
                {pricingNote && <p className="mb-4">{pricingNote}</p>}
                {depositNote && <p className={`text-xs ${isDarkBg ? "text-white/50" : "text-gray-400"}`}>{depositNote}</p>}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Registration Section */}
      <section id="register" className="py-16 px-4 scroll-mt-16" style={{ backgroundColor: darkColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-normal text-white mb-3 tracking-wide">
            REGISTER
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: secondaryColor }}></div>

          <p className="text-white/70 mb-8">
            Ready to join us for an unforgettable tango experience? Click below to complete your
            registration.
          </p>

          <Link
            href={registerUrl}
            className="inline-block text-white px-10 py-4 font-bold text-lg tracking-wide transition-all shadow-lg rounded-sm hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            REGISTER NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12 px-4" style={{ backgroundColor: darkColor }}>
        <div className="max-w-4xl mx-auto text-center">
          {heroLogo && <img src={heroLogo} alt={event.title} className="h-20 w-auto mx-auto mb-4" />}
          <p className="text-white/50 text-sm mb-6">
            {dateRange} - {event.city}, {event.country}
          </p>

          <a
            href={`mailto:${event.organizer.email}`}
            className="text-white/60 transition text-sm hover:opacity-80"
            style={{ color: secondaryColor }}
          >
            {event.organizer.email}
          </a>

          <div className="border-t border-white/10 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <div className="w-4 h-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">4T</span>
              </div>
              <span>Powered by 4Tango</span>
            </div>
            <div className="text-white/30 text-xs">
              <Link href="/privacy" className="hover:text-white/60 transition">
                Privacy
              </Link>
              <span className="mx-2">-</span>
              <Link href="/terms" className="hover:text-white/60 transition">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
