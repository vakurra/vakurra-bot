import { PageHeader } from "../../shared/ui/PageHeader";
import buttons from "../../shared/styles/buttons.module.css";
import layout from "../../shared/styles/layout.module.css";

import styles from "./TopPage.module.css";

export function TopPage() {
  return (
    <div className={`${layout.page} ${layout.pageTop}`}>
      <PageHeader title="VakurraBot" />

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
          <button className={buttons.accentButton}>
            Основная кнопка
          </button>
        </section>
      </div>
    </div>
  );
}
