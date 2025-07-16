import { useState, useCallback } from 'react';
import { Url } from '../../models/url';
import { useAuth } from '../useAuth';

type UseUpdateUrl = {
  updateUrl: (id: string, data: { customSlug?: string; originalUrl?: string; isActive?: boolean }) => Promise<Url>;
  loading: boolean;
};

export function useUpdateUrl(): UseUpdateUrl {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateUrl = useCallback(async (id: string, data: { customSlug?: string; originalUrl?: string; isActive?: boolean }) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/urls/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update URL');
      }

      return res.json();
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { updateUrl, loading };
}