'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import UserAvatar from './UserAvatar';

interface PostComposerProps {
  onPost?: (post: any) => void;
}

export default function PostComposer({ onPost }: PostComposerProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!session) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('الحد الأقصى لحجم الصورة 5 ميجابايت'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) { setError('اكتب شيئاً أو أضف صورة'); return; }
    setUploading(true);
    setError('');

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const form = new FormData();
        form.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!uploadRes.ok) throw new Error('فشل رفع الصورة');
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() || null, imageUrl }),
      });

      if (!res.ok) throw new Error('فشل نشر البوست');
      const newPost = await res.json();
      setContent('');
      removeImage();
      onPost?.(newPost);
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,26,0.98) 0%, rgba(22,22,22,1) 100%)',
        border: '1px solid rgba(139,0,0,0.3)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.875rem', direction: 'rtl' }}>
        <UserAvatar user={session.user} size={44} clickable={false} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ماذا يدور في بالك؟"
            maxLength={500}
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.875rem',
              padding: '0.75rem 1rem',
              color: '#e5e7eb',
              fontSize: '0.95rem',
              resize: 'none',
              outline: 'none',
              direction: 'rtl',
              fontFamily: 'var(--font-tajawal), sans-serif',
              lineHeight: 1.6,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(139,0,0,0.5)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />

          {/* Image preview */}
          {imagePreview && (
            <div style={{ position: 'relative', marginTop: '0.75rem', borderRadius: '0.75rem', overflow: 'hidden', maxHeight: 220 }}>
              <img src={imagePreview} alt="معاينة" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
              <button
                onClick={removeImage}
                style={{
                  position: 'absolute', top: 6, left: 6, width: 26, height: 26,
                  borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none',
                  color: '#fff', fontSize: '1rem', cursor: 'pointer', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: '0.5rem 0 0', direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
              ⚠ {error}
            </p>
          )}

          {/* Footer bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', direction: 'rtl' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Attach image */}
              <button
                onClick={() => fileRef.current?.click()}
                title="إضافة صورة"
                style={{
                  background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                  fontSize: '1.3rem', padding: '0.25rem 0.375rem', borderRadius: '0.5rem',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#e5e7eb'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                🖼️
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
              <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>{content.length}/500</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || (!content.trim() && !imageFile)}
              style={{
                background: uploading || (!content.trim() && !imageFile)
                  ? '#3a0000'
                  : 'linear-gradient(135deg, #8B0000, #c0392b)',
                color: uploading || (!content.trim() && !imageFile) ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.5rem 1.25rem',
                cursor: uploading || (!content.trim() && !imageFile) ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-tajawal), sans-serif',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              {uploading ? (
                <>
                  <span style={{ display: 'inline-block', width: '0.875rem', height: '0.875rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  جاري النشر…
                </>
              ) : (
                'نشر'
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
