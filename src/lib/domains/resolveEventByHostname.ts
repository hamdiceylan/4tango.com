import prisma from '@/lib/prisma';
import { normalizeHostname } from './normalizeHostname';

export interface DomainResolutionResult {
  found: boolean;
  eventId?: string;
  slug?: string;
  status?: 'ACTIVE' | 'PENDING' | 'FAILED' | 'DISABLED';
}

/**
 * Resolve an event by its custom domain hostname
 *
 * Only returns events with active custom domains
 */
export async function resolveEventByHostname(hostname: string): Promise<DomainResolutionResult> {
  const normalized = normalizeHostname(hostname);

  if (!normalized) {
    return { found: false };
  }

  try {
    const event = await prisma.event.findFirst({
      where: {
        customDomain: normalized,
        customDomainStatus: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        customDomainStatus: true,
      },
    });

    if (!event) {
      // Check if domain exists but is not active
      const pendingEvent = await prisma.event.findFirst({
        where: {
          customDomain: normalized,
        },
        select: {
          id: true,
          slug: true,
          customDomainStatus: true,
        },
      });

      if (pendingEvent) {
        return {
          found: false,
          eventId: pendingEvent.id,
          slug: pendingEvent.slug,
          status: pendingEvent.customDomainStatus as 'PENDING' | 'FAILED' | 'DISABLED',
        };
      }

      return { found: false };
    }

    return {
      found: true,
      eventId: event.id,
      slug: event.slug,
      status: 'ACTIVE',
    };
  } catch (error) {
    console.error('Error resolving event by hostname:', error);
    return { found: false };
  }
}

/**
 * Check if a custom domain is already in use by another event
 */
export async function isCustomDomainInUse(hostname: string, excludeEventId?: string): Promise<boolean> {
  const normalized = normalizeHostname(hostname);

  if (!normalized) {
    return false;
  }

  try {
    const event = await prisma.event.findFirst({
      where: {
        customDomain: normalized,
        ...(excludeEventId ? { NOT: { id: excludeEventId } } : {}),
      },
      select: {
        id: true,
      },
    });

    return !!event;
  } catch (error) {
    console.error('Error checking custom domain:', error);
    return false;
  }
}
