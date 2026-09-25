import { useState } from "react";
import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type BotPreview } from "../../shared/api/client";
import styles from "./AddPage.module.css";

export function AddPage() {
  const [username, setUsername] = useState("");
  const [preview, setPreview] = useState<BotPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const normalizedUsername = username.trim().replace(/^@/, "");

    if (!normalizedUsername) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bot = await api.previewBot(normalizedUsername);
      setPreview(bot);
    } catch (error) {
      console.error(error);

      setError("Не удалось найти бота.");
    } finally {
      setIsLoading(false);
    }
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

          <button
            className={styles.button}
            type="button"
          >
            Отправить на модерацию
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
          onClick={handleSubmit}
        >
          {isLoading ? "Поиск..." : "Далее"}
        </button>
      </section>
    </div>
  );
}
