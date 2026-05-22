import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Snippet } from '@/types';
import toast from 'react-hot-toast';
import { readCache, useCachedQueryData } from './useCachedQueryData';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';

const KEY = 'snippets';

export const useSnippets = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtimeInvalidation('snippets', KEY);

  const { data: snippets = [], isLoading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Snippet[];
    },
    enabled: !!user,
    initialData: () => readCache<Snippet[]>(`${KEY}:${user?.id}`, []),
  });
  useCachedQueryData(`${KEY}:${user?.id}`, snippets);

  const create = useMutation({
    mutationFn: async (payload: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('snippets').insert({ ...payload, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Snippet saved!'); },
    onError: () => toast.error('Failed to save snippet'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Snippet> & { id: string }) => {
      const { error } = await supabase.from('snippets').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Snippet updated!'); },
    onError: () => toast.error('Failed to update snippet'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('snippets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Snippet deleted'); },
    onError: () => toast.error('Failed to delete snippet'),
  });

  return { snippets, isLoading, create, update, remove };
};
