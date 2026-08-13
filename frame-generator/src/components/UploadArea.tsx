'use client';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';

export interface FrameData {
  imageSrc: string;
  name: string;
  title: string;
  role: string;
}
interface Props { onGenerate: (data: FrameData) => void; }

const T = {
  bg:        'var(--bg)',
  card:      'var(--bg-card)',
  surface:   'var(--bg-surface)',
  border:    'var(--border)',
  borderMid: 'var(--border-mid)',
  borderHi:  'var(--border-hi)',
  cream:     'var(--text-cream)',
  dim:       'var(--text-dim)',
  muted:     'var(--text-muted)',
  pink:      'var(--pink)',
  green:     'var(--green-neon)',
};

export const UploadArea: React.FC<Props> = ({ onGenerate }) => {
  const [processing, setProcessing]   = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [error,      setError]        = useState<string | null>(null);
  const [name,       setName]         = useState('');
  const [title,      setTitle]        = useState('');
  const [role,       setRole]         = useState('');
  const [imageSrc,   setImageSrc]     = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    setError(null);
    if (!files.length) return;
    const file = files[0];
    setProcessing(true);
    try {
      let final = file;
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        const cv = await heic2any({ blob: file, toType: 'image/png', quality: 1 });
        const blob = Array.isArray(cv) ? cv[0] : cv;
        final = new File([blob], file.name.replace(/\.heic$/i, '.png'), { type: 'image/png' });
      }
      const reader = new FileReader();
      reader.onload = e => { if (e.target?.result) setImageSrc(e.target.result as string); };
      reader.onerror = () => setError('Could not read file. Try another image.');
      reader.readAsDataURL(final);
    } catch {
      setError('Failed to process image. Please use JPG or PNG.');
    } finally {
      setProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg','.jpeg'], 'image/png': ['.png'], 'image/heic': ['.heic'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const handleGenerate = async () => {
    if (!imageSrc) { setError('Please upload a photo first.'); return; }
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError(null);
    setGenerating(true);
    try {
      await onGenerate({
        imageSrc,
        name:  name.trim().toUpperCase(),
        title: title.trim() || 'BUILDER',
        role:  role.trim().toUpperCase() || 'HACKER',
      });
    } catch {
      setError('Badge generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fade-up 0.5s both' }}>

      {/* ── Drop Zone ────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        style={{
          border: `1px dashed ${isDragActive ? T.green : T.borderMid}`,
          background: isDragActive ? 'rgba(57,255,20,0.04)' : T.surface,
          cursor: 'pointer',
          minHeight: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '36px 24px', gap: 14,
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { if (!isDragActive) (e.currentTarget as HTMLDivElement).style.borderColor = T.borderHi; }}
        onMouseLeave={e => { if (!isDragActive) (e.currentTarget as HTMLDivElement).style.borderColor = T.borderMid; }}
      >
        <input {...getInputProps()} />

        {processing ? (
          <>
            <Loader2 size={32} style={{ color: T.green, animation: 'spin 0.8s linear infinite' }} />
            <p className="label-xs" style={{ color: T.dim }}>Processing…</p>
          </>
        ) : imageSrc ? (
          <>
            {/* Color photo preview */}
            <div style={{
              width: 140, height: 140, overflow: 'hidden',
              border: `1px solid ${T.borderMid}`,
              flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} style={{ color: T.green }} />
              <span className="label-xs" style={{ color: T.green }}>Photo Selected</span>
            </div>
            <p className="label-xs" style={{ color: T.muted }}>Click or drag to change</p>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, border: `1px solid ${T.borderMid}`,
              background: T.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={22} style={{ color: isDragActive ? T.green : T.dim }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.cream, margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {isDragActive ? 'Drop your photo' : 'Upload your photo'}
              </p>
              <p className="label-xs" style={{ color: T.muted, margin: 0 }}>
                Tap to browse · JPG, PNG, HEIC · Up to 20 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Form Card ──────────────────────────────────────────── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '22px 20px 24px' }}>
        {/* Section label */}
        <p className="label-xs" style={{ color: T.muted, marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
          Your Information
        </p>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label className="label-xs" style={{ display: 'block', marginBottom: 8, color: T.dim }}>
            Full Name <span style={{ color: T.pink }}>*</span>
          </label>
          <input
            className="hh-input"
            type="text"
            placeholder="e.g. Harsh Prajapati"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoComplete="name"
          />
        </div>

        {/* Title + Role */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label className="label-xs" style={{ display: 'block', marginBottom: 8, color: T.dim }}>Builder Title</label>
            <input
              className="hh-input"
              type="text"
              placeholder="The Architect"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={25}
            />
          </div>
          <div>
            <label className="label-xs" style={{ display: 'block', marginBottom: 8, color: T.dim }}>Stack / Role</label>
            <input
              className="hh-input"
              type="text"
              placeholder="Full Stack"
              value={role}
              onChange={e => setRole(e.target.value)}
              maxLength={22}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 14,
            background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,40,40,0.30)',
          }}>
            <p className="label-xs" style={{ color: '#FF5555', margin: 0 }}>⚠ {error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerate}
          disabled={generating || processing}
          className="btn-primary"
        >
          {generating
            ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
            : <>✦ GENERATE MY BADGE</>
          }
        </button>
      </div>
    </div>
  );
};
