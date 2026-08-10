'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';

export interface FrameData {
  imageSrc: string;
  name: string;
  title: string;
  role: string;
}

interface UploadAreaProps {
  onGenerate: (data: FrameData) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onGenerate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);

    try {
      let finalFile = file;

      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        const converted = await heic2any({ blob: file, toType: 'image/png', quality: 1 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        finalFile = new File([blob], file.name.replace(/\.heic$/i, '.png'), { type: 'image/png' });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setImageSrc(e.target.result as string);
      };
      reader.onerror = () => setError('Failed to read file');
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Try a different photo.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/heic': ['.heic'] },
    maxFiles: 1,
  });

  const handleGenerate = () => {
    if (!imageSrc) { setError('Please upload a photo first.'); return; }
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError(null);
    onGenerate({
      imageSrc,
      name: name.trim().toUpperCase(),
      title: title.trim() || 'BUILDER',
      role: role.trim().toUpperCase() || 'HACKER',
    });
  };

  /* ─────────────────────────────────────────
     STYLES – Goa Coastal warm amber/gold theme
  ───────────────────────────────────────── */
  const inputCls =
    'w-full rounded-xl px-4 py-3 font-mono font-semibold text-amber-950 uppercase ' +
    'bg-white/60 border border-amber-400/50 placeholder-amber-700/40 ' +
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ' +
    'transition-all duration-200 backdrop-blur-sm shadow-inner';

  const labelCls =
    'block text-xs font-bold tracking-widest uppercase mb-2 text-amber-900/80';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">

      {/* ── UPLOAD ZONE ── */}
      <div
        {...getRootProps()}
        className={`relative rounded-3xl p-8 cursor-pointer transition-all duration-300
          border-2 border-dashed flex flex-col items-center justify-center text-center
          ${isDragActive
            ? 'border-amber-500 bg-amber-400/20 scale-[1.02]'
            : 'border-amber-400/50 bg-white/30 hover:bg-white/45 hover:border-amber-500/70'}
          backdrop-blur-md shadow-lg`}
        style={{ boxShadow: '0 4px 30px rgba(201,150,43,0.15)' }}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
            <p className="text-lg font-semibold text-amber-900">Processing image…</p>
          </div>
        ) : imageSrc ? (
          <div className="flex flex-col items-center gap-3">
            {/* Gold-bordered photo preview */}
            <div
              className="w-36 h-36 rounded-2xl overflow-hidden p-1"
              style={{
                background: 'linear-gradient(135deg,#f5d483,#c9962b,#8a6520,#f5d483)',
                boxShadow: '0 0 0 1px rgba(201,150,43,0.5)',
              }}
            >
              <img src={imageSrc} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className="text-sm text-amber-800 font-semibold">✓ Photo selected • Click to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f5d483,#c9962b)' }}
            >
              <UploadCloud className="w-8 h-8 text-amber-950" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-950 mb-1">Upload your photo</p>
              <p className="text-sm text-amber-800/70">Drag & drop or click to browse</p>
              <p className="text-xs text-amber-700/60 mt-1">JPG, PNG, HEIC supported</p>
            </div>
          </div>
        )}
      </div>

      {/* ── FORM FIELDS ── */}
      <div
        className="rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-md"
        style={{
          background: 'rgba(255,251,240,0.55)',
          border: '1.5px solid rgba(201,150,43,0.4)',
          boxShadow: '0 4px 30px rgba(201,150,43,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        {/* Name */}
        <div>
          <label className={labelCls}>Name</label>
          <input
            type="text"
            placeholder="e.g. JON SNOW"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputCls}
            maxLength={24}
          />
        </div>

        {/* Builder Title + Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Builder Title</label>
            <input
              type="text"
              placeholder="e.g. THE KNIGHT"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`${inputCls} text-sm`}
              maxLength={25}
            />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <input
              type="text"
              placeholder="e.g. WATCHGUARD"
              value={role}
              onChange={e => setRole(e.target.value)}
              className={`${inputCls} text-sm`}
              maxLength={22}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerate}
          className="mt-2 w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest
            text-amber-950 shadow-lg transition-all duration-200
            hover:scale-[1.02] hover:shadow-xl active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #f5d483 0%, #c9962b 50%, #f5d483 100%)',
            backgroundSize: '200% auto',
            boxShadow: '0 4px 20px rgba(201,150,43,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          ✦ Generate My Badge
        </button>
      </div>
      <br />

    </div>
  );
};
