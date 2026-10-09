import { useCallback, useEffect, useState } from "react";

export type PaginatedResult<T> = {
  items: T[];
  has_more: boolean;
};

type PageLoader<T> = (params: {
  limit: number;
  offset: number;
}) => Promise<PaginatedResult<T>>;

type UsePaginatedListOptions<T> = {
  pageSize: number;
  loadPage: PageLoader<T>;
  dependencies?: readonly unknown[];
};

export function usePaginatedList<T>({
  pageSize,
  loadPage,
  dependencies = [],
}: UsePaginatedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialPage() {
      setIsLoading(true);

      try {
        const result = await loadPage({ limit: pageSize, offset: 0 });

        if (cancelled) return;

        setItems(result.items);
        setHasMore(result.has_more);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load paginated list:", error);
          setItems([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitialPage();

    return () => {
      cancelled = true;
    };
  }, [loadPage, pageSize, ...dependencies]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const result = await loadPage({
        limit: pageSize,
        offset: items.length,
      });

      setItems((current) => [...current, ...result.items]);
      setHasMore(result.has_more);
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, items.length, loadPage, pageSize]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}
