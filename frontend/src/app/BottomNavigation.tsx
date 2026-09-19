import { useState } from "react";

import styles from "./BottomNavigation.module.css";

const navigationItems = [
  { label: "Лента", icon: "?" },
  { label: "Поиск", icon: "⌕" },
  { label: "ТОП", icon: "🏆" },
  { label: "Новый", icon: "+" },
  { label: "Вы", icon: "●" },
];

export function BottomNavigation() {
  const [activeIndex, setActiveIndex] = useState(2);

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
          key={item.label}
          type="button"
          className={`${styles.item} ${
            index === 2 ? styles.featured : ""
          }`}
          onClick={() => setActiveIndex(index)}
          aria-current={index === activeIndex ? "page" : undefined}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
