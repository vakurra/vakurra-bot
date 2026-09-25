import { ReactNode } from "react";

import { BottomNavigation } from "./BottomNavigation";
import styles from "./AppLayout.module.css";

import type { Page } from "./App";

type AppLayoutProps = {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
};

export function AppLayout({
  children,
  currentPage,
  onPageChange,
}: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>{children}</main>

      <BottomNavigation
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
