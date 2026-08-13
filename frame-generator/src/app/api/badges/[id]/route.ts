import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/badges/[id]
 * Fetches a badge image from Vercel Blob storage by ID.
 * Returns the raw PNG image with proper caching headers.
 */

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response('Missing badge ID', { status: 400 });
    }

    // Construct filename from ID
    const filename = `${id}.png`;

    // Get blob metadata to construct URL
    // Note: In production, Vercel Blob automatically handles this
    // We need to construct the full blob URL
    try {
      const blobInfo = await head(filename);
      
      if (!blobInfo) {
        return new Response('Badge not found', { status: 404 });
      }

      // Redirect to the actual blob URL (leverages CDN)
      return NextResponse.redirect(blobInfo.url, {
        status: 307, // Temporary redirect
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (blobErr) {
      console.error('[/api/badges/[id]] Blob fetch error:', blobErr);
      return new Response('Badge not found', { status: 404 });
    }
  } catch (err) {
    console.error('[/api/badges/[id]] Error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}
