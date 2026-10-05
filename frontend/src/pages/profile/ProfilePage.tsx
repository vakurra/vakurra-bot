import type { User } from "../../app/App";
import { PageHeader } from "../../shared/ui/PageHeader";
import layout from "../../shared/styles/layout.module.css";

import { MyBotsSection } from "./MyBotsSection";
import { AdminModerationSection } from "./AdminModerationSection";


type ProfilePageProps = {
  user: User | null;
};

export function ProfilePage({ user }: ProfilePageProps) {
  const displayName = user?.username
    ? `@${user.username}`
    : user?.first_name ?? "Пользователь";

  return (
    <div className={layout.page}>
      <PageHeader title={displayName} />

      <MyBotsSection />

      {user?.role === "admin" && (
        <AdminModerationSection />
      )}
    </div>
  );
}
