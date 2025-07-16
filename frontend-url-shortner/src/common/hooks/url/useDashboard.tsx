import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import { DashboardStats } from '../../models/url';
import { useAuth } from '../useAuth';

type UseDashboard = {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refreshStats: () => void;
};

export function useDashboard(): UseDashboard {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await apiClient.get('/urls/dashboard');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const statsData: DashboardStats = await res.json();
      setStats(statsData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refreshStats };
}