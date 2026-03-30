// Section type definitions for the page builder
import type { SectionBackground } from "./colors";

// Base content interface with common fields
export interface BaseSectionContent {
  background?: SectionBackground;
}

export type SectionType =
  | 'HERO'
  | 'ABOUT'
  | 'SCHEDULE'
  | 'ACCOMMODATION'
  | 'DJ_TEAM'
  | 'PHOTOGRAPHERS'
  | 'PRICING'
  | 'GALLERY'
  | 'CONTACT'
  | 'CUSTOM_TEXT'
  | 'CUSTOM_HTML';

// Section content type definitions

export interface HeroContent {
  backgroundImage?: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  overlay?: 'dark' | 'light' | 'none';
}

export interface AboutContent extends BaseSectionContent {
  content: string; // Markdown or HTML content
  images?: string[];
}

export interface ScheduleDay {
  date: string; // ISO date string
  label: string; // e.g., "Thursday"
  items: ScheduleItem[];
}

export interface ScheduleItem {
  time: string; // e.g., "18:00 - 06:00"
  title: string;
  description?: string;
}

export interface ScheduleContent extends BaseSectionContent {
  days: ScheduleDay[];
}

export interface TeamMember {
  name: string;
  photo?: string;
  bio?: string;
  country?: string;
  role?: string; // For photographers: "Lead Photographer", etc.
}

export interface DjTeamContent extends BaseSectionContent {
  members: TeamMember[];
}

export interface PhotographersContent extends BaseSectionContent {
  members: TeamMember[];
}

export interface AccommodationContent extends BaseSectionContent {
  title: string;
  description?: string;
  images?: string[];
  features?: string[];
  address?: string;
  mapUrl?: string;
  bookingUrl?: string;
}

export interface PricingContent extends BaseSectionContent {
  showPackages: boolean;
  customContent?: string; // Additional HTML/markdown content
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface GalleryContent extends BaseSectionContent {
  images: GalleryImage[];
  layout?: 'grid' | 'carousel' | 'masonry';
}

export interface ContactContent extends BaseSectionContent {
  email?: string;
  phone?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  showForm?: boolean;
  formFields?: string[]; // Which fields to show in contact form
}

export interface CustomTextContent extends BaseSectionContent {
  content: string; // Markdown content
}

export interface CustomHtmlContent {
  html: string; // Raw HTML content
}

// Union type for all section content types
export type SectionContent =
  | HeroContent
  | AboutContent
  | ScheduleContent
  | DjTeamContent
  | PhotographersContent
  | AccommodationContent
  | PricingContent
  | GalleryContent
  | ContactContent
  | CustomTextContent
  | CustomHtmlContent;

// Full section interface matching the Prisma model
export interface EventSection {
  id: string;
  eventId: string;
  type: SectionType;
  order: number;
  title?: string | null;
  content: SectionContent;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Section metadata for the UI
export interface SectionTypeInfo {
  type: SectionType;
  name: string;
  description: string;
  icon: string; // Icon name or emoji
  defaultContent: Partial<SectionContent>;
}

export const SECTION_TYPES: SectionTypeInfo[] = [
  {
    type: 'HERO',
    name: 'Hero',
    description: 'Large banner with title and call-to-action',
    icon: 'photo',
    defaultContent: {
      title: 'Your Event Title',
      subtitle: 'A memorable tagline for your event',
      ctaText: 'Register Now',
      overlay: 'dark',
    } as HeroContent,
  },
  {
    type: 'ABOUT',
    name: 'About',
    description: 'Description and details about your event',
    icon: 'document-text',
    defaultContent: {
      content: 'Tell your attendees about this amazing event...',
      images: [],
    } as AboutContent,
  },
  {
    type: 'SCHEDULE',
    name: 'Schedule',
    description: 'Daily schedule with times and activities',
    icon: 'calendar',
    defaultContent: {
      days: [],
    } as ScheduleContent,
  },
  {
    type: 'DJ_TEAM',
    name: 'DJ Team',
    description: 'Showcase your DJs with photos and bios',
    icon: 'musical-note',
    defaultContent: {
      members: [],
    } as DjTeamContent,
  },
  {
    type: 'PHOTOGRAPHERS',
    name: 'Photographers',
    description: 'Showcase your event photographers',
    icon: 'camera',
    defaultContent: {
      members: [],
    } as PhotographersContent,
  },
  {
    type: 'ACCOMMODATION',
    name: 'Accommodation',
    description: 'Hotel and lodging information',
    icon: 'home',
    defaultContent: {
      title: 'Hotel Name',
      description: '',
      images: [],
      features: [],
    } as AccommodationContent,
  },
  {
    type: 'PRICING',
    name: 'Pricing',
    description: 'Ticket prices and packages',
    icon: 'currency-dollar',
    defaultContent: {
      showPackages: true,
      customContent: '',
    } as PricingContent,
  },
  {
    type: 'GALLERY',
    name: 'Gallery',
    description: 'Photo gallery from previous events',
    icon: 'photograph',
    defaultContent: {
      images: [],
      layout: 'grid',
    } as GalleryContent,
  },
  {
    type: 'CONTACT',
    name: 'Contact',
    description: 'Contact information and social links',
    icon: 'mail',
    defaultContent: {
      showForm: false,
    } as ContactContent,
  },
  {
    type: 'CUSTOM_TEXT',
    name: 'Custom Text',
    description: 'Free-form text content with markdown support',
    icon: 'pencil',
    defaultContent: {
      content: '',
    } as CustomTextContent,
  },
  {
    type: 'CUSTOM_HTML',
    name: 'Custom HTML',
    description: 'Raw HTML for advanced customization',
    icon: 'code',
    defaultContent: {
      html: '',
    } as CustomHtmlContent,
  },
];

export function getSectionTypeInfo(type: SectionType): SectionTypeInfo | undefined {
  return SECTION_TYPES.find((s) => s.type === type);
}

export function getDefaultContent(type: SectionType): Partial<SectionContent> {
  return getSectionTypeInfo(type)?.defaultContent || {};
}
