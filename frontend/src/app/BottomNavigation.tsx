import type { CSSProperties } from "react";

import styles from "./BottomNavigation.module.css";

import type { Page } from "./App";

import feedIcon from "../assets/icons/feed.svg";
import searchIcon from "../assets/icons/search.svg";
import topIcon from "../assets/icons/top.svg";
import addIcon from "../assets/icons/add.svg";
import profileIcon from "../assets/icons/profile.svg";

type NavigationItem = {
  page: Page;
  label: string;
  icon: string;
};

const navigationItems: NavigationItem[] = [
  {
    page: "feed",
    label: "Лента",
    icon: feedIcon,
  },
  {
    page: "search",
    label: "Поиск",
    icon: searchIcon,
  },
  {
    page: "top",
    label: "ТОП",
    icon: topIcon,
  },
  {
    page: "add",
    label: "Новый",
    icon: addIcon,
  },
  {
    page: "profile",
    label: "Вы",
    icon: profileIcon,
  },
];

type BottomNavigationProps = {
  currentPage: Page;
  onPageChange: (page: Page) => void;
};

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
          <span
            className={styles.icon}
            style={{ "--icon": "url(" + item.icon + ")" } as CSSProperties}
            aria-hidden="true"
          />

          <span className={styles.label}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
