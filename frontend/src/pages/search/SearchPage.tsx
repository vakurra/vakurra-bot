import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type CatalogBot } from "../../shared/api/client";
import layout from "../../shared/styles/layout.module.css";

import { BotCatalogCard } from "./BotCatalogCard";
import { SearchFilters } from "./SearchFilters";
import {
  buildSearchCategories,
  filterCatalogBots,
} from "./searchUtils";

export function SearchPage() {
  const [bots, setBots] = useState<CatalogBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUsername, setExpandedUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>(
    [],
  );

  useEffect(() => {
    async function loadBots() {
      try {
        setBots(await api.catalogBots());
      } catch (error) {
        console.error("Failed to load catalog bots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBots();
  }, []);

  const categories = useMemo(() => buildSearchCategories(bots), [bots]);
  const filteredBots = useMemo(
    () => filterCatalogBots(bots, searchQuery, selectedSubcategoryIds),
    [bots, searchQuery, selectedSubcategoryIds],
  );

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
        onClear={() => setSelectedSubcategoryIds([])}
      />

      {isLoading && <p className={layout.message}>Загрузка...</p>}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>В каталоге пока нет ботов.</p>
      )}

      {!isLoading && bots.length > 0 && filteredBots.length === 0 && (
        <p className={layout.message}>Ничего не найдено.</p>
      )}

      {!isLoading && filteredBots.length > 0 && (
        <div className={layout.list}>
          {filteredBots.map((bot) => (
            <BotCatalogCard
              key={bot.username}
              bot={bot}
              isExpanded={expandedUsername === bot.username}
              onToggle={toggleBot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
