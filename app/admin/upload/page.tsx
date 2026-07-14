'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

type UploadedPost = { id: string; imageUrl: string; caption?: string };

export default function AdminUploadPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState<UploadedPost[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileRead(file);
      setUploadMode('file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
      setUploadMode('file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = imageUrl.trim();
    if (!url) { setError('Provide an image URL or upload a file.'); return; }

    setUploading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, caption: caption.trim() || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setUploaded((prev) => [json.data, ...prev]);
        setImageUrl('');
        setCaption('');
        setPreview('');
      } else {
        setError(json.error || 'Upload failed.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-silver-500 tracking-wider mb-1">
          Upload Exhibit
        </h1>
        <p className="text-silver-900 text-sm">Add new media to the Archive. Once uploaded, it is permanent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload form */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-crimson-950 border-crimson-700 text-crimson-300'
                    : 'bg-obsidian-700 border-obsidian-500 text-silver-900 hover:border-obsidian-400'
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-crimson-950 border-crimson-700 text-crimson-300'
                    : 'bg-obsidian-700 border-obsidian-500 text-silver-900 hover:border-obsidian-400'
                }`}
              >
                File Upload
              </button>
            </div>

            {uploadMode === 'url' ? (
              <div>
                <label className="block text-silver-900 text-xs uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setPreview(e.target.value); }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-crimson-600 bg-crimson-950/20'
                    : 'border-obsidian-500 hover:border-crimson-800'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-3xl mb-2">📁</div>
                <p className="text-silver-900 text-sm">
                  {dragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-obsidian-500 text-xs mt-1">JPG, PNG, GIF, WebP</p>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-silver-900 text-xs uppercase tracking-wider mb-1.5">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Describe this exhibit…"
                className="w-full bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-obsidian-500 text-xs mt-1 text-right">{caption.length}/500</p>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={uploading}>
              Add to Archive
            </Button>
          </form>
        </div>

        {/* Preview + recent uploads */}
        <div className="space-y-4">
          {/* Preview */}
          {preview && (
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-obsidian-600">
                <p className="text-silver-900 text-xs uppercase tracking-wider">Preview</p>
              </div>
              <img src={preview} alt="Preview" className="w-full object-cover max-h-64" />
            </div>
          )}

          {/* Recent uploads in this session */}
          {uploaded.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-silver-900 text-xs uppercase tracking-wider mb-3">
                Uploaded this session ({uploaded.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {uploaded.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-obsidian-700"
                    >
                      <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-silver-700 text-xs truncate">{p.caption || 'No caption'}</p>
                        <p className="text-obsidian-500 text-[10px]">ID: {p.id.slice(0, 8)}…</p>
                      </div>
                      <span className="text-green-400 text-xs">✓</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
