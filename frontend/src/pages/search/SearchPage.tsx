import { useEffect, useState } from "react";

import { PageHeader } from "../../shared/ui/PageHeader";
import { api, type CatalogBot } from "../../shared/api/client";
import common from "../../shared/styles/common.module.css";

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
    <div className={common.page}>
      <PageHeader title="Поиск" />

      {isLoading && (
        <p className={common.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={common.message}>
          В каталоге пока нет ботов.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={common.list}>
          {bots.map((bot) => (
            <article key={bot.username} className={common.botCard}>
              <div className={common.botMain}>
                {bot.profile_photo_url && (
                  <img
                    className={`${common.avatar} ${styles.avatar}`}
                    src={bot.profile_photo_url}
                    alt=""
                  />
                )}

                <div className={common.info}>
                  <div className={styles.nameRow}>
                    <h2 className={styles.botName}>{bot.name}</h2>

                    {bot.verified && (
                      <span className={styles.verified} aria-label="Проверенный бот">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className={common.username}>@{bot.username}</p>
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
                <div className={common.categoryList}>
                  {bot.subcategories.map((subcategory) => (
                    <span
                      key={subcategory.id}
                      className={common.category}
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
