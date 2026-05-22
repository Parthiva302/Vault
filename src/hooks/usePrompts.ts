import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Prompt } from '@/types';
import toast from 'react-hot-toast';
import { readCache, useCachedQueryData } from './useCachedQueryData';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';

const KEY = 'prompts';

export const usePrompts = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtimeInvalidation('prompts', KEY);

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user,
    initialData: () => readCache<Prompt[]>(`${KEY}:${user?.id}`, []),
  });
  useCachedQueryData(`${KEY}:${user?.id}`, prompts);

  const create = useMutation({
    mutationFn: async (payload: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('prompts').insert({ ...payload, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Prompt saved!'); },
    onError: () => toast.error('Failed to save prompt'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Prompt> & { id: string }) => {
      const { error } = await supabase.from('prompts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Prompt updated!'); },
    onError: () => toast.error('Failed to update prompt'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Prompt deleted'); },
    onError: () => toast.error('Failed to delete prompt'),
  });

  return { prompts, isLoading, create, update, remove };
};
