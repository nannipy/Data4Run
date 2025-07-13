import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Activity } from '@/lib/api';

export const useActivities = (userId: number | null, periodTrendsRun: string = 'month') => {
  const queryClient = useQueryClient();

  // Query per ottenere le attività dell'utente
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['activities', userId],
    queryFn: () => apiService.getUserActivities(userId!),
    enabled: !!userId,
  });

  // Query per ottenere le statistiche dell'utente (tutte le attività)
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => apiService.getUserStats(userId!),
    enabled: !!userId,
  });

  // Query per ottenere le statistiche solo delle corse
  const {
    data: statsRun,
    isLoading: isLoadingStatsRun,
    error: statsRunError,
    refetch: refetchStatsRun,
  } = useQuery({
    queryKey: ['stats', userId, 'run'],
    queryFn: () => apiService.getUserStats(userId!, { activity_type: 'Run' }),
    enabled: !!userId,
  });

  // Query per ottenere le tendenze dell'utente (tutte le attività)
  const {
    data: trends,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['trends', userId],
    queryFn: () => apiService.getUserTrends(userId!),
    enabled: !!userId,
  });

  // Query per ottenere le tendenze solo delle corse
  const {
    data: trendsRun,
    isLoading: isLoadingTrendsRun,
    error: trendsRunError,
    refetch: refetchTrendsRun,
  } = useQuery({
    queryKey: ['trends', userId, 'run', periodTrendsRun],
    queryFn: () => apiService.getUserTrends(userId!, periodTrendsRun, 'Run'),
    enabled: !!userId,
  });

  // Mutation per sincronizzare le attività
  const syncMutation = useMutation({
    mutationFn: (afterDate?: string) => apiService.syncActivities(userId!, afterDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['trends', userId] });
    },
  });

  // Mutation per sincronizzazione intelligente
  const syncSmartMutation = useMutation({
    mutationFn: () => apiService.syncActivitiesSmart(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['trends', userId] });
    },
  });

  // Mutation per estendere la sincronizzazione
  const syncExtendMutation = useMutation({
    mutationFn: (monthsBack: number) => apiService.syncActivitiesExtend(userId!, monthsBack),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['trends', userId] });
    },
  });

  const syncActivities = (afterDate?: string) => {
    return syncMutation.mutateAsync(afterDate);
  };

  const syncActivitiesSmart = () => {
    return syncSmartMutation.mutateAsync();
  };

  const syncActivitiesExtend = (monthsBack: number = 12) => {
    return syncExtendMutation.mutateAsync(monthsBack);
  };

  return {
    activities: activitiesData?.activities || [],
    totalActivities: activitiesData?.total || 0,
    isLoadingActivities,
    activitiesError,
    refetchActivities,
    refetchStats,
    refetchTrends,
    stats,
    isLoadingStats,
    statsError,
    statsRun,
    isLoadingStatsRun,
    statsRunError,
    refetchStatsRun,
    trends,
    isLoadingTrends,
    trendsError,
    trendsRun,
    isLoadingTrendsRun,
    trendsRunError,
    refetchTrendsRun,
    syncActivities,
    syncActivitiesSmart,
    syncActivitiesExtend,
    isSyncing: syncMutation.isPending || syncSmartMutation.isPending || syncExtendMutation.isPending,
    syncError: syncMutation.error || syncSmartMutation.error || syncExtendMutation.error,
  };
};

export const useActivityDetail = (userId: number | null, activityId: number | null) => {
  const {
    data: activity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activity', userId, activityId],
    queryFn: () => apiService.getActivityDetail(userId!, activityId!),
    enabled: !!userId && !!activityId,
  });

  return {
    activity,
    isLoading,
    error,
  };
}; 