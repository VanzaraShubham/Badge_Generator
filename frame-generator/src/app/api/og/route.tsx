import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Cache OG images aggressively - they don't change
const CACHE_CONTROL = 'public, max-age=31536000, s-maxage=31536000, immutable';

// Check if Vercel Blob is configured (edge runtime check)
const HAS_BLOB_TOKEN = typeof process !== 'undefined' && !!process.env?.BLOB_READ_WRITE_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');
    const badgeUrl = searchParams.get('url');

    if (!badgeId && !badgeUrl) {
      return new Response('Missing id or url parameter', { 
        status: 400,
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    let imageDataUri: string;
    let fetchUrl: string;

    if (badgeId) {
      // Check if this is a Vercel Blob ID (long timestamp-based) or external ID
      const isVerboseBlobId = badgeId.startsWith('badge-') && badgeId.includes('-');
      
      if (isVerboseBlobId && HAS_BLOB_TOKEN) {
        // Try to fetch from Vercel Blob
        const host = request.headers.get('host') || 'hh-goa-badge.vercel.app';
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        const origin = `${proto}://${host}`;
        fetchUrl = `${origin}/api/badges/${badgeId}`;
        
        try {
          const imgRes = await fetch(fetchUrl, { 
            cache: 'no-store',
            headers: { 'User-Agent': 'OG-Image-Generator/1.0' }
          });
          
          if (!imgRes.ok) {
            console.error(`[/api/og] Badge fetch failed: ${imgRes.status}`);
            return new Response('Badge not found', { 
              status: 404,
              headers: { 'Cache-Control': 'no-store' }
            });
          }
          
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          imageDataUri = `data:image/png;base64,${base64}`;
        } catch (fetchErr) {
          console.error('[/api/og] Fetch error:', fetchErr);
          return new Response('Failed to fetch badge', { 
            status: 502,
            headers: { 'Cache-Control': 'no-store' }
          });
        }
      } else {
        // Not a Vercel Blob ID, or Blob not configured
        // Return error - client should pass URL instead
        return new Response('Badge ID not found. Please use url parameter instead.', { 
          status: 404,
          headers: { 'Cache-Control': 'no-store' }
        });
      }
    } else {
      // Fallback: fetch from external URL (backwards compatibility)
      fetchUrl = badgeUrl!;
      
      try {
        const imgRes = await fetch(fetchUrl, { 
          cache: 'no-store',
          headers: {
            'User-Agent': 'OG-Image-Generator/1.0'
          }
        });
        
        if (!imgRes.ok) {
          console.error(`[/api/og] External image fetch failed: ${imgRes.status}`);
          return new Response('Image not found', { 
            status: 404,
            headers: { 'Cache-Control': 'no-store' }
          });
        }
        
        const buffer = await imgRes.arrayBuffer();
        
        // Validate image size (max 5MB)
        if (buffer.byteLength > 5 * 1024 * 1024) {
          return new Response('Image too large', { 
            status: 413,
            headers: { 'Cache-Control': 'no-store' }
          });
        }
        
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/png';
        imageDataUri = `data:${mimeType};base64,${base64}`;
      } catch (fetchErr) {
        console.error('[/api/og] External fetch error:', fetchErr);
        return new Response('Failed to fetch image', { 
          status: 502,
          headers: { 'Cache-Control': 'no-store' }
        });
      }
    }

    // Generate OG image with proper dimensions for X/Twitter
    const response = new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#06100A',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #0d2114 0%, #06100A 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUri}
            alt="HH Goa 2026 Badge"
            width={580}
            height={580}
            style={{ 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))'
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Set aggressive caching headers for CDN
    response.headers.set('Cache-Control', CACHE_CONTROL);
    response.headers.set('CDN-Cache-Control', CACHE_CONTROL);
    response.headers.set('Vercel-CDN-Cache-Control', CACHE_CONTROL);
    
    // Add CORS headers for X/Twitter crawler
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (err) {
    console.error('[/api/og] Unexpected error:', err);
    return new Response('Failed to generate OG image', { 
      status: 500,
      headers: { 
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain'
      }
    });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
