import { useMemo, useRef, useCallback } from 'react';

// Hook otimizado para cache de dados computados
export const useOptimizedData = <T, R>(
  data: T[],
  transformer: (data: T[]) => R,
  dependencies: any[] = []
) => {
  const lastDataRef = useRef<T[]>();
  const lastResultRef = useRef<R>();
  const lastDepsRef = useRef<any[]>();

  return useMemo(() => {
    // Check if dependencies have changed
    const depsChanged = !lastDepsRef.current || 
      lastDepsRef.current.length !== dependencies.length ||
      lastDepsRef.current.some((dep, index) => dep !== dependencies[index]);

    // Check if data has changed (shallow comparison)
    const dataChanged = !lastDataRef.current || 
      lastDataRef.current !== data ||
      lastDataRef.current.length !== data.length;

    if (dataChanged || depsChanged) {
      lastDataRef.current = data;
      lastDepsRef.current = [...dependencies];
      lastResultRef.current = transformer(data);
    }

    return lastResultRef.current!;
  }, [data, transformer, ...dependencies]);
};

// Hook para otimizar filtros com debounce interno
export const useOptimizedFilter = <T,>(
  items: T[],
  filterFn: (item: T) => boolean,
  delay = 0
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastItemsRef = useRef<T[]>();
  const lastFilterRef = useRef<((item: T) => boolean)>();
  const lastResultRef = useRef<T[]>([]);

  return useMemo(() => {
    // Se os items ou filter mudaram
    if (lastItemsRef.current !== items || lastFilterRef.current !== filterFn) {
      lastItemsRef.current = items;
      lastFilterRef.current = filterFn;
      
      if (delay > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastResultRef.current = items.filter(filterFn);
        }, delay);
        
        // Retorna o último resultado enquanto aguarda
        return lastResultRef.current;
      } else {
        lastResultRef.current = items.filter(filterFn);
      }
    }

    return lastResultRef.current;
  }, [items, filterFn, delay]);
};

// Hook para criar seletores memoizados
export const useSelector = <T, R>(
  data: T,
  selector: (data: T) => R
): R => {
  const lastDataRef = useRef<T>();
  const lastResultRef = useRef<R>();

  return useMemo(() => {
    if (lastDataRef.current !== data) {
      lastDataRef.current = data;
      lastResultRef.current = selector(data);
    }
    return lastResultRef.current!;
  }, [data, selector]);
};

// Hook para batch de atualizações
export const useBatchedUpdates = () => {
  const pendingUpdatesRef = useRef<Array<() => void>>([]);
  const isScheduledRef = useRef(false);

  const batchUpdate = useCallback((updateFn: () => void) => {
    pendingUpdatesRef.current.push(updateFn);
    
    if (!isScheduledRef.current) {
      isScheduledRef.current = true;
      
      // Use requestAnimationFrame for batching
      requestAnimationFrame(() => {
        const updates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = [];
        isScheduledRef.current = false;
        
        // Execute all batched updates
        updates.forEach(update => update());
      });
    }
  }, []);

  return batchUpdate;
};

// Hook para detectar mudanças em propriedades específicas
export const useShallowEqual = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): T => {
  const lastObjRef = useRef<T>();
  const lastKeysRef = useRef<(keyof T)[]>();
  const lastResultRef = useRef<T>();

  return useMemo(() => {
    // Se o objeto mudou ou as chaves mudaram
    if (lastObjRef.current !== obj || 
        !lastKeysRef.current || 
        lastKeysRef.current.length !== keys.length ||
        lastKeysRef.current.some((key, index) => key !== keys[index])) {
      
      // Se não temos resultado anterior, retorna o objeto
      if (!lastResultRef.current) {
        lastObjRef.current = obj;
        lastKeysRef.current = [...keys];
        lastResultRef.current = obj;
        return obj;
      }

      // Verifica se as propriedades específicas mudaram
      const hasChanged = keys.some(key => 
        lastObjRef.current?.[key] !== obj[key]
      );

      if (hasChanged) {
        lastObjRef.current = obj;
        lastKeysRef.current = [...keys];
        lastResultRef.current = obj;
      }
    }

    return lastResultRef.current!;
  }, [obj, keys]);
};