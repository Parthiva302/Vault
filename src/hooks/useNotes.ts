import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Note } from '@/types';
import toast from 'react-hot-toast';
import { readCache, useCachedQueryData } from './useCachedQueryData';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';

const KEY = 'notes';

export const useNotes = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtimeInvalidation('notes', KEY);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
    initialData: () => readCache<Note[]>(`${KEY}:${user?.id}`, []),
  });
  useCachedQueryData(`${KEY}:${user?.id}`, notes);

  const create = useMutation({
    mutationFn: async (payload: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('notes').insert({ ...payload, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Note created!'); },
    onError: () => toast.error('Failed to create note'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Note> & { id: string }) => {
      const { error } = await supabase.from('notes').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Note saved!'); },
    onError: () => toast.error('Failed to save note'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Note deleted'); },
    onError: () => toast.error('Failed to delete note'),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase.from('notes').update({ is_pinned, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return { notes, isLoading, create, update, remove, togglePin };
};
