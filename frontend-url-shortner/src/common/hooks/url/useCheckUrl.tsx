import { useState, useCallback } from 'react';

type UseCheckUrl = {
  checkUrl: (slug: string) => Promise<{ exists: boolean; shouldRedirect: boolean, originalUrl?: any }>;
  loading: boolean;
};

export function useCheckUrl(): UseCheckUrl {
  const [loading, setLoading] = useState(false);

  const checkUrl = useCallback(async (slug: string) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: { originalUrl: string; success: boolean } = await res.json(); 

      if (res.status === 200) {
        return { exists: true, shouldRedirect: true, originalUrl: data.originalUrl };
      } else if (res.status === 404) {                
        return { exists: false, shouldRedirect: false };
      } else {                
        return { exists: false, shouldRedirect: false };
      }
    } catch (error) {     
      return { exists: false, shouldRedirect: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkUrl, loading };
}