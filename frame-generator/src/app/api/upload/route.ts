import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload
 * Body: { image: "data:image/png;base64,..." }
 * Returns: { id: string, url: string }
 *
 * Uploads badge image with automatic fallback:
 * 1. Try Vercel Blob (if token configured)
 * 2. Fallback to freeimage.host (if Blob unavailable)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Check if Vercel Blob is configured
const HAS_BLOB_TOKEN = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' }, 
        { status: 400 }
      );
    }

    const { image } = body as { image?: string };

    // Validate image presence
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'No image provided or invalid format' }, 
        { status: 400 }
      );
    }

    // Validate data URL format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format - must be a data URL' }, 
        { status: 400 }
      );
    }

    // Extract MIME type and validate
    const mimeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
    if (!mimeMatch) {
      return NextResponse.json(
        { error: 'Invalid data URL format' }, 
        { status: 400 }
      );
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${mimeType}. Allowed: PNG, JPEG, WebP` }, 
        { status: 400 }
      );
    }

    // Strip data URL prefix to get raw base64
    const base64 = image.split(',')[1];
    
    if (!base64) {
      return NextResponse.json(
        { error: 'Invalid base64 data' }, 
        { status: 400 }
      );
    }

    // Convert base64 to buffer for size validation
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch {
      return NextResponse.json(
        { error: 'Failed to decode base64 data' }, 
        { status: 400 }
      );
    }

    // Validate file size
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Image too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, 
        { status: 413 }
      );
    }

    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'Empty image data' }, 
        { status: 400 }
      );
    }

    // Try Vercel Blob first, fallback to freeimage.host
    if (HAS_BLOB_TOKEN) {
      // Use Vercel Blob
      try {
        const { put } = await import('@vercel/blob');
        
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).slice(2, 11);
        const extension = mimeType.split('/')[1];
        const filename = `badge-${timestamp}-${randomSuffix}.${extension}`;

        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: false,
          cacheControlMaxAge: 31536000, // 1 year
        });

        const badgeId = filename.replace(`.${extension}`, '');

        return NextResponse.json({
          success: true,
          id: badgeId,
          url: blob.url,
          size: buffer.byteLength,
          contentType: mimeType,
          storage: 'vercel-blob',
        }, {
          status: 201,
          headers: { 'Cache-Control': 'no-store' },
        });
      } catch (blobErr) {
        console.error('[/api/upload] Vercel Blob error, falling back to freeimage.host:', blobErr);
        // Continue to fallback
      }
    }

    // Fallback: Use freeimage.host (free, no API key needed)
    console.log('[/api/upload] Using freeimage.host fallback');
    
    try {
      const params = new URLSearchParams();
      params.append('key', '6d207e02198a847aa98d0a2a901485a5');
      params.append('action', 'upload');
      params.append('source', base64);
      params.append('format', 'json');

      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[/api/upload] freeimage.host error:', text);
        throw new Error('Image host returned an error');
      }

      const data = await response.json();

      if (data?.image?.url) {
        // Generate a pseudo-ID from the URL for consistency
        const urlParts = data.image.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const pseudoId = filename.replace(/\.[^/.]+$/, ''); // Remove extension

        return NextResponse.json({
          success: true,
          id: pseudoId,
          url: data.image.url,
          size: buffer.byteLength,
          contentType: mimeType,
          storage: 'freeimage-host',
        }, {
          status: 201,
          headers: { 'Cache-Control': 'no-store' },
        });
      }

      console.error('[/api/upload] Unexpected freeimage.host response:', data);
      throw new Error('Unexpected response from image host');

    } catch (freeimagErr) {
      console.error('[/api/upload] freeimage.host error:', freeimagErr);
      return NextResponse.json(
        { error: 'Failed to upload image to storage. Please try again.' }, 
        { status: 500 }
      );
    }

  } catch (err) {
    console.error('[/api/upload] Unexpected error:', err);
    return NextResponse.json(
      { 
        error: err instanceof Error ? err.message : 'Internal upload error',
        details: process.env.NODE_ENV === 'development' ? String(err) : undefined
      }, 
      { status: 500 }
    );
  }
}

// Reject other methods
export async function GET() {
  return new Response('Method not allowed', { 
    status: 405,
    headers: { 'Allow': 'POST' }
  });
}
