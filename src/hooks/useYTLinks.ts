import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { YTLink } from '@/types';
import toast from 'react-hot-toast';
import { readCache, useCachedQueryData } from './useCachedQueryData';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';

const KEY = 'yt_links';

const getYTThumbnail = (url: string): string | null => {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
    } else if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1);
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  } catch {
    return null;
  }
};

export const useYTLinks = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  useRealtimeInvalidation('yt_links', KEY);

  const { data: ytLinks = [], isLoading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yt_links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as YTLink[];
    },
    enabled: !!user,
    initialData: () => readCache<YTLink[]>(`${KEY}:${user?.id}`, []),
  });
  useCachedQueryData(`${KEY}:${user?.id}`, ytLinks);

  const create = useMutation({
    mutationFn: async (payload: Omit<YTLink, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const thumbnail = payload.thumbnail || getYTThumbnail(payload.url);
      const { error } = await supabase.from('yt_links').insert({ ...payload, thumbnail, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Video saved!'); },
    onError: () => toast.error('Failed to save video'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<YTLink> & { id: string }) => {
      const { error } = await supabase.from('yt_links').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Video updated!'); },
    onError: () => toast.error('Failed to update video'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('yt_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); toast.success('Video deleted'); },
    onError: () => toast.error('Failed to delete video'),
  });

  const toggleWatched = useMutation({
    mutationFn: async ({ id, watched }: { id: string; watched: boolean }) => {
      const { error } = await supabase.from('yt_links').update({ watched, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return { ytLinks, isLoading, create, update, remove, toggleWatched, getYTThumbnail };
};
