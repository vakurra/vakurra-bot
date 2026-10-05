import { useEffect, useState } from "react";

import { api, type MyBot } from "../../shared/api/client";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

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
        <div className={layout.list}>
          {bots.map((bot) => (
            <article key={bot.id} className={cards.botCard}>
              <div className={content.botMain}>
                {bot.profile_photo_url && (
                  <img
                    className={content.avatar}
                    src={bot.profile_photo_url}
                    alt=""
                  />
                )}

                <div className={content.info}>
                  <h3 className={content.botName}>{bot.name}</h3>
                  <p className={content.username}>@{bot.username}</p>
                </div>

                <span
                  className={`${content.status} ${getStatusClass(bot.status)}`}
                >
                  {getStatusLabel(bot.status)}
                </span>
              </div>

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
