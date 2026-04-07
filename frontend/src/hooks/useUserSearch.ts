'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export interface UserSearchResult {
  id: number;
  email: string;
  nombreCompleto: string;
}

export function useUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<UserSearchResult[]>('/users/search', {
          params: { email: query },
        });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, isLoading };
}
