import type { BotPreview, Category } from "../../shared/api/client";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";

import { CategorySelector } from "./CategorySelector";
import styles from "./AddPage.module.css";

type BotPreviewPanelProps = {
  preview: BotPreview;
  categories: Category[];
  selectedIds: number[];
  expandedIds: number[];
  isCategoriesLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onCategoryToggle: (categoryId: number) => void;
  onSubcategoryToggle: (subcategoryId: number) => void;
  onSubmit: () => void;
};

export function BotPreviewPanel({
  preview,
  categories,
  selectedIds,
  expandedIds,
  isCategoriesLoading,
  isSubmitting,
  error,
  onCategoryToggle,
  onSubcategoryToggle,
  onSubmit,
}: BotPreviewPanelProps) {
  return (
    <section className={cards.surfaceCard}>
      {preview.profile_photo_url && (
        <img
          className={content.avatarLarge}
          src={preview.profile_photo_url}
          alt=""
        />
      )}

      <div className={styles.preview}>
        <h2 className={styles.title}>{preview.name}</h2>
        <p className={styles.username}>@{preview.username}</p>

        {preview.about && <p className={styles.description}>{preview.about}</p>}
        {preview.description && (
          <p className={styles.description}>{preview.description}</p>
        )}
        {preview.verified && (
          <span className={styles.badge}>✓ Подтверждён</span>
        )}
      </div>

      <CategorySelector
        categories={categories}
        selectedIds={selectedIds}
        expandedIds={expandedIds}
        isLoading={isCategoriesLoading}
        onCategoryToggle={onCategoryToggle}
        onSubcategoryToggle={onSubcategoryToggle}
      />

      <div className={styles.rules}>
        <h3 className={styles.sectionTitle}>Правила каталога</h3>
        <p className={styles.rulesText}>
          Не принимаются боты, связанные с казино и азартными играми,
          мошенничеством, обманом пользователей или другой запрещённой
          деятельностью.
        </p>
        <p className={styles.rulesText}>
          Выбирайте только те подкатегории, которые действительно соответствуют
          функциональности бота.
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={buttons.button}
        type="button"
        disabled={selectedIds.length === 0 || isCategoriesLoading || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Отправляем..." : "Отправить на модерацию"}
      </button>
    </section>
  );
}
