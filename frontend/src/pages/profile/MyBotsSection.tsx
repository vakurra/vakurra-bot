import { useCallback } from "react";

import { api, type MyBot } from "../../shared/api/client";
import { usePaginatedList } from "../../shared/hooks/usePaginatedList";
import { BotIdentity } from "../../shared/ui/BotIdentity";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

const PAGE_SIZE = 5;

export function MyBotsSection() {
  const loadBots = useCallback(
    ({ limit, offset }: { limit: number; offset: number }) =>
      api.myBots({ limit, offset }),
    [],
  );

  const {
    items: bots,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedList<MyBot>({
    pageSize: PAGE_SIZE,
    loadPage: loadBots,
  });

  return (
    <section className={layout.section}>
      <h2 className={layout.sectionTitle}>Мои заявки</h2>

      {isLoading && (
        <p className={layout.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>
          Вы ещё не добавляли ботов.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <>
          <div className={layout.list}>
            {bots.map((bot) => (
              <article key={bot.id} className={cards.botCard}>
                <BotIdentity
                  name={<h3 className={content.botName}>{bot.name}</h3>}
                  username={bot.username}
                  profilePhotoUrl={bot.profile_photo_url}
                  fallbackLetter={bot.name}
                  trailing={
                    <span
                      className={`${content.status} ${getStatusClass(bot.status)}`}
                    >
                      {getStatusLabel(bot.status)}
                    </span>
                  }
                />

                {bot.status === "rejected" && bot.rejection_reason && (
                  <div className={cards.rejection}>
                    <p className={cards.rejectionTitle}>
                      Причина
                    </p>
                    <p className={cards.rejectionReason}>
                      {bot.rejection_reason}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>

          {hasMore && (
            <button
              className={buttons.button}
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
            </button>
          )}
        </>
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

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pending: content.statusPending,
    approved: content.statusApproved,
    rejected: content.statusRejected,
  };

  return classes[status] ?? "";
}
