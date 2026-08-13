import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

/**
 * POST /api/upload
 * Body: { image: "data:image/png;base64,..." }
 * Returns: { id: string, url: string }
 *
 * Uploads badge image to Vercel Blob storage for fast, reliable hosting.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body as { image: string };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip the data URL prefix to get raw base64
    const base64 = image.includes(',') ? image.split(',')[1] : image;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');

    // Generate unique filename with timestamp
    const filename = `badge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.png`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
    });

    // Extract the blob ID from the filename for shorter share links
    const blobId = filename.replace('.png', '');

    return NextResponse.json({
      id: blobId,
      url: blob.url,
    });

  } catch (err) {
    console.error('[/api/upload] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal upload error' },
      { status: 500 }
    );
  }
}
