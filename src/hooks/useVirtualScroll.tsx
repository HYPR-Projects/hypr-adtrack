import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T,>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);
    
    return {
      items: items.slice(visibleStartIndex, endIndex),
      startIndex: visibleStartIndex,
      offsetY: visibleStartIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll
  };
};