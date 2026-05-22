import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim().toLowerCase();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-vault-surface border border-vault-border rounded-lg focus-within:border-vault-accent focus-within:ring-1 focus-within:ring-vault-accent/50 transition-all min-h-[42px]">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1 flex-1 min-w-[80px]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tags.length === 0 ? placeholder : '+ tag'}
          className="flex-1 bg-transparent text-sm text-vault-text placeholder-vault-muted outline-none min-w-0"
        />
        {input && (
          <button type="button" onClick={addTag} className="text-vault-accent hover:text-vault-accent-dim">
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
