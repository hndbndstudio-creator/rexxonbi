import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';

export type Plan = 'free' | 'starter' | 'pro' | 'team';

const KNOWLEDGE_PLANS: Plan[] = ['pro', 'team'];

export function usePlan() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['profile_plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.plan ?? 'free') as Plan;
    },
    enabled: !!user,
  });
  const plan = (data ?? 'free') as Plan;
  return {
    plan,
    isLoading,
    hasKnowledgeBase: KNOWLEDGE_PLANS.includes(plan),
  };
}
