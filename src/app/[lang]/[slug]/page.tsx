import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { isReservedSlug } from '@/lib/reserved-slugs';
import { isValidLanguage, DEFAULT_LANGUAGE, type Language, getAlternateUrls } from '@/lib/i18n';
import EventPageClient from './EventPageClient';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch event data
async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
      pageSections: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
      packages: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return event;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  if (isReservedSlug(slug)) {
    return { title: 'Not Found' };
  }

  const event = await getEvent(slug);

  if (!event || event.status === 'DRAFT') {
    return { title: 'Event Not Found' };
  }

  const validLang = isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://4tango.com';

  // Format dates
  const startDate = new Date(event.startAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const endDate = new Date(event.endAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const description =
    event.shortDescription ||
    `Join us for ${event.title} - ${startDate} to ${endDate} in ${event.city}, ${event.country}`;

  // Get hero image for Open Graph
  const heroSection = event.pageSections.find((s) => s.type === 'HERO');
  const heroImages = (heroSection?.content as Record<string, unknown>)?.backgroundImages as string[] | undefined;
  const ogImage = heroImages?.[0] || event.coverImageUrl || event.bannerUrl;

  // Generate alternate language URLs
  const alternates = getAlternateUrls(baseUrl, slug, event.availableLanguages as Language[]);

  return {
    title: `${event.title} | 4Tango`,
    description,
    keywords: ['tango', 'tango festival', 'milonga', event.city, event.country],
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      url: `${baseUrl}/${validLang}/${slug}`,
      siteName: '4Tango',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ]
        : [],
      locale: validLang,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/${validLang}/${slug}`,
      languages: alternates,
    },
    robots: {
      index: event.status === 'PUBLISHED',
      follow: true,
    },
  };
}

// JSON-LD structured data for the event
function generateJsonLd(event: Awaited<ReturnType<typeof getEvent>>, lang: string) {
  if (!event) return null;

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://4tango.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'DanceEvent',
    name: event.title,
    description: event.shortDescription || event.description,
    startDate: event.startAt.toISOString(),
    endDate: event.endAt.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venueName || `${event.city}, ${event.country}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: event.country,
        streetAddress: event.address || undefined,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name,
      email: event.organizer.email,
    },
    offers:
      event.packages.length > 0
        ? event.packages.map((pkg) => ({
            '@type': 'Offer',
            name: pkg.name,
            price: pkg.price / 100,
            priceCurrency: pkg.currency || event.currency,
            availability:
              pkg.capacity && pkg.capacity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            url: `${baseUrl}/${lang}/${event.slug}/register`,
          }))
        : event.priceAmount > 0
        ? {
            '@type': 'Offer',
            price: event.priceAmount / 100,
            priceCurrency: event.currency,
            url: `${baseUrl}/${lang}/${event.slug}/register`,
          }
        : undefined,
    image: event.coverImageUrl || event.bannerUrl,
    url: `${baseUrl}/${lang}/${event.slug}`,
  };
}

export default async function EventPage({ params, searchParams }: PageProps) {
  const { lang, slug } = await params;
  const searchParamsResolved = await searchParams;
  const isPreview = searchParamsResolved.preview === 'true';

  // Validate language
  if (!isValidLanguage(lang)) {
    notFound();
  }

  // Check for reserved slugs
  if (isReservedSlug(slug)) {
    notFound();
  }

  // Fetch event
  const event = await getEvent(slug);

  // Check if event exists and is published (or preview mode)
  if (!event || (event.status === 'DRAFT' && !isPreview)) {
    notFound();
  }

  // Generate JSON-LD
  const jsonLd = generateJsonLd(event, lang);

  // Serialize event data for client component
  const eventData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    shortDescription: event.shortDescription,
    description: event.description,
    coverImageUrl: event.coverImageUrl,
    city: event.city,
    country: event.country,
    venueName: event.venueName,
    address: event.address,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    priceAmount: event.priceAmount,
    currency: event.currency,
    primaryColor: event.primaryColor,
    logoUrl: event.logoUrl,
    bannerUrl: event.bannerUrl,
    defaultLanguage: event.defaultLanguage,
    availableLanguages: event.availableLanguages,
    organizer: event.organizer,
    pageSections: event.pageSections.map((section) => ({
      id: section.id,
      type: section.type,
      order: section.order,
      title: section.title,
      content: section.content as Record<string, unknown>,
      isVisible: section.isVisible,
    })),
    packages: event.packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      capacity: pkg.capacity,
      order: pkg.order,
    })),
  };

  return (
    <>
      {/* JSON-LD structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Client-side interactive component */}
      <EventPageClient event={eventData} lang={lang} isPreview={isPreview} />
    </>
  );
}
