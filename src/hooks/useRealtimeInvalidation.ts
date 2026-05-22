import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useRealtimeInvalidation = (table: string, queryKey: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return undefined;

    const channel = supabase
      .channel(`${table}:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${user.id}`,
        },
        () => qc.invalidateQueries({ queryKey: [queryKey, user.id] }),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, queryKey, table, user]);
};
