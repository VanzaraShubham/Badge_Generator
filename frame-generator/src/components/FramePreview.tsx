'use client';

import React from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FramePreviewProps {
  imageUrl: string;
  onReset: () => void;
}

export const FramePreview: React.FC<FramePreviewProps> = ({ imageUrl, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'HH_Goa_2026_Badge.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      "I'm heading to HH Goa 2026! 🏖️🚀\n\nGenerate your builder badge here.\n\n#HackerHouseGoa #FrameInGoa"
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">

      {/* Badge preview with gold frame */}
      <div
        className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 0 3px #c9962b, 0 0 0 6px rgba(245,212,131,0.35), 0 30px 80px rgba(0,0,0,0.3)',
        }}
      >
        <Image
          src={imageUrl}
          alt="Generated HH Goa Badge"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <button
          onClick={handleDownload}
          id="download-badge-btn"
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-4
            rounded-2xl font-black text-base uppercase tracking-wider text-amber-950
            transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #f5d483, #c9962b, #f5d483)',
            backgroundSize: '200% auto',
            boxShadow: '0 4px 20px rgba(201,150,43,0.5)',
          }}
        >
          <Download className="w-5 h-5" />
          Download Badge
        </button>

        <button
          onClick={handleShare}
          id="share-on-x-btn"
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-4
            rounded-2xl font-black text-base uppercase tracking-wider text-white
            bg-black hover:bg-neutral-900
            transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <XIcon />
          Share on X
        </button>
      </div>

      <button
        onClick={onReset}
        id="create-another-btn"
        className="flex items-center gap-2 text-amber-900/60 hover:text-amber-900
          text-sm font-semibold transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Create Another Badge
      </button>
      <br />
    </div>
  );
};
