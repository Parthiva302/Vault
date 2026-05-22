// Core database types matching Supabase tables

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  favicon_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface YTLink {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  thumbnail: string | null;
  channel: string | null;
  tags: string[];
  watched: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type Section = 'prompts' | 'links' | 'youtube' | 'notepad' | 'snippets';

export interface FormState {
  isOpen: boolean;
  mode: 'create' | 'edit';
}
