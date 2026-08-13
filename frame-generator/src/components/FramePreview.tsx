'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Download, RefreshCcw } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 15, height: 15, fill: 'currentColor', flexShrink: 0 }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const T = {
  bg:        'var(--bg)',
  card:      'var(--bg-card)',
  border:    'var(--border)',
  borderMid: 'var(--border-mid)',
  borderHi:  'var(--border-hi)',
  cream:     'var(--text-cream)',
  dim:       'var(--text-dim)',
  muted:     'var(--text-muted)',
  pink:      'var(--pink)',
  green:     'var(--green-neon)',
};

interface Props { 
  badgeUrl: string;
  badgeId: string;
  storage?: string;
  onReset: () => void;
}

export const FramePreview: React.FC<Props> = ({ badgeUrl, badgeId, storage, onReset }) => {
  const [shareError, setShareError] = useState<string | null>(null);

  /* Download */
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = badgeUrl;
    a.download = 'HH_Goa_2026_Badge.png';
    a.target = '_blank'; // Open in new tab for external URLs
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* Share on X - use the already uploaded badge */
  const handleShare = async () => {
    setShareError(null);

    try {
      // Use dynamic origin detection - works in all environments
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Construct share URL based on storage type
      let sharePageUrl: string;
      if (storage === 'freeimage-host') {
        // For freeimage fallback, pass URL directly
        sharePageUrl = `${origin}/share?url=${encodeURIComponent(badgeUrl)}`;
      } else {
        // For Vercel Blob, use ID-based URL
        sharePageUrl = `${origin}/share?id=${badgeId}`;
      }

      const tweet = encodeURIComponent(
        `Just generated my HH Goa 2026 builder badge! 🏖️🚀\n\nGenerate yours 👇\n${sharePageUrl}\n\n#HackerHouseGoa #FrameInGoa`
      );
      window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank', 'noopener');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Share error';
      setShareError(msg);
    }
  };

  return (
    /* 2-col on md+, stacked on mobile */
    <div
      style={{ animation: 'fade-in 0.4s both' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)',
        gap: 24,
        alignItems: 'start',
      }}
      className="badge-grid"
      >

        {/* ── Badge image ─────────────────────────────────────── */}
        <div
          style={{
            border: `1px solid ${T.borderMid}`,
            animation: 'badge-glow 3s ease-in-out infinite',
            lineHeight: 0,
          }}
        >
          <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
            <Image
              src={badgeUrl}
              alt="Your HH Goa 2026 Builder Badge"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* ── Action panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Info card */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '18px 18px 20px' }}>
            <p className="label-xs" style={{ color: T.muted, marginBottom: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
              Badge Actions
            </p>

            {shareError && (
              <div style={{ padding: '8px 12px', marginBottom: 12, background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,40,40,0.30)' }}>
                <p className="label-xs" style={{ color: '#FF5555', margin: 0 }}>⚠ {shareError}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={handleDownload} className="btn-secondary">
                <Download size={14} /> Download PNG
              </button>
              <button onClick={handleShare} className="btn-primary">
                <XIcon /> Share on X
              </button>
            </div>

            <p className="label-xs" style={{ color: T.muted, marginTop: 14, lineHeight: 1.6 }}>
              Your badge is stored in the cloud. Share with a preview card on X!
            </p>
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'none', border: `1px solid ${T.border}`,
              color: T.muted, fontFamily: 'inherit',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '12px 16px', cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = T.borderHi;
              e.currentTarget.style.color = T.cream;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.muted;
            }}
          >
            <RefreshCcw size={11} /> Create Another Badge
          </button>
        </div>
      </div>

      {/* Mobile: stack columns */}
      <style>{`
        @media (max-width: 640px) {
          .badge-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
