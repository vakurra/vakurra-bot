import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type CatalogBot } from "../../shared/api/client";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./SearchPage.module.css";

export function SearchPage() {
  const [bots, setBots] = useState<CatalogBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    async function loadBots() {
      try {
        const catalogBots = await api.catalogBots();
        setBots(catalogBots);
      } catch (error) {
        console.error("Failed to load catalog bots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBots();
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<
      number,
      {
        id: number;
        name: string;
        subcategories: Map<number, string>;
      }
    >();

    for (const bot of bots) {
      for (const subcategory of bot.subcategories) {
        if (!categoryMap.has(subcategory.category_id)) {
          categoryMap.set(subcategory.category_id, {
            id: subcategory.category_id,
            name: subcategory.category_name,
            subcategories: new Map(),
          });
        }

        categoryMap
          .get(subcategory.category_id)!
          .subcategories.set(
            subcategory.id,
            subcategory.name,
          );
      }
    }

    return Array.from(categoryMap.values()).map((category) => ({
      id: category.id,
      name: category.name,
      subcategories: Array.from(
        category.subcategories.entries(),
      ).map(([id, name]) => ({
        id,
        name,
      })),
    }));
  }, [bots]);

  const filteredBots = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bots.filter((bot) => {
      const matchesSearch =
        normalizedQuery === "" ||
        [
          bot.name,
          bot.username,
          bot.about,
          bot.description,
        ]
          .filter(Boolean)
          .some((value) =>
            value!.toLowerCase().includes(normalizedQuery),
          );

      const matchesCategories =
        selectedSubcategoryIds.length === 0 ||
        bot.subcategories.some((subcategory) =>
          selectedSubcategoryIds.includes(subcategory.id),
        );

      return matchesSearch && matchesCategories;
    });
  }, [bots, searchQuery, selectedSubcategoryIds]);

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

      <div className={styles.searchControls}>
        <input
          className={styles.searchInput}
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Поиск ботов..."
          aria-label="Поиск ботов"
        />

        <button
          className={`${styles.filterButton} ${
            isFiltersOpen ? styles.filterButtonActive : ""
          }`}
          type="button"
          onClick={() => setIsFiltersOpen((current) => !current)}
        >
          <span className={styles.filterButtonContent}>
            <span>Фильтры</span>

            {selectedSubcategoryIds.length > 0 && (
              <span className={styles.filterButtonCount}>
                {selectedSubcategoryIds.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {isFiltersOpen && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <span className={styles.filtersTitle}>Фильтры</span>

            {selectedSubcategoryIds.length > 0 && (
              <button
                className={styles.clearButton}
                type="button"
                onClick={clearFilters}
              >
                Сбросить
              </button>
            )}
          </div>

          <div className={styles.categoryList}>
            {categories.map((category) => {
              const isExpanded = expandedCategoryIds.includes(
                category.id,
              );

              const selectedCount =
                category.subcategories.filter((subcategory) =>
                  selectedSubcategoryIds.includes(subcategory.id),
                ).length;

              return (
                <div
                  key={category.id}
                  className={styles.categoryGroup}
                >
                  <button
                    className={styles.categoryButton}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span className={styles.categoryButtonContent}>
                      <span>{category.name}</span>

                      {selectedCount > 0 && (
                        <span
                          className={styles.categorySelectedCount}
                        >
                          {selectedCount}
                        </span>
                      )}
                    </span>

                    <span
                      className={`${styles.categoryArrow} ${
                        isExpanded
                          ? styles.categoryArrowExpanded
                          : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {isExpanded && (
                    <div className={styles.subcategoryList}>
                      {category.subcategories.map(
                        (subcategory) => {
                          const isSelected =
                            selectedSubcategoryIds.includes(
                              subcategory.id,
                            );

                          return (
                            <button
                              key={subcategory.id}
                              className={`${styles.subcategoryButton} ${
                                isSelected
                                  ? styles.subcategoryButtonActive
                                  : ""
                              }`}
                              type="button"
                              onClick={() =>
                                toggleSubcategory(subcategory.id)
                              }
                            >
                              <span
                                className={
                                  styles.subcategoryCheck
                                }
                              >
                                {isSelected ? "✓" : ""}
                              </span>

                              <span>{subcategory.name}</span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <p className={layout.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>
          В каталоге пока нет ботов.
        </p>
      )}

      {!isLoading &&
        bots.length > 0 &&
        filteredBots.length === 0 && (
          <p className={layout.message}>
            Ничего не найдено.
          </p>
        )}

      {!isLoading && filteredBots.length > 0 && (
        <div className={layout.list}>
          {filteredBots.map((bot) => {
            const isExpanded =
              expandedUsername === bot.username;

            return (
              <article
                key={bot.username}
                className={`${cards.botCard} ${
                  styles.searchCard
                } ${
                  isExpanded
                    ? styles.cardExpanded
                    : ""
                }`}
                onClick={() =>
                  toggleBot(bot.username)
                }
              >
                <div className={content.botMain}>
                  {bot.profile_photo_url && (
                    <img
                      className={`${content.avatar} ${styles.avatar}`}
                      src={bot.profile_photo_url}
                      alt=""
                    />
                  )}

                  <div className={content.info}>
                    <div className={styles.nameRow}>
                      <h2 className={styles.botName}>
                        {bot.name}
                      </h2>

                      {bot.verified && (
                        <span
                          className={styles.verified}
                          aria-label="Проверенный бот"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <p className={content.username}>
                      @{bot.username}
                    </p>

                    {bot.mau !== null && (
                      <p className={styles.mau}>
                        {formatMau(bot.mau)} активных
                        пользователей
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.summary}>
                  <p className={styles.about}>
                    {bot.about}
                  </p>

                  {bot.subcategories.length > 0 && (
                    <div className={styles.categories}>
                      {(isExpanded
                        ? bot.subcategories.map(
                            (subcategory) =>
                              subcategory.name,
                          )
                        : getVisibleCategories(bot)
                      ).map((category, index) => (
                        <span
                          key={`${category}-${index}`}
                          className={content.category}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`${styles.expanded} ${
                    isExpanded
                      ? styles.expandedOpen
                      : ""
                  }`}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <div
                    className={
                      styles.expandedContent
                    }
                  >
                    {bot.description && (
                      <p className={styles.description}>
                        {bot.description}
                      </p>
                    )}

                    <a
                      className={styles.botButton}
                      href={`https://t.me/${bot.username}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть бота
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getVisibleCategories(
  bot: CatalogBot,
): string[] {
  const categories = bot.subcategories.map(
    (subcategory) => subcategory.name,
  );

  if (categories.length <= 1) return categories;
  if (categories.length === 2) {
    return [categories[0], "Еще 1"];
  }

  return [
    categories[0],
    `Еще ${categories.length - 1}`,
  ];
}

function formatMau(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}
