import { useEffect, useState } from "react";

import { api, type AdminBot } from "../../shared/api/client";

import styles from "./AdminModerationSection.module.css";

export function AdminModerationSection() {
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBotId, setProcessingBotId] = useState<number | null>(null);

  useEffect(() => {
    async function loadBots() {
      try {
        const pendingBots = await api.adminBots();
        setBots(pendingBots);
      } catch (error) {
        console.error("Failed to load admin bots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBots();
  }, []);

  async function handleApprove(botId: number) {
    setProcessingBotId(botId);

    try {
      await api.approveBot(botId);

      setBots((currentBots) =>
        currentBots.filter((bot) => bot.id !== botId),
      );
    } catch (error) {
      console.error("Failed to approve bot:", error);
    } finally {
      setProcessingBotId(null);
    }
  }

  async function handleReject(botId: number) {
    setProcessingBotId(botId);

    try {
      await api.rejectBot(botId);

      setBots((currentBots) =>
        currentBots.filter((bot) => bot.id !== botId),
      );
    } catch (error) {
      console.error("Failed to reject bot:", error);
    } finally {
      setProcessingBotId(null);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Модерация
      </h2>

      {isLoading && (
        <p className={styles.message}>
          Загрузка...
        </p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={styles.message}>
          Нет заявок на модерацию.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={styles.list}>
          {bots.map((bot) => {
            const isProcessing = processingBotId === bot.id;

            return (
              <article key={bot.id} className={styles.bot}>
                <div className={styles.botInfo}>
                  {bot.profile_photo_url && (
                    <img
                      className={styles.avatar}
                      src={bot.profile_photo_url}
                      alt=""
                    />
                  )}

                  <div className={styles.info}>
                    <h3 className={styles.botName}>
                      {bot.name}
                    </h3>

                    <p className={styles.username}>
                      @{bot.username}
                    </p>

                    <p className={styles.submittedBy}>
                      Пользователь: {bot.submitted_by}
                    </p>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.approveButton}
                    disabled={isProcessing}
                    onClick={() => handleApprove(bot.id)}
                  >
                    {isProcessing ? "..." : "Одобрить"}
                  </button>

                  <button
                    type="button"
                    className={styles.rejectButton}
                    disabled={isProcessing}
                    onClick={() => handleReject(bot.id)}
                  >
                    {isProcessing ? "..." : "Отклонить"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
