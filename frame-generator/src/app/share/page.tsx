import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';

type Props = { searchParams: Promise<{ id?: string; url?: string }> };

/* ── Server-side OG metadata ──────────────────────────────────────
   When Twitter/X fetches this page to build the card preview,
   it sees the badge image in og:image and twitter:image.
───────────────────────────────────────────────────────────────── */
export async function generateMetadata(
  { searchParams }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams;
  const badgeId = params.id;
  const imageUrl = params.url; // Fallback for old links

  if (!badgeId && !imageUrl) {
    return { title: 'HH Goa 2026 – Builder Badge' };
  }

  const title = 'HH Goa 2026 – My Builder Badge 🏖️🚀';
  const description =
    "I'm heading to Hacker House Goa 2026! Generate your own builder badge. #FrameInGoa #HackerHouseGoa";

  const headersList = await headers();
  const host = headersList.get('host') || 'hh-goa-badge.vercel.app';
  const protocol = host.includes('localhost') && !host.includes('devtunnels.ms') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  // Use /api/og to generate a proper 1200×630 card served from our own domain.
  // Prefer ID-based URL (fetches from Vercel Blob), fallback to external URL.
  const ogImageUrl = badgeId
    ? `${origin}/api/og?id=${badgeId}`
    : `${origin}/api/og?url=${encodeURIComponent(imageUrl!)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'HH Goa 2026 Builder Badge' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

/* ── Share Page UI ─────────────────────────────────────────────── */
export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const badgeId = params.id;
  const imageUrl = params.url;

  // If we have an ID, construct the Vercel Blob URL for display
  const displayUrl = badgeId 
    ? `${process.env.BLOB_URL_BASE || 'https://public.blob.vercel-storage.com'}/${badgeId}.png`
    : imageUrl;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', textAlign: 'center',
      background: 'var(--black)', color: 'var(--text-primary)',
      position: 'relative', zIndex: 10,
    }}>

      {/* Tag */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', marginBottom: 28,
        border: '1px solid var(--border-mid)', background: 'var(--black-card)',
      }}>
        <span style={{ color: 'var(--pink)', fontSize: 8 }}>◆</span>
        <span className="label-xs" style={{ color: 'var(--text-secondary)' }}>
          OFFICIAL BADGE GENERATOR
        </span>
      </div>

      {/* Heading */}
      <h1 className="title-xl" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: 8 }}>
        SEE YOU IN{' '}
        <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--pink)', textShadow: '0 0 60px var(--pink-glow)' }}>
          GOA
        </span>
      </h1>
      <p className="label-xs" style={{ color: 'var(--text-muted)', marginBottom: 40 }}>
        Generate your own official builder badge for Hacker House Goa 2026
      </p>

      {/* Badge image */}
      {displayUrl ? (
        <div style={{
          width: '100%', maxWidth: 420, marginBottom: 32,
          border: '1px solid var(--border-mid)',
          boxShadow: '0 0 0 1px var(--pink), 0 0 40px var(--pink-glow-sm)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Builder Badge"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', maxWidth: 420, aspectRatio: '1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed var(--border-mid)',
          marginBottom: 32,
        }}>
          <span className="label-xs" style={{ color: 'var(--text-muted)' }}>No badge URL provided</span>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 36px',
          background: 'var(--pink)', color: '#fff',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 800,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'background 0.15s',
          border: 'none',
        }}
        onMouseEnter={undefined}
      >
        ✦ Create My Badge
      </Link>

      {/* Footer tag */}
      <p className="label-xs" style={{ color: 'var(--text-muted)', marginTop: 40 }}>
        <span style={{ color: 'var(--pink)' }}>#FRAMEINGOA</span> &nbsp;·&nbsp; HH GOA 2026
      </p>
    </div>
  );
}
