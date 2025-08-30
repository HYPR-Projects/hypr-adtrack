import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const globalCache = new DataCache();

export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { ttl = 5 * 60 * 1000, enabled = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(() => globalCache.get<T>(key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!enabled) return;

    // Verificar cache primeiro
    if (!forceFresh) {
      const cached = globalCache.get<T>(key);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      
      if (!abortController.signal.aborted) {
        globalCache.set(key, result, ttl);
        setData(result);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      if (!abortController.signal.aborted) {
        const error = err instanceof Error ? err : new Error('Fetch failed');
        setError(error);
        onError?.(error);
      }
      throw err;
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [key, fetcher, ttl, enabled, onSuccess, onError]);

  const invalidate = useCallback(() => {
    globalCache.invalidate(key);
    setData(null);
  }, [key]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    cache: globalCache
  };
}

// Hook específico para prefetch
export function usePrefetch() {
  const prefetch = useCallback(async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T | null> => {
    const cached = globalCache.get<T>(key);
    if (cached) return cached;

    try {
      const data = await fetcher();
      globalCache.set(key, data, ttl);
      return data;
    } catch (error) {
      console.warn('Prefetch failed for key:', key, error);
      return null;
    }
  }, []);

  return { prefetch, cache: globalCache };
}