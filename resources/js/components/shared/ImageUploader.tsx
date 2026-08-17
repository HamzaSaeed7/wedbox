import React, { useRef, useState } from 'react';
import Icon from './Icon';

interface ImageUploaderProps {
  /** Current image URL ('' when none) */
  value: string;
  onChange: (url: string) => void;
  /** Uploads the file and resolves to its public URL */
  upload: (file: File) => Promise<string>;
  /** Preview aspect ratio, e.g. '16/9' */
  aspectRatio?: string;
  hint?: string;
}

/**
 * Click-or-drag image picker with an inline preview.
 * Uploads immediately and hands the resulting URL back via onChange, so the
 * parent form only ever stores a URL string.
 */
export default function ImageUploader({
  value,
  onChange,
  upload,
  aspectRatio = '16 / 9',
  hint = 'PNG or JPG, up to 10 MB',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('That file is not an image.');
      return;
    }
    setErr('');
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch {
      setErr('Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pick = () => { if (!busy) inputRef.current?.click(); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!busy) handleFile(e.dataTransfer.files?.[0]);
  };

  const overlay = (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(255,255,255,.72)',
      display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
    }}>
      Uploading…
    </div>
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; handleFile(f); }}
      />

      {value ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <img src={value} alt="Cover preview" style={{ width: '100%', aspectRatio, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-sm" onClick={pick} disabled={busy}
              style={{ background: 'white', border: '1px solid var(--line)' }}>Replace</button>
            <button type="button" className="btn btn-sm" onClick={() => { setErr(''); onChange(''); }} disabled={busy}
              style={{ background: 'white', border: '1px solid var(--line)' }}>Remove</button>
          </div>
          {busy && overlay}
        </div>
      ) : (
        <div
          onClick={pick}
          onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }}
          style={{
            position: 'relative',
            aspectRatio,
            borderRadius: 12,
            border: `1.5px dashed ${dragging ? 'var(--primary)' : 'var(--line)'}`,
            background: dragging ? 'rgba(77,201,201,.06)' : 'var(--bg-3)',
            display: 'grid',
            placeItems: 'center',
            cursor: busy ? 'default' : 'pointer',
            textAlign: 'center',
            padding: 16,
          }}
        >
          <div>
            <Icon name="upload" size={26} color="var(--muted)" />
            <div className="fw-700 text-14 mt-8">Click to upload or drag an image here</div>
            <div className="muted text-12 mt-4">{hint}</div>
          </div>
          {busy && overlay}
        </div>
      )}

      {err && <p style={{ color: '#E11D48', fontSize: 12, marginTop: 8 }}>{err}</p>}
    </div>
  );
}
