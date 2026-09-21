import { useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import styles from "./AddPage.module.css";

export function AddPage() {
  const [username, setUsername] = useState("");

  async function handleSubmit() {
    const normalizedUsername = username.trim().replace(/^@/, "");

    if (!normalizedUsername) {
      return;
    }

    // запрос к бэку сделать
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Новый бот" />

      <section className={styles.card}>
        <h2 className={styles.title}>Добавьте своего бота</h2>

        <p className={styles.description}>
          Укажите username Telegram-бота, которого хотите добавить в каталог.
        </p>

        <label className={styles.label} htmlFor="bot-username">
          username бота
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

        <button
          className={styles.button}
          type="button"
          disabled={!username.trim()}
          onClick={handleSubmit}
        >
          Далее
        </button>
      </section>
    </div>
  );
}
