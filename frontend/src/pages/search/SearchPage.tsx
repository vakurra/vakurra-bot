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
  const [expandedUsername, setExpandedUsername] = useState<string | null>(
    null,
  );

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

  function toggleBot(username: string) {
    setExpandedUsername((current) =>
      current === username ? null : username,
    );
  }

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
          {bots.map((bot) => {
            const isExpanded = expandedUsername === bot.username;

            return (
              <article
                key={bot.username}
                className={`${cards.botCard} ${styles.searchCard} ${
                  isExpanded ? styles.cardExpanded : ""
                }`}
                onClick={() => toggleBot(bot.username)}
              >
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
                      <h2 className={styles.botName}>
                        {bot.name}
                      </h2>

                      {bot.verified && (
                        <span
                          className={styles.verified}
                          aria-label="Проверенный бот"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <p className={content.username}>
                      @{bot.username}
                    </p>

                    {bot.mau !== null && (
                      <p className={styles.mau}>
                        {formatMau(bot.mau)} активных пользователей
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.summary}>
                    <p className={styles.about}>
                      {bot.about}
                    </p>

                    {bot.subcategories.length > 0 && (
                      <div className={styles.categories}>
                        {(isExpanded
                          ? bot.subcategories.map(
                              (subcategory) => subcategory.name,
                            )
                          : getVisibleCategories(bot)
                        ).map((category, index) => (
                          <span
                            key={`${category}-${index}`}
                            className={content.category}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                <div
                  className={`${styles.expanded} ${
                    isExpanded
                      ? styles.expandedOpen
                      : ""
                  }`}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <div className={styles.expandedContent}>
                    {bot.description && (
                      <p className={styles.description}>
                        {bot.description}
                      </p>
                    )}

                    <a
                      className={styles.botButton}
                      href={`https://t.me/${bot.username}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть бота
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getVisibleCategories(bot: CatalogBot): string[] {
  const categories = bot.subcategories.map(
    (subcategory) => subcategory.name,
  );

  if (categories.length <= 1) return categories;
  if (categories.length === 2) return [categories[0], "Еще 1"];

  return [categories[0], `Еще ${categories.length - 1}`];
}

function formatMau(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}
