import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

// Force dynamic generation at runtime (not build time) since we fetch from database
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://4tango.com';

  // Fetch all published events
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      availableLanguages: true,
      updatedAt: true,
    },
  });

  // Generate sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add home page for each language
  SUPPORTED_LANGUAGES.forEach((lang) => {
    sitemapEntries.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  });

  // Add event pages for each language they're available in
  events.forEach((event) => {
    const languages = event.availableLanguages.length > 0
      ? event.availableLanguages
      : SUPPORTED_LANGUAGES;

    languages.forEach((lang) => {
      // Event landing page
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Event registration page
      sitemapEntries.push({
        url: `${baseUrl}/${lang}/${event.slug}/register`,
        lastModified: event.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  // Static pages (not language-prefixed)
  const staticPages = ['privacy', 'terms', 'contact'];
  staticPages.forEach((page) => {
    sitemapEntries.push({
      url: `${baseUrl}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });
  });

  return sitemapEntries;
}
