import { useEffect, useState } from "react";

import { api, type MyBot } from "../../shared/api/client";
import common from "../../shared/styles/common.module.css";

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
    <section className={common.section}>
      <h2 className={common.sectionTitle}>Мои заявки</h2>

      {isLoading && (
        <p className={common.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={common.message}>
          Вы ещё не добавляли ботов.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={common.list}>
          {bots.map((bot) => (
            <article key={bot.id} className={common.botCard}>
              <div className={common.botMain}>
                {bot.profile_photo_url && (
                  <img
                    className={common.avatar}
                    src={bot.profile_photo_url}
                    alt=""
                  />
                )}

                <div className={common.info}>
                  <h3 className={common.botName}>{bot.name}</h3>
                  <p className={common.username}>@{bot.username}</p>
                </div>

                <span
                  className={`${common.status} ${getStatusClass(bot.status)}`}
                >
                  {getStatusLabel(bot.status)}
                </span>
              </div>

              {bot.status === "rejected" && bot.rejection_reason && (
                <div className={common.rejection}>
                  <p className={common.rejectionTitle}>
                    Причина отклонения
                  </p>
                  <p className={common.rejectionReason}>
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
    pending: common.statusPending,
    approved: common.statusApproved,
    rejected: common.statusRejected,
  };

  return classes[status] ?? "";
}
