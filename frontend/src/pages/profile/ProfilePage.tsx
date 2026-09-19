import styles from "./ProfilePage.module.css";

type User = {
  id: number;
  username: string | null;
  first_name: string | null;
};

type ProfilePageProps = {
  user: User | null;
};

export function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.avatar}>
          ?
        </div>

        <div className={styles.info}>
          <p className={styles.name}>
            {user?.first_name ?? "Пользователь"}
          </p>

          <p className={styles.username}>
            {user?.username ? `@${user.username}` : "username не указан"}
          </p>
        </div>
      </section>
    </div>
  );
}