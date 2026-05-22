import React, { useState } from 'react';
import { ExternalLink, Pencil, Plus, SquarePlay, Trash2 } from 'lucide-react';
import { useYTLinks } from '@/hooks/useYTLinks';
import { Modal } from '@/components/ui/Modal';
import { TagInput } from '@/components/ui/TagInput';
import { SearchBar } from '@/components/ui/SearchBar';
import { ConfirmDialog, EmptyState, Spinner } from '@/components/ui/shared';
import type { YTLink } from '@/types';

const YouTubeForm: React.FC<{
  initial?: Partial<YTLink>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (data: Omit<YTLink, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}> = ({ initial, loading, onCancel, onSubmit }) => {
  const [url, setUrl] = useState(initial?.url ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [channel, setChannel] = useState(initial?.channel ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [watched, setWatched] = useState(initial?.watched ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({
      url: url.trim(),
      title: title.trim() || null,
      thumbnail: initial?.thumbnail ?? null,
      channel: channel.trim() || null,
      tags,
      watched,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">YouTube URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} required type="url" placeholder="https://youtube.com/watch?v=..." className="vault-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title..." className="vault-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Channel</label>
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel name..." className="vault-input" />
      </div>
      <TagInput tags={tags} onChange={setTags} />
      <label className="flex items-center gap-2 text-sm text-vault-muted">
        <input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} className="accent-vault-accent" />
        Mark as watched
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="vault-btn-ghost">Cancel</button>
        <button type="submit" disabled={loading} className="vault-btn-primary">{loading ? 'Saving...' : 'Save Video'}</button>
      </div>
    </form>
  );
};

export const YouTubeBoard: React.FC = () => {
  const { ytLinks, isLoading, create, update, remove, toggleWatched } = useYTLinks();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [editing, setEditing] = useState<YTLink | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const allTags = [...new Set(ytLinks.flatMap((v) => v.tags))];
  const filtered = ytLinks.filter((v) => {
    const needle = search.toLowerCase();
    const matchesSearch = !needle || [v.title, v.url, v.channel].some((field) => (field ?? '').toLowerCase().includes(needle));
    const matchesTag = !activeTag || v.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleSubmit = (data: Omit<YTLink, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editing) {
      update.mutate({ id: editing.id, ...data }, { onSuccess: () => { setModalOpen(false); setEditing(null); } });
    } else {
      create.mutate(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div className="p-6">
      <div className="section-header">
        <h2 className="section-title">
          <span className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
            <SquarePlay className="w-5 h-5 text-red-400" />
          </span>
          YouTube
          <span className="badge-accent">{ytLinks.length}</span>
        </h2>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="vault-btn-primary">
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search videos..." />
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)} className={`tag-chip ${activeTag === tag ? 'bg-vault-accent/30 border-vault-accent/50' : ''}`}>
            #{tag}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={SquarePlay} title="No videos yet" description="Collect talks, tutorials, demos, and watch-later links." />
      ) : (
        <div className="grid-cards">
          {filtered.map((video) => (
            <div key={video.id} className="vault-card p-4 flex flex-col gap-3 animate-slide-up group">
              <div className="aspect-video rounded-lg overflow-hidden bg-vault-surface border border-vault-border">
                {video.thumbnail ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><SquarePlay className="w-8 h-8 text-vault-muted" /></div>}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-vault-text line-clamp-2">{video.title || video.url}</h3>
                  {video.channel && <p className="text-[11px] text-vault-muted mt-1">{video.channel}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={video.url} target="_blank" rel="noreferrer" className="p-1 text-vault-muted hover:text-vault-accent"><ExternalLink className="w-3.5 h-3.5" /></a>
                  <button onClick={() => { setEditing(video); setModalOpen(true); }} className="p-1 text-vault-muted hover:text-vault-text"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleting(video.id)} className="p-1 text-vault-muted hover:text-vault-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-vault-muted">
                  <input type="checkbox" checked={video.watched} onChange={(e) => toggleWatched.mutate({ id: video.id, watched: e.target.checked })} className="accent-vault-accent" />
                  Watched
                </label>
                <span className="text-[10px] text-vault-muted/60">{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
              {video.tags.length > 0 && <div className="flex flex-wrap gap-1">{video.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Video' : 'Add Video'}>
        <YouTubeForm initial={editing ?? undefined} loading={create.isPending || update.isPending} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog isOpen={!!deleting} title="Delete Video" description="This YouTube link will be permanently deleted." loading={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove.mutate(deleting, { onSuccess: () => setDeleting(null) }); }} />
    </div>
  );
};
