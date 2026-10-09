import { useEffect, useState } from "react";

import { api, type AdminBot } from "../../shared/api/client";
import { BotIdentity } from "../../shared/ui/BotIdentity";
import buttons from "../../shared/styles/buttons.module.css";
import cards from "../../shared/styles/cards.module.css";
import content from "../../shared/styles/content.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./AdminModerationSection.module.css";

const PAGE_SIZE = 1;

export function AdminModerationSection() {
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [processingBotId, setProcessingBotId] = useState<number | null>(null);
  const [rejectingBotId, setRejectingBotId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBots() {
      try {
        const result = await api.adminBots({
          limit: PAGE_SIZE,
          offset: 0,
        });

        if (cancelled) {
          return;
        }

        setBots(result.items);
        setHasMore(result.has_more);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load admin bots:", error);
          setBots([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBots();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const result = await api.adminBots({
        limit: PAGE_SIZE,
        offset: bots.length,
      });

      setBots((currentBots) => [...currentBots, ...result.items]);
      setHasMore(result.has_more);
    } catch (error) {
      console.error("Failed to load more admin bots:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function removeProcessedBot(botId: number) {
    setBots((currentBots) =>
      currentBots.filter((bot) => bot.id !== botId),
    );

    setRejectingBotId(null);
    setRejectionReason("");

    if (!hasMore) {
      return;
    }

    try {
      const result = await api.adminBots({
        limit: 1,
        offset: bots.length,
      });

      if (result.items.length > 0) {
        setBots((currentBots) => {
          if (currentBots.some((bot) => bot.id === result.items[0].id)) {
            return currentBots;
          }

          return [...currentBots, ...result.items];
        });
      }

      setHasMore(result.has_more);
    } catch (error) {
      console.error("Failed to replenish moderation queue:", error);
    }
  }

  async function handleApprove(botId: number) {
    setProcessingBotId(botId);

    try {
      await api.approveBot(botId);
      await removeProcessedBot(botId);
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
      await removeProcessedBot(botId);
    } catch (error) {
      console.error("Failed to reject bot:", error);
    } finally {
      setProcessingBotId(null);
    }
  }

  return (
    <section className={layout.section}>
      <h2 className={layout.sectionTitle}>Модерация</h2>

      {isLoading && (
        <p className={layout.message}>Загрузка...</p>
      )}

      {!isLoading && bots.length === 0 && (
        <p className={layout.message}>
          Нет заявок на модерацию.
        </p>
      )}

      {!isLoading && bots.length > 0 && (
        <>
          <div className={layout.list}>
            {bots.map((bot) => {
              const isProcessing = processingBotId === bot.id;
              const isRejecting = rejectingBotId === bot.id;

              return (
                <article key={bot.id} className={cards.botCard}>
                  <BotIdentity
                    name={<h3 className={content.botName}>{bot.name}</h3>}
                    username={bot.username}
                    profilePhotoUrl={bot.profile_photo_url}
                    fallbackLetter={bot.name}
                    meta={
                      <div className={styles.submittedBy}>
                        <p>
                          User:{" "}
                          {bot.submitted_by_username
                            ? `@${bot.submitted_by_username}`
                            : bot.submitted_by_first_name || "Без имени"}{" "}
                          (ID: {bot.submitted_by})
                        </p>
                      </div>
                    }
                  />

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
                        disabled={isProcessing || processingBotId !== null}
                        onClick={() => handleApprove(bot.id)}
                      >
                        {isProcessing ? "..." : "Одобрить"}
                      </button>

                      <button
                        type="button"
                        className={buttons.dangerButton}
                        disabled={isProcessing || processingBotId !== null}
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

          {hasMore && (
            <button
              className={buttons.button}
              style={{ marginTop: "12px" }}
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore || processingBotId !== null}
            >
              {isLoadingMore ? "Загрузка..." : "Показать ещё"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
