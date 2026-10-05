import type { CSSProperties } from "react";

import type { BotPreview, Category } from "../../shared/api/client";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";

import { CategorySelector } from "./CategorySelector";
import styles from "./AddPage.module.css";

import backIcon from "../../assets/icons/back.svg";

type BotPreviewPanelProps = {
  preview: BotPreview;
  categories: Category[];
  selectedIds: number[];
  expandedIds: number[];
  isCategoriesLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
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
  onBack,
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

      <button
        className={`${buttons.dangerButton} ${styles.backButton}`}
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
      >
        <span
          className={styles.backIcon}
          style={{ "--icon": `url(${backIcon})` } as CSSProperties}
          aria-hidden="true"
        />
        Назад
      </button>

      <CategorySelector
        categories={categories}
        selectedIds={selectedIds}
        expandedIds={expandedIds}
        isLoading={isCategoriesLoading}
        onCategoryToggle={onCategoryToggle}
        onSubcategoryToggle={onSubcategoryToggle}
      />

      <div className={styles.rules}>
        <h3 className={styles.sectionTitle}>Запрещены</h3>

        <ul className={styles.rulesList}>
          <li>Боты, связанные с казино и азартными играми.</li>
          <li>Боты, связанные с мошенничеством или обманом пользователей.</li>
          <li>Боты, связанные с другой запрещённой деятельностью.</li>
        </ul>

        <p className={styles.rulesText}>
          Выбирайте только те подкатегории, которые действительно соответствуют
          функциональности бота.
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={buttons.button}
        type="button"
        disabled={
          selectedIds.length === 0 ||
          isCategoriesLoading ||
          isSubmitting
        }
        onClick={onSubmit}
      >
        {isSubmitting ? "Отправляем..." : "Отправить на модерацию"}
      </button>
    </section>
  );
}
