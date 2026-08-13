import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');
    const badgeUrl = searchParams.get('url'); // Keep for backwards compatibility

    if (!badgeId && !badgeUrl) {
      return new Response('Missing id or url parameter', { status: 400 });
    }

    let imageDataUri: string;

    if (badgeId) {
      // Construct Vercel Blob URL from ID
      // The blob URL pattern is: https://<account>.public.blob.vercel-storage.com/<filename>
      // We need to get the base URL from environment or construct it
      const blobBaseUrl = process.env.BLOB_URL_BASE || 'https://public.blob.vercel-storage.com';
      const blobUrl = `${blobBaseUrl}/${badgeId}.png`;
      
      try {
        const imgRes = await fetch(blobUrl, { cache: 'no-store' });
        if (!imgRes.ok) throw new Error(`Blob fetch failed: ${imgRes.status}`);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        imageDataUri = `data:image/png;base64,${base64}`;
      } catch (fetchErr) {
        console.error('[/api/og] failed to fetch from blob:', fetchErr);
        return new Response('Failed to fetch badge from storage', { status: 502 });
      }
    } else {
      // Fallback: fetch from external URL (for backwards compatibility)
      try {
        const imgRes = await fetch(badgeUrl!, { cache: 'no-store' });
        if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/png';
        imageDataUri = `data:${mimeType};base64,${base64}`;
      } catch (fetchErr) {
        console.error('[/api/og] failed to fetch badge image:', fetchErr);
        return new Response('Failed to fetch badge image', { status: 502 });
      }
    }

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
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUri}
            alt="HH Goa 2026 Badge"
            width={580}
            height={580}
            style={{ objectFit: 'contain' }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    );

    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
    return response;
  } catch (err) {
    console.error('[/api/og] error:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
