import styles from "./SplashScreen.module.css";

export function SplashScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.logo}>V</div>

        <h1 className={styles.title}>Vakurra</h1>

        <p className={styles.description}>Каталог полезных Telegram-ботов</p>

        <div className={styles.loader} role="status" aria-label="Загрузка" />
      </div>
    </main>
  );
}
