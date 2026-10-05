import { useEffect, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type CatalogBot } from "../../shared/api/client";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./SearchPage.module.css";

export function SearchPage() {
  const [bots, setBots] = useState<CatalogBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className={layout.page}>
      <PageHeader title="Поиск" />

      {isLoading && (
        <p className={layout.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>
          В каталоге пока нет ботов.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={layout.list}>
          {bots.map((bot) => (
            <article key={bot.username} className={cards.botCard}>
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
                    <h2 className={styles.botName}>{bot.name}</h2>

                    {bot.verified && (
                      <span className={styles.verified} aria-label="Проверенный бот">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className={content.username}>@{bot.username}</p>
                  {bot.mau !== null && (
                  <p className={styles.mau}>
                    {formatMau(bot.mau)} активных пользователей
                  </p>
                )}
                </div>
              </div>

              {bot.about && (
                <p className={styles.about}>{bot.about}</p>
              )}

              {bot.subcategories.length > 0 && (
                <div className={content.categoryList}>
                  {bot.subcategories.map((subcategory) => (
                    <span
                      key={subcategory.id}
                      className={content.category}
                    >
                      {subcategory.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatMau(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}
