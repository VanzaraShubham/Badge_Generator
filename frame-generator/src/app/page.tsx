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

interface BadgeData {
  url: string;
  id: string;
  storage?: string;
}

export default function Home() {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleGenerate = async (data: FrameData) => {
    setUploadError(null);
    
    // Step 1: Generate badge locally
    const localBadgeUrl = await generateFrame(data);
    
    // Step 2: Immediately upload to backend
    setUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: localBadgeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json() as {
        id: string;
        url: string;
        storage?: string;
      };

      setBadgeData({
        url: result.url,
        id: result.id,
        storage: result.storage,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload badge';
      setUploadError(message);
      console.error('[handleGenerate] Upload error:', err);
    } finally {
      setUploading(false);
    }
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
        padding: badgeData ? '28px 16px 20px' : '60px 16px 40px',
        transition: 'padding 0.4s',
        borderBottom: badgeData ? `1px solid ${T.border}` : 'none',
      }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', marginBottom: badgeData ? 16 : 24,
          border: `1px solid ${T.borderMid}`, background: T.card,
        }}>
          <span style={{ color: T.green, fontSize: 8 }}>◆</span>
          <span className="label-xs" style={{ color: T.dim }}>OFFICIAL BADGE GENERATOR</span>
        </div>

        {!badgeData ? (
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
        maxWidth: badgeData ? 1040 : 600,
        margin: '0 auto',
        padding: '32px 16px 56px',
        transition: 'max-width 0.4s',
      }}>
        {uploading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            animation: 'fade-in 0.3s both'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '20px 32px',
              background: T.card,
              border: `1px solid ${T.borderMid}`,
            }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                border: `3px solid ${T.border}`,
                borderTopColor: T.green,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span className="label-xs" style={{ color: T.dim }}>UPLOADING TO CLOUD...</span>
            </div>
          </div>
        ) : uploadError ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
          }}>
            <div style={{
              maxWidth: 500,
              margin: '0 auto',
              padding: '24px',
              background: 'rgba(255,0,0,0.06)',
              border: '1px solid rgba(255,40,40,0.30)',
            }}>
              <p style={{ color: '#FF5555', margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>
                ⚠ Upload Failed
              </p>
              <p className="label-xs" style={{ color: T.muted, margin: 0 }}>
                {uploadError}
              </p>
            </div>
            <button 
              onClick={() => setBadgeData(null)}
              className="btn-secondary"
              style={{ marginTop: 20 }}
            >
              Try Again
            </button>
          </div>
        ) : badgeData ? (
          <FramePreview 
            badgeUrl={badgeData.url}
            badgeId={badgeData.id}
            storage={badgeData.storage}
            onReset={() => setBadgeData(null)} 
          />
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
