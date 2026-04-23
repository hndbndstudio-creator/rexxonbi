import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const q = useQuery({
    queryKey: ['is-admin', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user!.id,
        _role: 'admin',
      });
      if (error) throw error;
      return data === true;
    },
  });
  return { isAdmin: q.data === true, loading: loading || q.isLoading };
}
