import { useEffect, useState } from "react";

import { api, type MyBot } from "../../shared/api/client";

import styles from "./MyBotsSection.module.css";

export function MyBotsSection() {
  const [bots, setBots] = useState<MyBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBots() {
      try {
        const myBots = await api.myBots();
        setBots(myBots);
      } catch (error) {
        console.error("Failed to load submitted bots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBots();
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Мои заявки</h2>

      {isLoading && (
        <p className={styles.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={styles.message}>
          Вы ещё не добавляли ботов.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={styles.list}>
          {bots.map((bot) => (
            <article key={bot.id} className={styles.bot}>
              {bot.profile_photo_url && (
                <img
                  className={styles.avatar}
                  src={bot.profile_photo_url}
                  alt=""
                />
              )}

              <div className={styles.info}>
                <h3 className={styles.botName}>{bot.name}</h3>
                <p className={styles.username}>@{bot.username}</p>
              </div>

              <span
                className={`${styles.status} ${styles[`status-${bot.status}`]}`}
              >
                {getStatusLabel(bot.status)}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "На модерации";

    case "approved":
      return "Опубликован";

    case "rejected":
      return "Отклонён";

    default:
      return status;
  }
}
