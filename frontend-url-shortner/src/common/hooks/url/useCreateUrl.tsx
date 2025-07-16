import { useState, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';
import { UrlFormData } from '../../schemas/urlSchema';
import { Url } from '../../models/url';

type UseCreateUrl = {
  createUrl: (data: UrlFormData) => Promise<Url>;
  loading: boolean;
};

import { useAuth } from '../useAuth';

export function useCreateUrl() {
  const { token } = useAuth();

  const createUrl = async (data: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to create short URL');
    }

    return res.json();
  };

  return { createUrl, loading: false };
}
