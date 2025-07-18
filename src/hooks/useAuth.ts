import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, User } from '@/lib/api';

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored) : null;
  });

  const queryClient = useQueryClient();

  // Query per ottenere i dati dell'utente
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      let attempts = 0;
      let lastError;
      while (attempts < 3) {
        try {
          return await apiService.getUser(userId!);
        } catch (err: any) {
          lastError = err;
          if (err.message && err.message.includes('500')) {
            attempts++;
            await new Promise(res => setTimeout(res, 500));
          } else {
            throw err;
          }
        }
      }
      throw lastError;
    },
    enabled: !!userId,
  });

  // Mutation per gestire il callback di Strava
  const stravaCallbackMutation = useMutation({
    mutationFn: (code: string) => apiService.handleStravaCallback(code),
    onSuccess: (data) => {
      setTimeout(() => {
        setUserId(data.user_id);
        localStorage.setItem('userId', data.user_id.toString());
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }, 1000); // 1 secondo di delay
    },
  });

  // Mutation per ottenere l'URL di autorizzazione
  const authUrlMutation = useMutation({
    mutationFn: () => apiService.getStravaAuthUrl(),
  });

  const login = async () => {
    try {
      const { authorization_url } = await authUrlMutation.mutateAsync();
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
    queryClient.clear();
  };

  const handleStravaCallback = (code: string) => {
    return stravaCallbackMutation.mutateAsync(code);
  };

  // Gestisci il callback di Strava se presente nell'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !userId) {
      handleStravaCallback(code).then(() => {
        // Rimuovi il codice dall'URL dopo il primo tentativo
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(() => {
        // Anche in caso di errore, rimuovi il code per evitare loop
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [userId]);

  return {
    user,
    userId,
    isLoadingUser,
    userError,
    login,
    logout,
    handleStravaCallback,
    isAuthenticated: !!userId,
    isLoggingIn: authUrlMutation.isPending,
    isHandlingCallback: stravaCallbackMutation.isPending,
  };
}; 