import React, { useState } from 'react';
import { Link2, Plus, Pencil, Trash2, ExternalLink, Globe } from 'lucide-react';
import { useLinks } from '@/hooks/useLinks';
import { Modal } from '@/components/ui/Modal';
import { TagInput } from '@/components/ui/TagInput';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner, EmptyState, ConfirmDialog } from '@/components/ui/shared';
import type { Link } from '@/types';

const LinkForm: React.FC<{
  initial?: Partial<Link>;
  onSubmit: (data: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
  onCancel: () => void;
}> = ({ initial, onSubmit, loading, onCancel }) => {
  const [url, setUrl] = useState(initial?.url ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const getFavicon = (u: string) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(u).hostname}&sz=32`; }
    catch { return null; }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const favicon_url = getFavicon(url);
    onSubmit({ url: url.trim(), title: title.trim() || null, description: description.trim() || null, favicon_url, tags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">URL *</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required type="url" className="vault-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Optional title..." className="vault-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." rows={3} className="vault-input resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="vault-btn-ghost">Cancel</button>
        <button type="submit" disabled={loading} className="vault-btn-primary">
          {loading ? 'Saving...' : initial?.id ? 'Update' : 'Save Link'}
        </button>
      </div>
    </form>
  );
};

const LinkCard: React.FC<{
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ link, onEdit, onDelete }) => {
  let hostname: string;
  try { hostname = new URL(link.url).hostname; } catch {
    hostname = link.url;
  }

  return (
    <div className="vault-card p-4 flex flex-col gap-3 animate-slide-up group">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-vault-surface border border-vault-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          {link.favicon_url
            ? <img src={link.favicon_url} alt="" className="w-4 h-4" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            : <Globe className="w-4 h-4 text-vault-muted" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-vault-text text-sm line-clamp-1">{link.title || hostname}</h3>
          <p className="text-[11px] text-vault-muted truncate">{hostname}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            className="p-1 rounded text-vault-muted hover:text-vault-accent transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={onEdit} className="p-1 rounded text-vault-muted hover:text-vault-text transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 rounded text-vault-muted hover:text-vault-danger transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {link.description && <p className="text-xs text-vault-muted line-clamp-2">{link.description}</p>}
      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {link.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
        </div>
      )}
      <p className="text-[10px] text-vault-muted/60">{new Date(link.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export const LinkBoard: React.FC = () => {
  const { links, isLoading, create, update, remove } = useLinks();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Link | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const allTags = [...new Set(links.flatMap(l => l.tags))];
  const filtered = links.filter(l => {
    const matchSearch = !search || (l.title ?? '').toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()) || (l.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || l.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const handleSubmit = (data: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
          <span className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-blue-400" />
          </span>
          Bookmarks
          <span className="badge-accent">{links.length}</span>
        </h2>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="vault-btn-primary">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search bookmarks..." />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveTag('')} className={`tag-chip ${!activeTag ? 'bg-vault-accent/30 border-vault-accent/50' : ''}`}>All</button>
            {allTags.map(t => (
              <button key={t} onClick={() => setActiveTag(activeTag === t ? '' : t)}
                className={`tag-chip ${activeTag === t ? 'bg-vault-accent/30 border-vault-accent/50' : ''}`}>#{t}</button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={Link2} title="No bookmarks yet" description="Save websites, articles, docs and resources here." />
      ) : (
        <div className="grid-cards">
          {filtered.map(l => (
            <LinkCard key={l.id} link={l}
              onEdit={() => { setEditing(l); setModalOpen(true); }}
              onDelete={() => setDeleting(l.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Bookmark' : 'Add Bookmark'}>
        <LinkForm initial={editing ?? undefined} loading={create.isPending || update.isPending} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleting} title="Delete Bookmark" description="This bookmark will be permanently deleted."
        loading={remove.isPending}
        onConfirm={() => { if (deleting) remove.mutate(deleting, { onSuccess: () => setDeleting(null) }); }}
        onCancel={() => setDeleting(null)} />
    </div>
  );
};
