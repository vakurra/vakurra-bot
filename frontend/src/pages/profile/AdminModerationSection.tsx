import { useEffect, useState } from "react";

import { api, type AdminBot } from "../../shared/api/client";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./AdminModerationSection.module.css";

export function AdminModerationSection() {
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBotId, setProcessingBotId] = useState<number | null>(null);
  const [rejectingBotId, setRejectingBotId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  function handleStartReject(botId: number) {
    setRejectingBotId(botId);
    setRejectionReason("");
  }

  function handleCancelReject() {
    setRejectingBotId(null);
    setRejectionReason("");
  }

  async function handleReject(botId: number) {
    const reason = rejectionReason.trim();

    if (!reason) {
      return;
    }

    setProcessingBotId(botId);

    try {
      await api.rejectBot(botId, reason);

      setBots((currentBots) =>
        currentBots.filter((bot) => bot.id !== botId),
      );

      setRejectingBotId(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject bot:", error);
    } finally {
      setProcessingBotId(null);
    }
  }

  return (
    <section className={layout.section}>
      <h2 className={layout.sectionTitle}>
        Модерация
      </h2>

      {isLoading && (
        <p className={layout.message}>
          Загрузка...
        </p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>
          Нет заявок на модерацию.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <div className={layout.list}>
          {bots.map((bot) => {
            const isProcessing = processingBotId === bot.id;
            const isRejecting = rejectingBotId === bot.id;

            return (
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
                    <h3 className={content.botName}>
                      {bot.name}
                    </h3>

                    <p className={content.username}>
                      @{bot.username}
                    </p>

                    <p className={styles.submittedBy}>
                      Пользователь: {bot.submitted_by}
                    </p>
                  </div>
                </div>

                {bot.subcategories.length > 0 && (
                  <div className={styles.categories}>
                    <p className={styles.categoriesTitle}>
                      Категории
                    </p>

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
                  </div>
                )}

                {isRejecting && (
                  <div className={styles.rejectionForm}>
                    <label
                      className={styles.rejectionLabel}
                      htmlFor={`rejection-${bot.id}`}
                    >
                      Причина отклонения
                    </label>

                    <textarea
                      id={`rejection-${bot.id}`}
                      className={styles.rejectionInput}
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      placeholder="Напишите причину отклонения..."
                      rows={3}
                      disabled={isProcessing}
                    />

                    <div className={styles.rejectionActions}>
                      <button
                        type="button"
                      className={buttons.secondaryButton}
                        disabled={isProcessing}
                        onClick={handleCancelReject}
                      >
                        Отмена
                      </button>

                      <button
                        type="button"
                        className={buttons.dangerButton}
                        disabled={
                          isProcessing ||
                          rejectionReason.trim().length === 0
                        }
                        onClick={() => handleReject(bot.id)}
                      >
                        {isProcessing
                          ? "Отклоняем..."
                          : "Подтвердить отклонение"}
                      </button>
                    </div>
                  </div>
                )}

                {!isRejecting && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={buttons.primaryButton}
                      disabled={isProcessing}
                      onClick={() => handleApprove(bot.id)}
                    >
                      {isProcessing ? "..." : "Одобрить"}
                    </button>

                    <button
                      type="button"
                      className={buttons.dangerButton}
                      disabled={isProcessing}
                      onClick={() => handleStartReject(bot.id)}
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
