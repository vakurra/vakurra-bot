import type { CatalogBot } from "../../shared/api/client";
import { BotIdentity } from "../../shared/ui/BotIdentity";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";

import { formatMau, getVisibleCategories } from "./searchUtils";
import styles from "./BotCatalogCard.module.css";

type BotCatalogCardProps = {
  bot: CatalogBot;
  isExpanded: boolean;
  onToggle: (username: string) => void;
};

export function BotCatalogCard({
  bot,
  isExpanded,
  onToggle,
}: BotCatalogCardProps) {
  const categories = isExpanded
    ? bot.subcategories.map((subcategory) => subcategory.name)
    : getVisibleCategories(bot);

  return (
    <article
      className={`${cards.botCard} ${cards.compactCard} ${
        isExpanded ? styles.cardExpanded : ""
      }`}
      onClick={() => onToggle(bot.username)}
    >
      <BotIdentity
        name={<h2 className={styles.botName}>{bot.name}</h2>}
        username={bot.username}
        profilePhotoUrl={bot.profile_photo_url}
        fallbackLetter={bot.name}
        avatarClassName={content.avatarBordered}
        badge={
          bot.verified ? (
            <span className={content.verified} aria-label="Проверенный бот">
              ✓
            </span>
          ) : undefined
        }
        meta={
          bot.mau !== null ? (
            <p className={styles.mau}>
              {formatMau(bot.mau)} активных пользователей
            </p>
          ) : undefined
        }
      />

      <div className={styles.summary}>
        <p className={styles.about}>{bot.about}</p>

        {bot.subcategories.length > 0 && (
          <div className={styles.categories}>
            {categories.map((category, index) => (
              <span key={`${category}-${index}`} className={content.category}>
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`${styles.expanded} ${
          isExpanded ? styles.expandedOpen : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.expandedContent}>
          {bot.description && (
            <p className={styles.description}>{bot.description}</p>
          )}

          <a
            className={buttons.linkButton}
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
}
