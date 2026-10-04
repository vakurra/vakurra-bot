import { useState } from "react";
import { PageHeader } from "../../shared/ui/PageHeader";
import {
  api,
  type BotPreview,
  type Category,
} from "../../shared/api/client";
import styles from "./AddPage.module.css";

export function AddPage() {
  const [username, setUsername] = useState("");
  const [preview, setPreview] = useState<BotPreview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    number[]
  >([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePreview() {
    const normalizedUsername = username.trim().replace(/^@/, "");

    if (!normalizedUsername) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bot = await api.previewBot(normalizedUsername);
      setPreview(bot);

      setSelectedSubcategoryIds([]);
      setExpandedCategoryIds([]);
      setIsCategoriesLoading(true);

      try {
        const loadedCategories = await api.categories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error(error);
        setError("Не удалось загрузить категории.");
      } finally {
        setIsCategoriesLoading(false);
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleCategoryToggle(categoryId: number) {
    setExpandedCategoryIds((currentIds) => {
      if (currentIds.includes(categoryId)) {
        return currentIds.filter((id) => id !== categoryId);
      }

      return [...currentIds, categoryId];
    });
  }

  function handleSubcategoryToggle(subcategoryId: number) {
    setSelectedSubcategoryIds((currentIds) => {
      if (currentIds.includes(subcategoryId)) {
        return currentIds.filter((id) => id !== subcategoryId);
      }

      if (currentIds.length >= 3) {
        return currentIds;
      }

      return [...currentIds, subcategoryId];
    });
  }

  async function handleSubmitBot() {
    if (!preview || selectedSubcategoryIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitBot(
        preview.username,
        selectedSubcategoryIds,
      );

      setIsSubmitted(true);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не удалось отправить заявку.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <PageHeader title="Добавить бота" />

        <section className={styles.card}>
          <h2 className={styles.title}>
            Заявка отправлена
          </h2>

          <p className={styles.description}>
            Бот отправлен на модерацию. После проверки он появится
            в каталоге.
          </p>
        </section>
      </div>
    );
  }

  if (preview) {
    return (
      <div className={styles.page}>
        <PageHeader title="Добавить бота" />

        <section className={styles.card}>
          {preview.profile_photo_url && (
            <img
              className={styles.avatar}
              src={preview.profile_photo_url}
              alt=""
            />
          )}

          <div className={styles.preview}>
            <h2 className={styles.title}>
              {preview.name}
            </h2>

            <p className={styles.username}>
              @{preview.username}
            </p>

            {preview.about && (
              <p className={styles.description}>
                {preview.about}
              </p>
            )}

            {preview.description && (
              <p className={styles.description}>
                {preview.description}
              </p>
            )}

            {preview.verified && (
              <span className={styles.badge}>
                ✓ Подтверждён
              </span>
            )}
          </div>

          <div className={styles.categories}>
            <div className={styles.categoriesHeader}>
              <h3 className={styles.sectionTitle}>
                Категории
              </h3>

              <span className={styles.counter}>
                {selectedSubcategoryIds.length} / 3
              </span>
            </div>

            <p className={styles.categoriesDescription}>
              Выберите от 1 до 3 подкатегорий, которые лучше всего
              описывают вашего бота.
            </p>

            {isCategoriesLoading && (
              <p className={styles.message}>
                Загрузка категорий...
              </p>
            )}

            {!isCategoriesLoading && (
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
                      className={styles.category}
                    >
                      <button
                        type="button"
                        className={styles.categoryButton}
                        onClick={() =>
                          handleCategoryToggle(category.id)
                        }
                        aria-expanded={isExpanded}
                      >
                        <span className={styles.categoryButtonContent}>
                          <span className={styles.categoryTitle}>
                            {category.name}
                          </span>

                          {selectedCount > 0 && (
                            <span className={styles.categorySelectedCount}>
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
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </button>

                      {isExpanded && (
                        <div className={styles.subcategoryList}>
                          {category.subcategories.map((subcategory) => {
                            const isSelected =
                              selectedSubcategoryIds.includes(
                                subcategory.id,
                              );

                            const isDisabled =
                              !isSelected &&
                              selectedSubcategoryIds.length >= 3;

                            return (
                              <button
                                key={subcategory.id}
                                type="button"
                                className={`${styles.subcategory} ${
                                  isSelected
                                    ? styles.subcategorySelected
                                    : ""
                                }`}
                                disabled={isDisabled}
                                onClick={() =>
                                  handleSubcategoryToggle(
                                    subcategory.id,
                                  )
                                }
                              >
                                <span
                                  className={styles.checkbox}
                                  aria-hidden="true"
                                >
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

          <div className={styles.rules}>
            <h3 className={styles.sectionTitle}>
              Правила каталога
            </h3>

            <p className={styles.rulesText}>
              Не принимаются боты, связанные с казино и азартными
              играми, мошенничеством, обманом пользователей или
              другой запрещённой деятельностью.
            </p>

            <p className={styles.rulesText}>
              Выбирайте только те подкатегории, которые действительно
              соответствуют функциональности бота.
            </p>
          </div>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <button
            className={styles.button}
            type="button"
            disabled={
              selectedSubcategoryIds.length === 0 ||
              isCategoriesLoading ||
              isSubmitting
            }
            onClick={handleSubmitBot}
          >
            {isSubmitting
              ? "Отправляем..."
              : "Отправить на модерацию"}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Добавить бота" />

      <section className={styles.card}>
        <h2 className={styles.title}>
          Добавьте своего бота
        </h2>

        <p className={styles.description}>
          Укажите username Telegram-бота, которого хотите
          добавить в каталог.
        </p>

        <label
          className={styles.label}
          htmlFor="bot-username"
        >
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

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <button
          className={styles.button}
          type="button"
          disabled={!username.trim() || isLoading}
          onClick={handlePreview}
        >
          {isLoading ? "Поиск..." : "Далее"}
        </button>
      </section>
    </div>
  );
}
