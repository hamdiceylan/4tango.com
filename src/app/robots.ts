import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://4tango.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en/*',
          '/es/*',
          '/de/*',
          '/fr/*',
          '/it/*',
          '/pl/*',
          '/tr/*',
          '/privacy',
          '/terms',
          '/contact',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/events/',
          '/settings/',
          '/registrations/',
          '/onboarding/',
          '/login',
          '/signup',
          '/check-email',
          '/verify-email',
          '/complete-profile',
          '/invite/',
          '/registration/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
