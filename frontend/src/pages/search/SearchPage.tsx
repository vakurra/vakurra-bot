import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { usePaginatedList } from "../../shared/hooks/usePaginatedList";
import { api } from "../../shared/api/client";
import layout from "../../shared/styles/layout.module.css";
import buttons from "../../shared/styles/buttons.module.css";
import styles from "./SearchPage.module.css";

import { BotCatalogCard } from "./BotCatalogCard";
import { SearchFilters } from "./SearchFilters";
import type { SearchCategory } from "./searchUtils";

const PAGE_SIZE = 10;

export function SearchPage() {
  const [categories, setCategories] = useState<SearchCategory[]>([]);

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

  const loadBots = useCallback(
    ({ limit, offset }: { limit: number; offset: number }) =>
      api.catalogBots({
        search: searchQuery,
        subcategoryIds: selectedSubcategoryIds,
        limit,
        offset,
      }),
    [searchQuery, selectedSubcategoryIds],
  );

  const {
    items: bots,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedList({
    pageSize: PAGE_SIZE,
    loadPage: loadBots,
  });

  useEffect(() => {
    setExpandedUsername(null);
  }, [searchQuery, selectedSubcategoryIds]);

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
              className={`${buttons.button} ${styles.loadMoreButton}`}
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
