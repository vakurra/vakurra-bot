import styles from "./TopPage.module.css";

export function TopPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>VakurraBot</h1>
      </header>

      <div className={styles.palette}>
        <section className={styles.example}>
          <p className={styles.label}>Background</p>
          <div className={styles.backgroundExample}>
            Основной фон приложения
          </div>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Surface</p>
          <div className={styles.surfaceExample}>
            Поверхность / карточка
          </div>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Text</p>
          <div className={styles.textExample}>
            Основной текст
          </div>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Text muted</p>
          <div className={styles.mutedExample}>
            Второстепенный текст
          </div>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Border</p>
          <div className={styles.borderExample}>
            Граница элемента
          </div>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Accent</p>
          <button className={styles.accentExample}>
            Основная кнопка
          </button>
        </section>

        <section className={styles.example}>
          <p className={styles.label}>Danger</p>
          <button className={styles.dangerExample}>
            Опасное действие
          </button>
        </section>
      </div>
    </div>
  );
}
