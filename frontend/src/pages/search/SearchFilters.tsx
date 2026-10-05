import content from "../../shared/styles/content.module.css";

import type { SearchCategory } from "./searchUtils";
import styles from "./SearchFilters.module.css";

type SearchFiltersProps = {
  query: string;
  isOpen: boolean;
  categories: SearchCategory[];
  expandedCategoryIds: number[];
  selectedSubcategoryIds: number[];
  onQueryChange: (query: string) => void;
  onToggleOpen: () => void;
  onToggleCategory: (categoryId: number) => void;
  onToggleSubcategory: (subcategoryId: number) => void;
  onClear: () => void;
};

export function SearchFilters({
  query,
  isOpen,
  categories,
  expandedCategoryIds,
  selectedSubcategoryIds,
  onQueryChange,
  onToggleOpen,
  onToggleCategory,
  onToggleSubcategory,
  onClear,
}: SearchFiltersProps) {
  return (
    <>
      <div className={styles.searchControls}>
        <input
          className={styles.searchInput}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск ботов..."
          aria-label="Поиск ботов"
        />

        <button
          className={`${styles.filterButton} ${
            isOpen ? styles.filterButtonActive : ""
          }`}
          type="button"
          onClick={onToggleOpen}
        >
          <span className={styles.filterButtonContent}>
            <span>Фильтры</span>
            {selectedSubcategoryIds.length > 0 && (
              <span className={content.countBadge}>
                {selectedSubcategoryIds.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <span className={styles.filtersTitle}>Фильтры</span>

            {selectedSubcategoryIds.length > 0 && (
              <button
                className={styles.clearButton}
                type="button"
                onClick={onClear}
              >
                Сбросить
              </button>
            )}
          </div>

          <div className={styles.categoryList}>
            {categories.map((category) => {
              const isExpanded = expandedCategoryIds.includes(category.id);
              const selectedCount = category.subcategories.filter(
                ({ id }) => selectedSubcategoryIds.includes(id),
              ).length;

              return (
                <div key={category.id} className={styles.categoryGroup}>
                  <button
                    className={styles.categoryButton}
                    type="button"
                    onClick={() => onToggleCategory(category.id)}
                  >
                    <span className={styles.categoryButtonContent}>
                      <span>{category.name}</span>
                      {selectedCount > 0 && (
                        <span className={content.countBadge}>
                          {selectedCount}
                        </span>
                      )}
                    </span>

                    <span
                      className={`${styles.categoryArrow} ${
                        isExpanded ? styles.categoryArrowExpanded : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {isExpanded && (
                    <div className={styles.subcategoryList}>
                      {category.subcategories.map((subcategory) => {
                        const isSelected = selectedSubcategoryIds.includes(
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
                              onToggleSubcategory(subcategory.id)
                            }
                          >
                            <span className={styles.subcategoryCheck}>
                              {isSelected ? "✓" : ""}
                            </span>
                            <span>{subcategory.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
