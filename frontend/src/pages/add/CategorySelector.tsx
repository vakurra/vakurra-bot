import type { Category } from "../../shared/api/client";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./AddPage.module.css";

type CategorySelectorProps = {
  categories: Category[];
  selectedIds: number[];
  expandedIds: number[];
  isLoading: boolean;
  onCategoryToggle: (categoryId: number) => void;
  onSubcategoryToggle: (subcategoryId: number) => void;
};

export function CategorySelector({
  categories,
  selectedIds,
  expandedIds,
  isLoading,
  onCategoryToggle,
  onSubcategoryToggle,
}: CategorySelectorProps) {
  return (
    <div className={styles.categories}>
      <div className={styles.categoriesHeader}>
        <h3 className={styles.sectionTitle}>Категории</h3>
        <span className={styles.counter}>{selectedIds.length} / 3</span>
      </div>

      <p className={styles.categoriesDescription}>
        Выберите от 1 до 3 подкатегорий, которые лучше всего описывают
        вашего бота.
      </p>

      {isLoading && (
        <p className={layout.message}>Загрузка категорий...</p>
      )}

      {!isLoading && (
        <div className={styles.categoryList}>
          {categories.map((category) => {
            const isExpanded = expandedIds.includes(category.id);
            const selectedCount = category.subcategories.filter((subcategory) =>
              selectedIds.includes(subcategory.id),
            ).length;

            return (
              <div key={category.id} className={styles.category}>
                <button
                  type="button"
                  className={styles.categoryButton}
                  onClick={() => onCategoryToggle(category.id)}
                  aria-expanded={isExpanded}
                >
                  <span className={styles.categoryButtonContent}>
                    <span className={styles.categoryTitle}>{category.name}</span>

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
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.subcategoryList}>
                    {category.subcategories.map((subcategory) => {
                      const isSelected = selectedIds.includes(subcategory.id);
                      const isDisabled = !isSelected && selectedIds.length >= 3;

                      return (
                        <button
                          key={subcategory.id}
                          type="button"
                          className={`${styles.subcategory} ${
                            isSelected ? styles.subcategorySelected : ""
                          }`}
                          disabled={isDisabled}
                          onClick={() => onSubcategoryToggle(subcategory.id)}
                        >
                          <span className={styles.checkbox} aria-hidden="true">
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
      )}
    </div>
  );
}
