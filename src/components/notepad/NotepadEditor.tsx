import React, { useMemo, useState } from 'react';
import { NotebookPen, Pin, PinOff, Plus, Save, Trash2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { SearchBar } from '@/components/ui/SearchBar';
import { TagInput } from '@/components/ui/TagInput';
import { ConfirmDialog, EmptyState, Spinner } from '@/components/ui/shared';
import type { Note } from '@/types';

const emptyDraft = { title: '', content: '', tags: [] as string[], is_pinned: false };

export const NotepadEditor: React.FC = () => {
  const { notes, isLoading, create, update, remove } = useNotes();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = notes.filter((note) => {
    const needle = search.toLowerCase();
    return !needle || note.title.toLowerCase().includes(needle) || note.content.toLowerCase().includes(needle) || note.tags.some((tag) => tag.includes(needle));
  });
  const selected = useMemo(() => notes.find((note) => note.id === selectedId) ?? null, [notes, selectedId]);

  const loadNote = (note: Note) => {
    setSelectedId(note.id);
    setDraft({ title: note.title, content: note.content, tags: note.tags, is_pinned: note.is_pinned });
  };

  const newNote = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
  };

  const saveNote = () => {
    const payload = {
      title: draft.title.trim() || 'Untitled note',
      content: draft.content,
      tags: draft.tags,
      is_pinned: draft.is_pinned,
    };
    if (selected) {
      update.mutate({ id: selected.id, ...payload });
    } else {
      create.mutate(payload, { onSuccess: newNote });
    }
  };

  return (
    <div className="p-6">
      <div className="section-header">
        <h2 className="section-title">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <NotebookPen className="w-5 h-5 text-emerald-400" />
          </span>
          Notepad
          <span className="badge-accent">{notes.length}</span>
        </h2>
        <button onClick={newNote} className="vault-btn-primary"><Plus className="w-4 h-4" /> New Note</button>
      </div>

      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-5">
        <aside className="vault-card p-3 h-[calc(100vh-150px)] min-h-[360px] overflow-hidden flex flex-col">
          <SearchBar value={search} onChange={setSearch} placeholder="Search notes..." />
          <div className="mt-3 overflow-y-auto pr-1 space-y-2">
            {isLoading ? <Spinner /> : filtered.length === 0 ? (
              <EmptyState icon={NotebookPen} title="No notes" description="Start a note and it will appear here." />
            ) : filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => loadNote(note)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedId === note.id ? 'bg-vault-accent/15 border-vault-accent/40' : 'bg-vault-surface border-vault-border hover:border-vault-accent/25'}`}
              >
                <div className="flex items-center gap-2">
                  {note.is_pinned && <Pin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  <h3 className="text-sm font-semibold text-vault-text truncate">{note.title}</h3>
                </div>
                <p className="text-xs text-vault-muted line-clamp-2 mt-1">{note.content || 'Empty note'}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="vault-card p-5 min-h-[520px] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Untitled note" className="vault-input text-lg font-semibold" />
            <div className="flex gap-2">
              <button onClick={() => setDraft((d) => ({ ...d, is_pinned: !d.is_pinned }))} className="vault-btn-ghost" title="Pin note">
                {draft.is_pinned ? <Pin className="w-4 h-4 text-emerald-400" /> : <PinOff className="w-4 h-4" />}
              </button>
              <button onClick={saveNote} disabled={create.isPending || update.isPending} className="vault-btn-primary"><Save className="w-4 h-4" /> Save</button>
              {selected && <button onClick={() => setDeleting(selected.id)} className="vault-btn-danger"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
          <TagInput tags={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} />
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            placeholder="Write freely..."
            className="vault-input flex-1 resize-none leading-7"
          />
        </section>
      </div>

      <ConfirmDialog isOpen={!!deleting} title="Delete Note" description="This note will be permanently deleted." loading={remove.isPending} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) remove.mutate(deleting, { onSuccess: () => { setDeleting(null); newNote(); } }); }} />
    </div>
  );
};
