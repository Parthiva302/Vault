import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Link } from '@/types';
import toast from 'react-hot-toast';
import { readCache, useCachedQueryData } from './useCachedQueryData';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';

const KEY = 'links';

export const useLinks = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtimeInvalidation('links', KEY);

  const { data: links = [], isLoading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Link[];
    },
    enabled: !!user,
    initialData: () => readCache<Link[]>(`${KEY}:${user?.id}`, []),
  });
  useCachedQueryData(`${KEY}:${user?.id}`, links);

  const create = useMutation({
    mutationFn: async (payload: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('links').insert({ ...payload, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Link saved!'); },
    onError: () => toast.error('Failed to save link'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Link> & { id: string }) => {
      const { error } = await supabase.from('links').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Link updated!'); },
    onError: () => toast.error('Failed to update link'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Link deleted'); },
    onError: () => toast.error('Failed to delete link'),
  });

  return { links, isLoading, create, update, remove };
};
