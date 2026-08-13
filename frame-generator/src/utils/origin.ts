import { headers } from 'next/headers';

/**
 * Get the current origin dynamically from request headers.
 * Works in both development and production without hardcoded URLs.
 */
export async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || headersList.get('x-forwarded-host');
  
  if (!host) {
    // Fallback for edge cases
    return 'https://hh-goa-badge.vercel.app';
  }

  // Determine protocol
  const proto = headersList.get('x-forwarded-proto') || 
                (host.includes('localhost') ? 'http' : 'https');

  return `${proto}://${host}`;
}

/**
 * Client-side origin detection
 */
export function getClientOrigin(): string {
  if (typeof window === 'undefined') {
    throw new Error('getClientOrigin() can only be called on client side');
  }
  return window.location.origin;
}
