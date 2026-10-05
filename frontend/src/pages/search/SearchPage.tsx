import { useEffect, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type CatalogBot } from "../../shared/api/client";
import layout from "../../shared/styles/layout.module.css";

import { BotCatalogCard } from "./BotCatalogCard";
import { SearchFilters } from "./SearchFilters";
import type { SearchCategory } from "./searchUtils";

const PAGE_SIZE = 25;

export function SearchPage() {
  const [bots, setBots] = useState<CatalogBot[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [expandedUsername, setExpandedUsername] = useState<string | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>(
    [],
  );
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    number[]
  >([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await api.categories();

        setCategories(
          result.map((category) => ({
            id: category.id,
            name: category.name,
            subcategories: category.subcategories.map((subcategory) => ({
              id: subcategory.id,
              name: subcategory.name,
            })),
          })),
        );
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBots() {
      setIsLoading(true);
      setExpandedUsername(null);

      try {
        const result = await api.catalogBots({
          search: searchQuery,
          subcategoryIds: selectedSubcategoryIds,
          limit: PAGE_SIZE,
          offset: 0,
        });

        if (cancelled) {
          return;
        }

        setBots(result.items);
        setHasMore(result.has_more);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load catalog bots:", error);
          setBots([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBots();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedSubcategoryIds]);

  async function loadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const result = await api.catalogBots({
        search: searchQuery,
        subcategoryIds: selectedSubcategoryIds,
        limit: PAGE_SIZE,
        offset: bots.length,
      });

      setBots((current) => [...current, ...result.items]);
      setHasMore(result.has_more);
    } catch (error) {
      console.error("Failed to load more catalog bots:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function toggleBot(username: string) {
    setExpandedUsername((current) =>
      current === username ? null : username,
    );
  }

  function toggleCategory(categoryId: number) {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  function toggleSubcategory(subcategoryId: number) {
    setSelectedSubcategoryIds((current) =>
      current.includes(subcategoryId)
        ? current.filter((id) => id !== subcategoryId)
        : [...current, subcategoryId],
    );
  }

  function clearFilters() {
    setSelectedSubcategoryIds([]);
  }

  return (
    <div className={layout.page}>
      <PageHeader title="Поиск" />

      <SearchFilters
        query={searchQuery}
        isOpen={isFiltersOpen}
        categories={categories}
        expandedCategoryIds={expandedCategoryIds}
        selectedSubcategoryIds={selectedSubcategoryIds}
        onQueryChange={setSearchQuery}
        onToggleOpen={() => setIsFiltersOpen((current) => !current)}
        onToggleCategory={toggleCategory}
        onToggleSubcategory={toggleSubcategory}
        onClear={clearFilters}
      />

      {isLoading && <p className={layout.message}>Загрузка...</p>}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>Ничего не найдено.</p>
      )}

      {!isLoading && bots.length > 0 && (
        <>
          <div className={layout.list}>
            {bots.map((bot) => (
              <BotCatalogCard
                key={bot.username}
                bot={bot}
                isExpanded={expandedUsername === bot.username}
                onToggle={toggleBot}
              />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
