import {
  SectionType,
  SectionContent,
  HeroContent,
  AboutContent,
  ScheduleContent,
  DjTeamContent,
  PhotographersContent,
  AccommodationContent,
  PricingContent,
  GalleryContent,
  ContactContent,
  CustomTextContent,
  CustomHtmlContent,
} from "@/lib/section-types";

import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ScheduleSection from "./ScheduleSection";
import DjTeamSection from "./DjTeamSection";
import PhotographersSection from "./PhotographersSection";
import AccommodationSection from "./AccommodationSection";
import PricingSection from "./PricingSection";
import GallerySection from "./GallerySection";
import ContactSection from "./ContactSection";
import { CustomTextSection, CustomHtmlSection } from "./CustomSection";

interface EventSection {
  id: string;
  type: SectionType;
  title?: string | null;
  content: SectionContent;
  isVisible: boolean;
}

interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  capacity?: number | null;
  isActive: boolean;
}

interface SectionRendererProps {
  section: EventSection;
  eventSlug: string;
  primaryColor?: string;
  packages?: Package[];
}

export default function SectionRenderer({
  section,
  eventSlug,
  primaryColor,
  packages = [],
}: SectionRendererProps) {
  if (!section.isVisible) {
    return null;
  }

  switch (section.type) {
    case "HERO":
      return (
        <HeroSection
          content={section.content as HeroContent}
          eventSlug={eventSlug}
          primaryColor={primaryColor}
        />
      );

    case "ABOUT":
      return (
        <AboutSection
          title={section.title}
          content={section.content as AboutContent}
        />
      );

    case "SCHEDULE":
      return (
        <ScheduleSection
          title={section.title}
          content={section.content as ScheduleContent}
        />
      );

    case "DJ_TEAM":
      return (
        <DjTeamSection
          title={section.title}
          content={section.content as DjTeamContent}
        />
      );

    case "PHOTOGRAPHERS":
      return (
        <PhotographersSection
          title={section.title}
          content={section.content as PhotographersContent}
        />
      );

    case "ACCOMMODATION":
      return (
        <AccommodationSection
          title={section.title}
          content={section.content as AccommodationContent}
        />
      );

    case "PRICING":
      return (
        <PricingSection
          title={section.title}
          content={section.content as PricingContent}
          packages={packages}
          eventSlug={eventSlug}
          primaryColor={primaryColor}
        />
      );

    case "GALLERY":
      return (
        <GallerySection
          title={section.title}
          content={section.content as GalleryContent}
        />
      );

    case "CONTACT":
      return (
        <ContactSection
          title={section.title}
          content={section.content as ContactContent}
        />
      );

    case "CUSTOM_TEXT":
      return (
        <CustomTextSection
          title={section.title}
          content={section.content as CustomTextContent}
        />
      );

    case "CUSTOM_HTML":
      return (
        <CustomHtmlSection
          title={section.title}
          content={section.content as CustomHtmlContent}
        />
      );

    default:
      return null;
  }
}
