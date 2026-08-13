import { Metadata } from 'next';
import Link from 'next/link';
import { getOrigin } from '@/utils/origin';
import { notFound } from 'next/navigation';

type Props = { 
  searchParams: Promise<{ id?: string; url?: string }> 
};

// Enable ISR with 1 hour revalidation for share pages
export const revalidate = 3600;

/* ── Server-side OG metadata ──────────────────────────────────────
   Generates proper Open Graph tags for X/Twitter card previews.
   Uses dynamic origin detection - no hardcoded URLs.
───────────────────────────────────────────────────────────────── */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const badgeId = params.id;
  const imageUrl = params.url;

  if (!badgeId && !imageUrl) {
    return { 
      title: 'HH Goa 2026 – Builder Badge',
      robots: { index: false, follow: false }
    };
  }

  const origin = await getOrigin();
  const title = 'HH Goa 2026 – My Builder Badge 🏖️🚀';
  const description = "I'm heading to Hacker House Goa 2026! Generate your own builder badge. #FrameInGoa #HackerHouseGoa";

  // Construct OG image URL - prefer ID-based (Vercel Blob), fallback to external URL
  const ogImageUrl = badgeId
    ? `${origin}/api/og?id=${badgeId}`
    : `${origin}/api/og?url=${encodeURIComponent(imageUrl!)}`;

  // Construct canonical share URL
  const canonicalUrl = badgeId 
    ? `${origin}/share?id=${badgeId}`
    : `${origin}/share?url=${encodeURIComponent(imageUrl!)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'HH Goa 2026 Badge Generator',
      images: [
        { 
          url: ogImageUrl, 
          width: 1200, 
          height: 630, 
          alt: 'HH Goa 2026 Builder Badge',
          type: 'image/png',
        }
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@HackerHouseGoa',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

/* ── Share Page UI (Server Component) ────────────────────────────
   Fully server-rendered for optimal performance and SEO.
───────────────────────────────────────────────────────────────── */
export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const badgeId = params.id;
  const imageUrl = params.url;

  // If neither ID nor URL provided, return 404
  if (!badgeId && !imageUrl) {
    notFound();
  }

  // Construct display URL for the badge image
  let displayUrl: string;
  
  if (badgeId) {
    // Check if it looks like a freeimage.host ID (contains hash-like pattern)
    // If so, it's from the fallback, construct freeimage URL
    if (badgeId.includes('-') && badgeId.length > 20) {
      // Likely a Vercel Blob ID
      const origin = await getOrigin();
      displayUrl = `${origin}/api/og?id=${badgeId}`;
    } else {
      // Likely a freeimage.host pseudo-ID, use URL param instead
      displayUrl = imageUrl || `${await getOrigin()}/api/og?id=${badgeId}`;
    }
  } else {
    displayUrl = imageUrl!;
  }

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '32px 16px', 
      textAlign: 'center',
      background: 'var(--black)', 
      color: 'var(--text-primary)',
      position: 'relative', 
      zIndex: 10,
    }}>

      {/* Tag */}
      <div style={{
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 8,
        padding: '6px 14px', 
        marginBottom: 28,
        border: '1px solid var(--border-mid)', 
        background: 'var(--black-card)',
      }}>
        <span style={{ color: 'var(--pink)', fontSize: 8 }}>◆</span>
        <span className="label-xs" style={{ color: 'var(--text-secondary)' }}>
          OFFICIAL BADGE GENERATOR
        </span>
      </div>

      {/* Heading */}
      <h1 className="title-xl" style={{ 
        fontSize: 'clamp(2rem, 6vw, 4rem)', 
        marginBottom: 8 
      }}>
        SEE YOU IN{' '}
        <span style={{ 
          color: 'transparent', 
          WebkitTextStroke: '2px var(--pink)', 
          textShadow: '0 0 60px var(--pink-glow)' 
        }}>
          GOA
        </span>
      </h1>
      <p className="label-xs" style={{ 
        color: 'var(--text-muted)', 
        marginBottom: 40 
      }}>
        Generate your own official builder badge for Hacker House Goa 2026
      </p>

      {/* Badge image - using native img for better OG preview compatibility */}
      <div style={{
        width: '100%', 
        maxWidth: 420, 
        marginBottom: 32,
        border: '1px solid var(--border-mid)',
        boxShadow: '0 0 0 1px var(--pink), 0 0 40px var(--pink-glow-sm)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt="HH Goa 2026 Builder Badge"
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block' 
          }}
          loading="eager"
        />
      </div>

      {/* CTA */}
      <Link
        href="/"
        style={{
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px 36px',
          background: 'var(--pink)', 
          color: '#fff',
          fontFamily: 'inherit', 
          fontSize: 12, 
          fontWeight: 800,
          letterSpacing: '0.16em', 
          textTransform: 'uppercase',
          textDecoration: 'none', 
          transition: 'background 0.15s',
          border: 'none',
        }}
      >
        ✦ Create My Badge
      </Link>

      {/* Footer tag */}
      <p className="label-xs" style={{ 
        color: 'var(--text-muted)', 
        marginTop: 40 
      }}>
        <span style={{ color: 'var(--pink)' }}>#FRAMEINGOA</span> 
        &nbsp;·&nbsp; HH GOA 2026
      </p>
    </div>
  );
}
