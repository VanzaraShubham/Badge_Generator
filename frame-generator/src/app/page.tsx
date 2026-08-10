'use client';

import { useState } from 'react';
import { UploadArea, FrameData } from '@/components/UploadArea';
import { FramePreview } from '@/components/FramePreview';
import { generateFrame } from '@/utils/canvas';

export default function Home() {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);

  const handleGenerate = async (data: FrameData) => {
    try {
      const generated = await generateFrame(data);
      setFrameUrl(generated);
    } catch (error) {
      console.error('Failed to generate frame', error);
      alert('Failed to generate frame. Please try again.');
    }
  };

  const handleReset = () => setFrameUrl(null);

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center">

      {/* ── HERO HEADER ── */}
      <header className="w-full text-center pt-14 pb-10 px-6">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full
          border border-amber-700/40 bg-amber-500/20 backdrop-blur-md
          text-amber-900 font-bold tracking-widest text-xs uppercase shadow">
          ✦ Official Badge Generator
        </div>

        {/* Main title */}
        <h1
          className="text-5xl sm:text-7xl font-black bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          <span className="text-red-shimmer">HACKER HOUSE</span>
          <br />
          <span
            className="text-5xl sm:text-6xl bold"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px #3e5226ff',
              textShadow: '0 4px 24px rgba(201,150,43,0.4)',
            }}
          >
            GOA 2026
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-5 text-lg sm:text-xl text-amber-950/75 font-medium max-w-xl mx-auto leading-relaxed">
          Upload your photo • Enter your details • Download your official builder badge
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-600/50" />
          <span className="text-amber-700 text-xlg">🏖️</span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-600/50" />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <section className="w-full max-w-xl px-4">
        {frameUrl ? (
          <FramePreview imageUrl={frameUrl} onReset={handleReset} />
        ) : (
          <UploadArea onGenerate={handleGenerate} />
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full mt-auto z-50
        border-t border-amber-700/30 bg-amber-950/80 backdrop-blur-xl
        py-3 px-6 text-center text-amber-200/70 text-xs tracking-wide">
        🌴 &nbsp;HH Goa 2026 &nbsp;•&nbsp; Built for Builders, Hackers & Creators &nbsp;•&nbsp; #FrameInGoa 🌴
      </footer>
    </main>
  );
}
