import type { User } from "../../app/App";
import { PageHeader } from "../../shared/ui/PageHeader";

import styles from "./ProfilePage.module.css";

type ProfilePageProps = {
  user: User | null;
};

export function ProfilePage({ user }: ProfilePageProps) {
  const displayName = user?.username
    ? `@${user.username}`
    : user?.first_name ?? "Пользователь";

  return (
    <div className={styles.page}>
      <PageHeader title={displayName} />
    </div>
  );
}
