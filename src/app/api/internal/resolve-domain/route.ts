import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeHostname } from '@/lib/domains/normalizeHostname';

/**
 * Internal API endpoint for resolving custom domains
 * Used by middleware to look up events by hostname
 *
 * This endpoint should be fast and cacheable
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');

  if (!hostname) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const normalized = normalizeHostname(hostname);

  try {
    const event = await prisma.event.findFirst({
      where: {
        customDomain: normalized,
        customDomainStatus: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        defaultLanguage: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { found: false },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=60', // Cache for 1 minute
          },
        }
      );
    }

    return NextResponse.json(
      {
        found: true,
        eventId: event.id,
        slug: event.slug,
        defaultLanguage: event.defaultLanguage,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Error resolving domain:', error);
    return NextResponse.json({ found: false, error: 'Internal error' }, { status: 500 });
  }
}
