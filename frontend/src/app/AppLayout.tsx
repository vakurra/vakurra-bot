import { ReactNode } from "react";

import { BottomNavigation } from "./BottomNavigation";
import styles from "./AppLayout.module.css";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>{children}</main>

      <BottomNavigation />
    </div>
  );
}
