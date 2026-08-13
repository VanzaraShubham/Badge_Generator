'use client';
import React, { useState } from 'react';
import { UploadArea, FrameData } from '@/components/UploadArea';
import { FramePreview } from '@/components/FramePreview';
import { generateFrame } from '@/utils/canvas';

const T = {
  bg:        'var(--bg)',
  card:      'var(--bg-card)',
  border:    'var(--border)',
  borderMid: 'var(--border-mid)',
  cream:     'var(--text-cream)',
  dim:       'var(--text-dim)',
  muted:     'var(--text-muted)',
  pink:      'var(--pink)',
  green:     'var(--green-neon)',
};

export default function Home() {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);

  const handleGenerate = async (data: FrameData) => {
    const url = await generateFrame(data);
    setFrameUrl(url);
  };

  return (
    <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── STICKY NAV ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(6,16,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <span className="label-xs" style={{ color: T.muted, letterSpacing: '0.22em' }}>HH GOA 2026</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a
            href="https://hhgoa.com" target="_blank" rel="noopener noreferrer"
            className="label-xs"
            style={{ color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = T.cream)}
            onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
          >HHGOA.COM ↗</a>
          <span className="label-xs" style={{ color: T.pink }}>#FRAMEINGOA</span>
        </div>
      </nav>

      {/* ── HERO (always visible, adapts when badge is ready) ── */}
      <header style={{
        textAlign: 'center',
        padding: frameUrl ? '28px 16px 20px' : '60px 16px 40px',
        transition: 'padding 0.4s',
        borderBottom: frameUrl ? `1px solid ${T.border}` : 'none',
      }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', marginBottom: frameUrl ? 16 : 24,
          border: `1px solid ${T.borderMid}`, background: T.card,
        }}>
          <span style={{ color: T.green, fontSize: 8 }}>◆</span>
          <span className="label-xs" style={{ color: T.dim }}>OFFICIAL BADGE GENERATOR</span>
        </div>

        {!frameUrl ? (
          <>
            {/* Full hero title */}
            <h1 className="title-hero" style={{ margin: '0 0 4px', color: T.cream, animation: 'fade-up 0.55s both' }}>
              HACKER HOUSE
            </h1>
            <h1 className="title-hero" style={{
              margin: '0 0 28px',
              color: 'transparent',
              WebkitTextStroke: `2px ${T.pink}`,
              textShadow: `0 0 80px ${T.pink}40`,
              animation: 'fade-up 0.55s 0.07s both',
            }}>
              GOA 2026
            </h1>
            {/* Steps */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['Upload Photo', 'Fill Details', 'Download Badge'].map((s, i) => (
                <React.Fragment key={s}>
                  <span className="label-xs" style={{ color: T.muted }}>{s}</span>
                  {i < 2 && <span style={{ color: T.border, fontSize: 9 }}>·</span>}
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          /* Compact badge-ready heading */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ color: T.green, fontSize: 18 }}>✦</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 800, color: T.cream, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Your Badge Is Ready!
            </h2>
            <span style={{ color: T.green, fontSize: 18 }}>✦</span>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main style={{
        flex: 1, position: 'relative', zIndex: 10,
        width: '100%',
        maxWidth: frameUrl ? 1040 : 600,
        margin: '0 auto',
        padding: '32px 16px 56px',
        transition: 'max-width 0.4s',
      }}>
        {frameUrl ? (
          <FramePreview imageUrl={frameUrl} onReset={() => setFrameUrl(null)} />
        ) : (
          <UploadArea onGenerate={handleGenerate} />
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${T.border}`,
        padding: '16px 24px',
        textAlign: 'center',
        background: 'rgba(6,16,10,0.6)',
      }}>
        <span className="label-xs" style={{ color: T.muted }}>
          © 2026 HH GOA &nbsp;·&nbsp; BUILDERS &amp; HACKERS &nbsp;·&nbsp;
          <span style={{ color: T.pink }}> #FRAMEINGOA</span>
        </span>
      </footer>
    </div>
  );
}
