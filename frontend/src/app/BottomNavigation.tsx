import styles from "./BottomNavigation.module.css";

import type { Page } from "./App";

type BottomNavigationProps = {
  currentPage: Page;
  onPageChange: (page: Page) => void;
};

const navigationItems = [
  { page: "feed" as const, label: "Лента", icon: "?" },
  { page: "search" as const, label: "Поиск", icon: "⌕" },
  { page: "top" as const, label: "ТОП", icon: "🏆" },
  { page: "add" as const, label: "Новый", icon: "+" },
  { page: "profile" as const, label: "Вы", icon: "●" },
];

export function BottomNavigation({
  currentPage,
  onPageChange,
}: BottomNavigationProps) {
  const activeIndex = navigationItems.findIndex(
    (item) => item.page === currentPage,
  );

  const indicatorClass =
    activeIndex === 0
      ? styles.indicatorFirst
      : activeIndex === navigationItems.length - 1
        ? styles.indicatorLast
        : styles.indicatorMiddle;

  return (
    <nav className={styles.navigation} aria-label="Основная навигация">
      <div
        className={`${styles.indicator} ${indicatorClass}`}
        style={{
          left: `${activeIndex * 20 + 10}%`,
        }}
      />

      {navigationItems.map((item, index) => (
        <button
          key={item.page}
          type="button"
          className={`${styles.item} ${
            index === 2 ? styles.featured : ""
          }`}
          onClick={() => onPageChange(item.page)}
          aria-current={item.page === currentPage ? "page" : undefined}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
