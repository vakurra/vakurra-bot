import styles from "./TopPage.module.css";

type TopPageProps = {
  status: string;
};

export function TopPage({ status }: TopPageProps) {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Telegram Mini App</p>
        <h1 className={styles.title}>Vakurra</h1>
        <p className={styles.subtitle}>Каталог полезных Telegram-ботов</p>
      </section>

      <section className={styles.statusCard}>
        <strong>Приложение подключено</strong>
        <p className={styles.status}>{status}</p>
      </section>
    </div>
  );
}
