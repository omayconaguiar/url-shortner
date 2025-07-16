import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Url } from '../../models/url';
import { useAuth } from '../useAuth';

type UseUrls = {
  urls: Url[];
  loading: boolean;
  error: Error | null;
  refreshUrls: () => void;
};

export function useUrls(userOnly: boolean = false): UseUrls {
  const { isAuthenticated } = useAuth();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = userOnly && isAuthenticated ? '/urls' : '/urls/all';
      const res = await apiClient.get(endpoint);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const urlsData: Url[] = await res.json();
      setUrls(urlsData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userOnly, isAuthenticated]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const refreshUrls = useCallback(() => {
    fetchUrls();
  }, [fetchUrls]);

  return { urls, loading, error, refreshUrls };
}