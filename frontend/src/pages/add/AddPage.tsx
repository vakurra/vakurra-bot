import { useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type BotPreview, type Category } from "../../shared/api/client";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import layout from "../../shared/styles/layout.module.css";

import { BotPreviewPanel } from "./BotPreviewPanel";
import styles from "./AddPage.module.css";

export function AddPage() {
  const [username, setUsername] = useState("");
  const [preview, setPreview] = useState<BotPreview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePreview() {
    const normalizedUsername = username.trim().replace(/^@/, "");
    if (!normalizedUsername) return;

    setIsLoading(true);
    setError(null);

    try {
      const loadedPreview = await api.previewBot(normalizedUsername);
      setPreview(loadedPreview);
      setSelectedIds([]);
      setExpandedIds([]);
      await loadCategories();
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Произошла ошибка.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    setIsCategoriesLoading(true);

    try {
      setCategories(await api.categories());
    } catch (error) {
      console.error(error);
      setError("Не удалось загрузить категории.");
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  function handleCategoryToggle(categoryId: number) {
    setExpandedIds((currentIds) =>
      currentIds.includes(categoryId)
        ? currentIds.filter((id) => id !== categoryId)
        : [...currentIds, categoryId],
    );
  }

  function handleSubcategoryToggle(subcategoryId: number) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(subcategoryId)) {
        return currentIds.filter((id) => id !== subcategoryId);
      }
      return currentIds.length >= 3
        ? currentIds
        : [...currentIds, subcategoryId];
    });
  }

  async function handleSubmit() {
    if (!preview || selectedIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitBot(preview.username, selectedIds);
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Не удалось отправить заявку.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={layout.page}>
      <PageHeader title="Добавить бота" />

      {isSubmitted ? (
        <section className={cards.surfaceCard}>
          <h2 className={styles.title}>Заявка отправлена</h2>
          <p className={styles.description}>
            Бот отправлен на модерацию. После проверки он появится в каталоге.
          </p>
        </section>
      ) : preview ? (
        <BotPreviewPanel
          preview={preview}
          categories={categories}
          selectedIds={selectedIds}
          expandedIds={expandedIds}
          isCategoriesLoading={isCategoriesLoading}
          isSubmitting={isSubmitting}
          error={error}
          onCategoryToggle={handleCategoryToggle}
          onSubcategoryToggle={handleSubcategoryToggle}
          onSubmit={handleSubmit}
        />
      ) : (
        <section className={cards.surfaceCard}>
          <h2 className={styles.title}>Добавьте своего бота</h2>
          <p className={styles.description}>
            Укажите username Telegram-бота, которого хотите добавить в каталог.
          </p>

          <label className={styles.label} htmlFor="bot-username">
            Username бота
          </label>
          <input
            id="bot-username"
            className={styles.input}
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="@example_bot"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={buttons.button}
            type="button"
            disabled={!username.trim() || isLoading}
            onClick={handlePreview}
          >
            {isLoading ? "Поиск..." : "Далее"}
          </button>
        </section>
      )}
    </div>
  );
}
