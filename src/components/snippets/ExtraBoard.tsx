import React, { useState } from 'react';
import { Check, Code2, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSnippets } from '@/hooks/useSnippets';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { TagInput } from '@/components/ui/TagInput';
import { ConfirmDialog, EmptyState, Spinner } from '@/components/ui/shared';
import type { Snippet } from '@/types';

const SnippetForm: React.FC<{
  initial?: Partial<Snippet>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (data: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}> = ({ initial, loading, onCancel, onSubmit }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [language, setLanguage] = useState(initial?.language ?? 'typescript');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    onSubmit({ title: title.trim(), language: language.trim() || 'text', description: description.trim() || null, code, tags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-[1fr_150px] gap-3">
        <div>
          <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="vault-input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Language</label>
          <input value={language} onChange={(e) => setLanguage(e.target.value)} className="vault-input" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-vault-muted mb-1.5 uppercase tracking-wide">Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className="vault-input" />
      </div>
      <TagInput tags={tags} onChange={setTags} />
      <textarea value={code} onChange={(e) => setCode(e.target.value)} required rows={9} className="vault-input resize-none font-mono text-xs" />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="vault-btn-ghost">Cancel</button>
        <button type="submit" disabled={loading} className="vault-btn-primary">{loading ? 'Saving...' : 'Save Snippet'}</button>
      </div>
    </form>
  );
};

const SnippetCard: React.FC<{ snippet: Snippet; onEdit: () => void; onDelete: () => void }> = ({ snippet, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="vault-card p-4 flex flex-col gap-3 animate-slide-up group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-vault-text truncate">{snippet.title}</h3>
          <p className="text-[11px] text-vault-muted">{snippet.language}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copy} className="p-1 text-vault-muted hover:text-vault-accent">{copied ? <Check className="w-3.5 h-3.5 text-vault-success" /> : <Copy className="w-3.5 h-3.5" />}</button>
          <button onClick={onEdit} className="p-1 text-vault-muted hover:text-vault-text"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-vault-muted hover:text-vault-danger"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {snippet.description && <p className="text-xs text-vault-muted line-clamp-2">{snippet.description}</p>}
      <pre className="bg-vault-surface border border-vault-border rounded-lg p-3 overflow-hidden text-xs text-vault-text font-mono max-h-44"><code>{snippet.code}</code></pre>
      {snippet.tags.length > 0 && <div className="flex flex-wrap gap-1">{snippet.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}</div>}
    </div>
  );
};

export const ExtraBoard: React.FC = () => {
  const { snippets, isLoading, create, update, remove } = useSnippets();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const allTags = [...new Set(snippets.flatMap((snippet) => snippet.tags))];
  const filtered = snippets.filter((snippet) => {
    const needle = search.toLowerCase();
    const matchesSearch = !needle || [snippet.title, snippet.description, snippet.language, snippet.code].some((field) => (field ?? '').toLowerCase().includes(needle));
    const matchesTag = !activeTag || snippet.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleSubmit = (data: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
          <span className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-amber-400" />
          </span>
          Code Snippets
          <span className="badge-accent">{snippets.length}</span>
        </h2>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="vault-btn-primary"><Plus className="w-4 h-4" /> New Snippet</button>
      </div>
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search snippets..." />
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? '' : tag)} className={`tag-chip ${activeTag === tag ? 'bg-vault-accent/30 border-vault-accent/50' : ''}`}>#{tag}</button>
        ))}
      </div>
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={Code2} title="No snippets yet" description="Save reusable code blocks and commands here." />
      ) : (
        <div className="grid-cards">{filtered.map((snippet) => <SnippetCard key={snippet.id} snippet={snippet} onEdit={() => { setEditing(snippet); setModalOpen(true); }} onDelete={() => setDeleting(snippet.id)} />)}</div>
      )}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Snippet' : 'New Snippet'}>
        <SnippetForm initial={editing ?? undefined} loading={create.isPending || update.isPending} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog isOpen={!!deleting} title="Delete Snippet" description="This code snippet will be permanently deleted." loading={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove.mutate(deleting, { onSuccess: () => setDeleting(null) }); }} />
    </div>
  );
};
