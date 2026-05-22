import React, { useState } from 'react';
import { Sparkles, Plus, Star, StarOff, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { Modal } from '@/components/ui/Modal';
import { TagInput } from '@/components/ui/TagInput';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner, EmptyState, ConfirmDialog } from '@/components/ui/shared';
import type { Prompt } from '@/types';

const PromptForm: React.FC<{
  initial?: Partial<Prompt>;
  onSubmit: (data: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
  onCancel: () => void;
}> = ({ initial, onSubmit, loading, onCancel }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [isFavorite, setIsFavorite] = useState(initial?.is_favorite ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim(), tags, is_favorite: isFavorite });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Prompt title..." required className="vault-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Content</label>
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="Write your prompt here..." required rows={6}
          className="vault-input resize-none font-mono text-xs"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Tags</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setIsFavorite(!isFavorite)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${isFavorite ? 'text-amber-400' : 'text-vault-muted hover:text-amber-400'}`}>
          {isFavorite ? <Star className="w-4 h-4 fill-amber-400" /> : <StarOff className="w-4 h-4" />}
          {isFavorite ? 'Favorited' : 'Add to favorites'}
        </button>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="vault-btn-ghost">Cancel</button>
        <button type="submit" disabled={loading} className="vault-btn-primary">
          {loading ? 'Saving...' : initial?.id ? 'Update' : 'Save Prompt'}
        </button>
      </div>
    </form>
  );
};

const PromptCard: React.FC<{
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFav: () => void;
}> = ({ prompt, onEdit, onDelete, onToggleFav }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="vault-card p-4 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-vault-text text-sm leading-snug line-clamp-1">{prompt.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggleFav} className={`p-1 rounded transition-colors ${prompt.is_favorite ? 'text-amber-400' : 'text-vault-muted hover:text-amber-400'}`}>
            <Star className={`w-3.5 h-3.5 ${prompt.is_favorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button onClick={handleCopy} className="p-1 rounded text-vault-muted hover:text-vault-accent transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-vault-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onEdit} className="p-1 rounded text-vault-muted hover:text-vault-text transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 rounded text-vault-muted hover:text-vault-danger transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-vault-muted line-clamp-3 font-mono bg-vault-surface rounded-lg p-2 leading-relaxed">{prompt.content}</p>
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
        </div>
      )}
      <p className="text-[10px] text-vault-muted/60">{new Date(prompt.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export const PromptPanel: React.FC = () => {
  const { prompts, isLoading, create, update, remove } = usePrompts();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const allTags = [...new Set(prompts.flatMap(p => p.tags))];

  const filtered = prompts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const handleSubmit = (data: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
          <span className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </span>
          Prompts
          <span className="badge-accent">{prompts.length}</span>
        </h2>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="vault-btn-primary">
          <Plus className="w-4 h-4" /> New Prompt
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search prompts..." />
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
        <EmptyState icon={Sparkles} title="No prompts yet" description="Store your AI prompts, system messages, and templates here." />
      ) : (
        <div className="grid-cards">
          {filtered.map(p => (
            <PromptCard
              key={p.id} prompt={p}
              onEdit={() => { setEditing(p); setModalOpen(true); }}
              onDelete={() => setDeleting(p.id)}
              onToggleFav={() => update.mutate({ id: p.id, is_favorite: !p.is_favorite })}
            />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Prompt' : 'New Prompt'}>
        <PromptForm
          initial={editing ?? undefined} loading={create.isPending || update.isPending}
          onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting} title="Delete Prompt" description="This prompt will be permanently deleted."
        loading={remove.isPending}
        onConfirm={() => { if (deleting) remove.mutate(deleting, { onSuccess: () => setDeleting(null) }); }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};
